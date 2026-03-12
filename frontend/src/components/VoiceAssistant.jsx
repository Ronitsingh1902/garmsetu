import React, { useEffect, useState } from 'react';
import { Mic, X, Activity } from 'lucide-react';
import 'regenerator-runtime/runtime';

export default function VoiceAssistant({
    isListening,
    startListening,
    stopListening,
    language,
    transcript, // Optional: display live transcript in the overlay
    isProcessing // Expect this prop
}) {
    const [visualize, setVisualize] = useState(false);

    useEffect(() => {
        if (isListening || isProcessing) {
            setVisualize(true);
        } else {
            const timer = setTimeout(() => setVisualize(false), 300); // fade out
            return () => clearTimeout(timer);
        }
    }, [isListening, isProcessing]);

    if (!visualize && !isListening && !isProcessing) {
        // Idle State: Floating Action Button (FAB)
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={startListening}
                    className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-300 transition-all duration-300 hover:scale-110 active:scale-95 text-white"
                >
                    <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-0 group-hover:opacity-75 duration-1000" />
                    <Mic size={28} />
                </button>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-earth-600 bg-white px-2 py-1 rounded-md shadow-sm pointer-events-none">
                    {language === 'hi-IN' ? 'बोलें' : 'Speak'}
                </div>
            </div>
        );
    }

    // Active State: Full Screen / Sheet Overlay
    return (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40  transition-opacity duration-300"
                onClick={stopListening}
            />

            {/* Assistant Panel */}
            <div className="relative bg-white rounded-t-[2.5rem] shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-slide-up-modal">
                {/* Close Button */}
                <button
                    onClick={stopListening}
                    className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 flex flex-col items-center justify-center min-h-[350px]">

                    {/* Siri/Alexa-like Orb Animation */}
                    <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                        {/* Core */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-full blur-md opacity-80 animate-pulse" />

                        {/* Outer Glow 1 */}
                        <div className="absolute inset-[-10px] bg-gradient-to-tr from-cyan-300 to-blue-600 rounded-full blur-xl opacity-40 animate-spin-slow" />

                        {/* Outer Glow 2 */}
                        <div className="absolute inset-[-20px] bg-purple-400 rounded-full blur-2xl opacity-30 animate-pulse-slow" />

                        {/* Icon */}
                        <div className="relative z-10 bg-white p-4 rounded-full shadow-inner">
                            <Mic size={40} className="text-indigo-600" />
                        </div>
                    </div>

                    {/* Status Text */}
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                        {isProcessing
                            ? (language === 'hi-IN' ? 'मैं सोच रहा हूँ...' : 'Thinking...')
                            : (isListening
                                ? (language === 'hi-IN' ? 'मैं सुन रहा हूँ...' : 'I\'m listening...')
                                : (language === 'hi-IN' ? 'प्रोसेसिंग...' : 'Processing...')
                            )
                        }
                    </h3>

                    {/* Transcript Preview */}
                    <div className="h-16 flex items-center justify-center w-full px-4">
                        {transcript ? (
                            <p className="text-lg text-gray-700 text-center font-medium leading-relaxed">
                                "{transcript}"
                            </p>
                        ) : (
                            <div className="flex gap-1 h-3 items-end">
                                {/* Fake Waveform */}
                                <div className="w-1 bg-indigo-400 h-2 animate-wave-1 rounded-full"></div>
                                <div className="w-1 bg-indigo-400 h-4 animate-wave-2 rounded-full"></div>
                                <div className="w-1 bg-indigo-400 h-6 animate-wave-3 rounded-full"></div>
                                <div className="w-1 bg-indigo-400 h-3 animate-wave-4 rounded-full"></div>
                                <div className="w-1 bg-indigo-400 h-5 animate-wave-2 rounded-full"></div>
                            </div>
                        )}
                    </div>

                    <p className="mt-8 text-sm text-gray-400">
                        {language === 'hi-IN' ? 'बंद करने के लिए कहीं भी टैप करें' : 'Tap anywhere to cancel'}
                    </p>
                </div>
            </div>
        </div>
    );
}
