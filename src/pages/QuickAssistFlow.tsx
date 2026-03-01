import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Phone, Asterisk, Activity, CheckCircle2, HelpingHand, Navigation, BriefcaseMedical, Zap, Stethoscope, Brain } from 'lucide-react';
import { cn } from '../lib/utils';
import decisionTreeData from '../data/decision_trees.json';
import { useTheme } from '../contexts/ThemeContext';

const iconMap: Record<string, React.ElementType> = {
    Navigation,
    BriefcaseMedical,
    HelpingHand,
    Zap,
    Stethoscope,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Phone,
    Asterisk
};

interface LocalizedString {
    en: string;
    th?: string;
    ms?: string;
    [key: string]: string | undefined;
}

interface DecisionOption {
    id: string;
    label: LocalizedString;
    icon: string;
    next_node?: string;
    isRedFlag?: boolean;
    redFlagAction?: string;
}

interface DecisionNode {
    id: string;
    question: LocalizedString;
    doNow?: LocalizedString[];
    aiHint?: LocalizedString;
    options?: DecisionOption[];
    isEndpoint?: boolean;
}

interface DecisionTreeData {
    nodes: Record<string, DecisionNode>;
}

export function QuickAssistFlow() {
    const { treeId } = useParams();
    const navigate = useNavigate();
    const { language, mode } = useTheme();

    // Track navigation history for the "Back" button
    const [history, setHistory] = useState<string[]>([]);
    // Start at the requested tree root (defaults to dt_first_aid_01 for demo)
    const [currentNodeId, setCurrentNodeId] = useState<string>(treeId || 'dt_first_aid_01');
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

    // Cast the imported JSON to avoid TS any warnings on dynamic keys
    const data = decisionTreeData as DecisionTreeData;
    const nodes = data.nodes;
    const currentNode = nodes[currentNodeId];

    // If node doesn't exist, redirect to entry immediately rather than showing a dead-end screen
    if (!currentNode) {
        navigate('/quick-assist', { replace: true });
        return null;
    }

    const handleBack = () => {
        if (history.length === 0) {
            navigate('/quick-assist'); // Exit flow
        } else {
            const newHistory = [...history];
            const prevNode = newHistory.pop();
            setHistory(newHistory);
            setCurrentNodeId(prevNode as string);
        }
    };

    const handleOptionSelect = (option: DecisionOption) => {
        if (option.isRedFlag || option.redFlagAction === 'SHOW_EMERGENCY_MODAL') {
            setShowEmergencyModal(true);
            return;
        }

        if (option.next_node) {
            setHistory([...history, currentNodeId]);
            setCurrentNodeId(option.next_node);
        }
    };

    const questionText = currentNode.question[language] || currentNode.question['en'];
    const isRainMode = mode === 'rain';

    return (
        <div className="flex flex-col h-full bg-surface-light px-4 pt-4 animate-in slide-in-from-right-4 duration-300 relative">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 haptic-active text-gray-700 bg-white rounded-full shadow-sm"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="ml-4 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest hidden sm:block">
                        Step {history.length + 2} Option
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe">
                {/* DO NOW Pinned Actions */}
                {currentNode.doNow && currentNode.doNow.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <h3 className="text-sm font-black uppercase text-critical-red tracking-wider flex items-center">
                            <Asterisk className="w-4 h-4 mr-1 animate-pulse" />
                            Do Now
                        </h3>
                        {currentNode.doNow.map((action: LocalizedString, idx: number) => (
                            <div key={idx} className="bg-red-50 border-l-4 border-critical-red p-4 rounded-r-xl shadow-sm">
                                <p className="text-gray-900 font-bold leading-tight">
                                    {action[language] || action['en']}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Insight Card */}
                {currentNode.aiHint && (
                    <div className="mb-5 p-4 bg-brand-primary/5 border-l-4 border-brand-primary rounded-r-xl">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Brain className="w-4 h-4 text-brand-primary" />
                            <span className="text-xs font-black text-brand-primary uppercase tracking-wider">AI Insight</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 leading-snug">
                            {currentNode.aiHint[language] || currentNode.aiHint['en']}
                        </p>
                    </div>
                )}

                {/* Question */}
                <h1 className={cn(
                    "font-black text-gray-900 leading-tight mb-8",
                    isRainMode ? "text-3xl" : "text-2xl"
                )}>
                    {questionText}
                </h1>

                {/* Choices / Options */}
                <div className="space-y-4">
                    {currentNode.options?.map((opt: DecisionOption) => {
                        const Icon = iconMap[opt.icon] || CheckCircle2;
                        const label = opt.label[language] || opt.label['en'];
                        const isRed = opt.isRedFlag;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleOptionSelect(opt)}
                                className={cn(
                                    "w-full flex items-center p-5 bg-white rounded-2xl shadow-card haptic-active text-left group border-2 transition-colors",
                                    isRed ? "border-red-100 hover:border-critical-red" : "border-transparent hover:border-brand-primary/20",
                                    isRainMode ? "py-6" : "py-5"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-14 h-14 rounded-xl",
                                    isRed ? "bg-red-50 text-critical-red" : "bg-gray-50 text-brand-primary"
                                )}>
                                    <Icon className="w-8 h-8" strokeWidth={2.5} />
                                </div>
                                <span className={cn(
                                    "ml-5 font-bold leading-tight transition-colors",
                                    isRainMode ? "text-2xl" : "text-xl",
                                    isRed ? "text-critical-red" : "text-gray-900 group-hover:text-brand-primary"
                                )}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Endpoint State */}
                {currentNode.isEndpoint && (
                    <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-green-900 mb-2">Guidance Complete</h2>
                        <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-white text-green-700 font-bold border border-green-200 rounded-xl haptic-active w-full shadow-sm">
                            Return to Home
                        </button>
                    </div>
                )}
            </div>

            {/* Emergency Modal Overlay */}
            {showEmergencyModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-light rounded-3xl p-6 mb-safe shadow-2xl animate-in slide-in-from-bottom-8">
                        <div className="w-16 h-16 bg-red-100 text-critical-red rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-black text-center text-gray-900 mb-2">High Risk Detected</h2>
                        <p className="text-center text-gray-600 font-medium mb-8">
                            This situation requires immediate professional medical attention.
                        </p>
                        <div className="space-y-3">
                            <a href="tel:1669" className="w-full bg-critical-red text-white font-bold text-xl py-4 rounded-2xl shadow-card haptic-active flex items-center justify-center">
                                <Phone className="w-6 h-6 mr-2" />
                                Call 1669 (Emergency)
                            </a>
                            <button onClick={() => setShowEmergencyModal(false)} className="w-full bg-gray-200 text-gray-800 font-bold text-lg py-4 rounded-2xl haptic-active">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
