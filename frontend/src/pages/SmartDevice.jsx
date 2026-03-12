import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { ArrowLeft, Wifi, Thermometer, Droplets, Sprout, ShoppingCart, Volume2, StopCircle, PlayCircle, X } from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

const STORY_SCENES = [
    {
        image: '/story-intro.png',
        text: "Bharat ka kisan apni mitti ko sabse achchhe se jaanta hai. Lekin badalte mausam, pani ki kami aur galat fasal ke faisle kisan ke liye nuksaan ka karan ban jaate hain. Isi samasya ka samadhan hai — Kisan Saathi.",
        title: "Kisan Saathi – Smart Khet, Samriddh Kisan"
    },
    {
        image: '/story-device.png',
        text: "Kisan Saathi ek smart agri field device hai jo seedha khet mein lagaya jaata hai. Yeh mitti ki nami, mitti ka rang, tapmaan, aur mausami badlav ka real-time data ikattha karta hai.",
        title: "Khet Mein Takneek"
    },
    {
        image: '/story-dashboard.png',
        text: "Yeh saara data internet ke zariye Kisan Saathi ke secure system tak pahunchta hai, jahaan AI aur smart analysis ke through mitti ki prakriti ko samjha jaata hai. Kisan Saathi batata hai: kaunsi fasal ugani chahiye, kab paani dena chahiye.",
        title: "Smart Analysis"
    },
    {
        image: '/story-farmer.png',
        text: "Yeh saari jaankari kisan ko mobile app ya Gram Setu website par milti hai. Jo saral, bhasha-friendly aur aasaan hai.",
        title: "Gram Setu Website"
    },
    {
        image: '/story-finance.png',
        text: "Kisan Saathi se kheti ka kharcha kam hota hai. Sahi maatra mein khaad aur paani dene se 30% tak ki bachat hoti hai aur munafa badhta hai.",
        title: "Arthik Munafa (Financial Benefits)"
    },
    {
        image: '/story-soil.png',
        text: "Mitti ki sehat sudharti hai. Rasayanik khaad ka kam prayog mitti ko upjau banaye rakhta hai, taaki aane wali pidhi bhi kheti kar sake.",
        title: "Mitti Ki Sehat (Soil Benefits)"
    },
    {
        image: '/story-intro.png', // Reusing nice background for outro
        text: "Kisan Saathi sirf ek machine nahi, yeh kisan ka saathi hai. Kisan Saathi – Har Khet ka Vishwas.",
        title: "Kisan Saathi – Har Khet ka Vishwas"
    }
];

