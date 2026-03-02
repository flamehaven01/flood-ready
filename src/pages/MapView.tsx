import { useState, useMemo } from 'react';
import { useHubs } from '../contexts/HubContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { WeatherRadar } from '../components/ui/WeatherRadar';
import { Moon, Castle, GraduationCap, Building2, MapPin, CheckCircle2, Droplets, Utensils, Bed, Zap, ShieldCheck, Plus, Wifi, QrCode } from 'lucide-react';
import type { Hub } from '../types/hub';

// Simple Icons map
const typeIcons: Record<string, React.ElementType> = {
    mosque: Moon,
    temple: Castle,
    school: GraduationCap,
    hospital: Building2,
    community: Building2,
};

const serviceIcons: Record<string, { icon: React.ElementType, label: string }> = {
    water: { icon: Droplets, label: 'Water' },
    halal_food: { icon: Utensils, label: 'Halal Food' },
    first_aid: { icon: ShieldCheck, label: 'First Aid' },
    power_charging: { icon: Zap, label: 'Power/Charging' },
    prayer_room: { icon: Moon, label: 'Prayer Room' },
    shelter: { icon: Bed, label: 'Shelter' },
};

export function MapView() {
    const { hubs, reportHubStatus, addHub } = useHubs();
    const { region, language } = useTheme();

    const [viewMode, setViewMode] = useState<'hubs' | 'radar'>('hubs');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
    const additionalCategories: string[] = [];
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Filter hubs based on region (prefer local first) and type
    const filteredHubs = useMemo(() => {
        let results = hubs;

        // Push hubs in the user's region to the top
        // hub.location.region is "Mueang Yala", user region is "Yala - Mueang Yala" → use includes()
        if (region) {
            results = [...results].sort((a, b) => {
                const aIsLocal = region.includes(a.location.region);
                const bIsLocal = region.includes(b.location.region);
                if (aIsLocal && !bIsLocal) return -1;
                if (!aIsLocal && bIsLocal) return 1;
                return 0;
            });
        }

        if (filterType !== 'all') {
            results = results.filter(h => h.type === filterType);
        }

        return results;
    }, [hubs, region, filterType]);

    // Format relative time (naive)
    const timeAgo = (dateStr?: string) => {
        if (!dateStr) return '';
        const diffMin = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        return `${Math.floor(diffMin / 60)}h ago`;
    };

    // Basic mapping for regional coordinates
    // region is stored as "Yala - Mueang Yala" format, so use includes() for matching
    const getRegionCoords = (reg: string | null) => {
        if (!reg) return { lat: 6.541, lng: 101.281 };
        if (reg.includes('Betong')) return { lat: 5.772, lng: 101.072 };
        if (reg.includes('Bannang Sata')) return { lat: 6.271, lng: 101.263 };
        if (reg.includes('Raman')) return { lat: 6.587, lng: 101.394 };
        if (reg.includes('Mueang Yala')) return { lat: 6.541, lng: 101.281 };
        return { lat: 6.541, lng: 101.281 };
    };

    const coords = getRegionCoords(region);

    return (
        <div className="flex flex-col h-full bg-surface-light px-4 py-6 animate-in fade-in duration-300 relative">

            {/* View Toggle */}
            <div className="flex bg-gray-200 p-1 rounded-full mb-6 relative">
                <button
                    onClick={() => setViewMode('hubs')}
                    className={cn(
                        "flex-1 py-3 text-center rounded-full text-sm font-bold uppercase transition-all duration-300 z-10",
                        viewMode === 'hubs' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Safe Hubs
                </button>
                <button
                    onClick={() => setViewMode('radar')}
                    className={cn(
                        "flex-1 py-3 text-center rounded-full text-sm font-bold uppercase transition-all duration-300 z-10",
                        viewMode === 'radar' ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Weather Radar
                </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center">
                    <h1 className="text-2xl font-black text-gray-900 px-1">
                        {viewMode === 'hubs' ? 'Nearby Safe Hubs' : 'Live Risk Assessment'}
                    </h1>
                    {viewMode === 'hubs' && (
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="ml-2 w-8 h-8 bg-brand-primary flex items-center justify-center rounded-full text-white shadow-sm haptic-active hover:bg-brand-primary/80 transition-colors"
                            title="Register New Safe Hub"
                        >
                            <Plus className="w-5 h-5" strokeWidth={3} />
                        </button>
                    )}
                </div>
                {region && viewMode === 'hubs' && (
                    <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {region}
                    </span>
                )}
            </div>

            {/* P2P Status & QR Sync (Only for Hubs tab) */}
            {viewMode === 'hubs' && (
                <div className="mb-4 px-1 flex items-center justify-between">
                    <div className="flex items-center text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200">
                        <Wifi className="w-3 h-3 mr-1.5 animate-pulse" />
                        P2P MESH CONNECTED
                    </div>
                    <button onClick={() => alert('Opening Offline Sync Module (QR & Bluetooth BLE)... (MOCK)')} className="flex items-center text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg haptic-active">
                        <QrCode className="w-4 h-4 mr-1.5 text-brand-primary" />
                        QR / Bluetooth Sync
                    </button>
                </div>
            )}

            {viewMode === 'radar' ? (
                <WeatherRadar lat={coords.lat} lng={coords.lng} />
            ) : (
                <>
                    {/* Filter Chips */}
                    <div className="flex space-x-2 overflow-x-auto snap-x hide-scrollbar mb-6 pb-2 px-1">
                        <FilterChip label="All" active={filterType === 'all'} onClick={() => setFilterType('all')} />
                        <FilterChip label="Mosques" active={filterType === 'mosque'} onClick={() => setFilterType('mosque')} />
                        <FilterChip label="Temples" active={filterType === 'temple'} onClick={() => setFilterType('temple')} />
                        <FilterChip label="Schools" active={filterType === 'school'} onClick={() => setFilterType('school')} />
                        {additionalCategories.includes('city_hall') && (
                            <FilterChip label="City Halls" active={filterType === 'city_hall'} onClick={() => setFilterType('city_hall')} />
                        )}
                    </div>

                    {/* Hub List */}
                    <div className="flex-1 overflow-y-auto space-y-4 pb-10">
                        {filteredHubs.map(hub => {
                            const Icon = typeIcons[hub.type] || Building2;
                            const hubName = hub.name[language] || hub.name['en'] || 'Unknown Hub';

                            const isOpen = hub.status === 'OPEN_SHELTER';
                            const isFull = hub.status === 'FULL';
                            const hasVerified = hub.verified_messages?.some(m => m.isVerified);

                            return (
                                <button
                                    key={hub.id}
                                    onClick={() => setSelectedHub(hub)}
                                    className="w-full bg-white border border-gray-100 p-5 rounded-3xl shadow-card hover:border-brand-primary/20 haptic-active text-left transition-all relative overflow-hidden group"
                                >
                                    {/* Trust Badge Pinned */}
                                    {hub.id.startsWith('hub_community_') ? (
                                        <div className="absolute top-0 right-0 bg-orange-50 text-orange-600 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center">
                                            <Zap className="w-3 h-3 mr-1" /> Community Report
                                        </div>
                                    ) : hasVerified && (
                                        <div className="absolute top-0 right-0 bg-blue-50 text-water-blue px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                        </div>
                                    )}

                                    <div className="flex items-start">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 text-gray-700">
                                            <Icon className="w-6 h-6" strokeWidth={2.5} />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-primary transition-colors leading-tight">
                                                {hubName}
                                            </h3>

                                            <div className="flex items-center mt-1 space-x-2">
                                                <span className={cn(
                                                    "text-sm font-bold px-2 py-0.5 rounded-md",
                                                    isOpen ? "bg-green-100 text-green-700" :
                                                        isFull ? "bg-red-100 text-critical-red" : "bg-gray-100 text-gray-600"
                                                )}>
                                                    {isOpen ? 'OPEN' : isFull ? 'FULL' : 'UNKNOWN'}
                                                </span>
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hubName + ' ' + hub.location.region + ' Thailand')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md hover:bg-brand-primary/20 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    Open Map
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services Provided */}
                                    {hub.services.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex gap-3 overflow-x-hidden opacity-80">
                                            {hub.services.slice(0, 3).map(srv => {
                                                const SrvIcon = serviceIcons[srv]?.icon;
                                                if (!SrvIcon) return null;
                                                return <SrvIcon key={srv} className="w-5 h-5 text-gray-500" />;
                                            })}
                                            {hub.services.length > 3 && <span className="text-sm font-bold text-gray-400">+{hub.services.length - 3}</span>}
                                        </div>
                                    )}

                                    {/* P2P Crowdsourced Flag */}
                                    {hub.lastUpdated && (
                                        <div className="mt-3 text-xs font-semibold text-brand-primary flex items-center">
                                            <Zap className="w-3 h-3 mr-1" /> Local report {timeAgo(hub.lastUpdated)}
                                        </div>
                                    )}

                                </button>
                            )
                        })}
                    </div>
                </>
            )}

            {/* Offline Report Modal */}
            {selectedHub && viewMode === 'hubs' && (
                <HubReportModal
                    hub={selectedHub}
                    language={language}
                    onClose={() => setSelectedHub(null)}
                    onReport={(updates: Partial<Hub>) => {
                        reportHubStatus(selectedHub.id, updates);
                        setSelectedHub(null);
                    }}
                />
            )}

            {/* Register New Hub Modal */}
            {showRegisterModal && (
                <HubRegisterModal
                    region={region}
                    onClose={() => setShowRegisterModal(false)}
                    onRegister={(newHub: Hub) => {
                        addHub(newHub);
                        setShowRegisterModal(false);
                    }}
                    getRegionCoords={getRegionCoords}
                />
            )}
        </div>
    );
}

// Subcomponents

interface HubRegisterModalProps {
    region: string | null;
    onClose: () => void;
    onRegister: (hub: Hub) => void;
    getRegionCoords: (reg: string | null) => { lat: number; lng: number };
}

function HubRegisterModal({ region, onClose, onRegister, getRegionCoords }: HubRegisterModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<Hub['type']>('community');
    const [status, setStatus] = useState<Hub['status']>('OPEN_SHELTER');
    const [services, setServices] = useState<string[]>([]);
    const [locating, setLocating] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locError, setLocError] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);

    const toggleService = (srv: string) =>
        setServices(prev => prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]);

    const handleGPS = () => {
        setLocating(true);
        setLocError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            () => {
                setLocError('GPS unavailable — using region center');
                setCoords(getRegionCoords(region));
                setLocating(false);
            },
            { timeout: 8000 }
        );
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        setBroadcasting(true);
        const finalCoords = coords ?? getRegionCoords(region);
        const regionLabel = region?.replace('Yala - ', '') ?? 'Yala';

        const newHub: Hub = {
            id: `hub_community_${Date.now()}`,
            type,
            name: { en: name.trim() },
            location: { lat: finalCoords.lat, lng: finalCoords.lng, region: regionLabel },
            status,
            capacity: { current: 0, max: 100 },
            services,
            verified_messages: [],
            lastUpdated: new Date().toISOString(),
        };

        // Simulate P2P broadcast delay
        setTimeout(() => {
            onRegister(newHub);
        }, 800);
    };

    const hubTypes: { key: Hub['type']; label: string; Icon: React.ElementType }[] = [
        { key: 'mosque', label: 'Mosque', Icon: Moon },
        { key: 'temple', label: 'Temple', Icon: Castle },
        { key: 'school', label: 'School', Icon: GraduationCap },
        { key: 'community', label: 'Community', Icon: Building2 },
        { key: 'hospital', label: 'Hospital', Icon: Building2 },
    ];

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200 p-2 sm:p-4">
            <div className="bg-surface-light rounded-[2rem] px-6 pt-4 pb-safe shadow-2xl animate-in slide-in-from-bottom-8 w-full max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 leading-tight">Register Safe Hub</h2>
                        <p className="text-xs font-bold text-brand-primary mt-0.5">Broadcast to P2P Mesh (Offline)</p>
                    </div>
                </div>

                {/* Hub Name */}
                <div className="mb-4">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Hub Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Masjid Al-Huda, Wat Photharam..."
                        className="w-full bg-white border-2 border-gray-200 focus:border-brand-primary rounded-xl px-4 py-3 text-base font-bold text-gray-900 outline-none transition-colors"
                    />
                </div>

                {/* Hub Type */}
                <div className="mb-4">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {hubTypes.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                onClick={() => setType(key)}
                                className={cn(
                                    "flex flex-col items-center py-3 px-2 rounded-xl border-2 font-bold text-xs transition-colors haptic-active",
                                    type === key ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-white border-gray-100 text-gray-600"
                                )}
                            >
                                <Icon className="w-5 h-5 mb-1" strokeWidth={2.5} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Current Status</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStatus('OPEN_SHELTER')}
                            className={cn("py-3 rounded-xl font-bold border-2 haptic-active text-sm", status === 'OPEN_SHELTER' ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-transparent text-gray-600")}
                        >
                            Open / Accepting
                        </button>
                        <button
                            onClick={() => setStatus('FULL')}
                            className={cn("py-3 rounded-xl font-bold border-2 haptic-active text-sm", status === 'FULL' ? "bg-red-50 border-critical-red text-critical-red" : "bg-white border-transparent text-gray-600")}
                        >
                            Full
                        </button>
                    </div>
                </div>

                {/* Services — reuse serviceIcons */}
                <div className="mb-4">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Resources Available</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(serviceIcons).map(([key, config]) => {
                            const SrvIcon = config.icon;
                            const selected = services.includes(key);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleService(key)}
                                    className={cn(
                                        "flex items-center p-3 rounded-xl border-2 text-left haptic-active transition-colors",
                                        selected ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-white border-transparent text-gray-500 hover:border-gray-200"
                                    )}
                                >
                                    <SrvIcon className="w-5 h-5 mr-2.5 shrink-0" />
                                    <span className="font-bold text-sm">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* GPS Location */}
                <div className="mb-6">
                    <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Location</label>
                    <button
                        onClick={handleGPS}
                        disabled={locating}
                        className={cn(
                            "w-full flex items-center justify-center py-3 rounded-xl font-bold border-2 haptic-active transition-colors text-sm",
                            coords ? "bg-green-50 border-green-400 text-green-700" : "bg-white border-gray-200 text-gray-700 hover:border-brand-primary"
                        )}
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        {locating ? 'Detecting GPS...' : coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Auto-detect my Location'}
                    </button>
                    {locError && <p className="text-xs text-orange-600 font-semibold mt-1.5 px-1">{locError}</p>}
                    {!coords && <p className="text-xs text-gray-400 font-medium mt-1.5 px-1">If skipped, region center will be used.</p>}
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-2xl haptic-active">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || broadcasting}
                        className={cn(
                            "flex-2 flex-1 font-bold text-base py-4 rounded-2xl haptic-active shadow-card transition-colors",
                            name.trim() && !broadcasting ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-400"
                        )}
                    >
                        {broadcasting ? 'Broadcasting...' : 'Register & Broadcast'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "snap-start flex-none px-5 py-2 rounded-full font-bold text-sm transition-colors haptic-active border-2 shadow-sm",
                active ? "bg-brand-primary border-brand-primary text-white" : "bg-white border-transparent text-gray-600 hover:border-gray-200"
            )}
        >
            {label}
        </button>
    )
}

