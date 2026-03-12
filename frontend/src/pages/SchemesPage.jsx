import React, { useState } from 'react';
import { ArrowLeft, Search, FileText, Phone, CheckCircle, Info, Volume2, StopCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import schemesData from '../../../backend/data/schemes.json';
import { speakText, stopSpeaking } from '../utils/speech';

export default function SchemesPage({ language = 'en-US' }) {
    const navigate = useNavigate();
    const isHindi = language === 'hi-IN';
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedScheme, setExpandedScheme] = useState(null);
    const [speakingId, setSpeakingId] = useState(null);

    const filteredSchemes = schemesData.filter(scheme => {
        const query = searchTerm.toLowerCase();
        return (
            scheme.title.toLowerCase().includes(query) ||
            scheme.title_hi.toLowerCase().includes(query)
        );
    });

    const toggleScheme = (id) => {
        if (expandedScheme === id) {
            setExpandedScheme(null);
        } else {
            setExpandedScheme(id);
        }
    };

    const speakScheme = (scheme, e) => {
        e.stopPropagation(); // Prevent toggling accordion

        if (speakingId === scheme.id) {
            stopSpeaking();
            setSpeakingId(null);
            return;
        }

        stopSpeaking(); // Stop valid speech

        let text = "";
        if (isHindi) {
            text = `नमस्ते किसान भाई। ${scheme.title_hi}। ${scheme.description_hi}। `;
            text += `इस योजना के बारे में विस्तार से जानिये। ${scheme.details.what_is_it_hi}। `;
            text += `पात्रता: ${scheme.details.eligibility_hi}। `;
            text += `आवेदन कैसे करें? ${scheme.details.how_to_apply_hi}। `;
            text += `जरूरी दस्तावेज: ${scheme.details.documents_hi}। `;
            text += `अधिक जानकारी के लिए संपर्क करें: ${scheme.details.contact_hi}। धन्यवाद।`;
        } else {
            text = `Hello Farmer friend. This is ${scheme.title}. ${scheme.description}. `;
            text += `Here are the details. ${scheme.details.what_is_it}. `;
            text += `Eligibility: ${scheme.details.eligibility}. `;
            text += `How to Apply? ${scheme.details.how_to_apply}. `;
            text += `Documents Required: ${scheme.details.documents}. `;
            text += `Contact: ${scheme.details.contact}. Thank you.`;
        }

        setSpeakingId(scheme.id);
        speakText(text, isHindi ? 'hi-IN' : 'en-US', () => setSpeakingId(null));
    };

    return (
        <Layout isOnline={true}>
            <div className="flex items-center gap-4 mb-6 sticky top-20 z-10 bg-white  p-3 rounded-2xl border border-earth-100 shadow-md">
                <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-earth-100 transition-colors">
                    <ArrowLeft size={24} className="text-earth-800" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-earth-800">{isHindi ? 'सरकारी योजनाएं' : 'Government Schemes'}</h1>
                    <p className="text-xs text-earth-500">{isHindi ? 'किसानों के लिए विशेष लाभ' : 'Special Benefits for Farmers'}</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-full">
                    <FileText className="text-orange-600" size={24} />
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder={isHindi ? "योजना खोजें (जैसे: किसान क्रेडिट कार्ड)" : "Search Scheme (e.g., Kisan Credit Card)"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4 pb-20">
                {filteredSchemes.map((scheme) => (
                    <div key={scheme.id} className="bg-white  rounded-2xl border border-earth-100 shadow-sm overflow-hidden transition-all duration-300">
                        <div
                            className="p-5 cursor-pointer hover:bg-orange-50 active:bg-orange-50 group"
                            onClick={() => toggleScheme(scheme.id)}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-earth-900 text-lg leading-tight mb-1 group-hover:text-orange-700 transition-colors">
                                        {isHindi ? scheme.title_hi : scheme.title}
                                    </h3>
                                    <p className="text-sm text-earth-600">
                                        {isHindi ? scheme.description_hi : scheme.description}
                                    </p>
                                </div>

                                {/* Listen Button */}
                                <button
                                    onClick={(e) => speakScheme(scheme, e)}
                                    className={`p-3 rounded-full shadow-sm hover:scale-105 transition-all flex items-center gap-2 ${speakingId === scheme.id ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700'}`}
                                >
                                    {speakingId === scheme.id ? <StopCircle size={22} /> : <Volume2 size={22} />}
                                    <span className="text-xs font-bold hidden sm:inline">
                                        {speakingId === scheme.id
                                            ? (isHindi ? 'रुकें' : 'Stop')
                                            : (isHindi ? 'सुनें' : 'Listen')}
                                    </span>
                                </button>
                            </div>

                            {/* Expand Indicator (Subtle) */}
                            <div className="flex justify-center mt-2">
                                <div className={`h-1 w-12 rounded-full transition-colors ${expandedScheme === scheme.id ? 'bg-orange-200' : 'bg-gray-100'}`} />
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedScheme === scheme.id && (
                            <div className="bg-orange-50 p-5 border-t border-orange-100 animate-in slide-in-from-top-2">
                                <div className="space-y-5">
                                    {/* What is it */}
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-orange-800 mb-2 text-sm uppercase tracking-wider">
                                            <Info size={16} />
                                            {isHindi ? 'योजना क्या है?' : 'What is it?'}
                                        </h4>
                                        <p className="text-earth-800 text-sm leading-relaxed bg-white  p-3 rounded-lg border border-orange-100">
                                            {isHindi ? scheme.details.what_is_it_hi : scheme.details.what_is_it}
                                        </p>
                                    </div>

                                    {/* Eligibility */}
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-2 text-sm uppercase tracking-wider">
                                            <CheckCircle size={16} />
                                            {isHindi ? 'पात्रता (Eligibility)' : 'Eligibility'}
                                        </h4>
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-900 whitespace-pre-line">
                                            {isHindi ? scheme.details.eligibility_hi : scheme.details.eligibility}
                                        </div>
                                    </div>

                                    {/* How to Apply */}
                                    <div>
                                        <h4 className="flex items-center gap-2 font-bold text-green-800 mb-2 text-sm uppercase tracking-wider">
                                            <FileText size={16} />
                                            {isHindi ? 'आवेदन कैसे करें?' : 'How to Apply?'}
                                        </h4>
                                        <p className="text-green-900 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                                            {isHindi ? scheme.details.how_to_apply_hi : scheme.details.how_to_apply}
                                        </p>
                                    </div>

                                    {/* Documents */}
                                    <div>
                                        <h4 className="font-bold text-gray-700 mb-1 text-xs uppercase">
                                            {isHindi ? 'जरूरी दस्तावेज' : 'Documents Required'}
                                        </h4>
                                        <p className="text-gray-600 text-sm whitespace-pre-line pl-2 border-l-2 border-gray-300">
                                            {isHindi ? scheme.details.documents_hi : scheme.details.documents}
                                        </p>
                                    </div>

                                    {/* Contact */}
                                    <div className="flex items-center gap-3 bg-white  p-3 rounded-xl border border-gray-200">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <Phone size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">{isHindi ? 'संपर्क करें' : 'Contact Here'}</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {isHindi ? scheme.details.contact_hi : scheme.details.contact}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredSchemes.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        {isHindi ? 'कोई योजना नहीं मिली।' : 'No schemes found.'}
                    </div>
                )}
            </div>
        </Layout>
    );
}
