/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

type Mode = 'normal' | 'rain' | 'ultra-low-power';
export type Language = 'en' | 'th' | 'ms' | 'ko' | 'ja' | 'zh' | 'ar' | 'id' | 'es' | 'de' | 'it' | 'fr';
type HouseholdType = 'solo' | 'family_with_kids' | 'elderly' | null;

export type RiskLevel = 'green' | 'yellow' | 'orange' | 'red';

// WMO + Thai Met Dept rain thresholds (mm/h)
// <1=green, 1-5=yellow, 5-15=orange, >=15=red
function classifyRisk(maxRain: number): RiskLevel {
    if (maxRain >= 15) return 'red';
    if (maxRain >= 5) return 'orange';
    if (maxRain >= 1) return 'yellow';
    return 'green';
}

function peakInWindow(precip: number[], startIdx: number, hours: number): number {
    if (startIdx < 0 || precip.length === 0) return 0;
    const slice = precip.slice(startIdx, startIdx + hours).map(v => (isNaN(v) ? 0 : v));
    return slice.length > 0 ? Math.max(0, ...slice) : 0;
}

interface ThemeContextType {
    mode: Mode;
    setMode: (mode: Mode) => void;
    autoBattery: boolean;
    setAutoBattery: (v: boolean) => void;
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
    // 72h Forecast
    forecastRisk12h: RiskLevel;
    forecastRisk24h: RiskLevel;
    forecastRisk72h: RiskLevel;
    forecastMaxRain12h: number;
    forecastMaxRain24h: number;
    forecastMaxRain72h: number;
    lastWeatherUpdate: Date | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('app_mode') as Mode) || 'normal');
    const [autoBattery, setAutoBattery] = useState<boolean>(() => localStorage.getItem('app_autoBattery') === 'true');
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

    // Forecast state — real data from Open-Meteo hourly array
    const [forecastRisk12h, setForecastRisk12h] = useState<RiskLevel>('green');
    const [forecastRisk24h, setForecastRisk24h] = useState<RiskLevel>('green');
    const [forecastRisk72h, setForecastRisk72h] = useState<RiskLevel>('green');
    const [forecastMaxRain12h, setForecastMaxRain12h] = useState(0);
    const [forecastMaxRain24h, setForecastMaxRain24h] = useState(0);
    const [forecastMaxRain72h, setForecastMaxRain72h] = useState(0);
    const [lastWeatherUpdate, setLastWeatherUpdate] = useState<Date | null>(null);

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

    // Battery auto-detect: activate Ultra Low Power when battery < 30%
    useEffect(() => {
        localStorage.setItem('app_autoBattery', String(autoBattery));
        if (!autoBattery || !('getBattery' in navigator)) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bat: any = null;
        const handleLevel = () => { if (bat && bat.level < 0.3) setMode('ultra-low-power'); };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).getBattery().then((b: any) => {
            bat = b;
            handleLevel();
            bat.addEventListener('levelchange', handleLevel);
        });
        return () => { if (bat) bat.removeEventListener('levelchange', handleLevel); };
    }, [autoBattery]);

    useEffect(() => {
        localStorage.setItem('app_language', language);
        if (region) { localStorage.setItem('app_region', region); } else { localStorage.removeItem('app_region'); }
        if (household) { localStorage.setItem('app_household', household); } else { localStorage.removeItem('app_household'); }
        if (medicalNeeds !== null) { localStorage.setItem('app_medical', String(medicalNeeds)); } else { localStorage.removeItem('app_medical'); }
        localStorage.setItem('app_onboarded', String(hasCompletedOnboarding));
        localStorage.setItem('app_riskLevel', riskLevel);
        localStorage.setItem('app_emergencyNumber', emergencyNumber);
    }, [language, region, household, medicalNeeds, hasCompletedOnboarding, riskLevel, emergencyNumber]);

    useEffect(() => {
        const fetchWeatherAndForecast = async () => {
            try {
                let lat = 6.541;
                let lng = 101.281;
                if (region?.includes('Betong')) { lat = 5.772; lng = 101.072; }
                else if (region?.includes('Bannang Sata')) { lat = 6.271; lng = 101.263; }
                else if (region?.includes('Raman')) { lat = 6.587; lng = 101.394; }

                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
                    `&current=temperature_2m,precipitation,wind_speed_10m` +
                    `&hourly=precipitation&forecast_days=3&timezone=UTC`;

                const res = await fetch(url);
                if (!res.ok) return;

                const data = await res.json();
                const rain: number = data.current?.precipitation ?? 0;
                const temp: number = data.current?.temperature_2m ?? 0;
                const wind: number = data.current?.wind_speed_10m ?? 0;

                // Current risk (WMO thresholds)
                setRiskLevel(classifyRisk(rain));
                setWeatherData({ rain, temp, wind });

                // Forecast: find current UTC hour index in the hourly array
                const hourlyTimes: string[] = data.hourly?.time ?? [];
                const hourlyPrecip: number[] = data.hourly?.precipitation ?? [];
                const now = new Date();
                const utcHourStr = now.toISOString().slice(0, 13) + ':00'; // "2026-03-02T10:00"
                const startIdx = hourlyTimes.indexOf(utcHourStr);

                const max12 = peakInWindow(hourlyPrecip, startIdx, 12);
                const max24 = peakInWindow(hourlyPrecip, startIdx, 24);
                const max72 = peakInWindow(hourlyPrecip, startIdx, 72);

                setForecastMaxRain12h(max12);
                setForecastMaxRain24h(max24);
                setForecastMaxRain72h(max72);
                setForecastRisk12h(classifyRisk(max12));
                setForecastRisk24h(classifyRisk(max24));
                setForecastRisk72h(classifyRisk(max72));
                setLastWeatherUpdate(new Date());

                console.log(`[Weather] Current: ${rain}mm -> ${classifyRisk(rain)} | Forecast 12h: ${max12.toFixed(1)}mm 24h: ${max24.toFixed(1)}mm 72h: ${max72.toFixed(1)}mm`);
            } catch (err) {
                console.warn('[Weather] Fetch failed. Using cached risk.', err);
            }
        };

        if (hasCompletedOnboarding) {
            fetchWeatherAndForecast();
            const interval = setInterval(fetchWeatherAndForecast, 30 * 60 * 1000);
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
            autoBattery, setAutoBattery,
            language, setLanguage,
            region, setRegion,
            household, setHousehold,
            medicalNeeds, setMedicalNeeds,
            hasCompletedOnboarding, completeOnboarding,
            resetToDefaults,
            riskLevel, setRiskLevel,
            weatherData,
            emergencyNumber, setEmergencyNumber,
            forecastRisk12h, forecastRisk24h, forecastRisk72h,
            forecastMaxRain12h, forecastMaxRain24h, forecastMaxRain72h,
            lastWeatherUpdate,
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
