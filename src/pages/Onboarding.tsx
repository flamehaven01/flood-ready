import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, type Language } from '../contexts/ThemeContext';
import { useAI } from '../contexts/AIContext';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';
import { MapPin, Users, HeartPulse, DownloadCloud, CheckCircle2, AlertTriangle, X, Brain, Send, Zap } from 'lucide-react';
import type { EmergencyAction } from '../lib/ollama';

export function Onboarding() {
    const {
        setLanguage, setRegion, setHousehold, setMedicalNeeds,
        completeOnboarding, hasCompletedOnboarding
    } = useTheme();
    const { initEngine, askQwen, isReady, progress, progressText, isLoading } = useAI();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [customRegion, setCustomRegion] = useState('');
    const [showDataWarning, setShowDataWarning] = useState(false);

    // Step 5: AI test state
    const [testInput, setTestInput] = useState('');
    const [testResult, setTestResult] = useState<EmergencyAction | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testStreamingText, setTestStreamingText] = useState<string>('');

    const handleConfirmDownload = () => {
        setShowDataWarning(false);
        initEngine();
    };

    // If somehow already onboarded, redirect out
    useEffect(() => {
        if (hasCompletedOnboarding) {
            navigate('/', { replace: true });
        }
    }, [hasCompletedOnboarding, navigate]);

    const handleSelectLanguage = (lang: string) => {
        setLanguage(lang as Language);
        setStep(2);
    };

    const handleSelectRegion = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const finalRegion = customRegion.trim() || 'Global Area';
        setRegion(finalRegion);
        setStep(3);
    };

    const handleSelectHousehold = (hh: 'solo' | 'family_with_kids' | 'elderly') => {
        setHousehold(hh);
        setStep(4);
    };

    const handleSelectMedical = (med: boolean) => {
        setMedicalNeeds(med);
        setStep(5); // proceed to AI setup step
    };

    const handleFinish = () => {
        completeOnboarding();
        navigate('/', { replace: true });
    };

    const handleTestAI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testInput.trim() || isTesting) return;
        setIsTesting(true);
        setTestResult(null);
        setTestStreamingText('');
        try {
            const result = await askQwen(testInput.trim(), (text) => setTestStreamingText(text));
            setTestResult(result);
        } finally {
            setIsTesting(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-40 h-40 mb-2 drop-shadow-2xl">
                            <img src="/logo.png" alt="Flood Ready Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                            Flood Ready
                        </h1>
                        <p className="text-lg font-bold text-gray-500 mb-8 max-w-[340px] flex flex-col items-center justify-center mx-auto leading-relaxed">
                            <span>A True Offline-First,</span>
                            <span>On-Device AI Disaster Survival Application</span>
                        </p>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full bg-brand-primary text-white font-black text-lg py-4 rounded-2xl shadow-card hover:shadow-card-hover haptic-active transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                );
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        <CompactLangCard title="English" onClick={() => handleSelectLanguage('en')} />
                        <CompactLangCard title="ภาษาไทย" onClick={() => handleSelectLanguage('th')} />
                        <CompactLangCard title="Melayu" onClick={() => handleSelectLanguage('ms')} />
                        {/* MVP: Other languages are disabled for now */}
                        {/* 
                        <CompactLangCard title="한국어" onClick={() => handleSelectLanguage('ko')} />
                        <CompactLangCard title="日本語" onClick={() => handleSelectLanguage('ja')} />
                        <CompactLangCard title="中文" onClick={() => handleSelectLanguage('zh')} />
                        <CompactLangCard title="عربي" onClick={() => handleSelectLanguage('ar')} />
                        <CompactLangCard title="Indo" onClick={() => handleSelectLanguage('id')} />
                        <CompactLangCard title="Español" onClick={() => handleSelectLanguage('es')} />
                        <CompactLangCard title="Deutsch" onClick={() => handleSelectLanguage('de')} />
                        <CompactLangCard title="Italiano" onClick={() => handleSelectLanguage('it')} />
                        <CompactLangCard title="Français" onClick={() => handleSelectLanguage('fr')} />
                        */}
                    </div>
                );
            case 2: {
                // Yala Province & Global Reference Cities
                const yalaDistricts = ["Mueang Yala", "Betong", "Bannang Sata", "Raman"];
                // MVP: Disabled
                // const globalCities = ["Seoul", "London", "Tokyo", "New York"];
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">{t('local_districts_yala')}</label>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {yalaDistricts.map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setCustomRegion(`Yala - ${d}`)}
                                        className={cn(
                                            "p-3 rounded-xl border-2 font-bold transition-all text-sm text-left truncate",
                                            customRegion === `Yala - ${d}`
                                                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-brand-primary/50"
                                        )}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                            {/* MVP: Global Reference Cities disabled, but manual entry kept 
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">{t('global_reference_cities')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {globalCities.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => setCustomRegion(city)}
                                        className={cn(
                                            "p-3 rounded-xl border-2 font-bold transition-all text-sm text-left truncate",
                                            customRegion === city
                                                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-brand-primary/50"
                                        )}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                            */}
                        </div>

                        <form onSubmit={handleSelectRegion} className="w-full">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1 relative z-10">{t('or_type_location')}</label>
                            <div className="bg-white p-3 rounded-2xl border-2 border-transparent focus-within:border-brand-primary shadow-sm flex items-center mb-4 transition-colors">
                                <MapPin className="w-6 h-6 text-brand-primary mx-3" />
                                <input
                                    type="text"
                                    value={customRegion}
                                    onChange={(e) => setCustomRegion(e.target.value)}
                                    className="w-full text-xl font-black text-gray-900 outline-none py-2"
                                    placeholder="e.g. Yala City Center"
                                />
                            </div>
                            <button type="submit" disabled={!customRegion.trim()} className="disabled:opacity-50 w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-card haptic-active">
                                {t('continue_btn')}
                            </button>
                        </form>
                    </div>
                );
            }
            case 3:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <OnboardCard icon={Users} title={t('just_me_solo')} onClick={() => handleSelectHousehold('solo')} />
                        <OnboardCard icon={Users} title={t('family_with_kids')} onClick={() => handleSelectHousehold('family_with_kids')} />
                        <OnboardCard icon={Users} title={t('caring_for_elderly')} onClick={() => handleSelectHousehold('elderly')} />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <OnboardCard icon={HeartPulse} title={t('yes_medical_needs')} onClick={() => handleSelectMedical(true)} color="text-critical-red" />
                        <OnboardCard icon={HeartPulse} title={t('no_healthy')} onClick={() => handleSelectMedical(false)} />
                    </div>
                );

            case 5: {
                const riskColors: Record<string, string> = {
                    red: 'bg-red-50 text-red-700 border-red-300',
                    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-300',
                    green: 'bg-green-50 text-green-700 border-green-300',
                };
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Model Info Card */}
                        <div className="p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                            <div className="flex items-center mb-3">
                                <Brain className="w-6 h-6 text-brand-primary mr-2" />
                                <span className="font-black text-gray-900">GAIA-119 · Qwen3</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs font-bold">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">1.7B params</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">~1.2 GB</span>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">WebGPU</span>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg">Offline-capable</span>
                            </div>
                        </div>

                        {/* Download Area */}
                        {isReady ? (
                            <div className="flex items-center text-green-700 font-bold p-4 bg-green-50 rounded-2xl border border-green-200">
                                <CheckCircle2 className="w-6 h-6 mr-2 flex-shrink-0" />
                                <div>
                                    <p>{t('ai_engine_ready')}</p>
                                    <p className="text-xs font-medium text-green-600">{t('offline_survival_mode_active')}</p>
                                </div>
                            </div>
                        ) : isLoading ? (
                            <div className="p-4 bg-white rounded-2xl border-2 border-brand-primary/30">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center text-brand-primary font-bold">
                                        <DownloadCloud className="w-5 h-5 mr-2 animate-bounce" />
                                        {t('downloading_ai')}
                                    </div>
                                    <span className="text-brand-primary font-black">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 font-medium truncate">{progressText}</p>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDataWarning(true)}
                                className="flex items-center justify-center w-full py-4 px-4 bg-brand-primary text-white font-bold rounded-2xl shadow-card haptic-active"
                            >
                                <DownloadCloud className="w-6 h-6 mr-2" />
                                {t('download_ai_engine')}
                            </button>
                        )}

                        {/* Live AI Test — only shown when ready */}
                        {isReady && (
                            <div className="p-5 bg-white rounded-2xl border-2 border-brand-primary/20 shadow-sm">
                                <div className="flex items-center mb-3">
                                    <Zap className="w-5 h-5 text-brand-primary mr-2" />
                                    <span className="font-black text-gray-900">{t('test_gaia_live')}</span>
                                </div>
                                <form onSubmit={handleTestAI} className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={testInput}
                                        onChange={(e) => setTestInput(e.target.value)}
                                        placeholder="e.g. water entering house"
                                        className="flex-1 bg-gray-50 border-2 border-gray-200 focus:border-brand-primary rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition-colors"
                                        disabled={isTesting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isTesting || !testInput.trim()}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-colors haptic-active",
                                            testInput.trim() && !isTesting ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-400"
                                        )}
                                    >
                                        {isTesting ? (
                                            <Brain className="w-5 h-5 animate-pulse" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </form>
                                {isTesting && testStreamingText && (
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 mb-2 overflow-hidden max-h-16">
                                        <p className="text-[10px] font-mono text-gray-400 leading-relaxed break-all line-clamp-3">{testStreamingText}</p>
                                    </div>
                                )}
                                {isTesting && (
                                    <div className="flex flex-col items-center justify-center py-6 text-center animate-pulse bg-gray-50 rounded-xl border border-gray-100 mb-3">
                                        <Brain className="w-8 h-8 text-brand-primary mb-2 animate-bounce" />
                                        <p className="text-sm font-bold text-gray-900">AI is analyzing your situation...</p>
                                        <p className="text-[11px] font-semibold text-gray-500 mt-1">Processing 100% offline via WebGPU. May take 15-30 seconds.</p>
                                    </div>
                                )}
                                {testResult && !isTesting && (
                                    <div className={cn("p-4 rounded-xl border text-sm font-bold mb-3 shadow-sm", riskColors[testResult.level] || riskColors.green)}>
                                        <p className="uppercase tracking-wider mb-2 flex items-center">
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            {testResult.level} RISK ASSESSMENT
                                        </p>
                                        <p className="text-gray-900 mb-3 opacity-90">{testResult.summary}</p>
                                        <div className="space-y-1.5 bg-white/50 p-3 rounded-lg">
                                            {testResult.actions.slice(0, 2).map((a, i) => (
                                                <p key={i} className="font-bold text-gray-800 flex items-start">
                                                    <span className="text-brand-primary mr-2">·</span> {a}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Finish buttons */}
                        <div className="space-y-3 pt-2">
                            <button
                                onClick={handleFinish}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-card haptic-active"
                            >
                                {isReady ? t('finish_setup') : t('skip_use_offline')}
                            </button>
                        </div>
                    </div>
                );
            }
        }
    };

    const getTitle = () => {
        switch (step) {
            case 1: return t('onboarding_step1_title');
            case 2: return t('onboarding_step2_title');
            case 3: return t('onboarding_step3_title');
            case 4: return t('onboarding_step4_title');
            case 5: return t('onboarding_step5_title');
            default: return "";
        }
    };

    return (
        <div className="flex flex-col h-full bg-surface-light px-4 py-8">
            <div className="mb-8">
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-1">Step {step} of 5</p>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                    {getTitle()}
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe">
                {renderStepContent()}
            </div>

            {showDataWarning && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-light rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
                        <button onClick={() => setShowDataWarning(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 haptic-active">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
                            <AlertTriangle className="w-8 h-8" strokeWidth={3} />
                        </div>

                        <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Cellular Data Warning</h2>
                        <p className="text-center text-gray-600 font-medium mb-6">
                            You are about to download the <strong>1.2GB</strong> AI survival engine.
                            <br /><br />
                            If you are not connected to Wi-Fi, this may consume a huge amount of your 4G/5G data and incur high carrier charges.
                        </p>

                        <div className="space-y-3">
                            <button onClick={handleConfirmDownload} className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl haptic-active shadow-card">
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

interface OnboardCardProps {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    onClick: () => void;
    color?: string;
}

function OnboardCard({ icon: Icon, title, subtitle, onClick, color = "text-brand-primary" }: OnboardCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center p-6 bg-white rounded-3xl shadow-card border-2 border-transparent hover:border-brand-primary/20 haptic-active text-left group transition-all"
        >
            <div className={cn("flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50", color)}>
                <Icon className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div className="ml-5 flex-1">
                <span className="text-2xl font-bold text-gray-900 leading-tight block group-hover:text-brand-primary transition-colors">
                    {title}
                </span>
                {subtitle && <span className="text-sm font-semibold text-gray-500 mt-1 block">{subtitle}</span>}
            </div>
        </button>
    );
}

interface CompactLangCardProps {
    title: string;
    onClick: () => void;
}

function CompactLangCard({ title, onClick }: CompactLangCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full h-14 flex items-center justify-center bg-white rounded-2xl shadow-sm border-2 border-gray-100 border-b-[3px] border-b-gray-200 hover:border-brand-primary/30 haptic-active text-center transition-all"
        >
            <span className="text-lg font-black text-gray-800 tracking-tight">{title}</span>
        </button>
    );
}
