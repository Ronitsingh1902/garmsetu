import React from 'react';
import { Sprout, FileText } from 'lucide-react';

export default function IntentCategoryCards({ onSelect, language }) {
    const categories = [
        {
            id: 'SCHEMES',
            label: language === 'hi-IN' ? 'सरकारी योजनाएं' : 'Government Schemes',
            image: '/assets/icon_schemes.png',
            color: 'bg-orange-100 text-orange-700',
            query: language === 'hi-IN' ? 'Sarkari Yojnayein bataiye' : 'Tell me about government schemes'
        },
        {
            id: 'FARMING',
            label: language === 'hi-IN' ? 'छत पर खेती' : 'Terrace Farming',
            image: '/assets/icon_farming.png',
            color: 'bg-green-100 text-green-700',
            query: language === 'hi-IN' ? 'Terrace farming kaise karein' : 'How to do terrace farming'
        }
    ];

    return (
        <div className="mb-8">
            <div className="grid grid-cols-2 gap-4 mb-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.query)}
                        className="flex flex-col items-center justify-center p-4 bg-white  rounded-xl shadow-sm border-2 border-transparent hover:border-earth-200 hover:bg-white transition-all active:scale-95 group"
                    >
                        <div className="w-20 h-20 mb-3 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-earth-800 font-bold text-center text-sm">
                            {cat.label}
                        </span>
                    </button>
                ))}
            </div>
            <p className="text-center text-xs text-earth-500 italic">
                {language === 'hi-IN'
                    ? '*और भी योजनाओं के बारे में पूछ सकते हैं'
                    : '*You can ask about other schemes too'}
            </p>
        </div>
    );
}
