/**
 * FreeEnglish - LLM Engine
 * Integrates with Google Gemini API (free tier) to generate dynamic lessons
 * and assessments based on student performance.
 */

const LLMEngine = {
    API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models/',
    MODELS: ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'],
    _currentModelIndex: 0,

    _apiKey: null,

    /**
     * Initialize the LLM engine with an API key
     */
    init() {
        this._apiKey = Storage.getApiKey();
    },

    /**
     * Set and save the API key
     */
    setApiKey(key) {
        this._apiKey = key;
        Storage.saveApiKey(key);
    },

    /**
     * Get the current API key
     */
    getApiKey() {
        return this._apiKey;
    },

    /**
     * Check if the LLM is configured and ready
     */
    isReady() {
        return !!this._apiKey && this._apiKey.length > 10;
    },

    /**
     * Call Gemini API with automatic model fallback
     * @param {string} prompt - The prompt to send
     * @returns {Promise<string>} The response text
     */
    async _callAPI(prompt) {
        if (!this.isReady()) {
            throw new Error('API key no configurada. Ve a Configuración para agregar tu clave de Gemini.');
        }

        // Try each model in the fallback chain
        let lastError = null;
        for (let i = 0; i < this.MODELS.length; i++) {
            const model = this.MODELS[(this._currentModelIndex + i) % this.MODELS.length];

            try {
                const result = await this._tryCallModel(model, prompt);
                // Remember which model worked
                this._currentModelIndex = (this._currentModelIndex + i) % this.MODELS.length;
                return result;
            } catch (error) {
                console.warn(`Model ${model} failed:`, error.message);
                lastError = error;

                // If it's an auth error, don't try other models
                if (error.message.includes('API_KEY') || error.message.includes('401') || error.message.includes('403')) {
                    throw new Error('API Key inválida. Verifica tu clave en Configuración → IA Generativa.');
                }
            }
        }

        throw lastError || new Error('Todos los modelos de IA fallaron. Intenta más tarde.');
    },

    /**
     * Try calling a specific model
     */
    async _tryCallModel(model, prompt) {
        const url = `${this.API_BASE}${model}:generateContent?key=${this._apiKey}`;

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

            // If JSON mode not supported, retry without it
            if (response.status === 400 && errMsg.includes('responseMimeType')) {
                return await this._tryCallModelPlain(model, prompt);
            }

            throw new Error(errMsg);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            const blockReason = data.candidates?.[0]?.finishReason;
            throw new Error(`Respuesta vacía de la IA (${blockReason || 'sin razón'})`);
        }

        return text;
    },

    /**
     * Fallback: call without responseMimeType (plain text mode)
     */
    async _tryCallModelPlain(model, prompt) {
        const url = `${this.API_BASE}${model}:generateContent?key=${this._apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt + '\n\nRespond ONLY with valid JSON, no markdown, no code fences, no extra text.' }]
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
        if (!text) throw new Error('Empty AI response in plain mode');

        // Clean markdown code fences if present
        return text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    },

    /**
     * Analyze assessment results and identify weak areas
     * @param {Array} answers - Assessment answers with level, correct, type info
     * @param {string} currentLevel - The assigned level
     * @returns {Object} Weakness analysis
     */
    analyzeWeaknesses(answers, currentLevel) {
        const analysis = {
            level: currentLevel,
            weakAreas: [],
            strongAreas: [],
            details: {}
        };

        // Categorize answers by type
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

        // Identify weak and strong areas
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

        // If no clear weak areas, add areas that aren't strong
        if (analysis.weakAreas.length === 0) {
            for (const [cat, data] of Object.entries(categories)) {
                if (data.total > 0 && !analysis.strongAreas.includes(cat)) {
                    analysis.weakAreas.push(cat);
                }
            }
        }

        // Always ensure at least one area to work on
        if (analysis.weakAreas.length === 0) {
            analysis.weakAreas = ['vocabulary', 'grammar'];
        }

        return analysis;
    },

    /**
     * Generate a complete dynamic lesson using the LLM
     * @param {string} level - Student's CEFR level (A1, A2, B1, B2)
     * @param {Array} weakAreas - Areas to focus on
     * @param {Object} context - Additional context (previous mistakes, etc.)
     * @returns {Promise<Object>} Generated lesson object
     */
    async generateLesson(level, weakAreas, context = {}) {
        const focusAreas = weakAreas.join(', ');
        const previousTopics = context.previousTopics || [];
        const previousTopicsStr = previousTopics.length > 0
            ? `\nAvoid repeating these topics that were already covered: ${previousTopics.join(', ')}`
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
  "title": "Lesson title in Spanish (descriptive, 3-5 words)",
  "description": "Brief description in Spanish of what the student will learn",
  "topic": "The main topic covered (in English, one word like 'greetings' or 'travel')",
  "xpReward": 25,
  "steps": [
    {
      "type": "learn",
      "instruction": "Instruction in Spanish",
      "word": "English word or phrase",
      "translation": "Spanish translation",
      "example": "Example sentence in English using the word",
      "exampleTranslation": "Spanish translation of example"
    },
    {
      "type": "multiple_choice",
      "instruction": "Question in Spanish about the word/grammar",
      "options": ["correct answer", "wrong1", "wrong2", "wrong3"],
      "correct": 0
    },
    {
      "type": "translate",
      "instruction": "Escribe en inglés:",
      "prompt": "Spanish phrase to translate",
      "answer": "correct english translation (lowercase)",
      "acceptAlternatives": ["alternative correct answers"]
    },
    {
      "type": "listen_choose",
      "instruction": "Escucha y selecciona lo que oyes:",
      "audio": "English phrase to be spoken by TTS",
      "options": ["the correct phrase", "similar but wrong 1", "similar but wrong 2", "similar but wrong 3"],
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

IMPORTANT RULES:
1. For "multiple_choice": "correct" is the INDEX (0-3) of the correct answer in the options array
2. For "listen_choose": "correct" is the INDEX of the correct answer, and "audio" is the text to speak
3. For "translate": "answer" must be lowercase
4. For "build_sentence": "words" must be 4-7 words, and "answer" is the correct ordered sentence
5. All instructions must be in Spanish
6. Content must be appropriate for level ${level}
7. Make it educational and engaging
8. Ensure exactly 8 steps
9. Start with 2 "learn" steps to introduce new vocabulary, then mix exercise types`;

        const responseText = await this._callAPI(prompt);

        try {
            const lesson = JSON.parse(responseText);

            // Validate and fix the lesson structure
            return this._validateLesson(lesson, level);
        } catch (e) {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const lesson = JSON.parse(jsonMatch[0]);
                    return this._validateLesson(lesson, level);
                } catch (e2) {
                    console.error('JSON parse error:', e2, 'Response:', responseText.substring(0, 200));
                    throw new Error('La IA respondió con formato inválido. Intenta de nuevo.');
                }
            }
            console.error('No JSON found in response:', responseText.substring(0, 200));
            throw new Error('La IA no generó una lección válida. Intenta de nuevo.');
        }
    },

    /**
     * Generate a post-lesson assessment based on what was taught
     * @param {Object} lesson - The lesson that was just completed
     * @param {string} level - Student's level
     * @returns {Promise<Array>} Assessment questions
     */
    async generatePostAssessment(lesson, level) {
        const lessonContent = lesson.steps
            .filter(s => s.type === 'learn')
            .map(s => `${s.word} (${s.translation})`)
            .join(', ');

        const prompt = `You are an English teacher assessing a Spanish-speaking student at CEFR ${level} level.

The student just completed a lesson about: "${lesson.title}"
Content covered: ${lessonContent}

Generate EXACTLY 10 assessment questions in JSON format to test if the student learned the material.

Mix question types:
- "meaning": What does this English word mean? (options in Spanish)
- "grammar": Fill in the blank grammar questions
- "reverse": How do you say this Spanish word in English? (options in English)

Return a JSON array with this EXACT structure:
[
  {
    "level": "${level}",
    "questionType": "meaning",
    "question": "What does \\"word\\" mean?",
    "options": ["correct Spanish", "wrong1", "wrong2", "wrong3"],
    "correct": 0
  },
  {
    "level": "${level}",
    "questionType": "grammar",
    "question": "Complete: \\"sentence with ___\\"",
    "options": ["correct", "wrong1", "wrong2", "wrong3"],
    "correct": 0
  },
  {
    "level": "${level}",
    "questionType": "reverse",
    "question": "¿Cómo se dice \\"spanish word\\" en inglés?",
    "options": ["correct English", "wrong1", "wrong2", "wrong3"],
    "correct": 0
  }
]

RULES:
1. "correct" is the INDEX (0-3) of the correct answer
2. Questions MUST relate to the lesson content
3. Include at least 3 "meaning", 3 "grammar", and 3 "reverse" questions
4. Make distractors plausible but clearly wrong
5. Difficulty must match ${level} level`;

        const responseText = await this._callAPI(prompt);

        try {
            const questions = JSON.parse(responseText);
            return this._validateAssessment(questions, level);
        } catch (e) {
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                try {
                    const questions = JSON.parse(jsonMatch[0]);
                    return this._validateAssessment(questions, level);
                } catch (e2) {
                    throw new Error('Error parsing assessment response');
                }
            }
            throw new Error('Failed to generate assessment');
        }
    },

    /**
     * Validate and fix lesson structure
     */
    _validateLesson(lesson, level) {
        if (!lesson.title) lesson.title = 'Lección Dinámica';
        if (!lesson.description) lesson.description = 'Lección generada por IA';
        if (!lesson.xpReward) lesson.xpReward = 25;
        if (!lesson.topic) lesson.topic = 'general';

        // Generate unique ID
        lesson.id = `ai_${level}_${Date.now()}`;
        lesson.isAIGenerated = true;

        if (!Array.isArray(lesson.steps)) {
            throw new Error('Lesson has no steps');
        }

        // Validate each step
        lesson.steps = lesson.steps.filter(step => {
            if (!step || !step.type) return false;

            switch (step.type) {
                case 'learn':
                    return step.word && step.translation;
                case 'multiple_choice':
                    if (!Array.isArray(step.options) || step.options.length < 2) return false;
                    if (typeof step.correct !== 'number' || step.correct < 0 || step.correct >= step.options.length) {
                        step.correct = 0;
                    }
                    return !!step.instruction;
                case 'translate':
                    return step.prompt && step.answer;
                case 'listen_choose':
                    if (!Array.isArray(step.options) || step.options.length < 2) return false;
                    if (typeof step.correct !== 'number' || step.correct < 0 || step.correct >= step.options.length) {
                        step.correct = 0;
                    }
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

    /**
     * Validate assessment questions
     */
    _validateAssessment(questions, level) {
        if (!Array.isArray(questions)) {
            throw new Error('Assessment is not an array');
        }

        return questions.filter(q => {
            if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) return false;
            if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= q.options.length) {
                q.correct = 0;
            }
            if (!q.level) q.level = level;
            if (!q.questionType) q.questionType = 'meaning';
            return true;
        }).slice(0, 10); // Max 10 questions
    },

    /**
     * Store lesson history for context
     */
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

        // Keep last 20 lessons
        if (history.length > 20) history.splice(0, history.length - 20);
        Storage.saveAILessonHistory(history);
    },

    /**
     * Get previous topics to avoid repetition
     */
    getPreviousTopics() {
        const history = Storage.getAILessonHistory();
        return history.map(h => h.topic).filter(Boolean);
    }
};
