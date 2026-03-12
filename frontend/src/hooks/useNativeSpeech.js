import { useState, useCallback, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useNativeSpeech = () => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    const [listeningStatus, setListeningStatus] = useState(listening);

    useEffect(() => {
        setListeningStatus(listening);
    }, [listening]);

    const startListening = useCallback(({ language = 'en-US' } = {}) => {
        try {
            SpeechRecognition.startListening({ language, continuous: false });
        } catch (e) {
            console.error("[NativeSpeech] Start error:", e);
            alert("Could not start microphone: " + e.message);
        }
    }, []);

    const stopListening = useCallback(() => {
        SpeechRecognition.stopListening();
    }, []);

    const resetTranscriptSafe = useCallback(() => {
        resetTranscript();
    }, [resetTranscript]);

    return {
        transcript,
        listening: listeningStatus,
        resetTranscript: resetTranscriptSafe,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
        startListening,
        stopListening
    };
};

export default useNativeSpeech;