export default function SmartDevice() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('hi-IN');
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Story State
    const [isStoryOpen, setIsStoryOpen] = useState(false);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    const isHindi = lang === 'hi-IN';

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            stopSpeaking();
        };
    }, []);

    const toggleSpeech = () => {
        if (isSpeaking) {
            stopSpeaking();
            setIsSpeaking(false);
        } else {
            const textToRead = isHindi
                ? "किसान साथी। आपका खेत बोलेगा! यह स्मार्ट डिवाइस आपके खेत की मिट्टी और मौसम पर 24/7 नज़र रखता है। गाँव में भी इंटरनेट। जीएसएम और लोरा तकनीक से काम करता है। मिट्टी की सेहत। एनपीके, नमी और तापमान की जानकारी। मौसम स्टेशन। बारिश और धूप का हिसाब रखे। सही सिंचाई। पानी बचाएं और पैदावार बढ़ाएं।"
                : "Kisan Sathi. Your Farm Will Speak! This smart device monitors your farm soil and weather 24/7. Connected Everywhere. Works using GSM & LoRa. Soil Health. NPK, moisture, and temp data. Weather Station. Tracks rain and sun. Smart Irrigation. Save water and increase yield.";

            setIsSpeaking(true);
            speakText(textToRead, lang, () => setIsSpeaking(false));
        }
    };

    // Story Logic
    const playScene = (index) => {
        if (index >= STORY_SCENES.length) {
            closeStory();
            return;
        }

        setCurrentSceneIndex(index);
        const scene = STORY_SCENES[index];

        // Speak the Hindi text
        speakText(scene.text, 'hi-IN', () => {
            // Auto advance when done
            setTimeout(() => {
                playScene(index + 1);
            }, 1000); // 1s pause between scenes
        });
    };

    const startStory = () => {
        stopSpeaking(); // Stop any other speech
        setIsSpeaking(false);
        setIsStoryOpen(true);
        playScene(0);
    };

    const closeStory = () => {
        stopSpeaking();
        setIsStoryOpen(false);
        setCurrentSceneIndex(0);
    };

    const skipScene = () => {
        stopSpeaking();
        playScene(currentSceneIndex + 1);
    };

    return (
        <Layout isOnline={true}>
            <div className="max-w-4xl mx-auto pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-earth-100">
                        <ArrowLeft className="text-earth-800" />
                    </button>
                    <h1 className="text-2xl font-bold text-earth-800">
                        {isHindi ? 'किसान साथी (Kisan Sathi)' : 'Kisan Sathi (Smart IoT)'}
                    </h1>

                    <div className="ml-auto flex gap-2">
                        <button
                            onClick={startStory}
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors animate-pulse"
                        >
                            <PlayCircle size={16} />
                            {isHindi ? 'वीडियो देखें' : 'Watch Story'}
                        </button>

                        <button
                            onClick={toggleSpeech}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isSpeaking ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                        >
                            {isSpeaking ? <StopCircle size={16} /> : <Volume2 size={16} />}
                            {isHindi ? (isSpeaking ? 'रुकें' : 'सुनें') : (isSpeaking ? 'Stop' : 'Listen')}
                        </button>

                        <button
                            onClick={() => {
                                stopSpeaking();
                                setIsSpeaking(false);
                                setLang(lang === 'hi-IN' ? 'en-IN' : 'hi-IN');
                            }}
                            className="bg-white  border border-earth-200 px-3 py-1 rounded-full text-xs font-bold text-earth-600"
                        >
                            {isHindi ? 'English' : 'हिंदी'}
                        </button>
                    </div>
                </div>

                {/* Main Hero Card */}
                <div className="bg-white  rounded-3xl p-1 shadow-xl shadow-earth-100 border border-earth-100 overflow-hidden mb-8">
                    <div className="relative aspect-[3/4] md:aspect-video w-full bg-slate-50 ">
                        <img
                            src="/kisan-sathi.png"
                            alt="Kisan Sathi Blueprint"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-4 right-4 bg-white  px-3 py-1 rounded-full text-xs font-bold text-blue-800 border border-blue-100 shadow-sm">
                            Blueprint v1.0
                        </div>
                    </div>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-earth-900 mb-2">
                            {isHindi ? 'आपका खेत बोलेगा!' : 'Your Farm Will Speak!'}
                        </h2>
                        <p className="text-earth-600 leading-relaxed">
                            {isHindi
                                ? 'यह स्मार्ट डिवाइस आपके खेत की मिट्टी और मौसम पर 24/7 नज़र रखता है। यह आपको बताता है कि कब पानी देना है और कब खाद डालनी है।'
                                : 'This smart device monitors your farm soil and weather 24/7. It tells you exactly when to water and when to fertilize.'}
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50 p-5 rounded-2xl flex gap-4 items-start">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <Wifi className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900">
                                {isHindi ? 'गाँव में भी इंटरनेट' : 'Connected Everywhere'}
                            </h3>
                            <p className="text-sm text-blue-700 mt-1">
                                {isHindi ? 'GSM और LoRa तकनीक से बिना वाई-फाई के काम करता है।' : 'Works without Wi-Fi using GSM & LoRa technology.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-green-50 p-5 rounded-2xl flex gap-4 items-start">
                        <div className="bg-green-100 p-3 rounded-xl">
                            <Sprout className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-900">
                                {isHindi ? 'मिट्टी की सेहत' : 'Soil Health'}
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
                                {isHindi ? 'NPK, नमी और तापमान की सटीक जानकारी सीधे मोबाइल पर।' : 'Accurate NPK, moisture, and temp data on your mobile.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-5 rounded-2xl flex gap-4 items-start">
                        <div className="bg-orange-100 p-3 rounded-xl">
                            <Thermometer className="text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-900">
                                {isHindi ? 'मौसम स्टेशन' : 'Weather Station'}
                            </h3>
                            <p className="text-sm text-orange-700 mt-1">
                                {isHindi ? 'बारिश और धूप का हिसाब रखे, ताकि फसल रहे सुरक्षित।' : 'Tracks rain and sun to keep crops safe.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-5 rounded-2xl flex gap-4 items-start">
                        <div className="bg-purple-100 p-3 rounded-xl">
                            <Droplets className="text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-purple-900">
                                {isHindi ? 'सही सिंचाई' : 'Smart Irrigation'}
                            </h3>
                            <p className="text-sm text-purple-700 mt-1">
                                {isHindi ? 'पानी बचाएं और पैदावार बढ़ाएं।' : 'Save water and increase yield based on data.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-earth-800 rounded-3xl p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-crop-green/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <h2 className="text-2xl font-bold mb-3 relative z-10">
                        {isHindi ? 'आज ही आर्डर करें!' : 'Order Today!'}
                    </h2>
                    <p className="text-earth-200 mb-6 max-w-md mx-auto relative z-10">
                        {isHindi
                            ? 'अपने खेत को "स्मार्ट" बनाएं। भारी छूट के लिए अभी प्री-बुक करें।'
                            : 'Make your farm "Smart". Pre-book now for massive discounts.'}
                    </p>
                    <button
                        onClick={() => alert(isHindi ? "आपकी रूचि दर्ज कर ली गई है! हमारी टीम संपर्क करेगी।" : "Interest registered! Our team will contact you.")}
                        className="bg-crop-green hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-green-900/50 transition-transform active:scale-95 flex items-center gap-2 mx-auto relative z-10"
                    >
                        <ShoppingCart size={20} />
                        {isHindi ? 'रुचि दिखाएं (Pre-Book)' : 'Show Interest (Pre-book)'}
                    </button>
                    <p className="text-xs text-earth-300 mt-4 relative z-10">
                        * {isHindi ? 'सरकार द्वारा सब्सिडी उपलब्ध है' : 'Government subsidy available'}
                    </p>
                </div>

                {/* STORY MODAL */}
                {isStoryOpen && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center p-4">
                        <button
                            onClick={closeStory}
                            className="absolute top-4 right-4 text-white p-2 hover:bg-white rounded-full z-50"
                        >
                            <X size={32} />
                        </button>

                        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl flex flex-col">
                            {/* Image */}
                            <div className="flex-1 relative">
                                <img
                                    src={STORY_SCENES[currentSceneIndex].image}
                                    alt="Story Scene"
                                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-1000"
                                    key={currentSceneIndex} // Force re-render for animation
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>

                                {/* Text Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                                    <h3 className="text-yellow-400 font-bold text-2xl mb-4 drop-shadow-md">
                                        {STORY_SCENES[currentSceneIndex].title}
                                    </h3>
                                    <p className="text-white text-xl md:text-2xl leading-relaxed font-medium drop-shadow-md max-w-4xl mx-auto">
                                        "{STORY_SCENES[currentSceneIndex].text}"
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1 bg-gray-800 w-full flex">
                                {STORY_SCENES.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-full flex-1 transition-all duration-300 ${idx <= currentSceneIndex ? 'bg-crop-green' : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={skipScene}
                                className="text-white/50 border border-white/20 px-6 py-2 rounded-full hover:bg-white text-sm"
                            >
                                Skip &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
