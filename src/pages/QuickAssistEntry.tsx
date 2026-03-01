import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Brain, Navigation, BriefcaseMedical, HelpingHand, Zap,
    AlertTriangle, MapPin, Droplets, BatteryCharging, Users, Heart,
    CarFront, PhoneCall, ShieldCheck, ChevronRight, Backpack, Baby, Radio,
    ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

type CardRoute =
    | { type: 'tree'; treeId: string }
    | { type: 'ai'; q: string }
    | { type: 'navigate'; to: string };

interface ScenarioCard {
    id: string;
    label: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    route: CardRoute;
    isGuided?: boolean;
}

interface Category {
    id: string;
    title: string;
    emoji: string;
    cards: ScenarioCard[];
}

const SCENARIO_CATEGORIES: Category[] = [
    {
        id: 'flood',
        title: 'Flood & Water',
        emoji: '🌊',
        cards: [
            { id: 'f1', label: 'Water is entering my house', icon: Droplets, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', route: { type: 'tree', treeId: 'dt_flood_evac_01' }, isGuided: true },
            { id: 'f2', label: 'I need to evacuate now', icon: Navigation, iconColor: 'text-brand-primary', iconBg: 'bg-brand-primary/10', route: { type: 'tree', treeId: 'dt_flood_evac_01' }, isGuided: true },
            { id: 'f3', label: 'My car is stuck in floodwater', icon: CarFront, iconColor: 'text-orange-600', iconBg: 'bg-orange-50', route: { type: 'ai', q: 'car stuck in floodwater what to do escape' } },
            { id: 'f4', label: 'I am trapped in a flooded building', icon: AlertTriangle, iconColor: 'text-red-600', iconBg: 'bg-red-50', route: { type: 'ai', q: 'trapped inside flooded building rescue signal roof' } },
            { id: 'f5', label: 'Downed power line in floodwater', icon: Zap, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50', route: { type: 'tree', treeId: 'dt_electric_01' }, isGuided: true },
            { id: 'f6', label: 'How to help a neighbor evacuate', icon: Users, iconColor: 'text-purple-600', iconBg: 'bg-purple-50', route: { type: 'ai', q: 'help neighbor evacuate flood elderly mobility' } },
        ],
    },
    {
        id: 'medical',
        title: 'Medical Emergency',
        emoji: '🏥',
        cards: [
            { id: 'm1', label: 'Someone is injured or bleeding', icon: BriefcaseMedical, iconColor: 'text-red-600', iconBg: 'bg-red-50', route: { type: 'tree', treeId: 'dt_first_aid_01' }, isGuided: true },
            { id: 'm2', label: 'Drowning / near-drowning', icon: Droplets, iconColor: 'text-blue-700', iconBg: 'bg-blue-100', route: { type: 'ai', q: 'drowning near drowning first aid rescue steps' } },
            { id: 'm3', label: 'Elderly person collapsed', icon: Heart, iconColor: 'text-red-500', iconBg: 'bg-red-50', route: { type: 'ai', q: 'elderly person collapsed flood emergency first aid' } },
            { id: 'm4', label: 'Child is sick or injured', icon: Baby, iconColor: 'text-pink-600', iconBg: 'bg-pink-50', route: { type: 'ai', q: 'child sick injured flood emergency care steps' } },
            { id: 'm5', label: 'Need CPR guidance', icon: ShieldCheck, iconColor: 'text-green-700', iconBg: 'bg-green-50', route: { type: 'ai', q: 'CPR guidance step by step unconscious adult child' } },
        ],
    },
    {
        id: 'resources',
        title: 'Supplies & Resources',
        emoji: '🎒',
        cards: [
            { id: 'r1', label: 'Prepare emergency go-bag', icon: Backpack, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', route: { type: 'tree', treeId: 'dt_gobag_01' }, isGuided: true },
            { id: 'r2', label: 'Store and purify drinking water', icon: Droplets, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50', route: { type: 'tree', treeId: 'dt_water_01' }, isGuided: true },
            { id: 'r3', label: 'Emergency food for 72 hours', icon: ShieldCheck, iconColor: 'text-orange-600', iconBg: 'bg-orange-50', route: { type: 'ai', q: '72 hour emergency food supply no electricity flood' } },
            { id: 'r4', label: 'Keep devices charged offline', icon: BatteryCharging, iconColor: 'text-purple-600', iconBg: 'bg-purple-50', route: { type: 'ai', q: 'keep phone charged no electricity power bank solar flood' } },
        ],
    },
    {
        id: 'shelter',
        title: 'Shelter & Safety',
        emoji: '🏠',
        cards: [
            { id: 's1', label: 'Find nearest safe shelter / hub', icon: MapPin, iconColor: 'text-brand-primary', iconBg: 'bg-brand-primary/10', route: { type: 'navigate', to: '/map' } },
            { id: 's2', label: 'Mosque / Temple / Community help', icon: HelpingHand, iconColor: 'text-brand-primary', iconBg: 'bg-brand-primary/10', route: { type: 'tree', treeId: 'dt_community_hub_01' }, isGuided: true },
            { id: 's3', label: 'Stay home vs evacuate decision', icon: AlertTriangle, iconColor: 'text-orange-600', iconBg: 'bg-orange-50', route: { type: 'ai', q: 'shelter in place or evacuate flood decision factors' } },
            { id: 's4', label: 'Protect documents and valuables', icon: ShieldAlert, iconColor: 'text-gray-600', iconBg: 'bg-gray-100', route: { type: 'ai', q: 'protect important documents valuables from flood waterproof' } },
        ],
    },
    {
        id: 'comms',
        title: 'Communication',
        emoji: '📡',
        cards: [
            { id: 'c1', label: 'Call 1669 for emergency rescue', icon: PhoneCall, iconColor: 'text-red-600', iconBg: 'bg-red-50', route: { type: 'ai', q: 'emergency call 1669 flood rescue Thailand what to say' } },
            { id: 'c2', label: 'Contact family without internet', icon: Radio, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', route: { type: 'ai', q: 'contact family no internet offline SMS flood communication' } },
            { id: 'c3', label: 'Signal for rescue from rooftop', icon: AlertTriangle, iconColor: 'text-orange-600', iconBg: 'bg-orange-50', route: { type: 'ai', q: 'signal rescue from rooftop stranded flood SOS methods' } },
        ],
    },
    {
        id: 'family',
        title: 'Family & Vulnerable',
        emoji: '👨‍👩‍👧',
        cards: [
            { id: 'fam1', label: 'Evacuate with young children', icon: Baby, iconColor: 'text-pink-600', iconBg: 'bg-pink-50', route: { type: 'ai', q: 'evacuate with young children flood safety essentials' } },
            { id: 'fam2', label: 'Evacuate with elderly person', icon: Heart, iconColor: 'text-red-500', iconBg: 'bg-red-50', route: { type: 'ai', q: 'evacuate elderly person flood limited mobility wheelchair' } },
            { id: 'fam3', label: 'Family member is missing', icon: Users, iconColor: 'text-purple-600', iconBg: 'bg-purple-50', route: { type: 'ai', q: 'family member missing flood disaster search contact authorities' } },
        ],
    },
];

export function QuickAssistEntry() {
    const navigate = useNavigate();
    const { riskLevel, household, medicalNeeds, weatherData } = useTheme();

    // Layer 1 — context-aware "For You" recommendations
    const forYouCards = useMemo<ScenarioCard[]>(() => {
        const picks: ScenarioCard[] = [];

        if (riskLevel === 'red') {
            picks.push({ id: 'fy_evac', label: 'EVACUATE IMMEDIATELY', icon: Navigation, iconColor: 'text-white', iconBg: 'bg-red-500', route: { type: 'tree', treeId: 'dt_flood_evac_01' }, isGuided: true });
            picks.push({ id: 'fy_call', label: 'Call 1669 — Request Rescue', icon: PhoneCall, iconColor: 'text-red-600', iconBg: 'bg-red-50', route: { type: 'ai', q: 'emergency rescue call 1669 flood stranded address' } });
        }
        if (riskLevel === 'orange') {
            picks.push({ id: 'fy_power', label: 'Cut Main Power Now', icon: Zap, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50', route: { type: 'tree', treeId: 'dt_electric_01' } });
            picks.push({ id: 'fy_gobag', label: 'Grab Your Go-Bag', icon: Backpack, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', route: { type: 'tree', treeId: 'dt_gobag_01' }, isGuided: true });
        }
        if (riskLevel === 'yellow') {
            picks.push({ id: 'fy_water', label: 'Store Drinking Water Now', icon: Droplets, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50', route: { type: 'tree', treeId: 'dt_water_01' }, isGuided: true });
            picks.push({ id: 'fy_gobag2', label: 'Check Emergency Go-Bag', icon: Backpack, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', route: { type: 'tree', treeId: 'dt_gobag_01' }, isGuided: true });
        }
        if (household === 'family_with_kids') {
            picks.push({ id: 'fy_kids', label: 'Child Safety During Flood', icon: Baby, iconColor: 'text-pink-600', iconBg: 'bg-pink-50', route: { type: 'ai', q: 'child safety flood evacuation family young children priority' } });
        }
        if (household === 'elderly') {
            picks.push({ id: 'fy_elderly', label: 'Evacuate with Elderly', icon: Heart, iconColor: 'text-red-500', iconBg: 'bg-red-50', route: { type: 'ai', q: 'evacuate elderly person flood limited mobility safe steps' } });
        }
        if (medicalNeeds) {
            picks.push({ id: 'fy_med', label: 'Emergency Medication Plan', icon: BriefcaseMedical, iconColor: 'text-red-600', iconBg: 'bg-red-50', route: { type: 'ai', q: 'emergency medication plan flood special medical needs supply' } });
        }
        if (weatherData && weatherData.rain > 10) {
            picks.push({ id: 'fy_rain', label: 'Heavy Rain — Action Plan', icon: Droplets, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', route: { type: 'ai', q: 'heavy rain flooding immediate action plan home safety' } });
        }
        // Green / no context — default suggestions
        if (picks.length === 0) {
            picks.push({ id: 'fy_prep', label: 'Prepare Emergency Go-Bag', icon: Backpack, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', route: { type: 'tree', treeId: 'dt_gobag_01' }, isGuided: true });
            picks.push({ id: 'fy_water2', label: 'Store Emergency Water', icon: Droplets, iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50', route: { type: 'tree', treeId: 'dt_water_01' }, isGuided: true });
        }
        return picks.slice(0, 4);
    }, [riskLevel, household, medicalNeeds, weatherData]);

    const handleCard = (route: CardRoute) => {
        if (route.type === 'tree') navigate(`/quick-assist/${route.treeId}`);
        else if (route.type === 'ai') navigate(`/ai-assist?q=${encodeURIComponent(route.q)}`);
        else navigate(route.to);
    };

    return (
        <div className="flex flex-col h-full bg-surface-light px-4 pt-4 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center mb-5">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 haptic-active text-gray-700 bg-white rounded-full shadow-sm">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="ml-4 flex-1">
                    <h1 className="text-2xl font-black text-gray-900 leading-tight">What do you need?</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 space-y-6">

                {/* Ask AI — always top */}
                <button
                    onClick={() => navigate('/ai-assist')}
                    className="w-full flex items-center p-4 bg-white rounded-2xl shadow-card border-2 border-brand-primary/20 haptic-active text-left group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider">
                        AI · Offline
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600">
                        <Brain className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="ml-4 flex-1">
                        <span className="text-lg font-black text-gray-900 group-hover:text-brand-primary transition-colors block">Ask AI (Qwen)</span>
                        <span className="text-xs font-semibold text-gray-400">Describe your situation in any language</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-primary transition-colors" />
                </button>

                {/* Layer 1 — For You */}
                {forYouCards.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <ShieldAlert className="w-4 h-4 text-brand-primary" />
                            <h2 className="text-sm font-black text-brand-primary uppercase tracking-widest">Recommended for You</h2>
                        </div>
                        <div className="space-y-2.5">
                            {forYouCards.map(card => (
                                <ScenarioCardButton key={card.id} card={card} onClick={() => handleCard(card.route)} urgent={riskLevel === 'red'} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Layer 2 — All Categories */}
                {SCENARIO_CATEGORIES.map(cat => (
                    <section key={cat.id}>
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 px-1">
                            {cat.emoji} {cat.title}
                        </h2>
                        <div className="space-y-2.5">
                            {cat.cards.map(card => (
                                <ScenarioCardButton key={card.id} card={card} onClick={() => handleCard(card.route)} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

interface ScenarioCardButtonProps {
    card: ScenarioCard;
    onClick: () => void;
    urgent?: boolean;
}

function ScenarioCardButton({ card, onClick, urgent }: ScenarioCardButtonProps) {
    const Icon = card.icon;
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center p-4 bg-white rounded-2xl shadow-sm border-2 haptic-active text-left group transition-all",
                urgent ? "border-red-200 hover:border-red-400" : "border-transparent hover:border-brand-primary/20"
            )}
        >
            <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0", card.iconBg, card.iconColor)}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className={cn(
                "ml-4 flex-1 text-base font-bold leading-snug transition-colors",
                urgent ? "text-red-700 group-hover:text-red-900" : "text-gray-900 group-hover:text-brand-primary"
            )}>
                {card.label}
            </span>
            <div className="ml-3 flex items-center gap-1.5 flex-shrink-0">
                {card.isGuided && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded-md">
                        Guide
                    </span>
                )}
                {!card.isGuided && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-md">
                        AI
                    </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-primary transition-colors" />
            </div>
        </button>
    );
}
