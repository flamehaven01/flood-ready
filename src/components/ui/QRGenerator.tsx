import { QRCodeSVG } from 'qrcode.react';

interface QRGeneratorProps {
    data: string;
    size?: number;
    label?: string;
}

export function QRGenerator({ data, size = 260, label }: QRGeneratorProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <QRCodeSVG
                    value={data}
                    size={size}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#111827"
                    style={{ display: 'block', borderRadius: 8 }}
                />
            </div>
            {label && (
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">
                    {label}
                </p>
            )}
        </div>
    );
}
