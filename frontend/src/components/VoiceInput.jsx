import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import 'regenerator-runtime/runtime';

export default function VoiceInput({ onResult, language, isListening, startListening, stopListening }) {
    // We use the parent's check for browser support to show errors there, 
    // or we can pass a prop if needed. For now, assume parent handles errors.

    return (
        <div className="flex flex-col items-center gap-4 my-8">
            <button
                onClick={() => {
                    console.log("[VoiceInput] Button clicked");
                    isListening ? stopListening() : startListening();
                }}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${isListening
                    ? 'bg-red-500 scale-110 shadow-red-200 ring-4 ring-red-100'
                    : 'bg-crop-green scale-100 shadow-green-200 hover:bg-crop-dark'
                    }`}
            >
                <Mic size={40} className="text-white" />
            </button>
            <div className={`text-center transition-all ${isListening ? 'scale-110' : ''}`}>
                <p className={`text-earth-600 font-medium text-lg ${isListening ? 'animate-pulse font-bold text-red-600' : ''}`}>
                    {isListening
                        ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...')
                        : (language === 'hi-IN' ? 'बोलने के लिए दबाएं' : 'Tap to Speak')}
                </p>
                {isListening && (
                    <p className="text-xs text-red-400 mt-1">
                        {language === 'hi-IN' ? '(रोकने और भेजने के लिए दबाएं)' : '(Tap to Stop & Send)'}
                    </p>
                )}
            </div>
        </div>
    );
}
