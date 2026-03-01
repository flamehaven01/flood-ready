import { AlertTriangle, X } from 'lucide-react';
import { useTheme, type RiskLevel } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../lib/i18n';

export function LiveAlertTicker({ simulatedRisk }: { simulatedRisk?: RiskLevel }) {
    const { riskLevel, weatherData, region } = useTheme();
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

    const effectiveRisk = simulatedRisk || riskLevel;

    let liveMessage = "";

    if (!simulatedRisk && isOnline && weatherData) {
        liveMessage = `${t('live_prefix')}: ${region?.split(' - ')[1] || 'Yala'} - ${t('metric_rain')}: ${weatherData.rain}mm, ${t('metric_temp')}: ${weatherData.temp}°C, ${t('metric_wind')}: ${weatherData.wind}km/h`;
    } else {
        const messages = {
            green: "LIVE: Monitoring normal conditions across all stations. No current threats.",
            yellow: "ALERT: Continuous rain detected. Watch for localized pooling. Simulation active.",
            orange: "WARNING: River levels rising rapidly in city center. Prepare to act.",
            red: "BREAKING: Rapid water rise reported in Bannang Sata district. Evacuation routes open."
        };
        liveMessage = messages[effectiveRisk];
    }
    const tickerColors = {
        green: "bg-green-600 text-white",
        yellow: "bg-yellow-500 text-gray-900",
        orange: "bg-[#F48C25] text-white",
        red: "bg-critical-red text-white"
    };

    return (
        <>
            <button
                onClick={() => setShowSources(true)}
                className={cn(
                    "w-full text-left p-3 mt-2 mx-4 rounded-xl shadow-sm flex items-center space-x-3 haptic-active overflow-hidden relative",
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
                    {simulatedRisk ? 'Forecast' : 'Live'}
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
                                📡 Thai Meteorological Department (Cached)
                            </div>
                            <div className="text-sm font-semibold text-gray-700 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                                🔗 3 Active P2P Offline Mesh Nodes
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
