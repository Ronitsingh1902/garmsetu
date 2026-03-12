import React, { useState, useEffect } from 'react';
import { PlayCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { checkVideoAvailability } from '../utils/videoUtils';

export default function VideoCard({ video, isHindi }) {
    const [status, setStatus] = useState('loading'); // 'loading', 'embeddable', 'fallback'
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        let mounted = true;

        const check = async () => {
            if (!video.videoId) {
                if (mounted) {
                    setStatus('fallback');
                    setShowFallback(true);
                }
                return;
            }

            // Attempt oEmbed check (though often opaque due to CORS)
            // Ideally this is verified by the iframe onError, but we do a pre-check
            try {
                const available = await checkVideoAvailability(video.videoId);
                // If the check returns true (or we assume true), we try to embed
                // If explicit false, fallback.
                if (mounted) {
                    // For now, we bias towards trying to embed unless ID is clearly bad
                    setStatus('embeddable');
                }
            } catch (e) {
                if (mounted) setStatus('embeddable'); // Try anyway
            }
        };

        check();

        return () => { mounted = false; };
    }, [video.videoId]);

    const handleIframeError = () => {
        console.warn(`Iframe error for video ${video.videoId}, switching to fallback.`);
        setStatus('fallback');
        setShowFallback(true);
    };

    if (showFallback || status === 'fallback') {
        return (
            <div className="bg-white  rounded-xl overflow-hidden shadow-sm border border-earth-100 hover:shadow-md transition-shadow group flex flex-col h-full">
                {/* Fallback UI: Thumbnail + CTA */}
                <div className="relative aspect-video bg-gray-900 group-hover:opacity-95 transition-opacity">
                    <img
                        src={video.thumbnail}
                        alt={isHindi ? video.title_hi : video.title}
                        className="w-full h-full object-cover opacity-60"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <AlertCircle className="text-white/80 mb-2" size={32} />
                        <p className="text-white text-sm font-medium mb-4 px-4">
                            {isHindi
                                ? 'यह वीडियो ऐप में नहीं चल सकता, लेकिन YouTube पर देखा जा सकता है।'
                                : 'This video cannot be played in-app, but is available on YouTube.'}
                        </p>
                        <a
                            href={video.watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-transform active:scale-95"
                        >
                            <PlayCircle size={18} />
                            {isHindi ? 'YouTube पर देखें' : 'Watch on YouTube'}
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>

                <div className="p-4 flex-1">
                    <h3 className="font-bold text-earth-900 mb-1 text-lg leading-tight line-clamp-2">
                        {isHindi ? video.title_hi : video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${video.category === 'SCHEMES' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {video.category === 'SCHEMES' ? (isHindi ? 'योजना' : 'Scheme') : (isHindi ? 'तकनीक' : 'Tech')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Default Embed UI
    return (
        <div className="bg-white  rounded-xl overflow-hidden shadow-sm border border-earth-100 hover:shadow-md transition-shadow group h-full flex flex-col">
            <div className="relative aspect-video bg-black">
                {video.embedUrl && (
                    <iframe
                        width="100%"
                        height="100%"
                        src={video.embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        onError={handleIframeError}
                    ></iframe>
                )}
            </div>
            <div className="p-4 flex-1">
                <h3 className="font-bold text-earth-900 mb-1 text-lg leading-tight line-clamp-2">
                    {isHindi ? video.title_hi : video.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${video.category === 'SCHEMES' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {video.category === 'SCHEMES' ? (isHindi ? 'योजना' : 'Scheme') : (isHindi ? 'तकनीक' : 'Tech')}
                    </span>
                    <p className="text-xs text-earth-500">Video</p>
                </div>
            </div>
        </div>
    );
}
