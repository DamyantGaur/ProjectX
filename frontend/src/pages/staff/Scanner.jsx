import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Camera, Keyboard, CheckCircle, XCircle, Clock, AlertTriangle, User, Ticket } from 'lucide-react';
import { qrAPI } from '../../api/client';

export default function StaffScanner() {
    const [mode, setMode] = useState('camera'); // camera | photo | manual
    const [manualToken, setManualToken] = useState('');
    const [result, setResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const scannerRef = useRef(null);
    const html5QrRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => { stopCamera(); };
    }, []);

    const startCamera = async () => {
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader');
            html5QrRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await scanner.stop();
                    setCameraActive(false);
                    handleValidate(decodedText);
                },
                () => { },
            );
            setCameraActive(true);
        } catch (err) {
            console.error('Camera error:', err);
            setCameraActive(false);
            setResult({
                status: 'error',
                message: 'Live Camera Denied: Browsers require HTTPS for live video. Use the "Photo Scanner" or "Manual" tab instead.'
            });
        }
    };

    const stopCamera = async () => {
        if (html5QrRef.current) {
            try { await html5QrRef.current.stop(); } catch { }
            setCameraActive(false);
        }
    };

    const handleFileScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        setResult(null);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader-hidden');
            const decodedText = await scanner.scanFile(file, true);
            handleValidate(decodedText);
        } catch (err) {
            setResult({ status: 'invalid', message: 'Could not find a valid QR code in that photo. Try again with a clearer image.' });
        } finally {
            setScanning(false);
        }
    };

    const handleValidate = async (token) => {
        setScanning(true);
        setResult(null);
        try {
            const res = await qrAPI.validate(token);
            setResult(res.data);
        } catch (err) {
            setResult({ status: 'error', message: err.response?.data?.detail || 'Validation failed' });
        } finally {
            setScanning(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualToken.trim()) handleValidate(manualToken.trim());
    };

    const resultStyles = {
        approved: { bg: 'rgba(91,154,111,0.1)', border: 'rgba(91,154,111,0.3)', icon: <CheckCircle size={48} color="#5B9A6F" />, color: '#5B9A6F' },
        already_used: { bg: 'rgba(192,96,112,0.1)', border: 'rgba(192,96,112,0.3)', icon: <XCircle size={48} color="#C06070" />, color: '#C06070' },
        expired: { bg: 'rgba(212,160,84,0.1)', border: 'rgba(212,160,84,0.3)', icon: <Clock size={48} color="#D4A054" />, color: '#D4A054' },
        payment_pending: { bg: 'rgba(212,160,84,0.1)', border: 'rgba(212,160,84,0.3)', icon: <AlertTriangle size={48} color="#D4A054" />, color: '#D4A054' },
        invalid: { bg: 'rgba(192,96,112,0.1)', border: 'rgba(192,96,112,0.3)', icon: <XCircle size={48} color="#C06070" />, color: '#C06070' },
        error: { bg: 'rgba(192,96,112,0.1)', border: 'rgba(192,96,112,0.3)', icon: <AlertTriangle size={48} color="#C06070" />, color: '#C06070' },
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: '#EAEAF0' }}>QR Scanner</h1>
                <p className="text-sm mt-1" style={{ color: '#9A9AB0' }}>Scan QR codes to validate entry</p>
            </div>

            {/* Hidden reader for file scanning */}
            <div id="qr-reader-hidden" style={{ display: 'none' }}></div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => { setMode('camera'); stopCamera(); }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all" style={{ background: mode === 'camera' ? 'rgba(201,169,110,0.15)' : 'transparent', color: mode === 'camera' ? '#C9A96E' : '#9A9AB0', border: `1px solid ${mode === 'camera' ? 'rgba(201,169,110,0.3)' : 'rgba(167,139,250,0.15)'}` }}>
                    <Camera size={16} /> Live
                </button>
                <button onClick={() => { setMode('photo'); stopCamera(); }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all" style={{ background: mode === 'photo' ? 'rgba(201,169,110,0.15)' : 'transparent', color: mode === 'photo' ? '#C9A96E' : '#9A9AB0', border: `1px solid ${mode === 'photo' ? 'rgba(201,169,110,0.3)' : 'rgba(167,139,250,0.15)'}` }}>
                    <ScanLine size={16} /> Photo
                </button>
                <button onClick={() => { setMode('manual'); stopCamera(); }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all" style={{ background: mode === 'manual' ? 'rgba(201,169,110,0.15)' : 'transparent', color: mode === 'manual' ? '#C9A96E' : '#9A9AB0', border: `1px solid ${mode === 'manual' ? 'rgba(201,169,110,0.3)' : 'rgba(167,139,250,0.15)'}` }}>
                    <Keyboard size={16} /> Manual
                </button>
            </div>

            {/* Camera Scanner (Live) */}
            {mode === 'camera' && (
                <div className="glass-card mb-6">
                    <div className="relative rounded-xl overflow-hidden mb-4" style={{ background: '#000', minHeight: 300 }}>
                        <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
                        {!cameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <ScanLine size={48} color="#C9A96E" className="mb-4 opacity-50" />
                                <button onClick={startCamera} className="btn-primary text-sm mb-4">Start Live Scanner</button>
                                <p className="text-xs max-w-xs" style={{ color: '#5E5E74' }}>
                                    <b>Warning</b>: Live scanning requires HTTPS. If this fails on your phone, use the <b>Photo Scanner</b> tab above.
                                </p>
                            </div>
                        )}
                    </div>
                    {cameraActive && (
                        <button onClick={stopCamera} className="btn-danger w-full text-sm">Stop Camera</button>
                    )}
                </div>
            )}

            {/* Photo Scanner (Works on HTTP) */}
            {mode === 'photo' && (
                <div className="glass-card mb-6 py-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)' }}>
                        <Camera size={32} color="#C9A96E" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Photo Scanner</h3>
                    <p className="text-sm px-8 mb-8" style={{ color: '#9A9AB0' }}>
                        Take a photo of the QR code using your native camera.
                        This works perfectly on any mobile device.
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileScan}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary px-8 py-3 flex items-center gap-3"
                    >
                        <ScanLine size={20} /> Take/Upload Photo
                    </button>
                </div>
            )}

            {/* Manual Entry */}
            {mode === 'manual' && (
                <div className="glass-card mb-6">
                    <form onSubmit={handleManualSubmit} className="flex gap-3">
                        <input value={manualToken} onChange={e => setManualToken(e.target.value)} placeholder="Enter QR token..." className="glass-input flex-1 font-mono text-sm" required />
                        <button type="submit" disabled={scanning} className="btn-primary text-sm whitespace-nowrap flex items-center gap-2">
                            <ScanLine size={16} /> Validate
                        </button>
                    </form>
                </div>
            )}

            {/* Loading */}
            {scanning && (
                <div className="glass-card text-center py-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-10 h-10 rounded-full border-2 border-transparent mx-auto mb-3" style={{ borderTopColor: '#C9A96E', borderRightColor: '#A78BFA' }} />
                    <p className="text-sm" style={{ color: '#9A9AB0' }}>Processing QR code...</p>
                </div>
            )}

            {/* Result */}
            <AnimatePresence>
                {result && !scanning && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card text-center py-8" style={{ background: resultStyles[result.status]?.bg, border: `2px solid ${resultStyles[result.status]?.border}` }}>
                        <div className="mb-4">{resultStyles[result.status]?.icon}</div>
                        <h3 className="text-xl font-bold mb-2 uppercase" style={{ color: resultStyles[result.status]?.color }}>{result.status.replace('_', ' ')}</h3>
                        <p className="text-sm mb-4" style={{ color: '#9A9AB0' }}>{result.message}</p>

                        {result.user_name && (
                            <div className="flex items-center justify-center gap-2 text-sm mb-1" style={{ color: '#EAEAF0' }}>
                                <User size={14} /> {result.user_name}
                            </div>
                        )}
                        {result.event_title && (
                            <div className="flex items-center justify-center gap-2 text-sm mb-1" style={{ color: '#9A9AB0' }}>
                                <Ticket size={14} /> {result.event_title}
                            </div>
                        )}
                        {result.membership_tier && (
                            <div className="mt-2">
                                <span className={`badge badge-vip text-xs uppercase`}>{result.membership_tier}</span>
                            </div>
                        )}

                        <button onClick={() => { setResult(null); setManualToken(''); }} className="btn-secondary text-sm mt-6">Scan Next</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
