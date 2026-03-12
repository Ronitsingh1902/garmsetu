import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function Layout({ children, isOnline }) {
    return (
        <div className="min-h-screen bg-earth-50 text-earth-900 font-sans selection:bg-earth-200 relative overflow-hidden">
            {/* Animated Video-like Background Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center animate-bg-pan"
                style={{ backgroundImage: "url('/assets/bg_farm.png')" }}
            ></div>

            <div className="relative z-10 min-h-screen bg-white/40">
                <header className="bg-white/90 border-b border-earth-100 p-4 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                    <div className="max-w-md mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-bold text-earth-800 flex items-center gap-2">
                            🌱 GramSetu
                        </h1>
                        <div className="flex items-center gap-2 text-sm w-fit px-3 py-1 rounded-full bg-white/50 border border-earth-100 backdrop-blur-sm">
                            {isOnline ? (
                                <><Wifi size={16} className="text-crop-green" /> Online</>
                            ) : (
                                <><WifiOff size={16} className="text-earth-400" /> Offline</>
                            )}
                        </div>
                    </div>
                </header>
                <main className="max-w-md mx-auto p-4 pb-24">
                    {children}
                </main>
            </div>
        </div>
    );
}
