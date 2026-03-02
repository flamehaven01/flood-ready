import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { NavHomeIcon, NavAssistIcon, NavMapIcon, NavSettingsIcon } from '../icons/NavIcons';
import { useTranslation } from '../../lib/i18n';

export function BottomNav() {
    const location = useLocation();
    const { t } = useTranslation();

    const navItems = [
        {
            id: 'home',
            path: '/',
            icon: NavHomeIcon,
            label: t('home_tab'),
            bubbleBg: 'bg-brand-primary',
            activeLabel: 'text-brand-primary',
        },
        {
            id: 'assist',
            path: '/quick-assist',
            icon: NavAssistIcon,
            label: t('assist_tab'),
            bubbleBg: 'bg-critical-red',
            activeLabel: 'text-critical-red',
        },
        {
            id: 'map',
            path: '/map',
            icon: NavMapIcon,
            label: t('map_tab'),
            bubbleBg: 'bg-water-blue',
            activeLabel: 'text-water-blue',
        },
        {
            id: 'settings',
            path: '/settings',
            icon: NavSettingsIcon,
            label: t('settings_tab'),
            bubbleBg: 'bg-purple-600',
            activeLabel: 'text-purple-600',
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.id === 'assist' && location.pathname.includes('/quick-assist'));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="flex flex-col items-center justify-center gap-0.5 w-20 h-full haptic-active transition-all duration-200"
                        >
                            {/* Icon bubble */}
                            <div className={cn(
                                "flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200",
                                isActive ? item.bubbleBg : "bg-transparent"
                            )}>
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-all duration-200",
                                        isActive ? "text-white" : "text-gray-400"
                                    )}
                                    fill={isActive ? "currentColor" : "none"}
                                />
                            </div>
                            {/* Label */}
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wide transition-colors duration-200",
                                isActive ? item.activeLabel : "text-gray-400"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
