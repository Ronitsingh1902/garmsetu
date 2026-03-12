import React, { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import useNativeSpeech from '../hooks/useNativeSpeech';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, Cpu } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import VoiceAssistant from '../components/VoiceAssistant';
import IntentCategoryCards from '../components/IntentCategoryCards';
import ResultCard from '../components/ResultCard';
import Layout from '../Layout';
import { speakText } from '../utils/speech';

export default function HomePage({ currentLang, setCurrentLang }) {
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [farmProfileSaved, setFarmProfileSaved] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
        startListening: startListeningNative,
        stopListening: stopListeningNative
    } = useNativeSpeech();

    // Check auth on mount
    useEffect(() => {
        const session = localStorage.getItem('kisan_session');
        if (!session) {
            navigate('/');
        }
    }, [navigate]);

    // Monitor online status
    useEffect(() => {
        const handleStatusChange = () => {
            setIsOnline(navigator.onLine);
        };
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

    const processIntent = async (text) => {
        // console.log("Processing:", text);

        // Check for navigation intents first
        if (text.toLowerCase().includes('sarkari') || text.includes('सरकारी') || text.includes('schemes')) {
            navigate('/schemes');
            return;
        }

        setIsProcessing(true);
        setResultData(null);

        try {
            const response = await fetch('http://localhost:5001/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: currentLang })
            });
            const data = await response.json();

            setTimeout(() => {
                if (data.data) {
                    setResultData(data.data);

                    let textToSpeak = data.data.title;
                    if (currentLang === 'hi-IN') {
                        textToSpeak = data.data.spoken_text_hi || data.data.title_hi || data.data.title;
                    } else {
                        textToSpeak = data.data.spoken_text || data.data.title;
                    }

                    speakText(textToSpeak, currentLang);
                }
                setIsProcessing(false);
            }, 800);

        } catch (error) {
            console.error("API Error", error);
            setIsProcessing(false);
        }
    };

    const startListening = () => {
        setErrorMessage(null);
        resetTranscript();
        setResultData(null);

        if (!browserSupportsSpeechRecognition) {
            setErrorMessage("Browser does not support voice input. Please use Chrome/Edge.");
            return;
        }
        if (!isMicrophoneAvailable) {
            setErrorMessage("Microphone access denied. Please allow permission.");
            return;
        }

        startListeningNative({ language: currentLang });
    };

    const stopListening = () => {
        stopListeningNative();
    };

    useEffect(() => {
        if (!listening) {
            if (transcript && transcript.trim().length > 0) {
                processIntent(transcript);
                resetTranscript();
            }
        }
    }, [listening, transcript]);

    const handleCategorySelect = (query) => {
        // Direct navigation for Schemes card
        if (query.includes('Sarkari')) {
            navigate('/schemes');
        } else {
            processIntent(query);
        }
    };

    const handleCameraCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsCapturing(true);

            // Getting location after image is selected
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;

                        // Simulate upload delay
                        setTimeout(() => {
                            localStorage.setItem('farm_profile', JSON.stringify({
                                lat: latitude,
                                lng: longitude,
                                captured: true,
                                imageName: file.name
                            }));
                            setFarmProfileSaved(true);
                            setIsCapturing(false);

                            alert(currentLang === 'hi-IN'
                                ? "फोटो और लोकेशन सुरक्षित कर ली गई है। धन्यवाद!"
                                : "Photo and location saved successfully!");
                        }, 1500);
                    },
                    (error) => {
                        console.error("Geo Error", error);
                        setIsCapturing(false);
                        alert("Unable to get location. Please allow permissions.");
                    }
                );
            } else {
                alert("Geolocation not supported.");
                setIsCapturing(false);
            }
        }
    };

    return (
        <Layout isOnline={isOnline}>
            <div className="mt-4">
                {errorMessage && (
                    <div className="bg-red-50  border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center text-sm">
                        {errorMessage}
                    </div>
                )}

                <LanguageSelector currentLang={currentLang} onSelect={setCurrentLang} />

                <div className="text-center mt-8">
                    <h2 className="text-2xl font-bold text-earth-800">
                        {currentLang === 'hi-IN' ? 'किसान भाई, स्वागत है!' : 'Welcome Farmer!'}
                    </h2>

                    {/* MERI KHETI SECTION */}
                    {!farmProfileSaved ? (
                        <div className="glass-card rounded-3xl p-6 my-8 mx-2 text-left relative overflow-hidden animate-slide-up">
                            {isCapturing && (
                                <div className="absolute inset-0 bg-white  z-10 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
                                        <p className="text-base text-blue-800 font-bold">
                                            {currentLang === 'hi-IN' ? 'अपलोड हो रहा है...' : 'Uploading...'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <MapPin size={18} />
                                {currentLang === 'hi-IN' ? 'अपने खेत के बारे में बताएं' : 'Tell us about your farm'}
                            </h3>
                            <p className="text-sm text-blue-700 mb-3 leading-relaxed">
                                {currentLang === 'hi-IN'
                                    ? 'लोकेशन और फोटो जोड़ें ताकि हम सटीक सलाह दे सकें।'
                                    : 'Add location and photo so we can give accurate advice.'}
                            </p>

                            <label className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg btn-press flex items-center justify-center gap-3 cursor-pointer hover:bg-blue-700">
                                <Camera size={24} />
                                {currentLang === 'hi-IN' ? 'फोटो लें (Take Photo)' : 'Take Photo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleCameraCapture}
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="bg-green-50  border border-green-200 rounded-3xl p-6 my-8 mx-2 shadow-sm text-center animate-fade-in">
                            <p className="text-green-800 font-bold text-lg flex items-center justify-center gap-2">
                                <MapPin size={24} />
                                {currentLang === 'hi-IN' ? 'खेत सुरक्षित है (Saved)' : 'Farm Data Saved'}
                            </p>
                            <p className="text-sm text-green-600 mt-2">
                                {currentLang === 'hi-IN' ? 'अब आप "अपने खेत को जानें" का उपयोग कर सकते हैं।' : 'Now you can use "Analyze Farm".'}
                            </p>
                        </div>
                    )}

                    {/* New Analyze Farm Button */}
                    <button
                        onClick={() => navigate('/analyze')}
                        className="mt-4 mb-6 bg-gradient-to-r from-crop-green to-emerald-600 text-white px-8 py-5 rounded-full font-bold text-lg shadow-xl shadow-green-200 hover:scale-105 transition-transform will-change-transform flex items-center justify-center gap-3 mx-auto w-full max-w-md animate-slide-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <span>📷</span>
                        {currentLang === 'hi-IN' ? 'अपने खेत को जानें (Apne Khet Ko Jane)' : 'Know Your Farm (Analyze)'}
                    </button>

                    {/* New Video Button */}
                    <button
                        onClick={() => navigate('/videos')}
                        className="mb-6 bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-5 rounded-full font-bold text-lg shadow-xl shadow-orange-200 hover:scale-105 transition-transform will-change-transform flex items-center justify-center gap-3 mx-auto w-full max-w-md animate-slide-up"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <span>🎬</span>
                        {currentLang === 'hi-IN' ? 'खेती की पाठशाला (Video Gyan)' : 'Farming School (Videos)'}
                    </button>

                    {/* NEW Kisan Sathi Button */}
                    <button
                        onClick={() => navigate('/smart-device')}
                        className="mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-5 rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:scale-105 transition-transform will-change-transform flex items-center justify-center gap-3 mx-auto w-full max-w-md animate-slide-up"
                        style={{ animationDelay: '0.3s' }}
                    >
                        <Cpu size={28} />
                        {currentLang === 'hi-IN' ? 'किसान साथी (Kisan Sathi)' : 'Kisan Sathi (IoT)'}
                    </button>

                    <p className="text-earth-600 mt-2 mb-8 text-sm">
                        {currentLang === 'hi-IN' ? 'सरकारी योजना या खेती के बारे में पूछें।' : 'Ask about government schemes or farming.'}
                    </p>
                </div>

                <IntentCategoryCards
                    onSelect={handleCategorySelect}
                    language={currentLang}
                />

                <VoiceAssistant
                    isListening={listening}
                    startListening={startListening}
                    stopListening={stopListening}
                    language={currentLang}
                    transcript={transcript}
                    isProcessing={isProcessing}
                />

                {/* Text Input Fallback (moved below voice assistant but VoiceAssistant is fixed) */}
                <div className="max-w-md mx-auto mb-24 px-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={currentLang === 'hi-IN' ? 'या यहाँ टाइप करें...' : 'Or type here...'}
                            className="w-full px-4 py-3 rounded-full border border-earth-300 focus:ring-2 focus:ring-crop-green focus:border-transparent outline-none shadow-sm text-center bg-white "
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    processIntent(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                        />
                    </div>
                </div>

                {isProcessing && (
                    <div className="text-center my-8 animate-pulse">
                        <div className="inline-block p-4 rounded-full bg-earth-100  mb-2">
                            <span className="text-earth-600 font-medium">
                                {currentLang === 'hi-IN' ? 'सोच रहा हूँ...' : 'Thinking...'}
                            </span>
                        </div>
                    </div>
                )}

                {resultData && !isProcessing && (
                    <ResultCard
                        data={resultData}
                        language={currentLang}
                        onSpeech={(txt) => speakText(txt, currentLang)}
                    />
                )}
            </div>
        </Layout>
    );
}
