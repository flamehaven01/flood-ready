import { useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, QrCode, Scan, AlertTriangle, MapPin, CheckCircle2,
    RefreshCw, Users, Radio, ExternalLink, Share2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useHubs } from '../contexts/HubContext';
import { QRGenerator } from '../components/ui/QRGenerator';
import { QRScanner } from '../components/ui/QRScanner';
import {
    encodeQR, decodeQR, makeSOSPayload, makeRelayPayload,
    hubToQRPayload, qrPayloadToHub, getAgeLabel, isExpired,
    CODE_LABEL, STATUS_LABEL,
    type QRPayload, type HubQRData, type SOSQRData, type RelayQRData
} from '../lib/qrPayload';

// ── Page ──────────────────────────────────────────────────────────────────
export function QRComms() {
    const navigate = useNavigate();
    const { household, medicalNeeds } = useTheme();
    const { hubs, importHubFromQR } = useHubs();

    const [tab, setTab] = useState<'show' | 'scan'>('show');
    const [showType, setShowType] = useState<'sos' | 'hub' | 'relay'>('sos');
    const [sosMsg, setSosMsg] = useState('');
    const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle');
    const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
    const [qrData, setQrData] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<QRPayload | null>(null);
    const [scanKey, setScanKey] = useState(0);
    const [hubAdded, setHubAdded] = useState(false);
    const [relayReady, setRelayReady] = useState(false);

    // Community-submitted hubs only (max 6)
    const communityHubs = hubs.filter(h => h.id.startsWith('hub_community_')).slice(0, 6);

    // ── GPS ──────────────────────────────────────────────────────────────
    const requestLocation = () => {
        setLocStatus('loading');
        navigator.geolocation.getCurrentPosition(
            pos => {
                setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocStatus('ok');
            },
            () => setLocStatus('denied'),
            { timeout: 8000, enableHighAccuracy: true }
        );
    };

    // ── QR generation ────────────────────────────────────────────────────
    const generateSOS = () => {
        if (!sosMsg.trim()) return;
        const payload = makeSOSPayload(sosMsg.trim(), {
            lat: loc?.lat,
            lng: loc?.lng,
            household: household ?? undefined,
            medicalNeeds: medicalNeeds ?? false,
        });
        setQrData(encodeQR(payload));
    };

    const generateHubQR = () => {
        const hub = hubs.find(h => h.id === selectedHubId);
        if (!hub) return;
        setQrData(encodeQR(hubToQRPayload(hub)));
    };

    // ── Scan result handling ─────────────────────────────────────────────
    const handleScan = useCallback((raw: string) => {
        const payload = decodeQR(raw);
        setScanResult(payload);
        setHubAdded(false);
        setRelayReady(false);
    }, []);

    const handleAddHub = (p: HubQRData) => {
        importHubFromQR(qrPayloadToHub(p));
        setHubAdded(true);
    };

    const handleRelay = (orig: HubQRData | SOSQRData, prevHops = 0) => {
        const relay = makeRelayPayload(orig, prevHops);
        setQrData(encodeQR(relay));
        setShowType('relay');
        setRelayReady(true);
        setTab('show');
    };

    const resetScan = () => {
        setScanResult(null);
        setHubAdded(false);
        setRelayReady(false);
        setScanKey(k => k + 1);
    };

    const canGenSOS = sosMsg.trim().length > 0;
    const canGenHub = selectedHubId !== null;

    return (
        <div className="flex flex-col h-full bg-surface-light animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center px-4 pt-4 pb-3 gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 haptic-active text-gray-700 bg-white rounded-full shadow-sm">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 leading-tight">QR Comms</h1>
                    <p className="text-xs font-semibold text-gray-400">Offline · No internet required</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex mx-4 mb-4 bg-gray-100 rounded-2xl p-1">
                <TabBtn active={tab === 'show'} onClick={() => setTab('show')} icon={<QrCode className="w-4 h-4" />} label="Show QR" />
                <TabBtn active={tab === 'scan'} onClick={() => setTab('scan')} icon={<Scan className="w-4 h-4" />} label="Scan QR" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8">

                {/* ── SHOW QR ──────────────────────────────────────────── */}
                {tab === 'show' && (
                    <div className="space-y-4">

                        {/* Relay banner (replaces type selector when relay is active) */}
                        {relayReady ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl border border-purple-200">
                                <Radio className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <p className="text-xs font-bold text-purple-700 flex-1">Relay QR ready — show to the next person in the chain</p>
                                <button onClick={() => { setRelayReady(false); setQrData(null); setShowType('sos'); }} className="text-purple-400 haptic-active">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <TypeBtn active={showType === 'sos'} onClick={() => { setShowType('sos'); setQrData(null); }} label="SOS Beacon" icon={<AlertTriangle className="w-4 h-4" />} color="text-red-600" />
                                <TypeBtn active={showType === 'hub'} onClick={() => { setShowType('hub'); setQrData(null); }} label="Hub Status" icon={<MapPin className="w-4 h-4" />} color="text-brand-primary" />
                            </div>
                        )}

                        {/* SOS form */}
                        {showType === 'sos' && !relayReady && (
                            <div className="space-y-3">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                        Describe your situation
                                    </label>
                                    <textarea
                                        value={sosMsg}
                                        onChange={e => { setSosMsg(e.target.value); setQrData(null); }}
                                        placeholder="e.g. Trapped on 2nd floor. Water rising fast. 3 people, 1 elderly."
                                        maxLength={100}
                                        rows={3}
                                        className="w-full text-sm font-semibold text-gray-900 outline-none resize-none placeholder:text-gray-300"
                                    />
                                    <p className="text-right text-[10px] font-bold text-gray-300 mt-1">{sosMsg.length}/100</p>
                                </div>

                                {/* GPS row */}
                                {locStatus === 'ok' && loc ? (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <span className="text-xs font-bold text-green-700">GPS: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={requestLocation}
                                        disabled={locStatus === 'loading'}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white rounded-xl border-2 border-dashed border-gray-200 haptic-active text-sm font-bold text-gray-500 hover:border-brand-primary/40 transition-all"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        {locStatus === 'loading' ? 'Getting GPS...' : locStatus === 'denied' ? 'GPS denied — QR still works without it' : 'Add GPS location (optional)'}
                                    </button>
                                )}

                                {/* Profile tags auto-included */}
                                {(household || medicalNeeds) && (
                                    <div className="flex flex-wrap gap-2 px-1">
                                        {household && (
                                            <span className="text-[10px] font-black px-2 py-1 bg-blue-50 text-blue-600 rounded-lg uppercase tracking-wide flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {household.replace('_', ' ')}
                                            </span>
                                        )}
                                        {medicalNeeds && (
                                            <span className="text-[10px] font-black px-2 py-1 bg-red-50 text-red-600 rounded-lg uppercase tracking-wide">Medical needs</span>
                                        )}
                                        <span className="text-[10px] font-semibold text-gray-400 self-center">from profile</span>
                                    </div>
                                )}

                                <button
                                    onClick={generateSOS}
                                    disabled={!canGenSOS}
                                    className={cn(
                                        'w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all',
                                        canGenSOS ? 'bg-red-500 text-white shadow-card haptic-active' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    )}
                                >
                                    Generate SOS QR
                                </button>
                            </div>
                        )}

                        {/* Hub selector */}
                        {showType === 'hub' && !relayReady && (
                            <div className="space-y-3">
                                {communityHubs.length === 0 ? (
                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-1">
                                        <p className="text-sm font-bold text-gray-500">No community hubs registered yet.</p>
                                        <p className="text-xs text-gray-400">Register a hub from the Map tab, then share its QR here.</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select hub to share</p>
                                        {communityHubs.map(hub => (
                                            <button
                                                key={hub.id}
                                                onClick={() => { setSelectedHubId(hub.id); setQrData(null); }}
                                                className={cn(
                                                    'w-full text-left flex items-center gap-3 p-4 rounded-2xl border-2 haptic-active transition-all',
                                                    selectedHubId === hub.id ? 'bg-brand-primary/5 border-brand-primary' : 'bg-white border-gray-100'
                                                )}
                                            >
                                                <MapPin className={cn('w-5 h-5 flex-shrink-0', selectedHubId === hub.id ? 'text-brand-primary' : 'text-gray-400')} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm truncate">{hub.name.en}</p>
                                                    <p className="text-[10px] text-gray-400 font-semibold">{hub.type} · {hub.status.replace('_', ' ')}</p>
                                                </div>
                                                {selectedHubId === hub.id && <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />}
                                            </button>
                                        ))}
                                        <button
                                            onClick={generateHubQR}
                                            disabled={!canGenHub}
                                            className={cn(
                                                'w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all',
                                                canGenHub ? 'bg-brand-primary text-white shadow-card haptic-active' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            )}
                                        >
                                            Generate Hub QR
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* QR display */}
                        {qrData && (
                            <div className="flex flex-col items-center gap-3 pt-2 animate-in fade-in duration-300">
                                <QRGenerator
                                    data={qrData}
                                    size={240}
                                    label={
                                        relayReady ? 'Relay QR — show to next person' :
                                        showType === 'sos' ? 'SOS Beacon — show to anyone nearby' :
                                        'Hub Status QR — scan to add to map'
                                    }
                                />
                                <p className="text-xs font-semibold text-gray-400 text-center px-4 max-w-xs">
                                    {relayReady
                                        ? 'This relays the original message. Each re-scan adds 1 hop (max 5).'
                                        : showType === 'sos'
                                            ? 'Hold screen toward any camera. Works through glass. Receiver can re-relay your SOS along a chain.'
                                            : 'Anyone who scans this adds the hub to their offline map instantly.'
                                    }
                                </p>
                                <button
                                    onClick={() => { setQrData(null); setRelayReady(false); }}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-400 haptic-active py-2 px-4 rounded-full hover:bg-gray-100 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" /> Reset
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── SCAN QR ──────────────────────────────────────────── */}
                {tab === 'scan' && (
                    <div className="space-y-4">

                        {!scanResult && (
                            <QRScanner key={scanKey} onScan={handleScan} />
                        )}

                        {scanResult && (
                            <div className="space-y-3 animate-in fade-in duration-300">
                                {/* Type badge + age */}
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        'text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full',
                                        scanResult.t === 'sos'   ? 'bg-red-50 text-red-600' :
                                        scanResult.t === 'hub'   ? 'bg-blue-50 text-brand-primary' :
                                                                   'bg-purple-50 text-purple-600'
                                    )}>
                                        {scanResult.t === 'sos'   ? 'SOS Beacon' :
                                         scanResult.t === 'hub'   ? 'Hub Status' :
                                         `Relay · ${(scanResult as RelayQRData).hops} hop${(scanResult as RelayQRData).hops !== 1 ? 's' : ''}`}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-400">{getAgeLabel(scanResult.ts)}</span>
                                </div>

                                {isExpired(scanResult) && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
                                        <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                        <p className="text-xs font-bold text-yellow-700">Older than 2 hours — verify before acting</p>
                                    </div>
                                )}

                                {scanResult.t === 'sos' && (
                                    <SOSCard p={scanResult as SOSQRData} onRelay={() => handleRelay(scanResult as SOSQRData)} />
                                )}
                                {scanResult.t === 'hub' && (
                                    <HubCard p={scanResult as HubQRData} added={hubAdded} onAdd={() => handleAddHub(scanResult as HubQRData)} />
                                )}
                                {scanResult.t === 'relay' && (
                                    <RelayCard
                                        p={scanResult as RelayQRData}
                                        hubAdded={hubAdded}
                                        onAddHub={orig => handleAddHub(orig as HubQRData)}
                                        onRelay={orig => handleRelay(orig, (scanResult as RelayQRData).hops)}
                                    />
                                )}

                                <button
                                    onClick={resetScan}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl border-2 border-gray-100 text-sm font-black text-gray-500 haptic-active hover:border-brand-primary/20 transition-all"
                                >
                                    <Scan className="w-4 h-4" /> Scan Another QR
                                </button>
                            </div>
                        )}

                        {!scanResult && (
                            <div className="space-y-2 pt-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Supported QR types</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'SOS Beacon', desc: 'Location + situation', color: 'text-red-600 bg-red-50 border-red-100' },
                                        { label: 'Hub Status', desc: 'Add hub to map', color: 'text-brand-primary bg-blue-50 border-blue-100' },
                                        { label: 'Relay', desc: 'Re-broadcast chain', color: 'text-purple-600 bg-purple-50 border-purple-100' },
                                    ].map(({ label, desc, color }) => (
                                        <div key={label} className={cn('p-3 rounded-xl border text-center', color)}>
                                            <p className="text-[10px] font-black uppercase tracking-wide">{label}</p>
                                            <p className="text-[9px] font-semibold opacity-70 mt-0.5">{desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Reusable small components ─────────────────────────────────────────────

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all haptic-active',
                active ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500'
            )}
        >
            {icon} {label}
        </button>
    );
}

function TypeBtn({ active, onClick, label, icon, color }: { active: boolean; onClick: () => void; label: string; icon: ReactNode; color: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black border-2 haptic-active transition-all',
                active ? `bg-white ${color} border-current shadow-sm` : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
            )}
        >
            {icon} {label}
        </button>
    );
}

function SOSCard({ p, onRelay }: { p: SOSQRData; onRelay: () => void }) {
    return (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200 space-y-3">
            <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Situation</p>
                <p className="text-base font-bold text-red-900">{p.msg}</p>
            </div>
            {p.lat !== undefined && p.lng !== undefined && (
                <a href={`https://maps.google.com/?q=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-brand-primary">
                    <MapPin className="w-4 h-4" /> {p.lat.toFixed(4)}, {p.lng.toFixed(4)} <ExternalLink className="w-3 h-3" />
                </a>
            )}
            <div className="flex flex-wrap gap-2">
                {p.hh && <span className="text-[10px] font-bold px-2 py-1 bg-white rounded-lg text-red-600 border border-red-100">{p.hh.replace('_', ' ')}</span>}
                {p.med === 1 && <span className="text-[10px] font-bold px-2 py-1 bg-white rounded-lg text-red-600 border border-red-100">Medical needs</span>}
            </div>
            <button onClick={onRelay} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-black text-sm haptic-active">
                <Share2 className="w-4 h-4" /> Re-relay this SOS
            </button>
        </div>
    );
}

function HubCard({ p, added, onAdd }: { p: HubQRData; added: boolean; onAdd: () => void }) {
    const services = p.svc.split(',').map(c => CODE_LABEL[c.trim()]).filter(Boolean);
    return (
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 space-y-3">
            <div>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">{p.tp} · {STATUS_LABEL[p.st] ?? p.st}</p>
                <p className="text-base font-bold text-gray-900">{p.n}</p>
            </div>
            {services.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {services.map(s => <span key={s} className="text-[10px] font-bold px-2 py-1 bg-white rounded-lg text-brand-primary border border-blue-100">{s}</span>)}
                </div>
            )}
            <a href={`https://maps.google.com/?q=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-gray-500">
                <MapPin className="w-3.5 h-3.5" /> {p.lat.toFixed(4)}, {p.lng.toFixed(4)} <ExternalLink className="w-3 h-3" />
            </a>
            {added
                ? <div className="flex items-center justify-center gap-2 py-3 text-green-700 font-black text-sm"><CheckCircle2 className="w-5 h-5" /> Added to your map</div>
                : <button onClick={onAdd} className="w-full py-3 bg-brand-primary text-white rounded-xl font-black text-sm haptic-active">Add to My Map</button>
            }
        </div>
    );
}

function RelayCard({ p, hubAdded, onAddHub, onRelay }: {
    p: RelayQRData;
    hubAdded: boolean;
    onAddHub: (orig: HubQRData | SOSQRData) => void;
    onRelay: (orig: HubQRData | SOSQRData) => void;
}) {
    const orig = p.orig;
    const maxHops = p.hops >= 5;
    return (
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Relay chain · {p.hops}/5 hops</p>
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={cn('w-2.5 h-2.5 rounded-full', i < p.hops ? 'bg-purple-500' : 'bg-purple-200')} />
                    ))}
                </div>
            </div>

            {orig.t === 'sos' && (
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Original SOS · {getAgeLabel(orig.ts)}</p>
                    <p className="text-sm font-bold text-gray-900">{(orig as SOSQRData).msg}</p>
                    {(orig as SOSQRData).lat !== undefined && (
                        <a href={`https://maps.google.com/?q=${(orig as SOSQRData).lat},${(orig as SOSQRData).lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-primary font-bold">
                            <MapPin className="w-3 h-3" /> Open in Maps <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            )}
            {orig.t === 'hub' && (
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hub: {(orig as HubQRData).tp} · {getAgeLabel(orig.ts)}</p>
                    <p className="text-sm font-bold text-gray-900">{(orig as HubQRData).n}</p>
                    <p className="text-xs font-semibold text-gray-500">{STATUS_LABEL[(orig as HubQRData).st]}</p>
                </div>
            )}

            <div className="flex gap-2">
                {orig.t === 'hub' && (
                    hubAdded
                        ? <div className="flex-1 flex items-center justify-center gap-1 text-green-700 font-black text-xs py-2.5"><CheckCircle2 className="w-4 h-4" /> Added</div>
                        : <button onClick={() => onAddHub(orig)} className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl font-black text-xs haptic-active">Add Hub</button>
                )}
                {!maxHops
                    ? <button onClick={() => onRelay(orig)} className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl font-black text-xs haptic-active flex items-center justify-center gap-1"><Share2 className="w-3.5 h-3.5" /> Re-relay (+1)</button>
                    : <p className="flex-1 text-center text-xs font-bold text-gray-400 py-2.5">Max relay hops reached</p>
                }
            </div>
        </div>
    );
}
