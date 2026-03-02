import { useState, useMemo } from 'react';
import { LiveAlertTicker } from '../components/ui/LiveAlertTicker';
import { ShieldAlert, Zap, ArrowUpToLine, CarFront, CheckCircle2, ChevronRight, MapPin, BriefcaseMedical, BatteryCharging, Brain, X, Droplets, Siren, PhoneCall, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useHubs } from '../contexts/HubContext';
import { useTheme, type RiskLevel } from '../contexts/ThemeContext';
import { useTranslation } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';

export function Home() {
    const { hubs } = useHubs();
    const { region, language, riskLevel, emergencyNumber, forecastRisk12h, forecastRisk24h, forecastRisk72h, forecastMaxRain12h, forecastMaxRain24h, forecastMaxRain72h, lastWeatherUpdate, weatherData } = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('now');
    const [showSourcesModal, setShowSourcesModal] = useState(false);

    // Find the best recommended hub (first one in region that is OPEN)
    const exactMatchHub = hubs.find(h => region?.includes(h.location.region) && h.status === 'OPEN_SHELTER');
    const recommendedHub = exactMatchHub || hubs[0];
    const isLocalMatch = !!exactMatchHub;

    // Dynamic Risk Styling Map
    const riskStyles = {
        green: {
            bg: 'from-green-500 to-green-600',
            tabBg: 'bg-green-600',
            title: 'Green Risk',
            desc: 'Normal rain conditions. Monitoring active.'
        },
        yellow: {
            bg: 'from-yellow-400 to-yellow-500',
            tabBg: 'bg-yellow-500',
            title: 'Yellow Risk',
            desc: 'Continuous rain. Minor flooding possible.'
        },
        orange: {
            bg: 'from-[#F48C25] to-[#E67E22]',
            tabBg: 'bg-[#F48C25]',
            title: 'Orange Risk',
            desc: 'Heavy rain. River rising rapidly in city center.'
        },
        red: {
            bg: 'from-red-600 to-red-700',
            tabBg: 'bg-red-600',
            title: 'Red Risk',
            desc: 'CRITICAL FORECAST. Evacuate immediately.'
        }
    };
    // Real forecast risk from ThemeContext (Open-Meteo 72h hourly data)
    const activeRisk: RiskLevel = useMemo(() => {
        if (activeTab === 'next 12h') return forecastRisk12h;
        if (activeTab === 'next 24h') return forecastRisk24h;
        if (activeTab === 'next 72h') return forecastRisk72h;
        return riskLevel;
    }, [activeTab, riskLevel, forecastRisk12h, forecastRisk24h, forecastRisk72h]);

    const activeForecastMaxRain = useMemo(() => {
        if (activeTab === 'next 12h') return forecastMaxRain12h;
        if (activeTab === 'next 24h') return forecastMaxRain24h;
        if (activeTab === 'next 72h') return forecastMaxRain72h;
        return weatherData?.rain ?? 0;
    }, [activeTab, forecastMaxRain12h, forecastMaxRain24h, forecastMaxRain72h, weatherData]);

    const currentRisk = riskStyles[activeRisk];

    type ActionRoute = { type: 'tel', to: string } | { type: 'navigate', to: string } | { type: 'ai', to: string };

    interface RiskAction {
        id: string;
        title: string;
        icon: React.ElementType;
        color: string;
        bg: string;
        route: ActionRoute;
    }

    const riskActionsMap: Record<string, RiskAction[]> = {
        green: [
            { id: 'gobag', title: "Check Go-Bag", icon: BriefcaseMedical, color: "text-blue-500", bg: "bg-blue-50", route: { type: 'navigate', to: '/quick-assist/dt_gobag_01' } },
            { id: 'water', title: "Store Clean Water", icon: Droplets, color: "text-green-600", bg: "bg-green-50", route: { type: 'navigate', to: '/quick-assist/dt_water_01' } },
            { id: 'battery', title: "Keep Devices Charged", icon: BatteryCharging, color: "text-purple-500", bg: "bg-purple-50", route: { type: 'ai', to: 'How to Keep Devices Charged in Emergency' } }
        ],
        yellow: [
            { id: 'valuables', title: "Move Valuables Upstairs", icon: ArrowUpToLine, color: "text-orange-500", bg: "bg-orange-50", route: { type: 'ai', to: 'How to Protect Valuables from Flood' } },
            { id: 'store_water', title: "Store Clean Water", icon: Droplets, color: "text-water-blue", bg: "bg-blue-50", route: { type: 'navigate', to: '/quick-assist/dt_water_01' } },
            { id: 'vehicle', title: "Prepare Vehicle", icon: CarFront, color: "text-gray-700", bg: "bg-gray-100", route: { type: 'ai', to: 'How to Prepare Vehicle for Flood' } }
        ],
        orange: [
            { id: 'power', title: "Cut Main Power & Gas", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50", route: { type: 'navigate', to: '/quick-assist/dt_electric_01' } },
            { id: 'evac_hub', title: "Move to Safe Hub", icon: MapPin, color: "text-brand-primary", bg: "bg-brand-primary/10", route: { type: 'navigate', to: '/map' } },
            { id: 'med_kit', title: "Grab Medical Kit", icon: BriefcaseMedical, color: "text-critical-red", bg: "bg-red-50", route: { type: 'navigate', to: '/quick-assist/dt_gobag_01' } }
        ],
        red: [
            { id: 'evac_now', title: "EVACUATE IMMEDIATELY", icon: Siren, color: "text-critical-red", bg: "bg-red-100", route: { type: 'navigate', to: '/quick-assist/dt_flood_evac_01' } },
            { id: 'rescue', title: "Call Direct Rescue", icon: PhoneCall, color: "text-blue-600", bg: "bg-blue-100", route: { type: 'tel', to: emergencyNumber } },
            { id: 'avoid_water', title: "AVOID FLOODWATER", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100", route: { type: 'ai', to: 'How to Survive and Avoid Floodwater' } }
        ]
    };

    const doNowActions = riskActionsMap[activeRisk] || riskActionsMap.green;

    return (
        <div className="flex flex-col h-full bg-surface-light animate-in fade-in duration-500">

            {/* 1. Real-Time News Ticker & Forecast */}
            <LiveAlertTicker
                forecastRisk={activeTab !== 'now' ? activeRisk : undefined}
                forecastWindow={activeTab !== 'now' ? activeTab as '12h' | '24h' | '72h' : undefined}
                forecastMaxRain={activeTab !== 'now' ? activeForecastMaxRain : undefined}
            />

            {/* 2. Primary Risk Card */}
            <div className={cn("mx-4 mt-6 p-6 rounded-3xl bg-gradient-to-br text-white shadow-card relative overflow-hidden", currentRisk.bg)}>
                {/* Abstract watermark or pattern could go here instead of a photo */}
                <div className="absolute -right-10 -top-10 opacity-10">
                    <ShieldAlert className="w-64 h-64" />
                </div>

                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <ShieldAlert className="w-8 h-8 flex-shrink-0" />
                            <h2 className="text-3xl font-black uppercase tracking-tight">{currentRisk.title}</h2>
                        </div>
                        <p className="text-xl font-medium opacity-90 leading-tight">
                            {currentRisk.desc}
                        </p>
                    </div>
                </div>

                {/* Evidence Button (The Trust Protocol) */}
                <div className="mt-8 flex items-center justify-between relative z-10">
                    <p className="text-sm font-semibold opacity-80">
                        {activeTab === 'now'
                            ? (lastWeatherUpdate
                                ? `Updated ${Math.max(0, Math.floor((Date.now() - lastWeatherUpdate.getTime()) / 60000))} min ago`
                                : 'Fetching live data...')
                            : `Open-Meteo · Peak ${activeForecastMaxRain.toFixed(1)}mm/h`}
                    </p>
                    <button
                        onClick={() => setShowSourcesModal(true)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-sm font-bold uppercase transition-colors haptic-active">
                        Sources
                    </button>
                </div>
            </div>

            {/* 3. Timeline Tabs */}
            <div className="mt-8 px-4 flex space-x-2 overflow-x-auto snap-x hide-scrollbar">
                {['now', 'next 12h', 'next 24h', 'next 72h'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "snap-start flex-none px-6 py-2.5 font-bold rounded-full shadow-sm transition-colors capitalize",
                            activeTab === tab
                                ? cn("text-white", currentRisk.tabBg)
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 4. Action Board (Do Now) */}
            <div className="mt-8 px-4 pb-8">
                <h3 className="text-xl font-black text-gray-900 mb-4 px-1">Do now ({doNowActions.length + 1})</h3>

                <div className="space-y-4">
                    {/* Ask AI Highly Visible Button */}
                    <button
                        onClick={() => navigate('/ai-assist')}
                        className="w-full flex items-center p-4 bg-white rounded-2xl shadow-card border-2 border-brand-primary/20 border-b-[4px] border-b-brand-primary/30 haptic-active text-left group relative overflow-hidden transition-all"
                    >
                        <div className="absolute top-0 right-0 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center uppercase tracking-wider">
                            Beta
                        </div>
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-50 text-purple-600">
                            <Brain className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <div className="ml-4 flex-1">
                            <span className="text-lg font-black text-gray-900 leading-tight block group-hover:text-brand-primary transition-colors">
                                Ask AI (GAIA-119)
                            </span>
                            <span className="text-sm font-semibold text-gray-500">
                                Get immediate situation advice
                            </span>
                        </div>
                    </button>

                    {/* Dynamic Action Cards */}
                    {doNowActions.map((action) => {
                        const handleActionClick = () => {
                            if (action.route.type === 'tel') {
                                window.location.href = `tel:${action.route.to}`;
                            } else if (action.route.type === 'navigate') {
                                navigate(action.route.to);
                            } else if (action.route.type === 'ai') {
                                navigate(`/ai-assist?q=${encodeURIComponent(action.route.to)}`);
                            }
                        };

                        return (
                            <ActionCard
                                key={action.id}
                                icon={action.icon}
                                title={action.title}
                                color={action.color}
                                bgColor={action.bg}
                                onClick={handleActionClick}
                            />
                        );
                    })}
                </div>

                {/* Nearest Community Hub Suggestion */}
                <div className="mt-8">
                    <h3 className="text-xl font-black text-gray-900 mb-4 px-1 flex items-center justify-between">
                        🛡️ {t('safe_hub_locator')}
                        <button onClick={() => navigate('/map')} className="text-sm text-brand-primary font-bold transition-opacity hover:opacity-70">See all {hubs.length} (Mesh Data)</button>
                    </h3>

                    {!isLocalMatch && (
                        <div className="mb-3 px-3 py-2 bg-yellow-50 rounded-xl border border-yellow-200 text-xs font-bold text-yellow-700 flex items-start">
                            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{t('region_warning')} ({region})</span>
                        </div>
                    )}

                    <div className="bg-white rounded-[24px] p-5 shadow-card border-2 border-gray-100 border-b-[4px] border-b-gray-200 relative overflow-hidden haptic-active hover:border-brand-primary/30 transition-all cursor-pointer" onClick={() => navigate('/map')}>
                        {recommendedHub.verified_messages?.some(m => m.isVerified) && (
                            <div className="absolute top-0 right-0 bg-blue-50 text-water-blue px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Admin
                            </div>
                        )}
                        <h4 className="text-lg font-bold text-gray-900 pr-24 leading-tight mb-1">
                            {recommendedHub.name[language] || recommendedHub.name['en']}
                        </h4>
                        <div className="flex items-center text-sm font-semibold text-gray-500 space-x-2 mb-3">
                            <span className={cn(
                                "px-2 py-0.5 rounded-md font-bold",
                                recommendedHub.status === 'OPEN_SHELTER' ? "bg-green-100 text-green-700" :
                                    recommendedHub.status === 'FULL' ? "bg-red-100 text-critical-red" : "bg-gray-100 text-gray-600"
                            )}>
                                {recommendedHub.status === 'OPEN_SHELTER' ? 'OPEN' : recommendedHub.status === 'FULL' ? 'FULL' : 'UNKNOWN'}
                            </span>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((recommendedHub.name[language] || recommendedHub.name['en']) + ' ' + recommendedHub.location.region)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md hover:bg-brand-primary/20 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MapPin className="w-3 h-3 mr-1" /> Map
                            </a>
                        </div>

                        {(recommendedHub.verified_messages?.length || 0) > 0 || recommendedHub.lastUpdated ? (
                            <p className="text-xs text-brand-primary font-bold flex items-center pt-3 border-t border-gray-50">
                                <Zap className="w-3 h-3 mr-1" /> {recommendedHub.lastUpdated ? "Local P2P update available" : "Crowdsourced updates available"}
                            </p>
                        ) : null}

                        <div className="absolute bottom-4 right-4 text-brand-primary">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Sources Modal to replace alert() */}
            {showSourcesModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-light rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowSourcesModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 haptic-active">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 pr-6">Data Sources</h2>
                        <div className="space-y-3 mb-6">
                            <div className="text-sm font-semibold text-gray-700 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                📡 Open-Meteo API · Free, no API key · 30-min refresh
                            </div>
                            <div className="text-sm font-semibold text-gray-700 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                🔗 QR-P2P Relay · Device-to-device · No internet needed
                            </div>
                            <div className="text-xs text-gray-500 font-medium px-2 py-2">
                                {lastWeatherUpdate
                                    ? `Last sync: ${lastWeatherUpdate.toLocaleTimeString()}`
                                    : 'Weather data not yet loaded.'}
                            </div>
                        </div>
                        <button onClick={() => setShowSourcesModal(false)} className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl haptic-active shadow-card">
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

interface ActionCardProps {
    icon: React.ElementType;
    title: string;
    color: string;
    bgColor: string;
    onClick?: () => void;
}

function ActionCard({ icon: Icon, title, color, bgColor, onClick }: ActionCardProps) {
    return (
        <button onClick={onClick} className="w-full flex items-center p-4 bg-white rounded-2xl shadow-sm border-2 border-gray-100 border-b-[3px] border-b-gray-200 hover:border-brand-primary/20 haptic-active text-left group transition-all">
            <div className={cn("flex items-center justify-center w-14 h-14 rounded-xl", bgColor, color)}>
                <Icon className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <div className="ml-4 flex-1">
                <span className="text-lg font-bold text-gray-900 leading-tight block">
                    {title}
                </span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 ml-4 flex-shrink-0 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </button>
    );
}
