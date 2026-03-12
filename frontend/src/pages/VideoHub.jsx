import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, PlayCircle, Sprout, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Layout from '../Layout';
import VoiceInput from '../components/VoiceInput';
import VideoCard from '../components/VideoCard';
import { normalizeVideo } from '../utils/videoUtils';
import rawVideoData from '../../../backend/data/videos.json';

export default function VideoHub({ language = 'hi-IN' }) {
    const navigate = useNavigate();
    const isHindi = language === 'hi-IN';
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // 'SCHEMES' or 'MODERN'

    // Normalize all videos once on load
    const allNormalizedVideos = React.useMemo(() => {
        return rawVideoData.map(normalizeVideo);
    }, []);

    const {
        transcript,
        listening,
        resetTranscript
    } = useSpeechRecognition();

    const startListening = () => {
        SpeechRecognition.startListening({ language: language, continuous: false });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    useEffect(() => {
        if (selectedCategory) {
            const filtered = allNormalizedVideos.filter(v =>
                v.category === selectedCategory &&
                (v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.title_hi.includes(searchQuery.toLowerCase()) ||
                    v.tags.some(t => t.includes(searchQuery.toLowerCase())))
            );
            setVideos(filtered);
        }
    }, [selectedCategory, searchQuery, allNormalizedVideos]);

    const selectCategory = (category) => {
        setSelectedCategory(category);
        setSearchQuery('');
    };

    return (
        <Layout isOnline={true}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-20 z-10 bg-white  p-3 rounded-2xl border border-earth-100 shadow-md">
                <button onClick={() => selectedCategory ? setSelectedCategory(null) : navigate('/home')} className="p-2 rounded-full hover:bg-earth-100 transition-colors">
                    <ArrowLeft size={24} className="text-earth-800" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-earth-800">
                        {selectedCategory
                            ? (selectedCategory === 'SCHEMES'
                                ? (isHindi ? 'सरकारी योजनाएं (वीडियो)' : 'Scheme Videos')
                                : (isHindi ? 'नई तकनीकें (वीडियो)' : 'Modern Tech Videos'))
                            : (isHindi ? 'खेती की पाठशाला' : 'Farm School')
                        }
                    </h1>
                    <p className="text-xs text-earth-500">{isHindi ? 'वीडियो ज्ञान केंद्र' : 'Video Knowledge Hub'}</p>
                </div>
            </div>

            {/* Category Selection Screen */}
            {!selectedCategory && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-center text-lg font-bold text-earth-700 mb-4">
                        {isHindi ? 'आप क्या सीखना चाहते हैं?' : 'What do you want to learn?'}
                    </h2>

                    <button
                        onClick={() => selectCategory('SCHEMES')}
                        className="w-full bg-gradient-to-br from-orange-100 to-orange-50 p-6 rounded-2xl border-2 border-orange-200 shadow-sm hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-4"
                    >
                        <div className="bg-orange-500 text-white p-4 rounded-full shadow-lg">
                            <Landmark size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-orange-900 mb-1">
                                {isHindi ? 'सरकारी योजनाएं' : 'Government Schemes'}
                            </h3>
                            <p className="text-sm text-orange-700">
                                {isHindi ? 'पीएम किसान, फसल बीमा, लोन आदि' : 'PM Kisan, Fasal Bima, Loans etc.'}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => selectCategory('MODERN')}
                        className="w-full bg-gradient-to-br from-blue-100 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 shadow-sm hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-4"
                    >
                        <div className="bg-blue-500 text-white p-4 rounded-full shadow-lg">
                            <Sprout size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-blue-900 mb-1">
                                {isHindi ? 'आधुनिक खेती और तकनीक' : 'Modern Farming & Tech'}
                            </h3>
                            <p className="text-sm text-blue-700">
                                {isHindi ? 'ड्रोन, हाइड्रोपोनिक्स, पॉलीहाउस' : 'Drones, Hydroponics, Polyhouse'}
                            </p>
                        </div>
                    </button>

                    <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                        <p className="text-yellow-800 text-sm italic">
                            {isHindi
                                ? 'वीडियो देखने के लिए ऊपर किसी एक विकल्प को चुनें।'
                                : 'Select an option above to watch videos.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Video List Screen */}
            {selectedCategory && (
                <div className="animate-in fade-in">
                    {/* Search Section */}
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={isHindi ? "वीडियो खोजें..." : "Search videos..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-earth-200 focus:ring-2 focus:ring-crop-green focus:border-transparent outline-none "
                            />
                            <Search className="absolute left-3 top-3.5 text-earth-400" size={20} />
                        </div>

                        <div className="flex justify-center">
                            <VoiceInput
                                language={language}
                                isListening={listening}
                                startListening={startListening}
                                stopListening={stopListening}
                            />
                        </div>
                    </div>

                    {/* Video Grid */}
                    <div className="grid grid-cols-1 max-w-2xl mx-auto gap-6 pb-20">
                        {videos.map((video) => (
                            <div key={video.id} className="h-full">
                                <VideoCard video={video} isHindi={isHindi} />
                            </div>
                        ))}
                    </div>

                    {videos.length === 0 && (
                        <div className="text-center py-12 text-earth-500 bg-white  rounded-xl border border-dashed border-earth-300">
                            <p>{isHindi ? 'कोई वीडियो नहीं मिला' : 'No videos found'}</p>
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}
