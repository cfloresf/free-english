/**
 * FreeEnglish - Speech Module
 * Handles Text-to-Speech and Speech Recognition using Web Speech API
 */

const Speech = {
    synth: window.speechSynthesis,
    recognition: null,
    isRecording: false,
    voices: [],
    englishVoice: null,

    init() {
        // Load voices
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }

        // Initialize Speech Recognition if available
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;
        }
    },

    loadVoices() {
        this.voices = this.synth.getVoices();
        // Try to find a good English voice
        this.englishVoice = this.voices.find(v =>
            v.lang.startsWith('en') && v.name.includes('Google')
        ) || this.voices.find(v =>
            v.lang.startsWith('en-US')
        ) || this.voices.find(v =>
            v.lang.startsWith('en')
        ) || null;
    },

    /**
     * Speak text in English
     * @param {string} text - Text to speak
     * @param {number} rate - Speech rate (0.5 to 2)
     * @returns {Promise} Resolves when speech is done
     */
    speak(text, rate = 1) {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }

            // Cancel any ongoing speech
            this.synth.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = rate;
            utterance.pitch = 1;
            utterance.volume = 1;

            if (this.englishVoice) {
                utterance.voice = this.englishVoice;
            }

            utterance.onend = () => {
                if (window.App && window.App.resumeSpotify) window.App.resumeSpotify();
                resolve();
            };
            utterance.onerror = (e) => {
                if (window.App && window.App.resumeSpotify) window.App.resumeSpotify();
                if (e.error !== 'interrupted') reject(e);
                else resolve();
            };

            if (window.App && window.App.pauseSpotify) window.App.pauseSpotify();
            this.synth.speak(utterance);
        });
    },

    /**
     * Stop current speech
     */
    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    },

    /**
     * Start speech recognition
     * @param {Function} onResult - Callback with transcript
     * @param {Function} onInterim - Callback with interim results
     * @param {Function} onEnd - Callback when recognition ends
     * @returns {boolean} Whether recognition started
     */
    startRecognition(onResult, onInterim, onEnd) {
        if (!this.recognition) {
            console.warn('Speech recognition not supported');
            return false;
        }

        if (this.isRecording) {
            this.stopRecognition();
            return false;
        }

        this.isRecording = true;

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript && onResult) {
                onResult(finalTranscript, event.results[event.resultIndex][0].confidence);
            }
            if (interimTranscript && onInterim) {
                onInterim(interimTranscript);
            }
        };

        this.recognition.onstart = () => {
            if (window.App && window.App.pauseSpotify) window.App.pauseSpotify();
            this.isRecording = true;
        };
        this.recognition.onend = () => {
            if (window.App && window.App.resumeSpotify) window.App.resumeSpotify();
            this.isRecording = false;
            if (onEnd) onEnd();
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isRecording = false;
            if (onEnd) onEnd();
        };

        try {
            this.recognition.start();
            return true;
        } catch (e) {
            console.error('Failed to start recognition:', e);
            this.isRecording = false;
            return false;
        }
    },

    /**
     * Stop speech recognition
     */
    stopRecognition() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
        }
    },

    /**
     * Compare two strings for pronunciation scoring
     * @param {string} expected - Expected text
     * @param {string} actual - Actually spoken text
     * @returns {Object} Score details
     */
    comparePronunciation(expected, actual) {
        const normalize = (str) => str.toLowerCase().trim()
            .replace(/[.,!?;:'"]/g, '')
            .replace(/\s+/g, ' ');

        const expectedNorm = normalize(expected);
        const actualNorm = normalize(actual);

        if (expectedNorm === actualNorm) {
            return { score: 100, rating: 'excellent', message: '¡Pronunciación perfecta!' };
        }

        // Calculate word-level similarity
        const expectedWords = expectedNorm.split(' ');
        const actualWords = actualNorm.split(' ');

        let matchCount = 0;
        for (const word of expectedWords) {
            if (actualWords.includes(word)) {
                matchCount++;
            }
        }

        const score = Math.round((matchCount / expectedWords.length) * 100);

        if (score >= 80) {
            return { score, rating: 'excellent', message: '¡Muy buena pronunciación!' };
        } else if (score >= 60) {
            return { score, rating: 'good', message: 'Bien, pero puedes mejorar algunos sonidos' };
        } else if (score >= 40) {
            return { score, rating: 'needs-work', message: 'Intenta pronunciar más despacio' };
        } else {
            return { score, rating: 'needs-work', message: 'Escucha el audio e intenta de nuevo' };
        }
    },

    /**
     * Check if speech recognition is supported
     */
    isRecognitionSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },

    /**
     * Check if speech synthesis is supported
     */
    isSynthesisSupported() {
        return !!window.speechSynthesis;
    }
};
