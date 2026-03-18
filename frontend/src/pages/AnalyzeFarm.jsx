import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader, Leaf, Droplets, Sprout, ArrowRight, CheckCircle, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import useNativeSpeech from '../hooks/useNativeSpeech';
import VoiceInput from '../components/VoiceInput';
import { speakText, stopSpeaking } from '../utils/speech';

export default function AnalyzeFarm({ language = 'en-US' }) {
    const navigate = useNavigate();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const lastColorHintRef = useRef(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        startListening: startListeningNative,
        stopListening: stopListeningNative
    } = useNativeSpeech();

    const startListening = () => {
        if (!browserSupportsSpeechRecognition) return;
        startListeningNative({ language: 'en-IN' });
    };

    const stopListening = () => {
        stopListeningNative();
    };

    React.useEffect(() => {
        if (!listening && transcript) {
            console.log("AnalyzeFarm Voice:", transcript);
            // Only auto-analyze if we have an image
            if (selectedImage && (transcript.toLowerCase().includes('analyze') || transcript.toLowerCase().includes('check'))) {
                startAnalysis();
            }
            resetTranscript();
        }
    }, [listening, transcript, selectedImage]);



    const handleFileUpload = async (e) => {
        console.log("File selected:", e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageSrc = reader.result;
                setSelectedImage(imageSrc);
                // Trigger analysis immediately with file
                startAnalysis(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const startAnalysis = async (fileToUpload = null) => {
        const activeFile = fileToUpload || selectedFile;

        if (!activeFile) {
            return;
        }

        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('image', activeFile);

            const backendUrl = "https://gramsetu-backend-sbs9.onrender.com/api/analyze";

            const response = await fetch(backendUrl, {
                method: 'POST',
                body: formData
                // No headers needed, browser sets Content-Type for FormData
            });
            const data = await response.json();
            setResult(data.data);

            // Show debug info from backend if available
            if (data.data.debug) {
                setDebugInfo(`HSV: ${data.data.debug.h},${data.data.debug.s},${data.data.debug.v} | Detect: ${data.data.debug.type}`);
            }

            setIsAnalyzing(false);
        } catch (error) {
            console.error("Analysis Error:", error);
            setIsAnalyzing(false);
            alert("Analysis failed. Please try again.");
        }
    };

    // DEBUG STATE
    const [debugInfo, setDebugInfo] = useState("");

    const analyzeImageColor = (imageSrc) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                canvas.width = 100; // Resize for speed
                canvas.height = 100;
                ctx.drawImage(image, 0, 0, 100, 100);

                const imageData = ctx.getImageData(0, 0, 100, 100);
                let r = 0, g = 0, b = 0;

                for (let i = 0; i < imageData.data.length; i += 4) {
                    r += imageData.data[i];
                    g += imageData.data[i + 1];
                    b += imageData.data[i + 2];
                }

                r = Math.floor(r / (imageData.data.length / 4));
                g = Math.floor(g / (imageData.data.length / 4));
                b = Math.floor(b / (imageData.data.length / 4));

                let detected = 'alluvial';
                // RELAXED THRESHOLDS
                if (r > g + 15 && r > b + 15) {
                    detected = 'red';
                } else if (r < 100 && g < 100 && b < 100) { // Was 60, too strict
                    detected = 'black';
                } else if (r > 100 && g > 80 && b < 60) {
                    detected = 'alluvial';
                }

                setDebugInfo(`RGB: ${r},${g},${b} | Detect: ${detected.toUpperCase()}`);
                resolve(detected);
            };
        });
    };

    const speakResult = () => {
        if (!result) return;
        stopSpeaking();

        const isHindi = language === 'hi-IN';
        const soilType = isHindi ? result.soilType_hi : result.soilType;
        const soilHealth = isHindi ? result.soilHealth_hi : result.soilHealth;
        const tips = isHindi ? result.steps_hi.join('. ') : result.steps.join('. ');

        const text = isHindi
            ? `???????????? ????????? ?????? ?????????????????? ${soilType} ????????? ???????????? ??????????????????????????? ${soilHealth} ????????? ???????????????: ${tips}`
            : `Your farm soil is ${soilType}. The health is ${soilHealth}. Recommendations: ${tips}`;

        speakText(text, language);
    };

    return (
        <Layout isOnline={true}>
            <div className="max-w-4xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-earth-100">
                        <ArrowRight className="rotate-180 text-earth-800" />
                    </button>
                    <h1 className="text-2xl font-bold text-earth-800">Apne Khet Ko Jane</h1>
                </div>

                {!result && !isAnalyzing && (
                    <>
                        <div className="bg-white  rounded-2xl p-8 border-2 border-dashed border-earth-300 text-center hover:border-crop-green transition-colors">
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-white text-crop-green border-2 border-crop-green px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-green-50 transition-all flex items-center gap-2"
                                >
                                    <Upload size={20} />
                                    {language === 'hi-IN' ? '??????????????? ???????????????' : 'Upload File'}
                                </button>
                                <button
                                    onClick={() => cameraInputRef.current.click()}
                                    className="bg-crop-green text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-crop-dark transition-all flex items-center gap-2"
                                >
                                    <Camera size={20} />
                                    {language === 'hi-IN' ? '???????????? ??????????????????' : 'Take Photo'}
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                            />
                            <input
                                ref={cameraInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <VoiceInput
                            isListening={listening}
                            startListening={startListening}
                            stopListening={stopListening}
                            language="en-IN"
                        />
                    </>
                )}

                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-earth-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-crop-green rounded-full border-t-transparent animate-spin"></div>
                            <Leaf className="absolute inset-0 m-auto text-crop-green animate-pulse" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-earth-800">Analyzing your Farm...</h3>
                        <p className="text-earth-600 mt-2">Checking Soil Quality ??? Predicting Crops</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {selectedImage && (
                            <div className="h-48 w-full bg-black/5 rounded-xl overflow-hidden mb-6">
                                <img src={selectedImage} alt="Farm" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Soil Report */}
                        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80  p-6 rounded-2xl border border-amber-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Droplets className="text-amber-700" size={24} />
                                </div>
                                <h2 className="text-lg font-bold text-amber-900">
                                    {language === 'hi-IN' ? '?????????????????? ?????? ????????????????????????' : 'Soil Analysis'}
                                </h2>
                                <button onClick={speakResult} className="ml-auto p-2 bg-white rounded-full text-amber-600 hover:bg-amber-50">
                                    <Volume2 size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-amber-600 uppercase font-semibold">
                                        {language === 'hi-IN' ? '??????????????????' : 'Type'}
                                    </p>
                                    <p className="font-bold text-amber-900">
                                        {language === 'hi-IN' ? result.soilType_hi : result.soilType}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-amber-600 uppercase font-semibold">
                                        {language === 'hi-IN' ? '???????????????????????????' : 'Health'}
                                    </p>
                                    <p className="font-bold text-green-700">
                                        {language === 'hi-IN' ? result.soilHealth_hi : result.soilHealth}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Crop Recommendations */}
                        <div className="bg-white  p-6 rounded-2xl border border-earth-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Sprout className="text-green-700" size={24} />
                                </div>
                                <h2 className="text-lg font-bold text-earth-900">
                                    {language === 'hi-IN' ? '????????????????????? ???????????????' : 'Best Crops to Grow'}
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {(language === 'hi-IN' ? result.recommendedCrops_hi : result.recommendedCrops).map((crop, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-earth-50 rounded-xl">
                                        <div className="font-semibold text-earth-800">{crop.name}</div>
                                        <div className="text-sm text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full">
                                            Yield: {crop.yield}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="bg-white  p-6 rounded-2xl border border-earth-100 shadow-sm">
                            <h3 className="font-bold text-earth-900 mb-4">
                                {language === 'hi-IN' ? '???????????? ?????? ???????????????' : 'Growing Steps'}
                            </h3>
                            <ul className="space-y-3">
                                {(language === 'hi-IN' ? result.steps_hi : result.steps).map((step, i) => (
                                    <li key={i} className="flex gap-3 text-earth-700 text-sm">
                                        <CheckCircle size={18} className="text-crop-green shrink-0 mt-0.5" />
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Free Seeds */}
                        <div className="bg-blue-50  p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full text-2xl font-bold text-blue-600">???????</div>
                            <div>
                                <h4 className="font-bold text-blue-900">
                                    {language === 'hi-IN' ? '??????????????? ?????????????????? ?????????' : 'Get Free Govt Seeds'}
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    {language === 'hi-IN' ? result.freeSeeds_hi : result.freeSeeds}
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => navigate('/market')}
                            className="w-full bg-crop-green text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                        >
                            Buy Tools & Organic Khad
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
