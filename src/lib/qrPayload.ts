// QR-P2P Payload Protocol v1
// Compact JSON encoding (<300 bytes) to maximise QR density at error-correction level M.
// Designed for line-of-sight device-to-device transfer — no internet required.

import type { Hub } from '../types/hub';

export const QR_VERSION = 1 as const;

// ── Payload types ──────────────────────────────────────────────────────────
export interface HubQRData {
    v: 1;
    t: 'hub';
    ts: number;       // Unix seconds
    id?: string;      // Hub ID (if originated from app)
    n: string;        // Name (max 40 chars)
    lat: number;
    lng: number;
    st: 'O' | 'F' | 'C' | 'U'; // OPEN | FULL | CLOSED | UNKNOWN
    svc: string;      // Service codes: 'w,f,m,p,s,c'
    tp: string;       // Hub type
}

export interface SOSQRData {
    v: 1;
    t: 'sos';
    ts: number;       // Unix seconds (creation time)
    lat?: number;
    lng?: number;
    msg: string;      // Max 100 chars
    hh?: string;      // Household type
    med?: 1;          // Has medical needs
}

export interface RelayQRData {
    v: 1;
    t: 'relay';
    ts: number;       // Relay timestamp
    hops: number;     // Hop count (capped at 5)
    orig: HubQRData | SOSQRData;
}

export type QRPayload = HubQRData | SOSQRData | RelayQRData;

// ── Service code maps ──────────────────────────────────────────────────────
// Hub services stored as compact codes in QR payload
const SVC_TO_CODE: Record<string, string> = {
    water: 'w',
    food: 'f',
    halal_food: 'f',
    medical: 'm',
    first_aid: 'm',
    power: 'p',
    prayer_room: 's',
    shelter: 's',
    communication: 'c',
};

const CODE_TO_SVC: Record<string, string> = {
    w: 'water',
    f: 'food',
    m: 'medical',
    p: 'power',
    s: 'shelter',
    c: 'communication',
};

export const CODE_LABEL: Record<string, string> = {
    w: 'Water',
    f: 'Food',
    m: 'Medical',
    p: 'Power',
    s: 'Shelter',
    c: 'Communication',
};

const STATUS_TO_CODE: Record<string, HubQRData['st']> = {
    OPEN_SHELTER: 'O',
    FULL: 'F',
    CLOSED: 'C',
    UNKNOWN: 'U',
};

const CODE_TO_STATUS: Record<string, Hub['status']> = {
    O: 'OPEN_SHELTER',
    F: 'FULL',
    C: 'CLOSED',
    U: 'UNKNOWN',
};

export const STATUS_LABEL: Record<string, string> = {
    O: 'Open',
    F: 'Full',
    C: 'Closed',
    U: 'Unknown',
};

// ── Encode / decode ────────────────────────────────────────────────────────
export function encodeQR(payload: QRPayload): string {
    return JSON.stringify(payload);
}

export function decodeQR(raw: string): QRPayload | null {
    try {
        const p = JSON.parse(raw) as Record<string, unknown>;
        if (p['v'] !== 1 || !['hub', 'sos', 'relay'].includes(p['t'] as string)) return null;
        return p as unknown as QRPayload;
    } catch {
        return null;
    }
}

// ── Hub <-> QR conversion ─────────────────────────────────────────────────
export function hubToQRPayload(hub: Hub): HubQRData {
    const svcCodes = [...new Set(hub.services.map(s => SVC_TO_CODE[s] ?? s.charAt(0)))]
        .filter(Boolean).join(',');
    return {
        v: 1,
        t: 'hub',
        ts: Math.floor(Date.now() / 1000),
        id: hub.id,
        n: (hub.name.en ?? hub.name.th ?? 'Hub').slice(0, 40),
        lat: Math.round(hub.location.lat * 1e6) / 1e6,
        lng: Math.round(hub.location.lng * 1e6) / 1e6,
        st: STATUS_TO_CODE[hub.status] ?? 'U',
        svc: svcCodes,
        tp: hub.type,
    };
}

export function qrPayloadToHub(p: HubQRData): Hub {
    const services = p.svc
        .split(',')
        .map(c => CODE_TO_SVC[c.trim()] ?? c)
        .filter(Boolean);
    return {
        id: p.id ?? `hub_qr_${p.ts}_${Math.random().toString(36).slice(2, 6)}`,
        type: (p.tp as Hub['type']) ?? 'community',
        name: { en: p.n },
        location: { lat: p.lat, lng: p.lng, region: '' },
        status: CODE_TO_STATUS[p.st] ?? 'UNKNOWN',
        capacity: { current: 0, max: 0 },
        services,
        verified_messages: [],
        lastUpdated: new Date(p.ts * 1000).toISOString(),
    };
}

// ── SOS payload builder ────────────────────────────────────────────────────
export function makeSOSPayload(
    msg: string,
    opts: { lat?: number; lng?: number; household?: string | null; medicalNeeds?: boolean }
): SOSQRData {
    const p: SOSQRData = {
        v: 1,
        t: 'sos',
        ts: Math.floor(Date.now() / 1000),
        msg: msg.slice(0, 100),
    };
    if (opts.lat !== undefined) p.lat = Math.round(opts.lat * 1e6) / 1e6;
    if (opts.lng !== undefined) p.lng = Math.round(opts.lng * 1e6) / 1e6;
    if (opts.household) p.hh = opts.household;
    if (opts.medicalNeeds) p.med = 1;
    return p;
}

// ── Relay wrapper ─────────────────────────────────────────────────────────
export function makeRelayPayload(
    orig: HubQRData | SOSQRData,
    prevHops = 0
): RelayQRData {
    return {
        v: 1,
        t: 'relay',
        ts: Math.floor(Date.now() / 1000),
        hops: Math.min(prevHops + 1, 5),
        orig,
    };
}

// ── Utilities ─────────────────────────────────────────────────────────────
export function getAgeLabel(ts: number): string {
    const sec = Math.floor(Date.now() / 1000) - ts;
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
}

// QR payload expires after 2 hours (SOS/relay) or 6 hours (hub)
export function isExpired(p: QRPayload): boolean {
    const ttl = p.t === 'hub' ? 6 * 3600 : 2 * 3600;
    return Math.floor(Date.now() / 1000) - p.ts > ttl;
}
