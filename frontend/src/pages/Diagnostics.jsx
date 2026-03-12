import React, { useState } from 'react';
import useNativeSpeech from '../hooks/useNativeSpeech';

const Diagnostics = () => {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
        startListening,
        stopListening
    } = useNativeSpeech();

    const [msg, setMsg] = useState('');

    const start = () => {
        setMsg('Attempting start...');
        try {
            startListening({ language: 'en-IN' });
            setMsg('Start called.');
        } catch (e) {
            setMsg('Error starting: ' + e.message);
        }
    };

    const stop = () => stopListening();

    return (
        <div style={{ padding: 20 }}>
            <h1>Voice Diagnostics</h1>
            <div>
                <strong>Browser Support:</strong> {browserSupportsSpeechRecognition ? 'Yes' : 'No'}
            </div>
            <div>
                <strong>Mic Available:</strong> {isMicrophoneAvailable ? 'Yes' : 'No'}
            </div>
            <div>
                <strong>Listening Status:</strong> {listening ? 'ON' : 'OFF'}
            </div>
            <div style={{ marginTop: 20, border: '1px solid #ccc', padding: 10, minHeight: 50 }}>
                <strong>Transcript:</strong> {transcript}
            </div>

            <div style={{ marginTop: 20 }}>
                <button onClick={start} style={{ marginRight: 10, padding: 10 }}>Start Listening</button>
                <button onClick={stop} style={{ padding: 10 }}>Stop Listening</button>
                <button onClick={resetTranscript} style={{ marginLeft: 10, padding: 10 }}>Reset</button>
            </div>
            <div style={{ marginTop: 20, color: 'blue' }}>
                Log: {msg}
            </div>
        </div>
    );
};

export default Diagnostics;
