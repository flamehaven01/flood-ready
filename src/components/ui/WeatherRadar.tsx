import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ShieldAlert, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RiskLevel } from '../../contexts/ThemeContext';

interface WeatherRadarProps {
    lat: number;
    lng: number;
}

export function WeatherRadar({ lat, lng }: WeatherRadarProps) {
    const { riskLevel } = useTheme();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Track online/offline status for iframe fallback
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Risk Legend UI Mapping
    const legendStyles: Record<RiskLevel, { text: string, bg: string, border: string, icon: string }> = {
        green: {
            text: 'Normal rain conditions. Monitoring active but no immediate threat.',
            bg: 'bg-green-50',
            border: 'border-green-500',
            icon: 'text-green-600'
        },
        yellow: {
            text: 'Continuous rain approaching. Minor flooding possible in low areas.',
            bg: 'bg-yellow-50',
            border: 'border-yellow-400',
            icon: 'text-yellow-600'
        },
        orange: {
            text: 'Heavy rain bands detected. River rising rapidly in city center. Prepare to move.',
            bg: 'bg-orange-50',
            border: 'border-[#F48C25]',
            icon: 'text-[#F48C25]'
        },
        red: {
            text: 'CRITICAL EXTREME RAIN. Severe flooding imminent. Evacuate immediately.',
            bg: 'bg-red-50',
            border: 'border-critical-red',
            icon: 'text-critical-red'
        }
    };

    const currentLegend = legendStyles[riskLevel];

    const mapUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=8&overlay=rain&product=ecmwf&level=surface&lat=${lat}&lon=${lng}`;

    return (
        <div className="flex flex-col space-y-4 animate-in fade-in duration-300">
            {/* 1. Risk Interpreter (Legend) */}
            <div className={cn("bg-white p-4 rounded-3xl shadow-sm border-l-4 transition-colors", currentLegend.border)}>
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center uppercase">
                        <ShieldAlert className={cn("w-5 h-5 mr-2", currentLegend.icon)} />
                        Current Radar: {riskLevel} RISK
                    </h3>
                </div>
                <p className="text-sm text-gray-700 mt-2 font-medium">
                    {currentLegend.text}
                </p>
                <div className="flex gap-2 mt-3 w-full">
                    {/* Color Scale - Highlight current risk */}
                    <div className={cn("flex-1 rounded-l-md h-2 transition-all duration-300", riskLevel === 'green' ? "bg-green-500 scale-y-150" : "bg-green-200")}></div>
                    <div className={cn("flex-1 h-2 transition-all duration-300", riskLevel === 'yellow' ? "bg-yellow-400 scale-y-150" : "bg-yellow-200")}></div>
                    <div className={cn("flex-1 h-2 transition-all duration-300", riskLevel === 'orange' ? "bg-orange-500 scale-y-150" : "bg-orange-200")}></div>
                    <div className={cn("flex-1 rounded-r-md h-2 transition-all duration-300", riskLevel === 'red' ? "bg-red-600 scale-y-150" : "bg-red-200")}></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest drop-shadow-sm">
                    <span className={cn(riskLevel === 'green' && "text-green-600 font-black")}>Clear</span>
                    <span className={cn((riskLevel === 'yellow' || riskLevel === 'orange') && "text-brand-primary font-black")}>Heavy</span>
                    <span className={cn(riskLevel === 'red' && "text-critical-red font-black")}>Extreme</span>
                </div>
            </div>

            {/* 2. Embedded Map or Offline Fallback */}
            <div className="w-full h-[60vh] rounded-3xl overflow-hidden shadow-card relative border border-gray-200 bg-gray-100 flex items-center justify-center">
                {isOnline ? (
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={mapUrl}
                        frameBorder="0"
                        title="Weather Radar"
                        loading="lazy"
                    />
                ) : (
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
                            <Info className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">You are offline.</h3>
                        <p className="text-gray-500 font-medium text-sm">
                            Weather radar requires an internet connection. Please navigate to the <b>Safe Hubs</b> tab to access the local offline P2P network for crowdsourced updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
