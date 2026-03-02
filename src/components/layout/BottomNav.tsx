import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { NavHomeIcon, NavAssistIcon, NavMapIcon, NavSettingsIcon } from '../icons/NavIcons';
import { useTranslation } from '../../lib/i18n';

export function BottomNav() {
    const location = useLocation();
    const { t } = useTranslation();

    const navItems = [
        { id: 'home',     path: '/',             icon: NavHomeIcon,     label: t('home_tab'),     activeText: 'text-brand-primary',  activeBg: 'bg-brand-primary/10', glow: 'rgba(244,140,37,0.5)' },
        { id: 'assist',   path: '/quick-assist', icon: NavAssistIcon,   label: t('assist_tab'),   activeText: 'text-critical-red',   activeBg: 'bg-red-100',          glow: 'rgba(255,59,48,0.45)' },
        { id: 'map',      path: '/map',           icon: NavMapIcon,      label: t('map_tab'),      activeText: 'text-water-blue',     activeBg: 'bg-blue-100',         glow: 'rgba(0,122,255,0.45)' },
        { id: 'settings', path: '/settings',      icon: NavSettingsIcon, label: t('settings_tab'), activeText: 'text-purple-600',     activeBg: 'bg-purple-100',       glow: 'rgba(147,51,234,0.4)' },
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
                                "flex flex-col items-center justify-center w-20 h-12 text-[11px] font-bold transition-all duration-200 haptic-active rounded-2xl",
                                isActive
                                    ? cn(item.activeText, item.activeBg)
                                    : "text-gray-400 hover:text-gray-700"
                            )}
                        >
                            <Icon
                                className={cn("w-6 h-6 mb-0.5 transition-all duration-200", isActive && `drop-shadow-[0_0_8px_${item.glow}]`)}
                                fill={isActive ? "currentColor" : "none"}
                            />
                            <span className="uppercase tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
