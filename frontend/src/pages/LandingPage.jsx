import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Phone, ArrowRight, UserCheck, Mic, MapPin, Camera, Upload } from 'lucide-react';
import useNativeSpeech from '../hooks/useNativeSpeech';
import LanguageSelector from '../components/LanguageSelector';
import { speakText, stopSpeaking } from '../utils/speech';

export default function LandingPage({ currentLang = 'hi-IN', setCurrentLang }) {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true); // Toggle Login/Signup
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [generatedId, setGeneratedId] = useState('');
    const [step, setStep] = useState(0); // 0: Idle, 1: Name, 2: Village, 3: Phone

    const fileInputRef = React.useRef(null);
    const cameraInputRef = React.useRef(null);

    const isHindi = currentLang === 'hi-IN';

    const {
        transcript,
        listening,
        resetTranscript,
        startListening,
        stopListening
    } = useNativeSpeech();

    // Voice Auto-fill Logic
    useEffect(() => {
        if (!listening && transcript) {
            console.log("Voice Input:", transcript, "Step:", step);

            if (step === 1) {
                // Captured Name
                setName(transcript.replace('.', ''));
                speakText(isHindi ? "जी, अब अपने गाँव का नाम बोलें।" : "Okay, now speak your village name.", currentLang, () => {
                    setStep(2);
                    startListening({ language: isHindi ? 'hi-IN' : 'en-IN' });
                });
            } else if (step === 2) {
                // Captured Village
                setLocation(transcript.replace('.', ''));
                speakText(isHindi ? "अब अपना मोबाइल नंबर बोलें।" : "Now speak your mobile number.", currentLang, () => {
                    setStep(3);
                    startListening({ language: isHindi ? 'hi-IN' : 'en-IN' });
                });
            } else if (step === 3) {
                // Captured Phone (Extract digits)
                const digits = transcript.replace(/\D/g, '');
                if (digits.length >= 10) {
                    setPhone(digits.slice(0, 10)); // Top 10
                    speakText(isHindi ? "जानकारी भर दी गई है। अब लॉगिन करें।" : "Details filled. Please login.", currentLang, () => {
                        setStep(0);
                    });
                } else {
                    speakText(isHindi ? "नंबर समझ नहीं आया। कृपया दोबारा बोलें।" : "Did not understand number. Speak again.", currentLang, () => {
                        startListening({ language: isHindi ? 'hi-IN' : 'en-IN' });
                    });
                }
            }
            resetTranscript();
        }
    }, [listening, transcript, step, isHindi, currentLang]);

    const startVoiceFill = () => {
        stopSpeaking();
        // Decide flow based on current mode
        if (isLoginMode) {
            setStep(3); // Jump directly to Phone step
            const greeting = isHindi
                ? "नमस्ते किसान भाई, लॉगिन करने के लिए कृपया अपना मोबाइल नंबर बोलें।"
                : "Namaste Farmer Friend, to login, please speak your mobile number.";
            speakText(greeting, currentLang, () => {
                startListening({ language: isHindi ? 'hi-IN' : 'en-IN' });
            });
        } else {
            // New Account Flow
            setStep(1); // Ask Name first
            const greeting = isHindi
                ? "नमस्ते किसान भाई, मैं ग्राम सेतु आपकी मदद के लिए तत्पर हूँ। कृपया बोलिये, आपका नाम क्या है?"
                : "Namaste Farmer Friend, I am Gram Setu, ready to help you. Please speak, what is your name?";
            speakText(greeting, currentLang, () => {
                startListening({ language: isHindi ? 'hi-IN' : 'en-IN' });
            });
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                // Mock Reverse Mocking for Demo Stability
                // In real app, we would fetch(https://api.bigdatacloud.net/data/reverse-geocode-client...)
                const mockLoc = isHindi ? "रामपुर, सीकर (राजस्थान)" : "Rampur, Sikar (Rajasthan)";
                setLocation(mockLoc);
            }, (error) => {
                alert(isHindi ? "लोकेशन नहीं मिल सकी।" : "Could not fetch location.");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();

        // Simple mock auth
        if (phone.length !== 10) {
            alert('Kisan bhai, mobile number 10 anko ka hona chahiye.');
            return;
        }

        if (!isLoginMode) {
            // Signup Flow
            const newId = `GS-${Math.floor(1000 + Math.random() * 9000)}`;
            setGeneratedId(newId);
            localStorage.setItem('kisan_session', JSON.stringify({ phone, name, location, profilePic, id: newId }));

            // Show Desi Popup
            setShowPopup(true);
            setTimeout(() => {
                navigate('/home');
            }, 3000); // Wait 3s so they can read popup

        } else {
            // Login Flow
            localStorage.setItem('kisan_session', JSON.stringify({ phone, name: 'Kisan Bhai', id: 'GS-EXISTING' }));
            navigate('/home');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Animated Video-like Background Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center animate-bg-pan"
                style={{ backgroundImage: "url('/assets/bg_farm.png')" }}
            ></div>

            <div className="absolute inset-0 z-0 bg-white/40"></div>
            {showPopup && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 border-4 border-green-500 relative z-10">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <UserCheck className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-earth-800">राम राम किसान भाई! 🙏</h3>
                        <p className="text-earth-600">
                            थारी पहचान संख्या (ID) बन गई है: <br />
                            <span className="text-2xl font-bold text-orange-600">{generatedId}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            यह ID आपके मोबाइल नंबर <b>{phone}</b> पर भेज दी गई है।
                        </p>
                        <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-4">
                            धन्यवाद
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8 w-full max-w-md space-y-6 relative z-10 overflow-hidden">
                {/* Language Selector Top Right */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={() => setCurrentLang(currentLang === 'hi-IN' ? 'en-IN' : 'hi-IN')}
                        className="bg-white/50 hover:bg-white p-2 rounded-full text-xs font-bold border border-earth-200 transition-all"
                    >
                        {currentLang === 'hi-IN' ? 'Change to English' : 'हिंदी में बदलें'}
                    </button>
                </div>

                <div className="text-center space-y-2 mt-4">
                    <div className="bg-gradient-to-br from-crop-green to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-3 hover:rotate-6 transition-transform">
                        <Sprout size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-earth-800 tracking-tight">GramSetu</h1>
                    <p className="text-earth-500 font-medium">
                        {isHindi ? 'किसानों का डिजिटल साथी' : 'Digital Partner for Farmers'}
                    </p>
                </div>

                <div className="bg-orange-50 rounded-xl p-1 flex">
                    <button
                        onClick={() => setIsLoginMode(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLoginMode ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {isHindi ? 'लॉगिन' : 'Login'}
                    </button>
                    <button
                        onClick={() => setIsLoginMode(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLoginMode ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {isHindi ? 'नया खाता' : 'New Account'}
                    </button>
                </div>

                {/* Voice Fill Button */}
                <button
                    type="button"
                    onClick={startVoiceFill}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${step > 0 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'}`}
                >
                    {step > 0 ? (
                        <>
                            <Mic size={20} className="animate-ping" />
                            {isHindi ? 'सुन रहा हूँ...' : 'Listening...'}
                        </>
                    ) : (
                        <>
                            <Mic size={20} />
                            {isHindi ? 'बोलकर भरें (Voice Fill)' : 'Fill by Voice'}
                        </>
                    )}
                </button>

                <form onSubmit={handleLogin} className="space-y-4">
                    {!isLoginMode && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            {/* Profile Pic Section */}
                            <div className="flex justify-center mb-4">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                        {profilePic ? (
                                            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="text-gray-400" size={32} />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => cameraInputRef.current.click()}
                                            className="p-2 bg-crop-green text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="p-2 bg-white text-crop-green border border-crop-green rounded-full shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <Upload size={14} />
                                        </button>
                                    </div>
                                    <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handlePhotoUpload} />
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-earth-700 mb-1 pl-1">
                                    {isHindi ? 'आपका नाम' : 'Your Name'}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={isHindi ? "राम सिंह" : "Ram Singh"}
                                    className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Location Field */}
                            <div>
                                <label className="block text-sm font-bold text-earth-700 mb-1 pl-1">
                                    {isHindi ? 'गाँव का नाम' : 'Village Name'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder={isHindi ? "अपना पता लिखें" : "Enter Address"}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={detectLocation}
                                        className="bg-orange-100 text-orange-600 p-3 rounded-xl hover:bg-orange-200 transition-colors"
                                        title="Detect Location"
                                    >
                                        <MapPin size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-earth-700 mb-1 pl-1">
                            {isHindi ? 'मोबाइल नंबर' : 'Mobile Number'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Phone size={18} />
                            </div>
                            <input
                                type="number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="9876543210"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-earth-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-earth-800/20 hover:bg-earth-900 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                        {isLoginMode ? (isHindi ? 'अंदर आएं' : 'Login') : (isHindi ? 'जुड़ें' : 'Join Now')}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400">
                    {isHindi ? 'ग्राम सेतु पर आपका स्वागत है।' : 'Welcome to GramSetu.'} <br />
                    {isHindi ? 'जय जवान, जय किसान! 🇮🇳' : 'Jai Jawan, Jai Kisan! 🇮🇳'}
                </p>
            </div>
        </div >
    );
}
