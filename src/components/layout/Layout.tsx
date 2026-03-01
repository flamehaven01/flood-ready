import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Menu } from 'lucide-react';

export function Layout() {
    return (
        <div className="min-h-screen bg-surface-light flex flex-col">
            {/* Universal Header */}
            <header className="sticky top-0 z-40 bg-white shadow-sm px-4 h-14 flex items-center justify-between">
                <button className="p-2 -ml-2 haptic-active text-gray-700" aria-label="Menu">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="font-sans font-black text-xl tracking-tight text-gray-900">
                    Flood Ready
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-md mx-auto w-full min-h-full flex flex-col">
                    <Outlet />
                </div>
            </main>

            {/* Fixed Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