interface HubReportModalProps {
    hub: Hub;
    language: string;
    onClose: () => void;
    onReport: (updates: Partial<Hub>) => void;
}

function HubReportModal({ hub, language, onClose, onReport }: HubReportModalProps) {
    const hubName = hub.name[language] || hub.name['en'] || 'Unknown Hub';

    // Local state for the form
    const [status, setStatus] = useState(hub.status);
    const [services, setServices] = useState<string[]>(hub.services);

    const toggleService = (srv: string) => {
        setServices(prev => prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]);
    };

    const handleSave = () => {
        onReport({ status, services });
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200 p-2 sm:p-4">
            <div className="bg-surface-light rounded-[2rem] p-6 pb-safe shadow-2xl animate-in slide-in-from-bottom-8 w-full">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">{hubName}</h2>
                        <p className="text-brand-primary font-bold text-sm mt-1">Community Report (QR-P2P)</p>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Capacity / Status</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setStatus('OPEN_SHELTER')}
                            className={cn("py-4 rounded-2xl font-bold border-2 haptic-active", status === 'OPEN_SHELTER' ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-transparent text-gray-600")}
                        >
                            Open
                        </button>
                        <button
                            onClick={() => setStatus('FULL')}
                            className={cn("py-4 rounded-2xl font-bold border-2 haptic-active", status === 'FULL' ? "bg-red-50 border-critical-red text-critical-red" : "bg-white border-transparent text-gray-600")}
                        >
                            Full
                        </button>
                    </div>
                </div>

                {/* Services Checkboxes */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Resources Available Now</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(serviceIcons).map(([key, config]) => {
                            const isSelected = services.includes(key);
                            const SrvIcon = config.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleService(key)}
                                    className={cn(
                                        "flex items-center p-3 rounded-xl border-2 text-left haptic-active transition-colors",
                                        isSelected ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-white border-transparent text-gray-500 hover:border-gray-200"
                                    )}
                                >
                                    <SrvIcon className="w-5 h-5 mr-3 shrink-0" />
                                    <span className="font-bold text-sm">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex space-x-3 mt-auto">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold text-lg py-4 rounded-2xl haptic-active">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex-1 bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl haptic-active shadow-card">
                        Save Report
                    </button>
                </div>
            </div>
        </div>
    )
}
