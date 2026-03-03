import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const APP_VERSION = 'v0.6.3';

export function SplashScreen() {
    const navigate = useNavigate();
    const { hasCompletedOnboarding } = useTheme();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Fade in
        const fadeIn = setTimeout(() => setVisible(true), 80);

        // Navigate after 2.5s
        const nav = setTimeout(() => {
            localStorage.setItem('splashShown', '1');
            navigate(hasCompletedOnboarding ? '/' : '/onboarding', { replace: true });
        }, 2500);

        return () => {
            clearTimeout(fadeIn);
            clearTimeout(nav);
        };
    }, [navigate, hasCompletedOnboarding]);

    return (
        <div className="fixed inset-0 flex flex-col bg-white">
            {/* Version badge — top left */}
            <div
                className="absolute top-safe-or-4 left-4 mt-4 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-mono text-gray-400 tracking-wide"
                style={{ top: 'max(env(safe-area-inset-top, 0px) + 12px, 16px)' }}
            >
                {APP_VERSION}
            </div>

            {/* Center content */}
            <div
                className="flex-1 flex flex-col items-center justify-center gap-5 transition-opacity duration-700"
                style={{ opacity: visible ? 1 : 0 }}
            >
                {/* Logo */}
                <div className="relative">
                    <img
                        src="/logo.svg"
                        alt="Flood Ready Yala logo"
                        className="w-32 h-32 object-contain drop-shadow-md"
                        draggable={false}
                    />
                </div>

                {/* App name */}
                <div className="flex flex-col items-center gap-1">
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                        Flood Ready
                    </h1>
                    <p className="text-xs text-gray-400 tracking-wider text-center leading-relaxed">
                        Offline AI · Disaster Survival
                    </p>
                </div>

                {/* Loading dots */}
                <div className="flex gap-1.5 mt-4">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce"
                            style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom — Flamehaven Initiative */}
            <div
                className="pb-safe-or-6 flex flex-col items-center gap-1 mb-8 transition-opacity duration-700"
                style={{
                    opacity: visible ? 1 : 0,
                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 16px, 24px)',
                }}
            >
                <p className="text-[11px] text-gray-300 uppercase tracking-widest font-medium">
                    Flamehaven Initiative
                </p>
            </div>
        </div>
    );
}
