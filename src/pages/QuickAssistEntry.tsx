import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ArrowUpToLine, Brain, Navigation, BriefcaseMedical, HelpingHand, Zap,
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
            { id: 'm3', label: 'Elderly person collapsed', icon: Heart, iconColor: 'text-red-500', iconBg: 'bg-red-50', route: { type: 'ai', q: 'elderly person collapsed first aid steps' } },
            { id: 'm4', label: 'Child is sick or injured', icon: Baby, iconColor: 'text-pink-600', iconBg: 'bg-pink-50', route: { type: 'ai', q: 'child sick or injured first aid care steps' } },
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

        // RED — mirrors Home riskActionsMap.red
        if (riskLevel === 'red') {
            picks.push({ id: 'fy_evac',  label: 'EVACUATE IMMEDIATELY',      icon: Navigation,      iconColor: 'text-white',          iconBg: 'bg-red-500',          route: { type: 'tree', treeId: 'dt_flood_evac_01' }, isGuided: true });
            picks.push({ id: 'fy_call',  label: 'Call Direct Rescue',         icon: PhoneCall,       iconColor: 'text-blue-600',       iconBg: 'bg-blue-100',         route: { type: 'ai', q: 'emergency rescue call flood stranded address' } });
            picks.push({ id: 'fy_water_avoid', label: 'AVOID FLOODWATER',     icon: AlertTriangle,   iconColor: 'text-orange-600',     iconBg: 'bg-orange-100',       route: { type: 'ai', q: 'how to survive avoid floodwater dangers electrocution' } });
        }

        // ORANGE — mirrors Home riskActionsMap.orange
        if (riskLevel === 'orange') {
            picks.push({ id: 'fy_power', label: 'Cut Main Power & Gas',       icon: Zap,             iconColor: 'text-yellow-600',     iconBg: 'bg-yellow-100',       route: { type: 'tree', treeId: 'dt_electric_01' }, isGuided: true });
            picks.push({ id: 'fy_hub2',  label: 'Move to Safe Hub',           icon: MapPin,          iconColor: 'text-brand-primary',  iconBg: 'bg-brand-primary/10', route: { type: 'navigate', to: '/map' } });
            picks.push({ id: 'fy_gobag', label: 'Grab Medical Kit & Go-Bag',  icon: BriefcaseMedical,iconColor: 'text-critical-red',   iconBg: 'bg-red-100',          route: { type: 'tree', treeId: 'dt_gobag_01' }, isGuided: true });
        }

        // YELLOW — mirrors Home riskActionsMap.yellow
        if (riskLevel === 'yellow') {
            picks.push({ id: 'fy_valuables', label: 'Move Valuables Upstairs', icon: ArrowUpToLine,      iconColor: 'text-orange-500',     iconBg: 'bg-orange-100',       route: { type: 'ai', q: 'how to protect valuables from flood move upstairs waterproof' } });
            picks.push({ id: 'fy_water',     label: 'Store Clean Water Now',   icon: Droplets,       iconColor: 'text-water-blue',     iconBg: 'bg-blue-100',         route: { type: 'tree', treeId: 'dt_water_01' }, isGuided: true });
            picks.push({ id: 'fy_vehicle',   label: 'Prepare Evacuation Vehicle', icon: CarFront,    iconColor: 'text-gray-700',       iconBg: 'bg-gray-100',         route: { type: 'ai', q: 'how to prepare vehicle for flood evacuation route plan' } });
        }

        // GREEN — mirrors Home riskActionsMap.green
        if (riskLevel === 'green') {
            picks.push({ id: 'fy_gobag_g',  label: 'Check Your Go-Bag',        icon: Backpack,       iconColor: 'text-blue-600',       iconBg: 'bg-blue-100',         route: { type: 'tree', treeId: 'dt_gobag_01' }, isGuided: true });
            picks.push({ id: 'fy_water_g',  label: 'Store Clean Water',        icon: Droplets,       iconColor: 'text-green-600',      iconBg: 'bg-green-100',        route: { type: 'tree', treeId: 'dt_water_01' }, isGuided: true });
            picks.push({ id: 'fy_charge_g', label: 'Keep Devices Charged',     icon: BatteryCharging,iconColor: 'text-purple-600',     iconBg: 'bg-purple-100',       route: { type: 'ai', q: 'keep phone charged emergency power bank solar charger flood prepare' } });
        }

        // Household/medical overlays (any risk level)
        if (household === 'family_with_kids') {
            picks.push({ id: 'fy_kids',    label: 'Child Safety Plan',          icon: Baby,           iconColor: 'text-pink-600',       iconBg: 'bg-pink-100',         route: { type: 'ai', q: 'child safety flood evacuation family young children priority steps' } });
        }
        if (household === 'elderly') {
            picks.push({ id: 'fy_elderly', label: 'Evacuate with Elderly',      icon: Heart,          iconColor: 'text-red-500',        iconBg: 'bg-red-100',          route: { type: 'ai', q: 'evacuate elderly person flood limited mobility safe steps' } });
        }
        if (medicalNeeds) {
            picks.push({ id: 'fy_med',     label: 'Emergency Medication Plan',  icon: BriefcaseMedical,iconColor: 'text-red-600',       iconBg: 'bg-red-100',          route: { type: 'ai', q: 'emergency medication plan flood special medical needs supply' } });
        }
        if (weatherData && weatherData.rain > 10) {
            picks.push({ id: 'fy_rain',    label: 'Heavy Rain — Action Plan',   icon: Droplets,       iconColor: 'text-blue-600',       iconBg: 'bg-blue-100',         route: { type: 'ai', q: 'heavy rain flooding immediate action plan home safety' } });
        }

        return picks.slice(0, 6);
    }, [riskLevel, household, medicalNeeds, weatherData]);

    const handleCard = (route: CardRoute) => {
        if (route.type === 'tree') navigate(`/quick-assist/${route.treeId}`);
        else if (route.type === 'ai') navigate(`/ai-assist?q=${encodeURIComponent(route.q)}`);
        else navigate(route.to);
    };

    const riskBanner = {
        green:  { bg: 'bg-green-500',          text: 'GREEN — Normal Conditions',        sub: 'Prepare now while conditions are safe.' },
        yellow: { bg: 'bg-yellow-400',          text: 'YELLOW — Caution',                sub: 'Rain approaching. Take preventive action.' },
        orange: { bg: 'bg-[#F48C25]',           text: 'ORANGE — High Risk',              sub: 'Heavy rain. Act now before flooding.' },
        red:    { bg: 'bg-critical-red',        text: 'RED — CRITICAL EMERGENCY',        sub: 'Immediate action required. Every second counts.' },
    };
    const banner = riskBanner[riskLevel];

    return (
        <div className="flex flex-col h-full bg-surface-light animate-in slide-in-from-bottom-4 duration-300">
            {/* Risk Level Banner */}
            <div className={cn("px-4 pt-4 pb-3", banner.bg)}>
                <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => navigate(-1)} className="p-1.5 haptic-active text-white/80 hover:text-white rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <ShieldAlert className="w-5 h-5 text-white" />
                    <span className="text-white font-black text-sm uppercase tracking-wide">{banner.text}</span>
                </div>
                <p className="text-white/80 text-xs font-semibold pl-10">{banner.sub}</p>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 space-y-5 px-4 pt-4">

                {/* Ask AI — always top */}
                <button
                    onClick={() => navigate('/ai-assist')}
                    className="w-full flex items-center p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover border-2 border-brand-primary/20 haptic-active text-left group relative overflow-hidden transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider">
                        AI · Offline
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600">
                        <Brain className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="ml-4 flex-1">
                        <span className="text-lg font-black text-gray-900 group-hover:text-brand-primary transition-colors block">Ask AI (GAIA-119)</span>
                        <span className="text-xs font-semibold text-gray-400">Describe your situation in any language</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-primary transition-colors" />
                </button>

                {/* Layer 1 — Priority Right Now */}
                {forYouCards.length > 0 && (
                    <section>
                        <div className={cn(
                            "flex items-center gap-2 mb-3 px-3 py-2 rounded-xl",
                            riskLevel === 'red'    ? "bg-red-50 border border-red-200" :
                            riskLevel === 'orange' ? "bg-orange-50 border border-orange-200" :
                            riskLevel === 'yellow' ? "bg-yellow-50 border border-yellow-200" :
                            "bg-green-50 border border-green-200"
                        )}>
                            <ShieldAlert className={cn("w-4 h-4 flex-shrink-0",
                                riskLevel === 'red' ? "text-critical-red" :
                                riskLevel === 'orange' ? "text-[#F48C25]" :
                                riskLevel === 'yellow' ? "text-yellow-600" : "text-green-600"
                            )} />
                            <div>
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Priority Right Now</h2>
                                <p className="text-[10px] text-gray-500 font-semibold">Based on your current risk level & profile</p>
                            </div>
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

// Map iconBg -> left-border accent (static Tailwind classes)
const iconBgToAccent: Record<string, string> = {
    'bg-blue-50':        'border-l-blue-400',
    'bg-blue-100':       'border-l-blue-500',
    'bg-red-50':         'border-l-red-400',
    'bg-red-100':        'border-l-red-500',
    'bg-red-500':        'border-l-red-600',
    'bg-orange-50':      'border-l-orange-400',
    'bg-yellow-50':      'border-l-yellow-400',
    'bg-purple-50':      'border-l-purple-400',
    'bg-pink-50':        'border-l-pink-400',
    'bg-cyan-50':        'border-l-cyan-500',
    'bg-green-50':       'border-l-green-500',
    'bg-gray-100':       'border-l-gray-300',
    'bg-brand-primary/10': 'border-l-[#F48C25]',
};

// Map iconBg -> slightly saturated icon bg
const iconBgUpgrade: Record<string, string> = {
    'bg-blue-50':   'bg-blue-100',
    'bg-red-50':    'bg-red-100',
    'bg-orange-50': 'bg-orange-100',
    'bg-yellow-50': 'bg-yellow-100',
    'bg-purple-50': 'bg-purple-100',
    'bg-pink-50':   'bg-pink-100',
    'bg-cyan-50':   'bg-cyan-100',
    'bg-green-50':  'bg-green-100',
};

function ScenarioCardButton({ card, onClick, urgent }: ScenarioCardButtonProps) {
    const Icon = card.icon;
    const accentBorder = urgent ? 'border-l-red-500' : (iconBgToAccent[card.iconBg] ?? 'border-l-gray-200');
    const upgradedBg = iconBgUpgrade[card.iconBg] ?? card.iconBg;
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100 border-l-4 haptic-active text-left group transition-all duration-300",
                accentBorder
            )}
        >
            <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0", upgradedBg, card.iconColor)}>
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
