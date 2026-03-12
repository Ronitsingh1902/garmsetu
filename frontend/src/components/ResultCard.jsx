import React from 'react';
import { Play, CheckCircle2, Info, ExternalLink } from 'lucide-react';

export default function ResultCard({ data, language, onSpeech }) {
    if (!data) return null;

    const isHindi = language === 'hi-IN';

    const title = isHindi && data.title_hi ? data.title_hi : data.title;
    const description = isHindi && data.description_hi ? data.description_hi : data.description;

    // Choose detailed spoken text for the play button
    let spokenText = description;
    if (isHindi) {
        spokenText = data.spoken_text_hi || data.title_hi || data.title;
    } else {
        spokenText = data.spoken_text || data.title;
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white  p-6 rounded-2xl shadow-sm border border-earth-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-earth-800">{title}</h2>
                        <p className="text-earth-600 text-sm mt-1">{description}</p>
                    </div>
                    <button onClick={() => onSpeech(spokenText)} className="p-2 bg-earth-100 rounded-full hover:bg-earth-200">
                        <Play size={20} className="text-earth-700" fill="currentColor" />
                    </button>
                </div>

                <div className="space-y-3">
                    {data.steps.map((step, idx) => (
                        <div key={step.id} className="flex gap-3 bg-earth-50 p-3 rounded-xl">
                            <div className="mt-1 min-w-[24px]">
                                <div className="w-6 h-6 rounded-full bg-earth-200 text-earth-700 flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                </div>
                            </div>
                            <div>
                                <p className="text-earth-800 font-medium">
                                    {isHindi && step.text_hi ? step.text_hi : step.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {data.source && (
                    <div className="mt-6 pt-4 border-t border-earth-100 flex items-center gap-2 text-xs text-earth-500">
                        <span>Source: {data.source}</span>
                        <ExternalLink size={12} />
                    </div>
                )}
            </div>

            <div className="bg-blue-50  p-3 rounded-lg flex gap-3 items-center text-sm text-blue-800">
                <Info size={16} />
                <p>
                    {isHindi ? 'यह जानकारी केवल सहायता के लिए है।' : 'This information is for assistance only.'}
                </p>
            </div>
        </div>
    );
}
