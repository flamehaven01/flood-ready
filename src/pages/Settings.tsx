import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { cn } from '../lib/utils';
import { MapPin, Globe, RefreshCcw, ArrowLeft, CheckCircle2, X, AlertTriangle, Save, Brain, DownloadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Settings() {
    const {
        region, setRegion,
        language, setLanguage,
        mode, setMode,
        autoBattery, setAutoBattery,
        emergencyNumber, setEmergencyNumber,
        resetToDefaults
    } = useTheme();
    const { initEngine, isReady, isLoading, progress, progressText } = useAI();
    const navigate = useNavigate();

    // Use local state to manage opening the 'sheets'
    const [view, setView] = useState<'main' | 'language_protection' | 'region_alerts' | 'ai_engine'>('main');
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDataWarning, setShowDataWarning] = useState(false);
    const [customRegion, setCustomRegion] = useState(region);

    // Keep local input in sync just in case
    useEffect(() => {
        setCustomRegion(region);
    }, [region]);

    const handleSaveRegion = () => {
        const safeRegion = customRegion || '';
        const finalRegion = safeRegion.trim() || 'Global Area';
        setRegion(finalRegion);
        setView('main');
    };

    const handleResetConfirm = () => {
        resetToDefaults();
        navigate('/', { replace: true });
    };

    if (view === 'region_alerts') {
        return (
            <div className="flex flex-col h-full bg-surface-light px-4 py-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center mb-8">
                    <button onClick={() => setView('main')} className="p-2 -ml-2 haptic-active text-gray-700 bg-white rounded-full shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-black text-gray-900 ml-4">Region & Alerts</h2>
                </div>

                <div className="space-y-8">
                    {/* Emergency Contacts */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Direct Rescue Number</h3>
                        <div className="bg-white p-5 rounded-2xl border-2 border-transparent shadow-sm flex items-center">
                            <input
                                type="tel"
                                value={emergencyNumber}
                                onChange={(e) => setEmergencyNumber(e.target.value)}
                                className="w-full text-xl font-black text-brand-primary outline-none"
                                placeholder="e.g. 1669, 911, 112"
                            />
                        </div>
                        <p className="text-xs font-semibold text-gray-400 mt-2 px-1">This number is dialed directly when you press "Call Rescue" during an extreme Red Risk flood.</p>
                    </div>

                    {/* Region Selector */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Monitored Region (Global)</h3>
                        <div className="bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm flex flex-col mb-2">
                            <div className="flex items-center mb-3">
                                <MapPin className="w-6 h-6 text-brand-primary mr-3" />
                                <input
                                    type="text"
                                    value={customRegion || ''}
                                    onChange={(e) => setCustomRegion(e.target.value)}
                                    className="w-full text-xl font-black text-gray-900 outline-none"
                                    placeholder="e.g. Seoul, Tokyo, Jakarta"
                                />
                            </div>
                            <button onClick={handleSaveRegion} className="w-full flex items-center justify-center p-3 bg-brand-primary text-white rounded-xl font-bold haptic-active">
                                <Save className="w-5 h-5 mr-2" /> Save Region
                            </button>
                        </div>
                        <p className="text-xs font-semibold text-gray-400 px-1">The AI will automatically tailor survival advice for this specific region.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'ai_engine') {
        return (
            <div className="flex flex-col h-full bg-surface-light px-4 py-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center mb-8">
                    <button onClick={() => setView('main')} className="p-2 -ml-2 haptic-active text-gray-700 bg-white rounded-full shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-black text-gray-900 ml-4">Offline AI Engine</h2>
                </div>

                <div className="space-y-4">
                    {/* Model info */}
                    <div className="p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                        <div className="flex items-center mb-3">
                            <Brain className="w-6 h-6 text-brand-primary mr-2" />
                            <span className="font-black text-gray-900">GAIA-119 · Qwen3</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">1.7B params</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">~1.1 GB</span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">WebGPU</span>
                            <span className={cn("px-2 py-1 rounded-lg", isReady ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
                                {isReady ? "Installed" : "Not Installed"}
                            </span>
                        </div>
                    </div>

                    {/* Status / Download */}
                    {isReady ? (
                        <div className="flex items-center text-green-700 font-bold p-4 bg-green-50 rounded-2xl border border-green-200">
                            <CheckCircle2 className="w-6 h-6 mr-3 flex-shrink-0" />
                            <div>
                                <p>AI Engine Ready</p>
                                <p className="text-xs font-medium text-green-600">Cached in browser · Works offline</p>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="p-4 bg-white rounded-2xl border-2 border-brand-primary/30">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-brand-primary font-bold">
                                    <DownloadCloud className="w-5 h-5 mr-2 animate-bounce" />
                                    Downloading...
                                </div>
                                <span className="text-brand-primary font-black">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                <div className="bg-brand-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-gray-500 font-medium truncate">{progressText}</p>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDataWarning(true)}
                            className="flex items-center justify-center w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-card haptic-active"
                        >
                            <DownloadCloud className="w-6 h-6 mr-2" />
                            Install AI Engine (Wi-Fi Recommended)
                        </button>
                    )}

                    <p className="text-xs text-gray-400 font-medium px-1">
                        The AI engine runs entirely on your device using WebGPU. Once installed, it works without internet during a flood emergency.
                    </p>
                </div>

                {/* Data Warning Modal */}
                {showDataWarning && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-surface-light rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                            <button onClick={() => setShowDataWarning(false)} className="absolute top-4 right-4 text-gray-400 haptic-active">
                                <X className="w-6 h-6" />
                            </button>
                            <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
                                <AlertTriangle className="w-8 h-8" strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Data Warning</h2>
                            <p className="text-center text-gray-600 font-medium mb-6">
                                Downloading <strong>~1.2 GB</strong>. Use Wi-Fi to avoid mobile data charges.
                            </p>
                            <div className="space-y-3">
                                <button onClick={() => { setShowDataWarning(false); initEngine(); }} className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl haptic-active shadow-card">
                                    Yes, Download Now
                                </button>
                                <button onClick={() => setShowDataWarning(false)} className="w-full bg-gray-200 text-gray-800 font-bold py-4 rounded-2xl haptic-active">
                                    Wait for Wi-Fi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (view === 'language_protection') {
        return (
            <div className="flex flex-col h-full bg-surface-light px-4 py-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center mb-8">
                    <button onClick={() => setView('main')} className="p-2 -ml-2 haptic-active text-gray-700 bg-white rounded-full shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-black text-gray-900 ml-4">Language & Protection</h2>
                </div>

                <div className="space-y-8">
                    {/* Language Settings */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">App Language</h3>
                        <div className="space-y-3">
                            <SettingOption selected={language === 'en'} onClick={() => setLanguage('en')} title="English" />
                            <SettingOption selected={language === 'th'} onClick={() => setLanguage('th')} title="ภาษาไทย" subtitle="Thai" />
                            <SettingOption selected={language === 'ms'} onClick={() => setLanguage('ms')} title="Bahasa Melayu" subtitle="Malay" />
                        </div>
                    </div>

                    {/* Mode Settings */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Display Mode</h3>
                        <div className="space-y-3">
                            <SettingOption
                                selected={mode === 'normal'}
                                onClick={() => setMode('normal')}
                                title="Normal"
                                subtitle="Standard UI elements"
                            />
                            <SettingOption
                                selected={mode === 'rain'}
                                onClick={() => setMode('rain')}
                                title="Rain Mode"
                                subtitle="Larger targets, higher contrast"
                                color="text-water-blue"
                            />
                            <SettingOption
                                selected={mode === 'ultra-low-power'}
                                onClick={() => setMode('ultra-low-power')}
                                title="Ultra Low Power"
                                subtitle="Dark theme, static UI"
                                color="text-yellow-500"
                            />
                            {/* Battery auto-detect toggle */}
                            <div className="flex items-center justify-between px-5 py-3 bg-white/50 rounded-2xl border border-gray-100">
                                <div>
                                    <span className="text-sm font-bold text-gray-700 block">Auto-activate below 30% battery</span>
                                    <span className="text-xs font-medium text-gray-400">
                                        {!('getBattery' in navigator) ? 'Not supported on this browser' : autoBattery ? 'Will switch automatically' : 'Manual only'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setAutoBattery(!autoBattery)}
                                    disabled={!('getBattery' in navigator)}
                                    className={cn(
                                        "relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4",
                                        !('getBattery' in navigator) ? "bg-gray-200 cursor-not-allowed" :
                                            autoBattery ? "bg-yellow-400" : "bg-gray-200"
                                    )}
                                    aria-label="Toggle battery auto-detect"
                                >
                                    <span className={cn(
                                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                                        autoBattery ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-surface-light px-4 py-6 animate-in fade-in duration-300">
            <h1 className="text-3xl font-black text-gray-900 mb-6 px-1">Settings</h1>

            {/* 4-Card Blueprint Layout */}
            <div className="grid grid-cols-1 gap-4 mb-10">
                <SettingsCard
                    icon={MapPin}
                    title="Region & Alerts"
                    summary={`${region || 'Not Set'} • Rescue: ${emergencyNumber}`}
                    color="text-brand-primary"
                    onClick={() => setView('region_alerts')}
                />

                <SettingsCard
                    icon={Globe}
                    title="Language & Protection"
                    summary={`${language.toUpperCase()} • Mode: ${mode}`}
                    color="text-yellow-600"
                    onClick={() => setView('language_protection')}
                />

                <SettingsCard
                    icon={Brain}
                    title="Offline AI Engine"
                    summary={isReady ? "GAIA-119 Ready · Offline capable" : isLoading ? `Downloading... ${progress}%` : "Not installed · Tap to install"}
                    color={isReady ? "text-green-600" : "text-brand-primary"}
                    onClick={() => setView('ai_engine')}
                />
            </div>

            {/* Reset Defaults */}
            <div className="mt-auto pt-6 flex justify-center pb-20">
                <button
                    onClick={() => setShowResetModal(true)}
                    className="flex items-center text-gray-400 hover:text-critical-red font-bold text-sm transition-colors haptic-active py-2 px-4 rounded-full hover:bg-red-50"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                </button>
            </div>

            {/* Custom Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-light rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 haptic-active">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="w-16 h-16 bg-red-50 text-critical-red rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
                            <AlertTriangle className="w-8 h-8" strokeWidth={3} />
                        </div>

                        <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Reset App?</h2>
                        <p className="text-center text-gray-600 font-medium mb-8">
                            This will clear all your preferences, and you will need to complete the setup again.
                        </p>

                        <div className="space-y-3">
                            <button onClick={handleResetConfirm} className="w-full bg-critical-red text-white font-bold py-4 rounded-2xl haptic-active shadow-card">
                                Yes, Reset Everything
                            </button>
                            <button onClick={() => setShowResetModal(false)} className="w-full bg-gray-200 text-gray-800 font-bold py-4 rounded-2xl haptic-active">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface SettingsCardProps {
    icon: React.ElementType;
    title: string;
    summary: string;
    color: string;
    onClick?: () => void;
}

function SettingsCard({ icon: Icon, title, summary, color, onClick }: SettingsCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center p-5 bg-white rounded-[24px] shadow-card border-2 border-gray-100 border-b-[4px] border-b-gray-200 hover:border-brand-primary/30 hover:shadow-md transition-all haptic-active text-left group"
        >
            <div className={cn("flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50", color)}>
                <Icon className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <div className="ml-5 flex-1">
                <span className="text-xl font-bold text-gray-900 block group-hover:text-brand-primary transition-colors">
                    {title}
                </span>
                <span className="text-sm font-semibold text-gray-500 mt-1 block">
                    {summary}
                </span>
            </div>
        </button>
    );
}

interface SettingOptionProps {
    selected: boolean;
    onClick: () => void;
    title: string;
    subtitle?: string;
    color?: string;
}

function SettingOption({ selected, onClick, title, subtitle, color = "text-brand-primary" }: SettingOptionProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center p-5 rounded-2xl border-2 transition-all haptic-active text-left",
                selected ? "bg-white border-brand-primary shadow-sm" : "bg-white/50 border-transparent hover:bg-white"
            )}
        >
            <div className="flex-1">
                <span className={cn("text-lg font-bold block", selected ? "text-gray-900" : "text-gray-600")}>
                    {title}
                </span>
                {subtitle && <span className="text-sm font-medium text-gray-500">{subtitle}</span>}
            </div>
            {selected && (
                <div className={cn("ml-4", color)}>
                    <CheckCircle2 className="w-6 h-6" strokeWidth={3} />
                </div>
            )}
        </button>
    );
}
