/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

type Mode = 'normal' | 'rain' | 'ultra-low-power';
export type Language = 'en' | 'th' | 'ms' | 'ko' | 'ja' | 'zh' | 'ar' | 'id' | 'es' | 'de' | 'it' | 'fr';
type HouseholdType = 'solo' | 'family_with_kids' | 'elderly' | null;

export type RiskLevel = 'green' | 'yellow' | 'orange' | 'red';

interface ThemeContextType {
    mode: Mode;
    setMode: (mode: Mode) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    region: string | null;
    setRegion: (region: string) => void;
    household: HouseholdType;
    setHousehold: (type: HouseholdType) => void;
    medicalNeeds: boolean | null;
    setMedicalNeeds: (needs: boolean) => void;
    hasCompletedOnboarding: boolean;
    completeOnboarding: () => void;
    resetToDefaults: () => void;
    riskLevel: RiskLevel;
    setRiskLevel: (level: RiskLevel) => void;
    weatherData: { rain: number; temp: number; wind: number } | null;
    emergencyNumber: string;
    setEmergencyNumber: (num: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initialize from localStorage or use defaults
    const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('app_mode') as Mode) || 'normal');
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('app_language') as Language) || 'en');
    const [region, setRegion] = useState<string | null>(() => localStorage.getItem('app_region'));
    const [household, setHousehold] = useState<HouseholdType>(() => (localStorage.getItem('app_household') as HouseholdType) || null);
    const [medicalNeeds, setMedicalNeeds] = useState<boolean | null>(() => {
        const stored = localStorage.getItem('app_medical');
        return stored !== null ? stored === 'true' : null;
    });
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => localStorage.getItem('app_onboarded') === 'true');
    const [riskLevel, setRiskLevel] = useState<RiskLevel>(() => (localStorage.getItem('app_riskLevel') as RiskLevel) || 'green');
    const [weatherData, setWeatherData] = useState<{ rain: number; temp: number; wind: number } | null>(null);
    const [emergencyNumber, setEmergencyNumber] = useState<string>(() => localStorage.getItem('app_emergencyNumber') || '1669');

    // Sync to DOM for mode
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-mode', mode);
        localStorage.setItem('app_mode', mode);

        if (mode === 'ultra-low-power') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [mode]);

    // Sync other preferences
    useEffect(() => {
        localStorage.setItem('app_language', language);
        if (region) { localStorage.setItem('app_region', region); } else { localStorage.removeItem('app_region'); }
        if (household) { localStorage.setItem('app_household', household); } else { localStorage.removeItem('app_household'); }
        if (medicalNeeds !== null) { localStorage.setItem('app_medical', String(medicalNeeds)); } else { localStorage.removeItem('app_medical'); }
        localStorage.setItem('app_onboarded', String(hasCompletedOnboarding));
        localStorage.setItem('app_riskLevel', riskLevel);
        localStorage.setItem('app_emergencyNumber', emergencyNumber);
    }, [language, region, household, medicalNeeds, hasCompletedOnboarding, riskLevel, emergencyNumber]);

    // Live Weather Integration for Risk Level
    useEffect(() => {
        const fetchLiveWeatherRisk = async () => {
            try {
                // Default coordinates (Mueang Yala)
                let lat = 6.541;
                let lng = 101.281;

                // Adjust based on user region string matching
                if (region?.includes('Betong')) { lat = 5.772; lng = 101.072; }
                else if (region?.includes('Bannang Sata')) { lat = 6.271; lng = 101.263; }
                else if (region?.includes('Raman')) { lat = 6.587; lng = 101.394; }

                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,wind_speed_10m`);
                if (!res.ok) return;

                const data = await res.json();
                const rain = data.current?.precipitation || 0;
                const temp = data.current?.temperature_2m || 0;
                const wind = data.current?.wind_speed_10m || 0;

                let realRisk: RiskLevel = 'green';
                if (rain > 0 && rain < 2.5) realRisk = 'yellow';
                else if (rain >= 2.5 && rain < 10) realRisk = 'orange';
                else if (rain >= 10) realRisk = 'red';

                setRiskLevel(realRisk);
                setWeatherData({ rain, temp, wind });
                console.log(`[Trust Protocol] Live Weather synced: ${rain}mm rain -> ${realRisk.toUpperCase()} risk.`);
            } catch (err) {
                console.warn("[Trust Protocol] Live weather sync failed. Falling back to cached risk status.", err);
            }
        };

        // Fetch on mount or when region changes (if onboarding is complete)
        if (hasCompletedOnboarding) {
            fetchLiveWeatherRisk();
            // Poll every 30 minutes
            const interval = setInterval(fetchLiveWeatherRisk, 30 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [region, hasCompletedOnboarding]);

    const completeOnboarding = () => setHasCompletedOnboarding(true);

    const resetToDefaults = () => {
        localStorage.clear();
        setMode('normal');
        setLanguage('en');
        setRegion(null);
        setHousehold(null);
        setMedicalNeeds(null);
        setHasCompletedOnboarding(false);
        setRiskLevel('green');
        setEmergencyNumber('1669');
    };

    return (
        <ThemeContext.Provider value={{
            mode, setMode,
            language, setLanguage,
            region, setRegion,
            household, setHousehold,
            medicalNeeds, setMedicalNeeds,
            hasCompletedOnboarding, completeOnboarding,
            resetToDefaults,
            riskLevel, setRiskLevel,
            weatherData,
            emergencyNumber, setEmergencyNumber
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
