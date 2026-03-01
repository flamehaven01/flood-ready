export interface HubMessage {
    id: string;
    timestamp: string;
    message: string;
    author: string;
    isVerified?: boolean;
}

export interface HubCapacity {
    current: number;
    max: number;
}

export interface HubLocation {
    lat: number;
    lng: number;
    region: string;
}

export interface Hub {
    id: string;
    type: 'mosque' | 'temple' | 'school' | 'hospital' | 'community';
    name: {
        en: string;
        th?: string;
        ms?: string;
        [key: string]: string | undefined;
    };
    location: HubLocation;
    status: 'OPEN_SHELTER' | 'FULL' | 'CLOSED' | 'UNKNOWN';
    capacity: HubCapacity;
    services: string[];
    verified_messages: HubMessage[];
    lastUpdated?: string;
}
