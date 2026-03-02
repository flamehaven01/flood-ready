/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import initialHubsData from '../data/hubs.json';
import type { Hub } from '../types/hub';

interface HubContextType {
    hubs: Hub[];
    bookmarkedIds: string[];
    reportHubStatus: (hubId: string, updates: Partial<Hub>) => void;
    addVerifiedMessage: (hubId: string, message: { author: string, message: string }) => void;
    approveMessage: (hubId: string, messageId: string) => void;
    addHub: (hub: Hub) => void;
    importHubFromQR: (hub: Hub) => boolean;
    deleteHub: (hubId: string) => void;
    toggleBookmark: (hubId: string) => void;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function HubProvider({ children }: { children: React.ReactNode }) {
    // Lazily initialize state to avoid calling setState in useEffect just for initial local storage data
    const [hubs, setHubs] = useState<Hub[]>(() => {
        let currentHubs = initialHubsData as Hub[];
        const localOverrides = localStorage.getItem('app_hub_overrides');
        if (localOverrides) {
            try {
                const parsedOverrides = JSON.parse(localOverrides);
                currentHubs = currentHubs.map(hub => {
                    const override = parsedOverrides[hub.id];
                    if (override) {
                        return { ...hub, ...override };
                    }
                    return hub;
                });
                // Also include community hubs stored in overrides but not in initial data
                Object.keys(parsedOverrides).forEach(id => {
                    if (id.startsWith('hub_community_') && !currentHubs.find(h => h.id === id)) {
                        currentHubs = [parsedOverrides[id] as Hub, ...currentHubs];
                    }
                });
            } catch {
                console.error("Failed to parse hub overrides");
            }
        }
        return currentHubs;
    });

    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('app_hub_bookmarks') || '[]'); }
        catch { return []; }
    });

    // Save a report/update to state AND localStorage (Mocking P2P)
    const reportHubStatus = (hubId: string, updates: Partial<Hub>) => {
        setHubs(prev => {
            const next = prev.map(hub => {
                if (hub.id === hubId) {
                    const updatedHub = {
                        ...hub,
                        ...updates,
                        lastUpdated: new Date().toISOString()
                    };
                    return updatedHub;
                }
                return hub;
            });

            // Persist the specific override
            saveOverridesToLocal(next, hubId);
            return next;
        });
    };

    const addVerifiedMessage = (hubId: string, msg: { author: string, message: string }) => {
        setHubs(prev => {
            const next = prev.map(hub => {
                if (hub.id === hubId) {
                    const newMessage = {
                        id: `msg_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        message: msg.message,
                        author: msg.author,
                        isVerified: false // Crowdsourced messages are unverified by default
                    };
                    return {
                        ...hub,
                        verified_messages: [newMessage, ...hub.verified_messages]
                    };
                }
                return hub;
            });
            saveOverridesToLocal(next, hubId);
            return next;
        });
    };

    // Admin/Moderator action to verify a P2P message
    const approveMessage = (hubId: string, messageId: string) => {
        setHubs(prev => {
            const next = prev.map(hub => {
                if (hub.id === hubId) {
                    const updatedMessages = hub.verified_messages.map(m =>
                        m.id === messageId ? { ...m, isVerified: true } : m
                    );
                    return { ...hub, verified_messages: updatedMessages };
                }
                return hub;
            });
            saveOverridesToLocal(next, hubId);
            return next;
        });
    };

    // Helper to only stringify the changed parts so we don't blow up localStorage
    const saveOverridesToLocal = (allHubs: Hub[], changedHubId: string) => {
        const localOverrides = localStorage.getItem('app_hub_overrides');
        let parsedOverrides: Record<string, Partial<Hub>> = {};
        if (localOverrides) {
            try {
                parsedOverrides = JSON.parse(localOverrides);
            } catch {
                // Ignore parse errors here
            }
        }

        const changedHub = allHubs.find(h => h.id === changedHubId);
        if (changedHub) {
            parsedOverrides[changedHubId] = changedHub;
            localStorage.setItem('app_hub_overrides', JSON.stringify(parsedOverrides));
        }
    };

    const addHub = (hub: Hub) => {
        setHubs(prev => {
            const next = [hub, ...prev];
            // Persist community-submitted hubs to localStorage
            const localOverrides = localStorage.getItem('app_hub_overrides');
            let parsedOverrides: Record<string, Partial<Hub>> = {};
            try { if (localOverrides) parsedOverrides = JSON.parse(localOverrides); } catch { /* ignore */ }
            parsedOverrides[hub.id] = hub;
            localStorage.setItem('app_hub_overrides', JSON.stringify(parsedOverrides));
            return next;
        });
    };

    const importHubFromQR = (hub: Hub): boolean => {
        let added = false;
        setHubs(prev => {
            if (prev.some(h => h.id === hub.id)) return prev;
            added = true;
            const canonicalId = hub.id.startsWith('hub_qr_')
                ? `hub_community_${Date.now()}`
                : hub.id;
            const entry = { ...hub, id: canonicalId };
            const next = [entry, ...prev];
            const localOverrides = localStorage.getItem('app_hub_overrides');
            let parsedOverrides: Record<string, Partial<Hub>> = {};
            try { if (localOverrides) parsedOverrides = JSON.parse(localOverrides); } catch { /* ignore */ }
            parsedOverrides[canonicalId] = entry;
            localStorage.setItem('app_hub_overrides', JSON.stringify(parsedOverrides));
            return next;
        });
        return added;
    };

    const deleteHub = (hubId: string) => {
        if (!hubId.startsWith('hub_community_')) return;
        setHubs(prev => prev.filter(h => h.id !== hubId));
        const localOverrides = localStorage.getItem('app_hub_overrides');
        if (localOverrides) {
            try {
                const parsed = JSON.parse(localOverrides);
                delete parsed[hubId];
                localStorage.setItem('app_hub_overrides', JSON.stringify(parsed));
            } catch { /* ignore */ }
        }
    };

    const toggleBookmark = (hubId: string) => {
        setBookmarkedIds(prev => {
            const next = prev.includes(hubId) ? prev.filter(id => id !== hubId) : [...prev, hubId];
            localStorage.setItem('app_hub_bookmarks', JSON.stringify(next));
            return next;
        });
    };

    return (
        <HubContext.Provider value={{ hubs, bookmarkedIds, reportHubStatus, addVerifiedMessage, approveMessage, addHub, importHubFromQR, deleteHub, toggleBookmark }}>
            {children}
        </HubContext.Provider>
    );
}

export function useHubs() {
    const context = useContext(HubContext);
    if (!context) {
        throw new Error('useHubs must be used within a HubProvider');
    }
    return context;
}
