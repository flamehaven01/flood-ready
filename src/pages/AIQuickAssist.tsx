import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Brain, Search, AlertTriangle, ChevronRight, Mic, Send, MapPin, Droplets, Users, Heart, Activity, GitBranch } from 'lucide-react';
import { getActionIcon } from '../components/icons/ScenarioIcons';
import { cn } from '../lib/utils';
import { useAI } from '../contexts/AIContext';
import { useTheme } from '../contexts/ThemeContext';
import type { EmergencyAction } from '../lib/ollama';
import decisionTreeData from '../data/decision_trees.json';

// Pre-compute valid treeIds from the JSON so AI hallucinations are silently dropped
const validTreeIds = new Set(Object.keys((decisionTreeData as { nodes?: Record<string, unknown> }).nodes ?? {}));


export function AIQuickAssist() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { askQwen } = useAI();
    const { region, household, medicalNeeds, weatherData } = useTheme();

    const [input, setInput] = useState(searchParams.get('q') || '');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<EmergencyAction | null>(null);
    const [streamingText, setStreamingText] = useState<string>('');
    const [submittedQuery, setSubmittedQuery] = useState<string>(searchParams.get('q') || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        setResult(null);
        setStreamingText('');
        setSubmittedQuery(input.trim());

        try {
            // GAIA-119 auto-detects language from user input — pass raw situation only
            const data = await askQwen(input.trim(), (text) => setStreamingText(text));
            setResult(data);
        } catch (error) {
            console.error(error);
            // askQwen already has a built-in fallback, this is an ultimate failsafe
            setResult({
                level: "yellow",
                actions: ["Stay calm and find safe ground.", "Wait for local authorities."],
                searchQuery: input
            });
        } finally {
            setIsLoading(false);
            setInput('');
        }
    };

    const riskColorMap: Record<string, { card: string; badge: string }> = {
        red: { card: "bg-red-50 border-red-500", badge: "bg-red-600 text-white" },
        yellow: { card: "bg-yellow-50 border-yellow-400", badge: "bg-yellow-500 text-white" },
        orange: { card: "bg-orange-50 border-orange-400", badge: "bg-orange-500 text-white" },
        green: { card: "bg-green-50 border-green-500", badge: "bg-green-600 text-white" },
    };

    const priorityStyle: Record<string, { badge: string; num: string }> = {
        CRITICAL: { badge: "bg-red-100 text-red-700", num: "bg-red-600 text-white" },
        IMPORTANT: { badge: "bg-orange-100 text-orange-700", num: "bg-orange-500 text-white" },
        PREPARE: { badge: "bg-blue-100 text-blue-700", num: "bg-blue-500 text-white" },
    };

    return (
        <div className="flex flex-col h-full bg-surface-light px-4 pt-4 animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 haptic-active text-gray-700 bg-white rounded-full shadow-sm"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="ml-4 flex-1">
                    <h1 className="text-2xl font-black text-gray-900 leading-tight flex items-center">
                        <Brain className="w-6 h-6 mr-2 text-brand-primary" />
                        Ask AI (Qwen)
                    </h1>
                </div>
            </div>

            {/* Input Form */}
            <div className="mb-6">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="What is your situation?"
                        className="w-full bg-white border-2 border-gray-200 focus:border-brand-primary rounded-2xl pl-5 pr-24 py-4 text-lg font-semibold text-gray-900 shadow-sm outline-none transition-colors"
                        disabled={isLoading}
                    />
                    <div className="absolute right-2 top-2 flex space-x-1">
                        <button type="button" className="p-2 text-gray-400 hover:text-brand-primary transition-colors haptic-active">
                            <Mic className="w-6 h-6" />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={cn(
                                "p-2 rounded-xl transition-colors haptic-active",
                                input.trim() && !isLoading ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-400"
                            )}>
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Brain className="w-16 h-16 text-brand-primary mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-gray-900">AI is analyzing locally...</h3>
                    <p className="text-sm font-semibold text-gray-500 mt-2">Processing 100% offline via WebGPU.<br />May take 15-30 seconds.</p>
                    {streamingText ? (
                        <div className="w-full mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-left overflow-hidden max-h-28">
                            <p className="text-[11px] font-mono text-gray-400 leading-relaxed break-all line-clamp-5">
                                {streamingText}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-2 font-medium animate-pulse">Connecting to AI engine...</p>
                    )}
                </div>
            )}

            {/* Results */}
            {result && !isLoading && (
                <div className="flex-1 overflow-y-auto pb-8 space-y-3 animate-in fade-in duration-500">

                    {/* 0. Your Question */}
                    {submittedQuery && (
                        <div className="flex items-start gap-3 px-1 pb-1">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1 flex-shrink-0">You:</span>
                            <p className="text-base font-bold text-gray-800 leading-snug">{submittedQuery}</p>
                        </div>
                    )}

                    {/* 1. Situation Summary Card */}
                    <div className={cn("p-4 rounded-2xl border-l-4 shadow-sm", (riskColorMap[result.level] || riskColorMap.green).card)}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={cn("text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full", (riskColorMap[result.level] || riskColorMap.green).badge)}>
                                {result.level.toUpperCase()} RISK
                            </span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Assessment</span>
                        </div>
                        {result.summary ? (
                            <p className="text-base font-semibold text-gray-900 leading-snug">{result.summary}</p>
                        ) : (
                            <div className="flex items-center text-sm font-bold text-gray-700">
                                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                                Immediate response required.
                            </div>
                        )}
                    </div>

                    {/* 2. Guided Flow CTA — only shown when AI returned a treeId that exists in decision_trees.json */}
                    {result.treeId && validTreeIds.has(result.treeId) && (
                        <button
                            onClick={() => navigate(`/quick-assist/${result.treeId}`)}
                            className="w-full flex items-center p-4 bg-brand-primary text-white rounded-2xl shadow-card haptic-active group"
                        >
                            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                <GitBranch className="w-5 h-5" />
                            </div>
                            <div className="ml-4 flex-1 text-left">
                                <p className="font-black text-base leading-tight">Start Step-by-Step Guided Flow</p>
                                <p className="text-xs font-semibold opacity-75 mt-0.5">AI matched your situation to an interactive guide</p>
                            </div>
                            <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    )}

                    {/* 3. Context Chips — what GAIA-119 factored in */}
                    <div className="flex flex-wrap gap-2 px-1">
                        {region && (
                            <span className="flex items-center text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                                <MapPin className="w-3 h-3 mr-1.5" />{region}
                            </span>
                        )}
                        {household === 'family_with_kids' && (
                            <span className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                                <Users className="w-3 h-3 mr-1.5" />Family with kids
                            </span>
                        )}
                        {household === 'elderly' && (
                            <span className="flex items-center text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">
                                <Heart className="w-3 h-3 mr-1.5" />Caring for elderly
                            </span>
                        )}
                        {medicalNeeds && (
                            <span className="flex items-center text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded-full">
                                <Activity className="w-3 h-3 mr-1.5" />Medical needs
                            </span>
                        )}
                        {weatherData && (
                            <span className="flex items-center text-xs font-bold bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-full">
                                <Droplets className="w-3 h-3 mr-1.5" />{weatherData.rain}mm · {weatherData.temp}°C
                            </span>
                        )}
                    </div>

                    {/* 4. Action Steps */}
                    <h3 className="text-gray-900 font-black text-xl px-1 pt-1">
                        Immediate Actions ({result.actions.length})
                    </h3>

                    <div className="space-y-3">
                        {result.actions.map((action, i) => {
                            const priority = result.priorities?.[i];
                            const detail = result.details?.[i];
                            const ActionIcon = getActionIcon(action);
                            const ps = priority
                                ? priorityStyle[priority]
                                : { badge: "bg-gray-100 text-gray-600", num: "bg-gray-500 text-white" };

                            return (
                                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="flex items-start p-4 gap-3">
                                        {/* Step Number */}
                                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5", ps.num)}>
                                            {i + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Priority Badge */}
                                            {priority && (
                                                <span className={cn("inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5", ps.badge)}>
                                                    {priority}
                                                </span>
                                            )}
                                            {/* Action */}
                                            <p className="text-base font-bold text-gray-900 leading-snug">{action}</p>
                                            {/* Detail */}
                                            {detail && (
                                                <p className="text-sm text-gray-500 font-medium mt-1.5 leading-snug border-t border-gray-50 pt-1.5">{detail}</p>
                                            )}
                                        </div>

                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                            <ActionIcon className="w-10 h-10" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 5. Search Link */}
                    {result.searchQuery && (
                        <div className="pt-2">
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(result.searchQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-between p-5 bg-gray-900 text-white rounded-2xl shadow-sm haptic-active"
                            >
                                <div className="flex items-center">
                                    <Search className="w-6 h-6 mr-3 text-gray-400" />
                                    <span className="font-bold text-sm">Search Web: {result.searchQuery}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-50" />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div >
    );
}
