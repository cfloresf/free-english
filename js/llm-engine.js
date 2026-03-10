/**
 * FreeEnglish - LLM Engine v3
 * Hybrid AI: Chrome Built-in AI (Gemini Nano) → Gemini API fallback
 * Generates dynamic lessons and assessments.
 */

const LLMEngine = {
    // Gemini API config
    API_BASE: 'https://generativelanguage.googleapis.com/v1/models/',
    MODEL: 'gemini-1.5-flash',

    _apiKey: null,
    _mode: 'none', // 'builtin', 'api', 'none'
    _builtinSession: null,
    _builtinChecked: false,
    _builtinAvailable: false,

    /**
     * Initialize the LLM engine
     */
    async init() {
        this._apiKey = Storage.getApiKey();

        // Check for Chrome Built-in AI
        await this._checkBuiltinAI();

        // Determine mode
        if (this._builtinAvailable) {
            this._mode = 'builtin';
            console.log('🧠 LLM Mode: Chrome Built-in AI (Gemini Nano) - LOCAL');
        } else if (this._apiKey && this._apiKey.length > 10) {
            this._mode = 'api';
            console.log('☁️ LLM Mode: Gemini API (cloud)');
        } else {
            this._mode = 'none';
            console.log('⚠️ LLM Mode: None - no AI available');
        }
    },

    /**
     * Check if Chrome Built-in AI is available
     */
    async _checkBuiltinAI() {
        this._builtinChecked = true;
        try {
            if (typeof self !== 'undefined' && self.ai && self.ai.languageModel) {
                const caps = await self.ai.languageModel.capabilities();
                if (caps && caps.available === 'readily') {
                    this._builtinAvailable = true;
                    console.log('✅ Chrome Built-in AI available and ready');
                    return;
                } else if (caps && caps.available === 'after-download') {
                    console.log('⏳ Chrome Built-in AI requires download, falling back to API');
                    this._builtinAvailable = false;
                    return;
                }
            }
        } catch (e) {
            console.warn('Chrome Built-in AI check failed:', e.message);
        }
        this._builtinAvailable = false;
    },

    /**
     * Get or create a built-in AI session
     */
    async _getBuiltinSession() {
        if (this._builtinSession) return this._builtinSession;

        this._builtinSession = await self.ai.languageModel.create({
            temperature: 0.8,
            topK: 40,
            systemPrompt: 'You are an expert English teacher for Spanish speakers. Always respond with valid JSON only, no markdown, no code fences, no extra text. Follow the exact JSON structure requested.'
        });

        return this._builtinSession;
    },

    setApiKey(key) {
        this._apiKey = key;
        Storage.saveApiKey(key);
        if (key && key.length > 10 && this._mode === 'none') {
            this._mode = 'api';
        }
    },

    getApiKey() {
        return this._apiKey;
    },

    /**
     * Check if any AI is available
     */
    isReady() {
        return this._mode === 'builtin' || (this._mode === 'api' && !!this._apiKey && this._apiKey.length > 10);
    },

    /**
     * Get the current mode description
     */
    getModeLabel() {
        if (this._mode === 'builtin') return '🧠 IA Local (Gemini Nano)';
        if (this._mode === 'api') return '☁️ Gemini API';
        return '❌ Sin IA';
    },

    /**
     * Call AI - routes to built-in or API
     */
    async _callAI(prompt) {
        if (this._mode === 'builtin') {
            return await this._callBuiltinAI(prompt);
        } else if (this._mode === 'api') {
            return await this._callGeminiAPI(prompt);
        } else {
            throw new Error('No hay IA disponible. Configura tu API key en Configuración.');
        }
    },

    /**
     * Call Chrome Built-in AI (Gemini Nano)
     */
    async _callBuiltinAI(prompt) {
        try {
            const session = await this._getBuiltinSession();
            const result = await session.prompt(prompt + '\n\nRespond ONLY with valid JSON. No markdown, no code fences, no explanations.');

            // Clean response
            let cleaned = result.trim();
            cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
            return cleaned;
        } catch (error) {
            console.warn('Built-in AI failed, trying API fallback:', error.message);
            // Destroy session on error so it can be recreated
            this._builtinSession = null;

            // If API key is available, fallback to API
            if (this._apiKey && this._apiKey.length > 10) {
                console.log('Falling back to Gemini API...');
                return await this._callGeminiAPI(prompt);
            }
            throw new Error('IA local falló: ' + error.message);
        }
    },

    /**
     * Call Gemini API (cloud)
     */
    async _callGeminiAPI(prompt) {
        if (!this._apiKey || this._apiKey.length < 10) {
            throw new Error('API key no configurada. Ve a Configuración → IA Generativa.');
        }

        const url = `${this.API_BASE}${this.MODEL}:generateContent?key=${this._apiKey}`;

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 4096,
                        responseMimeType: "application/json"
                    }
                })
            });
        } catch (networkError) {
            throw new Error('Error de red. Verifica tu conexión a internet.');
        }

        if (!response.ok) {
            let errMsg = `Error ${response.status}`;
            try {
                const errData = await response.json();
                errMsg = errData.error?.message || errMsg;
            } catch (e) { }

            // Handle specific errors
            if (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('Cuota agotada. Espera 1 minuto e intenta de nuevo.');
            }
            if (errMsg.includes('API_KEY') || response.status === 401 || response.status === 403) {
                throw new Error('API Key inválida. Verifica en Configuración → IA Generativa.');
            }

            // If JSON mode not supported, retry without it
            if (response.status === 400 && errMsg.includes('responseMimeType')) {
                return await this._callGeminiAPIPlain(prompt);
            }

            throw new Error(errMsg);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            // Check for safety blocking
            if (data.promptFeedback?.blockReason) {
                throw new Error('La IA bloqueó la respuesta por seguridad: ' + data.promptFeedback.blockReason);
            }
            if (data.candidates?.[0]?.finishReason === 'SAFETY') {
                throw new Error('La respuesta fue bloqueada por filtros de seguridad de la IA.');
            }
            throw new Error('Respuesta vacía de la IA.');
        }

        // Extra cleaning for markdown even in JSON mode
        text = text.trim();
        if (text.startsWith('```')) {
            text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        }

        return text;
    },

    /**
     * Fallback: API call without JSON mode
     */
    async _callGeminiAPIPlain(prompt) {
        const url = `${this.API_BASE}${this.MODEL}:generateContent?key=${this._apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt + '\n\nRespond ONLY with valid JSON, no markdown, no code fences.' }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 4096
                }
            })
        });

        if (!response.ok) {
            let errMsg = `Error ${response.status}`;
            try { errMsg = (await response.json()).error?.message || errMsg; } catch (e) { }
            throw new Error(errMsg);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Respuesta vacía.');

        return text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    },

    // ========== WEAKNESS ANALYSIS ==========
    analyzeWeaknesses(answers, currentLevel) {
        const analysis = {
            level: currentLevel,
            weakAreas: [],
            strongAreas: [],
            details: {}
        };

        const categories = {
            vocabulary: { correct: 0, total: 0 },
            grammar: { correct: 0, total: 0 },
            translation: { correct: 0, total: 0 },
            listening: { correct: 0, total: 0 },
            phrases: { correct: 0, total: 0 }
        };

        answers.forEach(a => {
            const type = a.questionType || 'vocabulary';
            let cat = 'vocabulary';
            if (type === 'grammar') cat = 'grammar';
            else if (type === 'reverse' || type === 'translate') cat = 'translation';
            else if (type === 'meaning') cat = 'vocabulary';
            else if (type === 'phrases') cat = 'phrases';

            if (categories[cat]) {
                categories[cat].total++;
                if (a.correct) categories[cat].correct++;
            }
        });

        for (const [cat, data] of Object.entries(categories)) {
            if (data.total === 0) continue;
            const accuracy = data.correct / data.total;
            analysis.details[cat] = {
                accuracy: Math.round(accuracy * 100),
                correct: data.correct,
                total: data.total
            };

            if (accuracy < 0.6) {
                analysis.weakAreas.push(cat);
            } else if (accuracy >= 0.8) {
                analysis.strongAreas.push(cat);
            }
        }

        if (analysis.weakAreas.length === 0) {
            for (const [cat, data] of Object.entries(categories)) {
                if (data.total > 0 && !analysis.strongAreas.includes(cat)) {
                    analysis.weakAreas.push(cat);
                }
            }
        }

        if (analysis.weakAreas.length === 0) {
            analysis.weakAreas = ['vocabulary', 'grammar'];
        }

        return analysis;
    },

    // ========== LESSON GENERATION ==========
    async generateLesson(level, weakAreas, context = {}) {
        const focusAreas = weakAreas.join(', ');
        const previousTopics = context.previousTopics || [];
        const previousTopicsStr = previousTopics.length > 0
            ? `\nAvoid repeating these topics already covered: ${previousTopics.join(', ')}`
            : '';

        const prompt = `You are an expert English teacher creating a lesson for a Spanish-speaking student at CEFR level ${level}.

The student needs to improve in: ${focusAreas}
${previousTopicsStr}

Generate a complete English lesson with EXACTLY 8 exercise steps in JSON format.

The lesson MUST include a mix of these exercise types:
- "learn": Teaching a new word/phrase (2 steps)
- "multiple_choice": Multiple choice questions (2 steps minimum)
- "translate": Translation exercises Spanish to English (1-2 steps)
- "listen_choose": Listening comprehension with choices (1 step)
- "build_sentence": Arrange words into correct order (1 step)

Level guidelines for ${level}:
${level === 'A1' ? '- Basic vocabulary: greetings, colors, numbers, family, food, animals\n- Grammar: to be, articles a/an/the, simple present\n- Very short sentences, max 5-6 words' : ''}
${level === 'A2' ? '- Daily life vocabulary: travel, shopping, weather, routines\n- Grammar: past simple, present continuous, comparatives\n- Medium sentences, 6-10 words' : ''}
${level === 'B1' ? '- Work, education, opinions vocabulary\n- Grammar: conditionals, reported speech, relative clauses, present perfect\n- Complex sentences with connectors' : ''}
${level === 'B2' ? '- Academic, abstract, idiomatic vocabulary\n- Grammar: inversions, future perfect, passive voice, subjunctive\n- Advanced expressions and nuanced language' : ''}

Return a JSON object with this EXACT structure:
{
  "title": "Lesson title in Spanish",
  "description": "Brief description in Spanish",
  "topic": "main topic in English (one word)",
  "xpReward": 25,
  "steps": [
    {
      "type": "learn",
      "instruction": "Instruction in Spanish",
      "word": "English word or phrase",
      "translation": "Spanish translation",
      "example": "Example sentence in English",
      "exampleTranslation": "Spanish translation of example"
    },
    {
      "type": "multiple_choice",
      "instruction": "Question in Spanish",
      "options": ["correct answer", "wrong1", "wrong2", "wrong3"],
      "correct": 0
    },
    {
      "type": "translate",
      "instruction": "Escribe en inglés:",
      "prompt": "Spanish phrase to translate",
      "answer": "correct english translation lowercase",
      "acceptAlternatives": ["alternative answers"]
    },
    {
      "type": "listen_choose",
      "instruction": "Escucha y selecciona lo que oyes:",
      "audio": "English phrase to speak",
      "options": ["correct phrase", "wrong 1", "wrong 2", "wrong 3"],
      "correct": 0
    },
    {
      "type": "build_sentence",
      "instruction": "Ordena las palabras:",
      "words": ["shuffled", "words", "of", "sentence"],
      "answer": "words of shuffled sentence"
    }
  ]
}

RULES:
1. "correct" is the INDEX (0-3) of the correct answer
2. For "translate": "answer" must be lowercase
3. For "build_sentence": 4-7 words, "answer" is the correct sentence
4. All instructions in Spanish
5. Content appropriate for ${level}
6. Exactly 8 steps, starting with 2 "learn" steps`;

        const responseText = await this._callAI(prompt);

        try {
            // Clean before parsing
            let cleaned = responseText.trim();
            cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
            
            const lesson = JSON.parse(cleaned);
            return this._validateLesson(lesson, level);
        } catch (e) {
            // Try to extract JSON if it's embedded in text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const lesson = JSON.parse(jsonMatch[0]);
                    return this._validateLesson(lesson, level);
                } catch (e2) {
                    console.error('JSON parse error after match:', e2, 'Response:', responseText.substring(0, 300));
                    throw new Error('La IA respondió con formato inválido. Intenta de nuevo.');
                }
            }
            console.error('No JSON found in response:', responseText.substring(0, 300));
            throw new Error('La IA no pudo generar una lección válida en este momento. Intenta de nuevo.');
        }
    },

    // ========== POST-LESSON ASSESSMENT ==========
    async generatePostAssessment(lesson, level) {
        const lessonContent = lesson.steps
            .filter(s => s.type === 'learn')
            .map(s => `${s.word} (${s.translation})`)
            .join(', ');

        const prompt = `You are an English teacher assessing a Spanish-speaking student at CEFR ${level} level.

The student completed a lesson: "${lesson.title}"
Content covered: ${lessonContent}

Generate EXACTLY 10 assessment questions as a JSON array.

Mix types: "meaning", "grammar", "reverse"

Return JSON array:
[
  {
    "level": "${level}",
    "questionType": "meaning",
    "question": "What does \\"word\\" mean?",
    "options": ["correct Spanish", "wrong1", "wrong2", "wrong3"],
    "correct": 0
  }
]

RULES:
1. "correct" is the INDEX (0-3) of correct answer
2. Questions MUST relate to lesson content
3. At least 3 of each type
4. Difficulty matches ${level}`;

        const responseText = await this._callAI(prompt);

        try {
            let cleaned = responseText.trim();
            cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
            const questions = JSON.parse(cleaned);
            return this._validateAssessment(questions, level);
        } catch (e) {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    return this._validateAssessment(JSON.parse(jsonMatch[0]), level);
                } catch (e2) {
                    throw new Error('Error al procesar la evaluación de la IA.');
                }
            }
            throw new Error('La IA no pudo generar la evaluación en este momento. Intenta de nuevo.');
        }
    },

    // ========== VALIDATION ==========
    _validateLesson(lesson, level) {
        if (!lesson.title) lesson.title = 'Lección Dinámica';
        if (!lesson.description) lesson.description = 'Lección generada por IA';
        if (!lesson.xpReward) lesson.xpReward = 25;
        if (!lesson.topic) lesson.topic = 'general';

        lesson.id = `ai_${level}_${Date.now()}`;
        lesson.isAIGenerated = true;

        if (!Array.isArray(lesson.steps)) {
            throw new Error('Lesson has no steps');
        }

        lesson.steps = lesson.steps.filter(step => {
            if (!step || !step.type) return false;
            switch (step.type) {
                case 'learn':
                    return step.word && step.translation;
                case 'multiple_choice':
                    if (!Array.isArray(step.options) || step.options.length < 2) return false;
                    if (typeof step.correct !== 'number' || step.correct < 0 || step.correct >= step.options.length) step.correct = 0;
                    return !!step.instruction;
                case 'translate':
                    return step.prompt && step.answer;
                case 'listen_choose':
                    if (!Array.isArray(step.options) || step.options.length < 2) return false;
                    if (typeof step.correct !== 'number' || step.correct < 0 || step.correct >= step.options.length) step.correct = 0;
                    if (!step.audio) step.audio = step.options[step.correct];
                    return !!step.instruction;
                case 'build_sentence':
                    if (!Array.isArray(step.words) || !step.answer) return false;
                    return step.words.length >= 3;
                case 'speak':
                    return step.phrase && step.translation;
                default:
                    return false;
            }
        });

        if (lesson.steps.length < 3) {
            throw new Error('Lesson has insufficient valid steps');
        }

        return lesson;
    },

    _validateAssessment(questions, level) {
        if (!Array.isArray(questions)) throw new Error('Assessment is not an array');

        return questions.filter(q => {
            if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) return false;
            if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) q.correct = 0;
            if (!q.level) q.level = level;
            if (!q.questionType) q.questionType = 'meaning';
            return true;
        }).slice(0, 10);
    },

    // ========== CONTEXT TRACKING ==========
    saveLessonContext(lesson) {
        const history = Storage.getAILessonHistory();
        history.push({
            topic: lesson.topic,
            title: lesson.title,
            timestamp: Date.now(),
            learnedWords: lesson.steps
                .filter(s => s.type === 'learn')
                .map(s => ({ en: s.word, es: s.translation }))
        });
        if (history.length > 20) history.splice(0, history.length - 20);
        Storage.saveAILessonHistory(history);
    },

    getPreviousTopics() {
        const history = Storage.getAILessonHistory();
        return history.map(h => h.topic).filter(Boolean);
    }
};
