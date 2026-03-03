/**
 * FreeEnglish - Procedural Question Generator
 * Generates unique questions from word banks + templates
 * Every user session has different questions
 */

const QuestionGenerator = {

    // ========== WORD BANKS BY LEVEL ==========
    WORDS: {
        A1: [
            { en: 'hello', es: 'hola', cat: 'greetings' },
            { en: 'goodbye', es: 'adiós', cat: 'greetings' },
            { en: 'please', es: 'por favor', cat: 'greetings' },
            { en: 'thank you', es: 'gracias', cat: 'greetings' },
            { en: 'sorry', es: 'lo siento', cat: 'greetings' },
            { en: 'yes', es: 'sí', cat: 'basics' },
            { en: 'no', es: 'no', cat: 'basics' },
            { en: 'good morning', es: 'buenos días', cat: 'greetings' },
            { en: 'good night', es: 'buenas noches', cat: 'greetings' },
            { en: 'good afternoon', es: 'buenas tardes', cat: 'greetings' },
            { en: 'mother', es: 'madre', cat: 'family' },
            { en: 'father', es: 'padre', cat: 'family' },
            { en: 'brother', es: 'hermano', cat: 'family' },
            { en: 'sister', es: 'hermana', cat: 'family' },
            { en: 'son', es: 'hijo', cat: 'family' },
            { en: 'daughter', es: 'hija', cat: 'family' },
            { en: 'dog', es: 'perro', cat: 'animals' },
            { en: 'cat', es: 'gato', cat: 'animals' },
            { en: 'bird', es: 'pájaro', cat: 'animals' },
            { en: 'fish', es: 'pez', cat: 'animals' },
            { en: 'red', es: 'rojo', cat: 'colors' },
            { en: 'blue', es: 'azul', cat: 'colors' },
            { en: 'green', es: 'verde', cat: 'colors' },
            { en: 'yellow', es: 'amarillo', cat: 'colors' },
            { en: 'white', es: 'blanco', cat: 'colors' },
            { en: 'black', es: 'negro', cat: 'colors' },
            { en: 'water', es: 'agua', cat: 'food' },
            { en: 'bread', es: 'pan', cat: 'food' },
            { en: 'milk', es: 'leche', cat: 'food' },
            { en: 'apple', es: 'manzana', cat: 'food' },
            { en: 'house', es: 'casa', cat: 'places' },
            { en: 'school', es: 'escuela', cat: 'places' },
            { en: 'book', es: 'libro', cat: 'objects' },
            { en: 'table', es: 'mesa', cat: 'objects' },
            { en: 'chair', es: 'silla', cat: 'objects' },
            { en: 'big', es: 'grande', cat: 'adjectives' },
            { en: 'small', es: 'pequeño', cat: 'adjectives' },
            { en: 'happy', es: 'feliz', cat: 'adjectives' },
            { en: 'sad', es: 'triste', cat: 'adjectives' },
            { en: 'cold', es: 'frío', cat: 'adjectives' },
            { en: 'hot', es: 'caliente', cat: 'adjectives' },
            { en: 'one', es: 'uno', cat: 'numbers' },
            { en: 'two', es: 'dos', cat: 'numbers' },
            { en: 'three', es: 'tres', cat: 'numbers' },
            { en: 'ten', es: 'diez', cat: 'numbers' },
            { en: 'twenty', es: 'veinte', cat: 'numbers' }
        ],
        A2: [
            { en: 'breakfast', es: 'desayuno', cat: 'food' },
            { en: 'lunch', es: 'almuerzo', cat: 'food' },
            { en: 'dinner', es: 'cena', cat: 'food' },
            { en: 'chicken', es: 'pollo', cat: 'food' },
            { en: 'rice', es: 'arroz', cat: 'food' },
            { en: 'coffee', es: 'café', cat: 'food' },
            { en: 'airport', es: 'aeropuerto', cat: 'travel' },
            { en: 'ticket', es: 'boleto', cat: 'travel' },
            { en: 'passport', es: 'pasaporte', cat: 'travel' },
            { en: 'hotel', es: 'hotel', cat: 'travel' },
            { en: 'beach', es: 'playa', cat: 'travel' },
            { en: 'suitcase', es: 'maleta', cat: 'travel' },
            { en: 'restaurant', es: 'restaurante', cat: 'places' },
            { en: 'hospital', es: 'hospital', cat: 'places' },
            { en: 'supermarket', es: 'supermercado', cat: 'places' },
            { en: 'bank', es: 'banco', cat: 'places' },
            { en: 'weather', es: 'clima', cat: 'nature' },
            { en: 'rain', es: 'lluvia', cat: 'nature' },
            { en: 'sun', es: 'sol', cat: 'nature' },
            { en: 'cloud', es: 'nube', cat: 'nature' },
            { en: 'mountain', es: 'montaña', cat: 'nature' },
            { en: 'beautiful', es: 'hermoso', cat: 'adjectives' },
            { en: 'expensive', es: 'caro', cat: 'adjectives' },
            { en: 'cheap', es: 'barato', cat: 'adjectives' },
            { en: 'dangerous', es: 'peligroso', cat: 'adjectives' },
            { en: 'comfortable', es: 'cómodo', cat: 'adjectives' },
            { en: 'to buy', es: 'comprar', cat: 'verbs' },
            { en: 'to sell', es: 'vender', cat: 'verbs' },
            { en: 'to travel', es: 'viajar', cat: 'verbs' },
            { en: 'to cook', es: 'cocinar', cat: 'verbs' },
            { en: 'to drive', es: 'conducir', cat: 'verbs' },
            { en: 'to swim', es: 'nadar', cat: 'verbs' },
            { en: 'to paint', es: 'pintar', cat: 'verbs' },
            { en: 'to dance', es: 'bailar', cat: 'verbs' },
            { en: 'to sing', es: 'cantar', cat: 'verbs' },
            { en: 'always', es: 'siempre', cat: 'adverbs' },
            { en: 'never', es: 'nunca', cat: 'adverbs' },
            { en: 'sometimes', es: 'a veces', cat: 'adverbs' },
            { en: 'quickly', es: 'rápidamente', cat: 'adverbs' },
            { en: 'slowly', es: 'lentamente', cat: 'adverbs' }
        ],
        B1: [
            { en: 'meeting', es: 'reunión', cat: 'work' },
            { en: 'deadline', es: 'fecha límite', cat: 'work' },
            { en: 'colleague', es: 'colega', cat: 'work' },
            { en: 'salary', es: 'salario', cat: 'work' },
            { en: 'interview', es: 'entrevista', cat: 'work' },
            { en: 'experience', es: 'experiencia', cat: 'work' },
            { en: 'environment', es: 'medio ambiente', cat: 'world' },
            { en: 'pollution', es: 'contaminación', cat: 'world' },
            { en: 'recycling', es: 'reciclaje', cat: 'world' },
            { en: 'government', es: 'gobierno', cat: 'world' },
            { en: 'achievement', es: 'logro', cat: 'abstract' },
            { en: 'opportunity', es: 'oportunidad', cat: 'abstract' },
            { en: 'responsibility', es: 'responsabilidad', cat: 'abstract' },
            { en: 'knowledge', es: 'conocimiento', cat: 'abstract' },
            { en: 'advantage', es: 'ventaja', cat: 'abstract' },
            { en: 'disadvantage', es: 'desventaja', cat: 'abstract' },
            { en: 'to improve', es: 'mejorar', cat: 'verbs' },
            { en: 'to develop', es: 'desarrollar', cat: 'verbs' },
            { en: 'to achieve', es: 'lograr', cat: 'verbs' },
            { en: 'to complain', es: 'quejarse', cat: 'verbs' },
            { en: 'to suggest', es: 'sugerir', cat: 'verbs' },
            { en: 'to avoid', es: 'evitar', cat: 'verbs' },
            { en: 'to consider', es: 'considerar', cat: 'verbs' },
            { en: 'to require', es: 'requerir', cat: 'verbs' },
            { en: 'although', es: 'aunque', cat: 'connectors' },
            { en: 'however', es: 'sin embargo', cat: 'connectors' },
            { en: 'therefore', es: 'por lo tanto', cat: 'connectors' },
            { en: 'meanwhile', es: 'mientras tanto', cat: 'connectors' },
            { en: 'reliable', es: 'confiable', cat: 'adjectives' },
            { en: 'efficient', es: 'eficiente', cat: 'adjectives' },
            { en: 'frustrated', es: 'frustrado', cat: 'adjectives' },
            { en: 'anxious', es: 'ansioso', cat: 'adjectives' },
            { en: 'grateful', es: 'agradecido', cat: 'adjectives' }
        ],
        B2: [
            { en: 'breakthrough', es: 'avance', cat: 'academic' },
            { en: 'outcome', es: 'resultado', cat: 'academic' },
            { en: 'hypothesis', es: 'hipótesis', cat: 'academic' },
            { en: 'assessment', es: 'evaluación', cat: 'academic' },
            { en: 'curriculum', es: 'plan de estudios', cat: 'academic' },
            { en: 'furthermore', es: 'además', cat: 'connectors' },
            { en: 'nevertheless', es: 'no obstante', cat: 'connectors' },
            { en: 'notwithstanding', es: 'a pesar de', cat: 'connectors' },
            { en: 'whereas', es: 'mientras que', cat: 'connectors' },
            { en: 'to undertake', es: 'emprender', cat: 'verbs' },
            { en: 'to acknowledge', es: 'reconocer', cat: 'verbs' },
            { en: 'to undermine', es: 'socavar', cat: 'verbs' },
            { en: 'to compromise', es: 'comprometer', cat: 'verbs' },
            { en: 'to elaborate', es: 'elaborar', cat: 'verbs' },
            { en: 'to convey', es: 'transmitir', cat: 'verbs' },
            { en: 'compelling', es: 'convincente', cat: 'adjectives' },
            { en: 'thorough', es: 'exhaustivo', cat: 'adjectives' },
            { en: 'ambiguous', es: 'ambiguo', cat: 'adjectives' },
            { en: 'unprecedented', es: 'sin precedentes', cat: 'adjectives' },
            { en: 'feasible', es: 'factible', cat: 'adjectives' },
            { en: 'subtle', es: 'sutil', cat: 'adjectives' },
            { en: 'reluctant', es: 'reacio', cat: 'adjectives' },
            { en: 'overwhelming', es: 'abrumador', cat: 'adjectives' }
        ]
    },

    // ========== GRAMMAR EXERCISES BY LEVEL ==========
    GRAMMAR: {
        A1: [
            { template: 'I ___ a student', answer: 'am', options: ['am', 'is', 'are', 'be'] },
            { template: 'She ___ happy', answer: 'is', options: ['is', 'am', 'are', 'be'] },
            { template: 'They ___ friends', answer: 'are', options: ['are', 'is', 'am', 'be'] },
            { template: 'We ___ from Mexico', answer: 'are', options: ['are', 'is', 'am', 'be'] },
            { template: 'He ___ a teacher', answer: 'is', options: ['is', 'am', 'are', 'be'] },
            { template: 'I have ___ apple', answer: 'an', options: ['an', 'a', 'the', '-'] },
            { template: 'She has ___ cat', answer: 'a', options: ['a', 'an', 'the', '-'] },
            { template: '___ book is on the table', answer: 'The', options: ['The', 'A', 'An', '-'] },
            { template: 'This is ___ orange', answer: 'an', options: ['an', 'a', 'the', '-'] },
            { template: 'My name ___ Carlos', answer: 'is', options: ['is', 'am', 'are', 'be'] },
            { template: 'I ___ not tired', answer: 'am', options: ['am', 'is', 'are', 'do'] },
            { template: '___ you from Chile?', answer: 'Are', options: ['Are', 'Is', 'Am', 'Do'] },
        ],
        A2: [
            { template: 'Yesterday I ___ to the park', answer: 'went', options: ['went', 'go', 'goes', 'going'] },
            { template: 'She ___ dinner at 8 PM last night', answer: 'had', options: ['had', 'has', 'have', 'having'] },
            { template: 'They ___ playing soccer right now', answer: 'are', options: ['are', 'is', 'am', 'were'] },
            { template: 'He ___ TV every evening', answer: 'watches', options: ['watches', 'watch', 'watching', 'watched'] },
            { template: 'I ___ never been to Japan', answer: 'have', options: ['have', 'has', 'had', 'am'] },
            { template: 'She doesn\'t ___ coffee', answer: 'like', options: ['like', 'likes', 'liked', 'liking'] },
            { template: 'We ___ studying when you called', answer: 'were', options: ['were', 'are', 'was', 'been'] },
            { template: 'The movie was ___ than the book', answer: 'better', options: ['better', 'good', 'best', 'more good'] },
            { template: 'I ___ to the gym three times a week', answer: 'go', options: ['go', 'goes', 'going', 'went'] },
            { template: 'Did you ___ the homework?', answer: 'do', options: ['do', 'did', 'does', 'done'] },
            { template: 'There ___ a lot of people at the party', answer: 'were', options: ['were', 'was', 'is', 'has'] },
            { template: 'She is ___ for the bus', answer: 'waiting', options: ['waiting', 'wait', 'waited', 'waits'] },
        ],
        B1: [
            { template: 'If I ___ rich, I would travel the world', answer: 'were', options: ['were', 'am', 'will be', 'being'] },
            { template: 'She told me she ___ coming', answer: 'was', options: ['was', 'is', 'will', 'has'] },
            { template: 'I wish I ___ speak French', answer: 'could', options: ['could', 'can', 'will', 'would'] },
            { template: 'The woman ___ lives next door is kind', answer: 'who', options: ['who', 'which', 'what', 'whom'] },
            { template: 'He asked me ___ I wanted to go', answer: 'whether', options: ['whether', 'weather', 'that', 'what'] },
            { template: 'By the time I arrived, she ___ left', answer: 'had', options: ['had', 'has', 'have', 'was'] },
            { template: 'You ___ to study harder if you want to pass', answer: 'need', options: ['need', 'must', 'should', 'would'] },
            { template: 'I\'ve been ___ here for two hours', answer: 'waiting', options: ['waiting', 'wait', 'waited', 'waits'] },
            { template: 'He suggested ___ a break', answer: 'taking', options: ['taking', 'to take', 'take', 'took'] },
            { template: 'If I had studied more, I ___ have passed', answer: 'would', options: ['would', 'will', 'can', 'should'] },
        ],
        B2: [
            { template: 'Had I known, I ___ have helped', answer: 'would', options: ['would', 'will', 'can', 'shall'] },
            { template: 'The report ___ by the time we arrive', answer: 'will have been finished', options: ['will have been finished', 'will finish', 'is finishing', 'has finished'] },
            { template: 'Not only ___ she smart, but also kind', answer: 'is', options: ['is', 'was', 'does', 'has'] },
            { template: 'Rarely ___ such talent been seen', answer: 'has', options: ['has', 'have', 'is', 'was'] },
            { template: '___ the circumstances, we did well', answer: 'Given', options: ['Given', 'Giving', 'Give', 'Gave'] },
            { template: 'The project ___ completed by next Friday', answer: 'will be', options: ['will be', 'is', 'would', 'has'] },
            { template: 'She acts as ___ she owned the place', answer: 'though', options: ['though', 'if', 'because', 'when'] },
            { template: 'Were I ___ you, I would accept', answer: 'in your position', options: ['in your position', 'you', 'to be', 'was'] },
        ]
    },

    // ========== IDIOMS & PHRASES BY LEVEL ==========
    PHRASES: {
        A1: [
            { en: 'How are you?', es: '¿Cómo estás?' },
            { en: 'Nice to meet you', es: 'Encantado de conocerte' },
            { en: 'What is your name?', es: '¿Cómo te llamas?' },
            { en: 'I don\'t understand', es: 'No entiendo' },
            { en: 'Can you help me?', es: '¿Puedes ayudarme?' },
            { en: 'Where is the bathroom?', es: '¿Dónde está el baño?' },
            { en: 'How much does it cost?', es: '¿Cuánto cuesta?' },
            { en: 'I am from Chile', es: 'Soy de Chile' },
            { en: 'See you later', es: 'Nos vemos' },
            { en: 'Have a nice day', es: 'Que tengas un buen día' },
        ],
        A2: [
            { en: 'I would like a table for two', es: 'Me gustaría una mesa para dos' },
            { en: 'Could you repeat that, please?', es: '¿Podría repetir eso, por favor?' },
            { en: 'What time does the bus leave?', es: '¿A qué hora sale el bus?' },
            { en: 'I\'m looking for the train station', es: 'Estoy buscando la estación de tren' },
            { en: 'Do you have this in a different size?', es: '¿Tienen esto en otra talla?' },
            { en: 'I usually wake up at seven', es: 'Usualmente me despierto a las siete' },
            { en: 'The weather is really nice today', es: 'El clima está muy bonito hoy' },
            { en: 'I enjoy playing soccer on weekends', es: 'Disfruto jugar fútbol los fines de semana' },
            { en: 'Can I have the bill, please?', es: '¿Me puede dar la cuenta, por favor?' },
            { en: 'I\'m sorry, I\'m late', es: 'Lo siento, llego tarde' },
        ],
        B1: [
            { en: 'I\'m looking forward to meeting you', es: 'Espero con ansias conocerte' },
            { en: 'In my opinion, education is very important', es: 'En mi opinión, la educación es muy importante' },
            { en: 'On the one hand... on the other hand', es: 'Por un lado... por otro lado' },
            { en: 'I couldn\'t agree more', es: 'No podría estar más de acuerdo' },
            { en: 'It depends on the situation', es: 'Depende de la situación' },
            { en: 'I have been working here for five years', es: 'He estado trabajando aquí por cinco años' },
            { en: 'If I were you, I would study abroad', es: 'Si fuera tú, estudiaría en el extranjero' },
            { en: 'The meeting has been postponed until tomorrow', es: 'La reunión ha sido pospuesta hasta mañana' },
        ],
        B2: [
            { en: 'The situation is getting out of hand', es: 'La situación se está saliendo de control' },
            { en: 'We need to think outside the box', es: 'Necesitamos pensar de forma creativa' },
            { en: 'Actions speak louder than words', es: 'Los hechos hablan más que las palabras' },
            { en: 'It\'s not rocket science', es: 'No es ciencia espacial' },
            { en: 'Let\'s get down to business', es: 'Vamos al grano' },
            { en: 'To beat around the bush', es: 'Dar rodeos / Andarse con rodeos' },
            { en: 'A blessing in disguise', es: 'No hay mal que por bien no venga' },
            { en: 'Better late than never', es: 'Más vale tarde que nunca' },
        ]
    },

    // ========== SENTENCE TEMPLATES FOR SPEAK EXERCISES ==========
    SPEAK_SENTENCES: {
        A1: [
            { en: 'Hello, my name is {name}', es: 'Hola, mi nombre es {name}' },
            { en: 'I have a {animal}', es: 'Tengo un {animal}' },
            { en: 'My favorite color is {color}', es: 'Mi color favorito es {color}' },
            { en: 'I am {age} years old', es: 'Tengo {age} años' },
            { en: 'I like {food}', es: 'Me gusta {food}' },
        ],
        A2: [
            { en: 'Yesterday I went to the {place}', es: 'Ayer fui al {place}' },
            { en: 'I usually have {meal} at eight', es: 'Usualmente tomo el {meal} a las ocho' },
            { en: 'The weather is {weather} today', es: 'El clima está {weather} hoy' },
            { en: 'I enjoy {activity} on weekends', es: 'Disfruto {activity} los fines de semana' },
        ],
        B1: [
            { en: 'If I had more time, I would learn {language}', es: 'Si tuviera más tiempo, aprendería {language}' },
            { en: 'I have been studying English for {time}', es: 'He estado estudiando inglés por {time}' },
            { en: 'In my opinion, {topic} is very important', es: 'En mi opinión, {topic} es muy importante' },
        ],
        B2: [
            { en: 'Notwithstanding the challenges, we succeeded', es: 'A pesar de los desafíos, tuvimos éxito' },
            { en: 'The committee will have finished the report by Friday', es: 'El comité habrá terminado el informe para el viernes' },
            { en: 'Had I known about the issue, I would have acted differently', es: 'Si hubiera sabido del problema, habría actuado diferente' },
        ]
    },

    // ========== UTILITY FUNCTIONS ==========
    _pickRandom(arr, count = 1) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return count === 1 ? shuffled[0] : shuffled.slice(0, count);
    },

    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    _getDistractors(correctEs, level, count = 3) {
        const words = this.WORDS[level] || this.WORDS.A1;
        const others = words.filter(w => w.es !== correctEs);
        return this._pickRandom(others, count).map(w => w.es);
    },

    _getDistractorsEn(correctEn, level, count = 3) {
        const words = this.WORDS[level] || this.WORDS.A1;
        const others = words.filter(w => w.en !== correctEn);
        return this._pickRandom(others, count).map(w => w.en);
    },

    // ========== ASSESSMENT GENERATOR ==========
    generateAssessment(questionsPerLevel = 5) {
        const levels = ['A1', 'A2', 'B1', 'B2'];
        const questions = [];

        for (const level of levels) {
            const levelQuestions = [];
            const words = this._pickRandom(this.WORDS[level], Math.min(questionsPerLevel * 2, this.WORDS[level].length));
            const grammars = this._shuffle(this.GRAMMAR[level]);

            // Mix question types
            const types = this._shuffle([
                'meaning', 'meaning', 'grammar', 'grammar', 'reverse'
            ]);

            let wordIdx = 0;
            let gramIdx = 0;

            for (let i = 0; i < questionsPerLevel; i++) {
                const type = types[i % types.length];

                if (type === 'meaning' && wordIdx < words.length) {
                    const word = words[wordIdx++];
                    const distractors = this._getDistractors(word.es, level);
                    const allOptions = this._shuffle([word.es, ...distractors]);
                    levelQuestions.push({
                        level,
                        question: `What does "${word.en}" mean?`,
                        options: allOptions,
                        correct: allOptions.indexOf(word.es)
                    });
                } else if (type === 'reverse' && wordIdx < words.length) {
                    const word = words[wordIdx++];
                    const distractors = this._getDistractorsEn(word.en, level);
                    const allOptions = this._shuffle([word.en, ...distractors]);
                    levelQuestions.push({
                        level,
                        question: `¿Cómo se dice "${word.es}" en inglés?`,
                        options: allOptions,
                        correct: allOptions.indexOf(word.en)
                    });
                } else if (gramIdx < grammars.length) {
                    const gram = grammars[gramIdx++];
                    const allOptions = this._shuffle([...gram.options]);
                    levelQuestions.push({
                        level,
                        question: `Complete: "${gram.template}"`,
                        options: allOptions,
                        correct: allOptions.indexOf(gram.answer)
                    });
                } else {
                    // Fallback: meaning question
                    const word = this._pickRandom(this.WORDS[level]);
                    const distractors = this._getDistractors(word.es, level);
                    const allOptions = this._shuffle([word.es, ...distractors]);
                    levelQuestions.push({
                        level,
                        question: `What does "${word.en}" mean?`,
                        options: allOptions,
                        correct: allOptions.indexOf(word.es)
                    });
                }
            }

            questions.push(...levelQuestions);
        }

        return questions;
    },

    // ========== LESSON STEP GENERATOR ==========
    generateLessonSteps(level, category, stepCount = 6) {
        const steps = [];
        const words = this._pickRandom(this.WORDS[level], Math.min(stepCount * 2, this.WORDS[level].length));
        const phrases = this.PHRASES[level] || this.PHRASES.A1;
        const grammars = this._shuffle(this.GRAMMAR[level] || this.GRAMMAR.A1);

        let wordIdx = 0;
        let gramIdx = 0;

        // Define step type patterns per category
        const patterns = {
            vocabulary: ['learn', 'multiple_choice', 'learn', 'translate', 'multiple_choice', 'speak'],
            grammar: ['learn', 'multiple_choice', 'multiple_choice', 'translate', 'build_sentence', 'multiple_choice'],
            phrases: ['learn', 'multiple_choice', 'learn', 'speak', 'translate', 'speak'],
            listening: ['listen_choose', 'listen_write', 'listen_choose', 'multiple_choice', 'listen_write', 'listen_choose'],
            speaking: ['speak', 'speak', 'speak', 'speak', 'speak', 'speak'],
            reading: ['learn', 'multiple_choice', 'translate', 'multiple_choice', 'translate', 'build_sentence']
        };

        const pattern = patterns[category] || patterns.vocabulary;

        for (let i = 0; i < stepCount; i++) {
            const stepType = pattern[i % pattern.length];
            const word = words[wordIdx % words.length];

            switch (stepType) {
                case 'learn':
                    const phrase = this._pickRandom(phrases);
                    steps.push({
                        type: 'learn',
                        instruction: 'Aprende esta palabra:',
                        word: word.en,
                        translation: word.es,
                        example: phrase ? phrase.en : `I like ${word.en}.`,
                        exampleTranslation: phrase ? phrase.es : `Me gusta ${word.en}.`
                    });
                    wordIdx++;
                    break;

                case 'multiple_choice': {
                    // Randomly choose between meaning and grammar
                    if (Math.random() > 0.4 || gramIdx >= grammars.length) {
                        const w = words[wordIdx % words.length];
                        const distractors = this._getDistractors(w.es, level);
                        const allOptions = this._shuffle([w.es, ...distractors]);
                        steps.push({
                            type: 'multiple_choice',
                            instruction: `¿Qué significa "${w.en}"?`,
                            options: allOptions,
                            correct: allOptions.indexOf(w.es)
                        });
                        wordIdx++;
                    } else {
                        const gram = grammars[gramIdx++];
                        const allOptions = this._shuffle([...gram.options]);
                        steps.push({
                            type: 'multiple_choice',
                            instruction: `Complete: "${gram.template}"`,
                            options: allOptions,
                            correct: allOptions.indexOf(gram.answer)
                        });
                    }
                    break;
                }

                case 'translate': {
                    const w = words[wordIdx % words.length];
                    const phraseForTranslate = this._pickRandom(phrases);
                    if (Math.random() > 0.5 && phraseForTranslate) {
                        steps.push({
                            type: 'translate',
                            instruction: 'Traduce al inglés:',
                            prompt: phraseForTranslate.es,
                            answer: phraseForTranslate.en.toLowerCase(),
                            acceptAlternatives: []
                        });
                    } else {
                        steps.push({
                            type: 'translate',
                            instruction: 'Escribe en inglés:',
                            prompt: w.es,
                            answer: w.en.toLowerCase(),
                            acceptAlternatives: []
                        });
                    }
                    wordIdx++;
                    break;
                }

                case 'speak': {
                    const p = this._pickRandom(phrases);
                    steps.push({
                        type: 'speak',
                        instruction: 'Pronuncia esta frase:',
                        phrase: p.en,
                        translation: p.es
                    });
                    break;
                }

                case 'listen_choose': {
                    const p = this._pickRandom(phrases);
                    const otherPhrases = phrases.filter(x => x.en !== p.en);
                    const distractors = this._pickRandom(otherPhrases, 3).map(x => x.en);
                    const allOptions = this._shuffle([p.en, ...distractors]);
                    steps.push({
                        type: 'listen_choose',
                        instruction: 'Escucha y selecciona lo que oyes:',
                        audio: p.en,
                        options: allOptions,
                        correct: allOptions.indexOf(p.en)
                    });
                    break;
                }

                case 'listen_write': {
                    const w = words[wordIdx % words.length];
                    const simplePhrase = this._pickRandom(phrases);
                    const text = Math.random() > 0.5 ? simplePhrase.en : w.en;
                    steps.push({
                        type: 'listen_write',
                        instruction: 'Escucha y escribe lo que oyes:',
                        audio: text,
                        answer: text.toLowerCase(),
                        acceptAlternatives: [text.toLowerCase() + '.', text.toLowerCase() + '!']
                    });
                    wordIdx++;
                    break;
                }

                case 'build_sentence': {
                    const p = this._pickRandom(phrases);
                    const sentenceWords = p.en.split(' ').filter(w => w.length > 0);
                    if (sentenceWords.length >= 3 && sentenceWords.length <= 8) {
                        steps.push({
                            type: 'build_sentence',
                            instruction: 'Ordena las palabras:',
                            words: this._shuffle(sentenceWords),
                            answer: p.en
                        });
                    } else {
                        // Fallback to translate
                        steps.push({
                            type: 'translate',
                            instruction: 'Traduce al inglés:',
                            prompt: p.es,
                            answer: p.en.toLowerCase(),
                            acceptAlternatives: []
                        });
                    }
                    break;
                }
            }
        }

        return steps;
    }
};
