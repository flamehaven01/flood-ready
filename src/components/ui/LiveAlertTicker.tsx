import { AlertTriangle, X } from 'lucide-react';
import { useTheme, type RiskLevel } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../lib/i18n';

interface LiveAlertTickerProps {
    forecastRisk?: RiskLevel;
    forecastWindow?: '12h' | '24h' | '72h';
    forecastMaxRain?: number;
}

export function LiveAlertTicker({ forecastRisk, forecastWindow, forecastMaxRain }: LiveAlertTickerProps) {
    const { riskLevel, weatherData, region, lastWeatherUpdate } = useTheme();
    const { t } = useTranslation();
    const [showSources, setShowSources] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    const effectiveRisk = forecastRisk || riskLevel;
    const regionShort = region?.split(' - ')[1] || region || 'Yala';

    let liveMessage = '';

    if (!forecastRisk && isOnline && weatherData) {
        // Live current conditions
        liveMessage = `${t('live_prefix')}: ${regionShort} — ${t('metric_rain')}: ${weatherData.rain}mm/h, ${t('metric_temp')}: ${weatherData.temp}°C, ${t('metric_wind')}: ${weatherData.wind}km/h`;
    } else if (forecastRisk && forecastWindow !== undefined && forecastMaxRain !== undefined) {
        // Real forecast message from Open-Meteo data
        const riskLabel = { green: 'GREEN', yellow: 'YELLOW', orange: 'ORANGE', red: 'RED' }[forecastRisk];
        const rainDesc = forecastMaxRain < 1
            ? 'No significant rain'
            : forecastMaxRain < 5
                ? `Light rain (${forecastMaxRain.toFixed(1)}mm/h)`
                : forecastMaxRain < 15
                    ? `Heavy rain (${forecastMaxRain.toFixed(1)}mm/h)`
                    : `Extreme rain (${forecastMaxRain.toFixed(1)}mm/h)`;
        liveMessage = `FORECAST NEXT ${forecastWindow.toUpperCase()}: ${regionShort} — Peak rain: ${forecastMaxRain.toFixed(1)}mm/h · ${rainDesc} · ${riskLabel} RISK`;
    } else {
        // Fallback static messages (no weather data yet)
        const messages: Record<RiskLevel, string> = {
            green: 'LIVE: Monitoring normal conditions. No current threats detected.',
            yellow: 'ALERT: Continuous rain detected. Watch for localized pooling.',
            orange: 'WARNING: River levels rising. Heavy rain ongoing. Prepare to act.',
            red: 'BREAKING: Extreme rain event detected. Evacuate immediately if in flood-prone area.',
        };
        liveMessage = messages[effectiveRisk];
    }

    const tickerColors: Record<RiskLevel, string> = {
        green: 'bg-green-600 text-white',
        yellow: 'bg-yellow-500 text-gray-900',
        orange: 'bg-[#F48C25] text-white',
        red: 'bg-critical-red text-white',
    };

    return (
        <>
            <button
                onClick={() => setShowSources(true)}
                className={cn(
                    'w-full text-left p-3 mt-2 mx-4 rounded-xl shadow-sm flex items-center space-x-3 haptic-active overflow-hidden relative',
                    tickerColors[effectiveRisk]
                )}
                style={{ width: 'calc(100% - 2rem)' }}
            >
                <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
                <div className="flex-1 overflow-hidden relative h-6 flex items-center">
                    <p className="text-sm font-bold truncate absolute whitespace-nowrap animate-marquee">
                        {liveMessage}
                    </p>
                </div>
                <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-md whitespace-nowrap uppercase tracking-wider">
                    {forecastRisk ? 'Forecast' : 'Live'}
                </span>
            </button>

            {showSources && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-light rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowSources(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 haptic-active">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 pr-6">Live Data Sources</h2>
                        <div className="space-y-3 mb-6">
                            <div className="text-sm font-semibold text-gray-700 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                📡 Open-Meteo API · Free · No API key · 30-min refresh
                            </div>
                            <div className="text-sm font-semibold text-gray-700 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                🔗 QR-P2P Relay · Share hub status device-to-device
                            </div>
                            <div className="text-xs text-gray-500 font-medium px-2 py-2">
                                {lastWeatherUpdate
                                    ? `Last sync: ${lastWeatherUpdate.toLocaleTimeString()}`
                                    : 'Awaiting first weather sync.'}
                            </div>
                        </div>
                        <button onClick={() => setShowSources(false)} className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl haptic-active">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
