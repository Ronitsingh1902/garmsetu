import React from 'react';

const languages = [
    { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
    { code: 'en-IN', label: 'English', native: 'English' },
    { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
];

export default function LanguageSelector({ currentLang, onSelect }) {
    return (
        <div className="flex gap-2 justify-center mb-6">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => onSelect(lang.code)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors border-2 ${currentLang === lang.code
                            ? 'bg-earth-700 text-white border-earth-700'
                            : 'bg-white text-earth-700 border-earth-200 hover:bg-earth-50'
                        }`}
                >
                    {lang.native}
                </button>
            ))}
        </div>
    );
}
