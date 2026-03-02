import { useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';

// BarcodeDetector is available in Chrome 83+ / Edge 83+.
// This app requires Chrome 113+ for WebGPU, so it is always present.
declare global {
    interface Window {
        BarcodeDetector?: new (options?: { formats?: string[] }) => {
            detect(source: HTMLVideoElement): Promise<{ rawValue: string; format: string }[]>;
        };
    }
}

interface QRScannerProps {
    onScan: (raw: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const rafRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<'requesting' | 'scanning' | 'error'>('requesting');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!window.BarcodeDetector) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setErrorMsg('QR scanning requires Chrome 83+ or Edge 83+.');
            setStatus('error');
            return;
        }

        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        let active = true;

        const scan = async () => {
            if (!active || !videoRef.current) return;
            if (videoRef.current.readyState >= 2) {
                try {
                    const results = await detector.detect(videoRef.current);
                    if (results.length > 0 && results[0].rawValue) {
                        active = false;
                        streamRef.current?.getTracks().forEach(t => t.stop());
                        onScan(results[0].rawValue);
                        return;
                    }
                } catch {
                    // Ignore per-frame decode errors
                }
            }
            rafRef.current = requestAnimationFrame(scan);
        };

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } } })
            .then(stream => {
                if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().then(() => {
                        setStatus('scanning');
                        scan();
                    }).catch(() => {
                        setErrorMsg('Could not start camera playback.');
                        setStatus('error');
                    });
                }
            })
            .catch(() => {
                setErrorMsg('Camera permission denied. Allow camera access and try again.');
                setStatus('error');
            });

        return () => {
            active = false;
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [onScan]);

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-gray-50 rounded-2xl border border-gray-200">
                <AlertTriangle className="w-10 h-10 text-orange-500" />
                <p className="text-sm font-bold text-gray-700 text-center">{errorMsg}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Camera viewfinder */}
            <div
                className="relative w-full rounded-2xl overflow-hidden bg-black"
                style={{ aspectRatio: '1' }}
            >
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                />

                {/* Dim overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Corner brackets */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-3/5 h-3/5">
                        <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-brand-primary rounded-tl-lg" />
                        <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-brand-primary rounded-tr-lg" />
                        <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-brand-primary rounded-bl-lg" />
                        <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-brand-primary rounded-br-lg" />
                        {/* Scan line */}
                        <span className="absolute left-2 right-2 top-1/2 h-0.5 bg-brand-primary/70 animate-pulse" />
                    </div>
                </div>

                {status === 'requesting' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-white/60 animate-pulse" />
                    </div>
                )}
            </div>

            <p className="text-xs font-bold text-gray-400 text-center uppercase tracking-widest">
                Point camera at QR code
            </p>
        </div>
    );
}
