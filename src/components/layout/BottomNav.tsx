import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { NavHomeIcon, NavAssistIcon, NavMapIcon, NavSettingsIcon } from '../icons/NavIcons';
import { useTranslation } from '../../lib/i18n';

export function BottomNav() {
    const location = useLocation();
    const { t } = useTranslation();

    const navItems = [
        { id: 'home', path: '/', icon: NavHomeIcon, label: t('home_tab') },
        { id: 'assist', path: '/quick-assist', icon: NavAssistIcon, label: t('assist_tab') },
        { id: 'map', path: '/map', icon: NavMapIcon, label: t('map_tab') },
        { id: 'settings', path: '/settings', icon: NavSettingsIcon, label: t('settings_tab') },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe bg-white border-t border-gray-200">
            <div className="flex items-center justify-between h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.id === 'assist' && location.pathname.includes('/quick-assist'));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-20 h-full text-[11px] font-bold transition-colors haptic-active",
                                isActive ? (item.id === 'assist' ? "text-critical-red" : "text-brand-primary") : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("w-6 h-6 mb-1", isActive && "drop-shadow-[0_0_8px_rgba(244,140,37,0.5)]")} fill={isActive ? "currentColor" : "none"} />
                            <span className="uppercase tracking-wide mt-0.5">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
