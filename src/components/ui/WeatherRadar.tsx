import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ShieldAlert, Info, Wind, Thermometer, Droplets, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RiskLevel } from '../../contexts/ThemeContext';

interface WeatherRadarProps {
    lat: number;
    lng: number;
}

// Indicator position per risk level (center of each segment %)
const indicatorPos: Record<RiskLevel, number> = {
    green: 12.5,
    yellow: 37.5,
    orange: 62.5,
    red: 87.5,
};

export function WeatherRadar({ lat, lng }: WeatherRadarProps) {
    const {
        riskLevel,
        weatherData,
        forecastRisk12h, forecastRisk24h, forecastRisk72h,
        forecastMaxRain12h, forecastMaxRain24h, forecastMaxRain72h,
        lastWeatherUpdate,
    } = useTheme();
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
                {/* Indicator bar with 🔻 pointer */}
                <div className="mt-3 relative">
                    {/* 🔻 pointer */}
                    <div
                        className="absolute -top-1 transition-all duration-500 ease-in-out"
                        style={{ left: `calc(${indicatorPos[riskLevel]}% - 6px)` }}
                    >
                        <span className="text-xs leading-none select-none">🔻</span>
                    </div>
                    {/* Color bar */}
                    <div className="flex gap-1 mt-4 w-full">
                        <div className={cn("flex-1 rounded-l-md h-3 transition-all duration-300", riskLevel === 'green' ? "bg-green-500" : "bg-green-200")}></div>
                        <div className={cn("flex-1 h-3 transition-all duration-300", riskLevel === 'yellow' ? "bg-yellow-400" : "bg-yellow-200")}></div>
                        <div className={cn("flex-1 h-3 transition-all duration-300", riskLevel === 'orange' ? "bg-orange-500" : "bg-orange-200")}></div>
                        <div className={cn("flex-1 rounded-r-md h-3 transition-all duration-300", riskLevel === 'red' ? "bg-red-600" : "bg-red-200")}></div>
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className={cn(riskLevel === 'green' && "text-green-600 font-black")}>Clear</span>
                        <span className={cn(riskLevel === 'yellow' && "text-yellow-600 font-black")}>Caution</span>
                        <span className={cn(riskLevel === 'orange' && "text-orange-500 font-black")}>Heavy</span>
                        <span className={cn(riskLevel === 'red' && "text-critical-red font-black")}>Extreme</span>
                    </div>
                </div>
            </div>

            {/* 2. Brief Weather News */}
            {weatherData && (
                <div className="bg-white rounded-3xl shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">Weather Brief</h3>
                        {lastWeatherUpdate && (
                            <span className="flex items-center text-[10px] font-bold text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {Math.max(0, Math.floor((Date.now() - lastWeatherUpdate.getTime()) / 60000))}m ago
                            </span>
                        )}
                    </div>

                    {/* Current conditions row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center bg-blue-50 rounded-2xl py-2.5 px-2">
                            <Droplets className="w-4 h-4 text-blue-500 mb-1" />
                            <span className="text-base font-black text-gray-900">{weatherData.rain.toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-gray-400">mm/h</span>
                        </div>
                        <div className="flex flex-col items-center bg-orange-50 rounded-2xl py-2.5 px-2">
                            <Thermometer className="w-4 h-4 text-orange-400 mb-1" />
                            <span className="text-base font-black text-gray-900">{weatherData.temp.toFixed(0)}°</span>
                            <span className="text-[10px] font-bold text-gray-400">Celsius</span>
                        </div>
                        <div className="flex flex-col items-center bg-gray-50 rounded-2xl py-2.5 px-2">
                            <Wind className="w-4 h-4 text-gray-500 mb-1" />
                            <span className="text-base font-black text-gray-900">{weatherData.wind.toFixed(0)}</span>
                            <span className="text-[10px] font-bold text-gray-400">km/h</span>
                        </div>
                    </div>

                    {/* Forecast outlook row */}
                    <div className="grid grid-cols-3 gap-2">
                        {(
                            [
                                { label: 'Next 12h', risk: forecastRisk12h, peak: forecastMaxRain12h },
                                { label: 'Next 24h', risk: forecastRisk24h, peak: forecastMaxRain24h },
                                { label: 'Next 72h', risk: forecastRisk72h, peak: forecastMaxRain72h },
                            ] as const
                        ).map(({ label, risk, peak }) => {
                            const riskColor: Record<RiskLevel, string> = {
                                green: 'text-green-600 bg-green-50 border-green-200',
                                yellow: 'text-yellow-700 bg-yellow-50 border-yellow-200',
                                orange: 'text-orange-600 bg-orange-50 border-orange-200',
                                red: 'text-critical-red bg-red-50 border-red-200',
                            };
                            return (
                                <div key={label} className={cn("flex flex-col items-center rounded-2xl py-2 px-1 border", riskColor[risk])}>
                                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</span>
                                    <span className="text-sm font-black mt-0.5 uppercase">{risk}</span>
                                    <span className="text-[10px] font-bold opacity-60">{peak.toFixed(1)}mm/h</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3. Embedded Map or Offline Fallback */}
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
