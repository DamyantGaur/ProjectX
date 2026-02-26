"""Project X - Analytics API routes (admin dashboard)."""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from app.database import get_database
from app.middleware.roles import require_role
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
import csv
import io

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_overview(admin: dict = Depends(require_role("admin"))):
    """Get global analytics overview."""
    db = get_database()

    total_users = await db.users.count_documents({})
    total_events = await db.events.count_documents({})
    active_events = await db.events.count_documents({"is_active": True})
    total_qr = await db.qr_codes.count_documents({})
    total_scans = await db.scan_logs.count_documents({})
    approved_scans = await db.scan_logs.count_documents({"result": "approved"})

    # Revenue calculation
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.payments.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Membership distribution
    membership_pipeline = [
        {"$group": {"_id": "$membership_tier", "count": {"$sum": 1}}}
    ]
    membership_dist = await db.users.aggregate(membership_pipeline).to_list(10)

    return {
        "users": {"total": total_users},
        "events": {"total": total_events, "active": active_events},
        "qr_codes": {"total": total_qr},
        "scans": {"total": total_scans, "approved": approved_scans},
        "revenue": {"total": round(total_revenue, 2)},
        "membership_distribution": {
            item["_id"]: item["count"] for item in membership_dist
        },
    }


@router.get("/revenue-chart")
async def get_revenue_chart(
    days: int = 30,
    admin: dict = Depends(require_role("admin")),
):
    """Get daily revenue data for charting."""
    db = get_database()
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "revenue": {"$sum": "$amount"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    data = await db.payments.aggregate(pipeline).to_list(days)
    return [{"date": d["_id"], "revenue": round(d["revenue"], 2), "transactions": d["count"]} for d in data]


@router.get("/attendance-chart")
async def get_attendance_chart(
    days: int = 30,
    admin: dict = Depends(require_role("admin")),
):
    """Get daily scan/attendance data for charting."""
    db = get_database()
    start_date = datetime.utcnow() - timedelta(days=days)

    pipeline = [
        {"$match": {"result": "approved", "scanned_at": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$scanned_at"}},
            "scans": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    data = await db.scan_logs.aggregate(pipeline).to_list(days)
    return [{"date": d["_id"], "scans": d["scans"]} for d in data]


@router.get("/scan-activity")
async def get_scan_activity(
    hours: int = 24,
    admin: dict = Depends(require_role("admin")),
):
    """Get hourly scan activity for the last N hours."""
    db = get_database()
    start_time = datetime.utcnow() - timedelta(hours=hours)

    pipeline = [
        {"$match": {"scanned_at": {"$gte": start_time}}},
        {"$group": {
            "_id": {
                "hour": {"$hour": "$scanned_at"},
                "result": "$result",
            },
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id.hour": 1}},
    ]
    data = await db.scan_logs.aggregate(pipeline).to_list(100)

    # Format into hourly buckets
    hours_data = {}
    for d in data:
        h = d["_id"]["hour"]
        if h not in hours_data:
            hours_data[h] = {"hour": h, "approved": 0, "denied": 0}
        if d["_id"]["result"] == "approved":
            hours_data[h]["approved"] = d["count"]
        else:
            hours_data[h]["denied"] += d["count"]

    return list(hours_data.values())


@router.get("/scan-logs")
async def get_scan_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    event_id: Optional[str] = None,
    result: Optional[str] = None,
    admin: dict = Depends(require_role("admin")),
):
    """Get paginated scan logs with optional filters (admin only)."""
    db = get_database()
    query = {}
    if event_id:
        query["event_id"] = event_id
    if result:
        query["result"] = result

    cursor = db.scan_logs.find(query).sort("scanned_at", -1).skip(skip).limit(limit)
    logs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        logs.append(doc)

    total = await db.scan_logs.count_documents(query)
    return {"items": logs, "total": total}


@router.get("/staff-activity")
async def get_staff_activity(
    admin: dict = Depends(require_role("admin")),
):
    """Get recent scan activity grouped by staff member."""
    db = get_database()
    pipeline = [
        {"$group": {
            "_id": "$scanned_by",
            "total_scans": {"$sum": 1},
            "approved": {"$sum": {"$cond": [{"$eq": ["$result", "approved"]}, 1, 0]}},
            "denied": {"$sum": {"$cond": [{"$ne": ["$result", "approved"]}, 1, 0]}},
            "last_scan": {"$max": "$scanned_at"},
        }},
        {"$sort": {"last_scan": -1}},
        {"$limit": 20},
    ]
    data = await db.scan_logs.aggregate(pipeline).to_list(20)

    # Enrich with staff names
    enriched = []
    for item in data:
        staff_id = item["_id"]
        staff = await db.users.find_one({"_id": ObjectId(staff_id)})
        enriched.append({
            "staff_id": staff_id,
            "staff_name": staff["name"] if staff else "Unknown",
            "total_scans": item["total_scans"],
            "approved": item["approved"],
            "denied": item["denied"],
            "last_scan": item["last_scan"].isoformat() if item["last_scan"] else None,
        })
    return enriched


@router.get("/fraud-alerts")
async def get_fraud_alerts(
    admin: dict = Depends(require_role("admin")),
):
    """Get duplicate/suspicious scan alerts."""
    db = get_database()

    # Find QR tokens that were scanned more than once (potential duplicate attempts)
    pipeline = [
        {"$group": {
            "_id": "$qr_token",
            "scan_count": {"$sum": 1},
            "results": {"$push": "$result"},
            "times": {"$push": "$scanned_at"},
            "event_id": {"$first": "$event_id"},
            "user_id": {"$first": "$user_id"},
        }},
        {"$match": {"scan_count": {"$gt": 1}}},
        {"$sort": {"scan_count": -1}},
        {"$limit": 50},
    ]
    data = await db.scan_logs.aggregate(pipeline).to_list(50)

    alerts = []
    for item in data:
        denied_count = sum(1 for r in item["results"] if r != "approved")
        alerts.append({
            "qr_token": item["_id"][:20] + "..." if item["_id"] and len(item["_id"]) > 20 else item["_id"],
            "scan_count": item["scan_count"],
            "denied_count": denied_count,
            "event_id": item["event_id"],
            "user_id": item["user_id"],
            "first_scan": item["times"][0].isoformat() if item["times"] else None,
            "last_scan": item["times"][-1].isoformat() if item["times"] else None,
            "severity": "high" if denied_count >= 3 else "medium" if denied_count >= 1 else "low",
        })
    return alerts


@router.get("/export/{export_type}")
async def export_csv(
    export_type: str,
    admin: dict = Depends(require_role("admin")),
):
    """Export data as CSV (admin only). Types: users, events, payments, scans."""
    db = get_database()
    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "users":
        writer.writerow(["ID", "Name", "Email", "Role", "Tier", "Points", "Total Spend", "Active", "Created"])
        async for doc in db.users.find():
            writer.writerow([
                str(doc["_id"]), doc.get("name"), doc.get("email"),
                doc.get("role"), doc.get("membership_tier"), doc.get("loyalty_points", 0),
                doc.get("total_spend", 0), doc.get("is_active", True),
                doc.get("created_at", ""),
            ])
    elif export_type == "events":
        writer.writerow(["ID", "Title", "Venue", "Date", "Capacity", "Attendees", "Price", "Active"])
        async for doc in db.events.find():
            writer.writerow([
                str(doc["_id"]), doc.get("title"), doc.get("venue"),
                doc.get("date", ""), doc.get("capacity"), doc.get("attendee_count", 0),
                doc.get("price", 0), doc.get("is_active", True),
            ])
    elif export_type == "payments":
        writer.writerow(["ID", "User ID", "Event ID", "Amount", "Original Amount", "Discount", "Coupon", "Status", "Provider", "Created"])
        async for doc in db.payments.find():
            writer.writerow([
                str(doc["_id"]), doc.get("user_id"), doc.get("event_id"),
                doc.get("amount"), doc.get("original_amount"), doc.get("discount", 0),
                doc.get("coupon_code", ""), doc.get("status"), doc.get("provider"),
                doc.get("created_at", ""),
            ])
    elif export_type == "scans":
        writer.writerow(["ID", "QR Token", "User ID", "Event ID", "Scanned By", "Result", "Scanned At"])
        async for doc in db.scan_logs.find():
            writer.writerow([
                str(doc["_id"]), doc.get("qr_token", "")[:20],
                doc.get("user_id"), doc.get("event_id"),
                doc.get("scanned_by"), doc.get("result"),
                doc.get("scanned_at", ""),
            ])
    else:
        return {"error": f"Invalid export type: {export_type}"}

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=projectx_{export_type}_{datetime.utcnow().strftime('%Y%m%d')}.csv"},
    )
