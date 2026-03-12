import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Calendar, User, Phone, CheckCircle, Tag, Volume2, StopCircle, MapPin, Mic, MicOff, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Mock high-quality images (using placeholders for now, envisioned as real photos)
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=400"; // Generic farm tool

const PRODUCTS = [
    {
        id: 1,
        name: "Organic Urea (Bio)",
        name_hi: "जैविक यूरिया (बायो)",
        price: "₹250",
        type: "Fertilizer",
        type_hi: "खाद",
        subsidy: "40% OFF",
        description: "Increases soil nitrogen naturally without harming microbes. Best for Paddy and Wheat.",
        description_hi: "मिट्टी के रोगाणुओं को नुकसान पहुंचाए बिना प्राकृतिक रूप से नाइट्रोजन बढ़ाता है। धान और गेहूं के लिए सर्वोत्तम।",
        images: ["/products/urea.png", "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 2,
        name: "Drip Irrigation Kit",
        name_hi: "ड्रिप सिंचाई किट",
        price: "₹1200",
        type: "Equipment",
        type_hi: "उपकरण",
        subsidy: "Govt Subsidized",
        description: "Save 70% water. Easy to install for 1 acre land. Govt approved ISI mark.",
        description_hi: "७०% पानी बचाएं। १ एकड़ जमीन के लिए स्थापित करना आसान। सरकारी मान्यता प्राप्त आईएसआई मार्क।",
        images: ["/products/drip_irrigation.png", "https://images.unsplash.com/photo-1615811361524-78849b2c56b4?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 3,
        name: "Hybrid Tomato Seeds",
        name_hi: "हाइब्रिड टमाटर बीज",
        price: "₹80",
        type: "Seeds",
        type_hi: "बीज",
        subsidy: null,
        description: "High yield variety. Resistant to leaf curl virus. Harvest in 60 days.",
        description_hi: "अधिक उपज देने वाली किस्म। पत्ता मरोड़ रोग प्रतिरोधी। ६० दिनों में फसल तैयार।",
        images: ["/products/tomato.png", "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 4,
        name: "Vermicompost (5kg)",
        name_hi: "केंचुआ खाद (५ किलो)",
        price: "₹300",
        type: "Manure",
        type_hi: "खाद",
        subsidy: "10% OFF",
        description: "Pure organic compost. Improve soil texture and water retention.",
        description_hi: "शुद्ध जैविक खाद। मिट्टी की बनावट और जल धारण क्षमता में सुधार करता है।",
        images: ["/products/vermicompost.png", "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 5,
        name: "Polyhouse Setup",
        name_hi: "पॉलीहाउस सेटअप",
        price: "₹1.5L",
        type: "Infrastructure",
        type_hi: "ढांचा",
        subsidy: "80% Subsidy",
        description: "Grow vegetables year-round. Protected from pest and weather. Full installation support.",
        description_hi: "साल भर सब्जियां उगाएं। कीट और मौसम से सुरक्षित। पूर्ण स्थापना सहायता।",
        images: ["/products/polyhouse.png", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 6,
        name: "Solar Insect Trap",
        name_hi: "सौर कीट जाल",
        price: "₹900",
        type: "Equipment",
        type_hi: "उपकरण",
        subsidy: "50% OFF",
        description: "Automatic night charging. Traps harmful flying insects. No electricity needed.",
        description_hi: "स्वचालित रात्रि चार्जिंग। हानिकारक उड़ने वाले कीड़ों को फंसाता है। बिजली की जरूरत नहीं।",
        images: ["/products/solar_trap.png", "https://plus.unsplash.com/premium_photo-1664303499312-917c50e4047d?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 7,
        name: "Neem Oil (1L)",
        name_hi: "नीम तेल (१ लीटर)",
        price: "₹450",
        type: "Pesticide",
        type_hi: "कीटनाशक",
        subsidy: null,
        description: "Natural organic pesticide. Safe for bees and earthworms. Kills aphids and mites.",
        description_hi: "प्राकृतिक जैविक कीटनाशक। मधुमक्खियों और केंचुओं के लिए सुरक्षित। एफिड्स और माइट्स को मारता है।",
        images: ["/products/neem_oil.png", "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 8,
        name: "Battery Sprayer Pump",
        name_hi: "बैटरी स्प्रेयर पंप",
        price: "₹2500",
        type: "Equipment",
        type_hi: "उपकरण",
        subsidy: "20% OFF",
        description: "16L Tank. 8 hours battery life. Lightweight and easy to carry.",
        description_hi: "१६ लीटर टैंक। ८ घंटे की बैटरी लाइफ। हल्का और ले जाने में आसान।",
        images: ["/products/battery_sprayer.png", "https://images.unsplash.com/photo-1615811361524-78849b2c56b4?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 9,
        name: "Mulching Sheet (Silver)",
        name_hi: "मल्चिंग शीट (सिल्वर)",
        price: "₹1800",
        type: "Equipment",
        type_hi: "उपकरण",
        subsidy: "Govt Approved",
        description: "Prevents weed growth. Saves water. Reflects sunlight to repel insects.",
        description_hi: "खरपतवार को रोकता है। पानी बचाता है। कीड़ों को दूर रखने के लिए धूप को परावर्तित करता है।",
        images: ["/products/mulching_sheet.png", "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 10,
        name: "Bio-Fungicide (Trichoderma)",
        name_hi: "जैव कवकनाशी (ट्राइकोडर्मा)",
        price: "₹150",
        type: "Pesticide",
        type_hi: "कीटनाशक",
        subsidy: null,
        description: "Controls root rot and wilting. Seed treatment and soil application.",
        description_hi: "जड़ सड़न और उकठा रोग को नियंत्रित करता है। बीज उपचार और मिट्टी में प्रयोग।",
        images: ["/products/vermicompost.png", "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 11,
        name: "Power Weeder",
        name_hi: "पावर वीडर (छोटा ट्रैक्टर)",
        price: "₹25000",
        type: "Machine",
        type_hi: "मशीन",
        subsidy: "30% Grants",
        description: "Petrol engine. Removes weeds between crop rows. Saves labor cost.",
        description_hi: "पेट्रोल इंजन। फसल की कतारों के बीच से खरपतवार निकालता है। मजदूरी का खर्च बचाता है।",
        images: ["/products/power_weeder.png", "https://images.unsplash.com/photo-1473177027534-53d906e9abcf?auto=format&fit=crop&q=80&w=400"]
    },
    {
        id: 12,
        name: "Fruit Fly Trap",
        name_hi: "फल मक्खी जाल",
        price: "₹60",
        type: "Equipment",
        type_hi: "उपकरण",
        subsidy: null,
        description: "Protects Mango, Guava, Melon. Pheromone based attraction.",
        description_hi: "आम, अमरूद, खरबूजे की रक्षा करता है। फेरोमोन आधारित आकर्षण।",
        images: ["/products/solar_trap.png", "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=400"]
    }
];

export default function Marketplace({ language = 'en-US' }) { // Default to English if undefined, but prop should be passed
    const navigate = useNavigate();
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [demoSubmitted, setDemoSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', village: '' });
    const [activeField, setActiveField] = useState(null); // 'name', 'phone', 'village'

    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const isHindi = language === 'hi-IN';

    // Update active field with voice input
    useEffect(() => {
        if (activeField && transcript) {
            setFormData(prev => ({ ...prev, [activeField]: transcript }));
        }
    }, [transcript, activeField]);

    const handleStartListening = (field) => {
        setActiveField(field);
        resetTranscript();
        SpeechRecognition.startListening({ continuous: false, language: language });
    };

    const handleStopListening = () => {
        SpeechRecognition.stopListening();
        setActiveField(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBookDemo = (item) => {
        setSelectedItem(item);
        setShowDemoModal(true);
        setFormData({ name: '', phone: '', village: '' }); // Reset form
    };

    const submitDemo = (e) => {
        e.preventDefault();

        // Show Local Style Success
        setDemoSubmitted(true);

        // Voice Notification
        const successMsg = isHindi
            ? `राम-राम! हमने आपका डेमो नोट कर लिया है। हमारी टीम जल्द ही आपसे संपर्क करेगी। धन्यवाद!`
            : `Ram-Ram! We have noted your request. Our team will contact you shortly. Thank you!`;

        const utterance = new SpeechSynthesisUtterance(successMsg);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);

        // Simulate API call
        console.log("Booking Details:", { ...formData, item: selectedItem?.name });

        setTimeout(() => {
            setShowDemoModal(false);
            setDemoSubmitted(false);
            setSelectedItem(null);
        }, 8000); // Give enough time to listen
    };

    const speakDetails = (item) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const text = isHindi
            ? `${item.name_hi}, कीमत ${item.price}। ${item.description_hi}`
            : `${item.name}, Price ${item.price}. ${item.description}`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
    };

    if (!browserSupportsSpeechRecognition) {
        console.warn("Browser does not support speech recognition.");
    }

    return (
        <Layout isOnline={true}>
            <div className="flex items-center gap-4 mb-6 sticky top-20 z-10 bg-white  p-3 rounded-2xl border border-earth-100 shadow-md">
                <button onClick={() => navigate('/analyze')} className="p-2 rounded-full hover:bg-earth-100 transition-colors">
                    <ArrowLeft size={24} className="text-earth-800" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-earth-800">{isHindi ? 'ग्रामसेतु मंडी' : 'GramSetu Mandi'}</h1>
                    <p className="text-xs text-earth-500">{isHindi ? 'किफायती उपकरण और बीज' : 'Affordable Tools & Seeds'}</p>
                </div>
                <div className="bg-crop-green/10 p-2 rounded-full">
                    <ShoppingBag className="text-crop-green" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                {PRODUCTS.map((item) => (
                    <div key={item.id} className="bg-white  rounded-2xl border border-earth-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">

                        {/* Image Carousel (Simple Grid of 2 for now as requested) */}
                        <div className="grid grid-cols-2 h-40 gap-1 bg-gray-50 ">
                            {item.images.slice(0, 2).map((img, idx) => (
                                <img key={idx} src={img} alt={item.name} className="w-full h-full object-cover" />
                            ))}
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    {item.subsidy && (
                                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                                            {item.subsidy}
                                        </span>
                                    )}
                                    <h3 className="font-bold text-earth-900 text-lg leading-tight">
                                        {isHindi ? item.name_hi : item.name}
                                    </h3>
                                    <p className="text-xs text-earth-500 font-medium">
                                        {isHindi ? item.type_hi : item.type}
                                    </p>
                                </div>
                                <span className="font-bold text-crop-green text-lg bg-green-50 px-2 py-1 rounded-lg">
                                    {item.price}
                                </span>
                            </div>

                            <p className="text-sm text-earth-600 mb-4 flex-1">
                                {isHindi ? item.description_hi : item.description}
                            </p>

                            <div className="flex gap-2 mt-auto">
                                <button
                                    onClick={() => speakDetails(item)}
                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 flex-1 text-sm font-bold"
                                >
                                    <Volume2 size={18} />
                                    {isHindi ? 'सुनें' : 'Listen'}
                                </button>

                                {item.type === 'Infrastructure' || item.type === 'Equipment' || item.type === 'Machine' ? (
                                    <button
                                        onClick={() => handleBookDemo(item)}
                                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 flex-[2]"
                                    >
                                        {isHindi ? 'डेमो बुक करें' : 'Book Demo'}
                                    </button>
                                ) : (
                                    <button className="bg-crop-green text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-crop-dark flex-[2]">
                                        {isHindi ? 'अभी खरीदें' : 'Buy Now'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Demo Booking Modal */}
            {showDemoModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60  p-4">
                    <div className="bg-white  w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                        {demoSubmitted ? (
                            <div className="text-center py-8">
                                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                    <span className="text-4xl">🙏</span>
                                </div>
                                <h3 className="text-2xl font-bold text-earth-800 mb-2">
                                    {isHindi ? 'राम-राम! 🙏' : 'Ram-Ram! 🙏'}
                                </h3>
                                <p className="text-lg text-earth-700 font-medium">
                                    {isHindi ? 'आपकी अर्जी मिल गई है।' : 'We have received your request.'}
                                </p>
                                <p className="text-earth-500 mt-2 text-sm">
                                    {isHindi ? 'हमारी टीम जल्द ही आपसे संपर्क करेगी और खेत पर आएगी।' : 'Our team will contact you soon and visit your farm.'}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submitDemo}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-earth-800">
                                        {isHindi ? 'डेमो बुक करें' : 'Book In-Person Demo'}
                                    </h3>
                                    <button type="button" onClick={() => setShowDemoModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                                        &times;
                                    </button>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl mb-6 flex gap-4 items-center border border-blue-100">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Tag size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase">
                                            {isHindi ? 'के लिए' : 'Interested In'}
                                        </p>
                                        <p className="font-bold text-blue-900 text-lg">
                                            {isHindi ? selectedItem?.name_hi : selectedItem?.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Name Field */}
                                    <div className="relative">
                                        <User className="absolute left-4 top-4 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder={isHindi ? "आपका नाम" : "Your Name"}
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-earth-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => listening && activeField === 'name' ? handleStopListening() : handleStartListening('name')}
                                            className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${listening && activeField === 'name' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}
                                        >
                                            {listening && activeField === 'name' ? <Square size={18} /> : <Mic size={18} />}
                                        </button>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder={isHindi ? "मोबाइल नंबर" : "Mobile Number"}
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-earth-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => listening && activeField === 'phone' ? handleStopListening() : handleStartListening('phone')}
                                            className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${listening && activeField === 'phone' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}
                                        >
                                            {listening && activeField === 'phone' ? <Square size={18} /> : <Mic size={18} />}
                                        </button>
                                    </div>

                                    {/* Village Field */}
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            name="village"
                                            value={formData.village}
                                            onChange={handleInputChange}
                                            placeholder={isHindi ? "गाँव / शहर" : "Village / City"}
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-earth-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => listening && activeField === 'village' ? handleStopListening() : handleStartListening('village')}
                                            className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${listening && activeField === 'village' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}
                                        >
                                            {listening && activeField === 'village' ? <Square size={18} /> : <Mic size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {listening && (
                                    <p className="text-center text-xs text-red-500 mt-2 font-medium animate-pulse">
                                        {isHindi ? 'बोलिये... (सुन रहा हूँ)' : 'Listening... Speak now'}
                                    </p>
                                )}

                                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8 shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all">
                                    {isHindi ? 'पुष्टि करें' : 'Confirm Scheduling'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
