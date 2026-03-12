const synth = window.speechSynthesis;
let currentSessionId = 0;

export const stopSpeaking = () => {
    currentSessionId++; // Invalidate previous sessions
    if (synth.speaking) {
        synth.cancel();
    }
};

/**
 * Enhanced Text-to-Speech function
 * @param {string} text - The text to speak
 * @param {string} lang - Language code (e.g., 'hi-IN', 'en-US')
 * @param {function} onEnd - Callback when speaking finishes
 */
export const speakText = (text, lang = 'en-US', onEnd) => {
    stopSpeaking(); // This increments the session ID

    if (!text) return;

    // Capture the ID for this specific speech request
    const mySessionId = currentSessionId;

    // Retry getting voices if they aren't loaded yet
    let voices = synth.getVoices();
    if (voices.length === 0) {
        // Wait for voices to load
        const waitHandler = () => {
            voices = synth.getVoices();
            window.speechSynthesis.removeEventListener('voiceschanged', waitHandler);
            if (mySessionId === currentSessionId) {
                doSpeak(text, lang, voices, onEnd, mySessionId);
            }
        };
        window.speechSynthesis.addEventListener('voiceschanged', waitHandler);
        // Fallback in case event doesn't fire (Safari sometimes)
        setTimeout(() => {
            if (voices.length === 0) {
                voices = synth.getVoices();
                if (mySessionId === currentSessionId) {
                    doSpeak(text, lang, voices, onEnd, mySessionId);
                }
            }
        }, 500);
    } else {
        doSpeak(text, lang, voices, onEnd, mySessionId);
    }
};

const doSpeak = (text, lang, voices, onEnd, sessionId) => {
    // 1. Voice Selection Strategy
    let selectedVoice = null;

    if (lang === 'hi-IN') {
        // Try to find Google Hindi first, then any Hindi
        selectedVoice = voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
            voices.find(v => v.lang === 'hi-IN');
    } else {
        // Google US English -> Any Google English -> Any US English
        selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
            voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
            voices.find(v => v.lang === 'en-US');
    }

    // 2. Chunking for Pauses using Regex
    const sentenceRegex = /[^.?!|]+[.?!|]+|[^.?!|]+$/g;
    const sentences = text.match(sentenceRegex) || [text];

    let index = 0;

    const speakNext = () => {
        // Stop if the session has changed (i.e. stopSpeaking was called)
        if (sessionId !== currentSessionId) return;

        if (index >= sentences.length) {
            if (onEnd) onEnd();
            return;
        }

        const chunk = sentences[index].trim();
        if (!chunk) {
            index++;
            speakNext();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = lang;
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // 3. Human-like Tuning
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Handle long pauses manually via setTimeout in onend
        utterance.onend = () => {
            if (sessionId !== currentSessionId) return; // Stop if cancelled 

            index++;
            // Add a natural pause between sentences (400ms)
            setTimeout(() => {
                if (sessionId === currentSessionId) {
                    speakNext();
                }
            }, 450);
        };

        utterance.onerror = (e) => {
            console.error("Speech Error:", e);
            if (sessionId !== currentSessionId) return;
            index++;
            speakNext();
        };

        synth.speak(utterance);
    };

    speakNext();
};
