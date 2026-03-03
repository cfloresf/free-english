/**
 * FreeEnglish - Lesson Database
 * Organized by CEFR levels (A1-B2) and categories
 */

const LEVELS = {
    A1: { name: 'Principiante', xpToNext: 500, description: 'Saludos, presentaciones y frases básicas' },
    A2: { name: 'Elemental', xpToNext: 1000, description: 'Conversación cotidiana y gramática básica' },
    B1: { name: 'Intermedio', xpToNext: 2000, description: 'Opiniones, planes y situaciones complejas' },
    B2: { name: 'Intermedio Alto', xpToNext: 4000, description: 'Fluidez y precisión en contextos variados' }
};

const CATEGORIES = [
    { id: 'vocabulary', name: 'Vocabulario', emoji: '📝', color: '#6366f1' },
    { id: 'grammar', name: 'Gramática', emoji: '📐', color: '#06b6d4' },
    { id: 'listening', name: 'Listening', emoji: '🎧', color: '#f59e0b' },
    { id: 'speaking', name: 'Speaking', emoji: '🎤', color: '#10b981' },
    { id: 'phrases', name: 'Frases Útiles', emoji: '💬', color: '#8b5cf6' },
    { id: 'reading', name: 'Lectura', emoji: '📖', color: '#ec4899' }
];

const ASSESSMENT_QUESTIONS = [
    // A1 Level questions
    {
        level: 'A1',
        type: 'multiple_choice',
        question: 'What is the correct greeting?',
        context: 'Es la mañana y te encuentras con alguien',
        options: ['Good morning', 'Good night', 'Goodbye', 'See you'],
        correct: 0
    },
    {
        level: 'A1',
        type: 'multiple_choice',
        question: 'Complete: "My name ___ Maria"',
        options: ['is', 'are', 'am', 'be'],
        correct: 0
    },
    {
        level: 'A1',
        type: 'multiple_choice',
        question: '"How are you?" means:',
        options: ['¿Cómo estás?', '¿Qué hora es?', '¿Dónde vives?', '¿Cuántos años tienes?'],
        correct: 0
    },
    // A2 Level questions
    {
        level: 'A2',
        type: 'multiple_choice',
        question: 'Choose the correct past tense:',
        context: '"Yesterday I ___ to the store"',
        options: ['went', 'go', 'going', 'goes'],
        correct: 0
    },
    {
        level: 'A2',
        type: 'multiple_choice',
        question: 'Which sentence is correct?',
        options: [
            'She doesn\'t like coffee',
            'She don\'t like coffee',
            'She not like coffee',
            'She no likes coffee'
        ],
        correct: 0
    },
    {
        level: 'A2',
        type: 'multiple_choice',
        question: '"I have been waiting for two hours" is in:',
        options: ['Present Perfect Continuous', 'Simple Past', 'Simple Present', 'Future'],
        correct: 0
    },
    // B1 Level questions
    {
        level: 'B1',
        type: 'multiple_choice',
        question: 'Complete: "If I ___ rich, I would travel"',
        options: ['were', 'am', 'will be', 'was being'],
        correct: 0
    },
    {
        level: 'B1',
        type: 'multiple_choice',
        question: '"She told me that she ___ coming"',
        options: ['was', 'is', 'will', 'has'],
        correct: 0
    },
    // B2 Level questions
    {
        level: 'B2',
        type: 'multiple_choice',
        question: 'Which word best completes: "The project was ___ successful"',
        options: ['overwhelmingly', 'very much', 'so lot', 'plenty'],
        correct: 0
    },
    {
        level: 'B2',
        type: 'multiple_choice',
        question: '"Had I known earlier, I ___ have acted differently"',
        options: ['would', 'will', 'can', 'shall'],
        correct: 0
    }
];

const LESSONS_DB = {
    // =================== A1 LESSONS ===================
    A1: {
        vocabulary: [
            {
                id: 'a1_vocab_greetings',
                title: 'Saludos Básicos',
                description: 'Aprende a saludar en inglés',
                xpReward: 20,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Aprende esta palabra:',
                        word: 'Hello',
                        translation: 'Hola',
                        example: 'Hello! Nice to meet you.',
                        exampleTranslation: '¡Hola! Gusto en conocerte.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Qué significa "Hello"?',
                        options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
                        correct: 0
                    },
                    {
                        type: 'learn',
                        instruction: 'Aprende esta expresión:',
                        word: 'Good morning',
                        translation: 'Buenos días',
                        example: 'Good morning! How are you?',
                        exampleTranslation: '¡Buenos días! ¿Cómo estás?'
                    },
                    {
                        type: 'translate',
                        instruction: 'Escribe en inglés:',
                        prompt: 'Buenos días',
                        answer: 'good morning',
                        acceptAlternatives: ['good morning!']
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cómo dices "Buenas noches" en inglés?',
                        options: ['Good night', 'Good morning', 'Good afternoon', 'Good day'],
                        correct: 0
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia esta frase:',
                        phrase: 'Hello, good morning!',
                        translation: '¡Hola, buenos días!'
                    }
                ]
            },
            {
                id: 'a1_vocab_numbers',
                title: 'Números del 1 al 20',
                description: 'Aprende a contar en inglés',
                xpReward: 25,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Aprende los números:',
                        word: 'One, Two, Three',
                        translation: 'Uno, Dos, Tres',
                        example: 'I have three dogs.',
                        exampleTranslation: 'Tengo tres perros.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cuál es el número "five"?',
                        options: ['5', '4', '6', '3'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Escribe el número en inglés:',
                        prompt: '10',
                        answer: 'ten',
                        acceptAlternatives: []
                    },
                    {
                        type: 'learn',
                        instruction: 'Números más grandes:',
                        word: 'Eleven, Twelve, Thirteen',
                        translation: 'Once, Doce, Trece',
                        example: 'She is thirteen years old.',
                        exampleTranslation: 'Ella tiene trece años.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cómo se dice "twenty" en español?',
                        options: ['Veinte', 'Doce', 'Quince', 'Dieciocho'],
                        correct: 0
                    }
                ]
            },
            {
                id: 'a1_vocab_colors',
                title: 'Los Colores',
                description: 'Aprende los colores en inglés',
                xpReward: 20,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Aprende estos colores:',
                        word: 'Red, Blue, Green',
                        translation: 'Rojo, Azul, Verde',
                        example: 'The sky is blue.',
                        exampleTranslation: 'El cielo es azul.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Qué color es "yellow"?',
                        options: ['Amarillo', 'Naranja', 'Rojo', 'Morado'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Escribe en inglés:',
                        prompt: 'El gato es negro',
                        answer: 'the cat is black',
                        acceptAlternatives: ['the cat is black.']
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "The grass is ___"',
                        options: ['green', 'blue', 'red', 'white'],
                        correct: 0
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'My favorite color is blue',
                        translation: 'Mi color favorito es azul'
                    }
                ]
            },
            {
                id: 'a1_vocab_family',
                title: 'La Familia',
                description: 'Vocabulario de la familia',
                xpReward: 25,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Miembros de la familia:',
                        word: 'Mother / Father',
                        translation: 'Madre / Padre',
                        example: 'My mother is a teacher.',
                        exampleTranslation: 'Mi madre es profesora.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '"Sister" significa:',
                        options: ['Hermana', 'Hermano', 'Prima', 'Hija'],
                        correct: 0
                    },
                    {
                        type: 'learn',
                        instruction: 'Más miembros:',
                        word: 'Brother / Sister',
                        translation: 'Hermano / Hermana',
                        example: 'I have two brothers and one sister.',
                        exampleTranslation: 'Tengo dos hermanos y una hermana.'
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce al inglés:',
                        prompt: 'Mi padre es alto',
                        answer: 'my father is tall',
                        acceptAlternatives: ['my father is tall.', 'my dad is tall', 'my dad is tall.']
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I love my family',
                        translation: 'Amo a mi familia'
                    }
                ]
            }
        ],
        grammar: [
            {
                id: 'a1_gram_tobe',
                title: 'Verbo To Be',
                description: 'Ser/Estar en presente',
                xpReward: 25,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'El verbo "to be" (ser/estar):',
                        word: 'I am / You are / He is',
                        translation: 'Yo soy / Tú eres / Él es',
                        example: 'I am happy. She is a student.',
                        exampleTranslation: 'Soy feliz. Ella es estudiante.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "They ___ friends"',
                        options: ['are', 'is', 'am', 'be'],
                        correct: 0
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "She ___ a doctor"',
                        options: ['is', 'are', 'am', 'be'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce al inglés:',
                        prompt: 'Yo soy estudiante',
                        answer: 'i am a student',
                        acceptAlternatives: ["i'm a student", 'i am a student.']
                    },
                    {
                        type: 'build_sentence',
                        instruction: 'Ordena las palabras:',
                        words: ['We', 'are', 'happy', 'very'],
                        answer: 'We are very happy'
                    }
                ]
            },
            {
                id: 'a1_gram_articles',
                title: 'Artículos A/An/The',
                description: 'Cuándo usar a, an y the',
                xpReward: 20,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Los artículos en inglés:',
                        word: 'A / An / The',
                        translation: 'Un(a) / Un(a) / El/La/Los/Las',
                        example: 'A cat, an apple, the sun.',
                        exampleTranslation: 'Un gato, una manzana, el sol.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cuál es correcto? "___ elephant"',
                        options: ['An', 'A', 'The', 'No article'],
                        correct: 0
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "I have ___ car"',
                        options: ['a', 'an', 'the', '-'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce:',
                        prompt: 'Es una manzana',
                        answer: 'it is an apple',
                        acceptAlternatives: ["it's an apple", 'it is an apple.']
                    }
                ]
            }
        ],
        phrases: [
            {
                id: 'a1_phrases_intro',
                title: 'Presentarse',
                description: 'Cómo presentarte en inglés',
                xpReward: 20,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Frase útil:',
                        word: 'Nice to meet you',
                        translation: 'Encantado de conocerte',
                        example: 'Hi, I\'m Carlos. Nice to meet you!',
                        exampleTranslation: 'Hola, soy Carlos. ¡Encantado de conocerte!'
                    },
                    {
                        type: 'learn',
                        instruction: 'Otra frase útil:',
                        word: 'Where are you from?',
                        translation: '¿De dónde eres?',
                        example: 'Where are you from? I\'m from Mexico.',
                        exampleTranslation: '¿De dónde eres? Soy de México.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cómo dices "Encantado de conocerte"?',
                        options: ['Nice to meet you', 'How are you', 'What is your name', 'See you later'],
                        correct: 0
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'Nice to meet you!',
                        translation: '¡Encantado de conocerte!'
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce al inglés:',
                        prompt: 'Soy de Chile',
                        answer: "i'm from chile",
                        acceptAlternatives: ['i am from chile', "i'm from chile.", 'i am from chile.']
                    }
                ]
            }
        ],
        listening: [
            {
                id: 'a1_listen_basic',
                title: 'Frases Cotidianas',
                description: 'Escucha y comprende frases básicas',
                xpReward: 20,
                steps: [
                    {
                        type: 'listen_choose',
                        instruction: 'Escucha y selecciona lo que oyes:',
                        audio: 'How are you today?',
                        options: ['How are you today?', 'Where are you today?', 'Who are you?', 'How old are you?'],
                        correct: 0
                    },
                    {
                        type: 'listen_choose',
                        instruction: 'Escucha y selecciona lo que oyes:',
                        audio: 'I would like a glass of water, please.',
                        options: ['I would like a glass of water, please.', 'I want a cup of coffee.', 'Can I have some milk?', 'I need a bottle of juice.'],
                        correct: 0
                    },
                    {
                        type: 'listen_write',
                        instruction: 'Escucha y escribe lo que oyes:',
                        audio: 'Thank you very much',
                        answer: 'thank you very much',
                        acceptAlternatives: ['thank you very much!', 'thank you very much.']
                    },
                    {
                        type: 'listen_write',
                        instruction: 'Escucha y escribe lo que oyes:',
                        audio: 'Good afternoon',
                        answer: 'good afternoon',
                        acceptAlternatives: ['good afternoon!', 'good afternoon.']
                    }
                ]
            }
        ],
        speaking: [
            {
                id: 'a1_speak_greetings',
                title: 'Pronunciación: Saludos',
                description: 'Practica la pronunciación de saludos',
                xpReward: 25,
                steps: [
                    {
                        type: 'speak',
                        instruction: 'Pronuncia esta frase:',
                        phrase: 'Hello, how are you?',
                        translation: 'Hola, ¿cómo estás?'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'Good morning, nice to meet you',
                        translation: 'Buenos días, encantado de conocerte'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'My name is Carlos',
                        translation: 'Mi nombre es Carlos'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I am from South America',
                        translation: 'Soy de Sudamérica'
                    }
                ]
            }
        ]
    },

    // =================== A2 LESSONS ===================
    A2: {
        vocabulary: [
            {
                id: 'a2_vocab_food',
                title: 'Comida y Restaurante',
                description: 'Vocabulario para pedir comida',
                xpReward: 25,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Vocabulario del restaurante:',
                        word: 'Menu / Order / Bill',
                        translation: 'Menú / Pedido / Cuenta',
                        example: 'Can I see the menu, please?',
                        exampleTranslation: '¿Puedo ver el menú, por favor?'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cómo pides la cuenta?',
                        options: ['Can I have the bill?', 'Where is the menu?', 'I want food', 'Give me money'],
                        correct: 0
                    },
                    {
                        type: 'learn',
                        instruction: 'Más vocabulario:',
                        word: 'Breakfast / Lunch / Dinner',
                        translation: 'Desayuno / Almuerzo / Cena',
                        example: 'What do you want for dinner?',
                        exampleTranslation: '¿Qué quieres para la cena?'
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce al inglés:',
                        prompt: 'Quiero pedir un café',
                        answer: 'i want to order a coffee',
                        acceptAlternatives: ["i'd like to order a coffee", 'i want to order a coffee.', "i'd like a coffee"]
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I would like a table for two, please',
                        translation: 'Me gustaría una mesa para dos, por favor'
                    }
                ]
            },
            {
                id: 'a2_vocab_travel',
                title: 'Viajes y Transporte',
                description: 'Vocabulario esencial para viajar',
                xpReward: 25,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Vocabulario de viaje:',
                        word: 'Airport / Train / Bus',
                        translation: 'Aeropuerto / Tren / Bus',
                        example: 'The train leaves at 8 AM.',
                        exampleTranslation: 'El tren sale a las 8 AM.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '"Ticket" significa:',
                        options: ['Boleto', 'Maleta', 'Pasaporte', 'Hotel'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Escribe en inglés:',
                        prompt: '¿Dónde está el aeropuerto?',
                        answer: 'where is the airport',
                        acceptAlternatives: ['where is the airport?']
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "I need to ___ a taxi"',
                        options: ['take', 'make', 'do', 'have'],
                        correct: 0
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'Excuse me, where is the train station?',
                        translation: 'Disculpe, ¿dónde está la estación de tren?'
                    }
                ]
            }
        ],
        grammar: [
            {
                id: 'a2_gram_past',
                title: 'Pasado Simple',
                description: 'Verbos en pasado simple',
                xpReward: 30,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'El pasado simple:',
                        word: 'I played / She worked / They studied',
                        translation: 'Yo jugué / Ella trabajó / Ellos estudiaron',
                        example: 'Yesterday I played soccer with my friends.',
                        exampleTranslation: 'Ayer jugué fútbol con mis amigos.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "She ___ to the park yesterday"',
                        options: ['went', 'go', 'goes', 'going'],
                        correct: 0
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cuál es el pasado de "eat"?',
                        options: ['ate', 'eated', 'eaten', 'eating'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce al inglés:',
                        prompt: 'Yo estudié inglés ayer',
                        answer: 'i studied english yesterday',
                        acceptAlternatives: ['i studied english yesterday.']
                    },
                    {
                        type: 'build_sentence',
                        instruction: 'Ordena las palabras:',
                        words: ['She', 'didn\'t', 'go', 'to', 'school', 'yesterday'],
                        answer: "She didn't go to school yesterday"
                    }
                ]
            },
            {
                id: 'a2_gram_present_cont',
                title: 'Presente Continuo',
                description: 'Lo que está pasando ahora',
                xpReward: 25,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Presente continuo (be + -ing):',
                        word: 'I am working / She is reading',
                        translation: 'Estoy trabajando / Ella está leyendo',
                        example: 'I am learning English right now.',
                        exampleTranslation: 'Estoy aprendiendo inglés ahora mismo.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "They ___ playing soccer"',
                        options: ['are', 'is', 'am', 'be'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce al inglés:',
                        prompt: 'Ella está cocinando',
                        answer: 'she is cooking',
                        acceptAlternatives: ["she's cooking", 'she is cooking.']
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cuál es la forma -ing de "run"?',
                        options: ['running', 'runing', 'runninng', 'runing'],
                        correct: 0
                    }
                ]
            }
        ],
        phrases: [
            {
                id: 'a2_phrases_shopping',
                title: 'De Compras',
                description: 'Frases para ir de compras',
                xpReward: 20,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Frase útil:',
                        word: 'How much does this cost?',
                        translation: '¿Cuánto cuesta esto?',
                        example: 'How much does this shirt cost?',
                        exampleTranslation: '¿Cuánto cuesta esta camisa?'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cómo preguntas el precio?',
                        options: ['How much is it?', 'What time is it?', 'Where is it?', 'Who has it?'],
                        correct: 0
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'Do you have this in a different size?',
                        translation: '¿Tienen esto en otra talla?'
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce:',
                        prompt: 'Me lo llevo',
                        answer: "i'll take it",
                        acceptAlternatives: ['i will take it', "i'll take it.", 'i will take it.']
                    }
                ]
            }
        ],
        listening: [
            {
                id: 'a2_listen_directions',
                title: 'Direcciones',
                description: 'Comprende instrucciones de dirección',
                xpReward: 25,
                steps: [
                    {
                        type: 'listen_choose',
                        instruction: 'Escucha y selecciona:',
                        audio: 'Turn left at the traffic light.',
                        options: ['Turn left at the traffic light', 'Turn right at the traffic light', 'Go straight ahead', 'Stop at the corner'],
                        correct: 0
                    },
                    {
                        type: 'listen_write',
                        instruction: 'Escucha y escribe:',
                        audio: 'The bank is next to the supermarket',
                        answer: 'the bank is next to the supermarket',
                        acceptAlternatives: ['the bank is next to the supermarket.']
                    },
                    {
                        type: 'listen_choose',
                        instruction: 'Escucha y selecciona:',
                        audio: 'Go straight for two blocks, then turn right.',
                        options: ['Go straight for two blocks, then turn right', 'Go left for three blocks', 'Turn around and go back', 'Take the first exit'],
                        correct: 0
                    }
                ]
            }
        ],
        speaking: [
            {
                id: 'a2_speak_daily',
                title: 'Rutina Diaria',
                description: 'Habla sobre tu día a día',
                xpReward: 25,
                steps: [
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I usually wake up at seven in the morning',
                        translation: 'Usualmente me despierto a las siete de la mañana'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'After breakfast, I go to work by bus',
                        translation: 'Después del desayuno, voy al trabajo en bus'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'In the evening, I like to read books',
                        translation: 'En la noche, me gusta leer libros'
                    }
                ]
            }
        ]
    },

    // =================== B1 LESSONS ===================
    B1: {
        vocabulary: [
            {
                id: 'b1_vocab_work',
                title: 'El Trabajo',
                description: 'Vocabulario profesional',
                xpReward: 30,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Vocabulario laboral:',
                        word: 'Meeting / Deadline / Colleague',
                        translation: 'Reunión / Fecha límite / Colega',
                        example: 'We have a meeting with our colleagues at 3 PM.',
                        exampleTranslation: 'Tenemos una reunión con nuestros colegas a las 3 PM.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '"Deadline" significa:',
                        options: ['Fecha límite', 'Trabajo extra', 'Vacaciones', 'Salario'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce al inglés:',
                        prompt: 'Necesito terminar el informe antes de la fecha límite',
                        answer: 'i need to finish the report before the deadline',
                        acceptAlternatives: ['i need to finish the report before the deadline.']
                    },
                    {
                        type: 'build_sentence',
                        instruction: 'Ordena las palabras:',
                        words: ['The', 'meeting', 'has', 'been', 'postponed', 'until', 'tomorrow'],
                        answer: 'The meeting has been postponed until tomorrow'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I have a job interview next Monday',
                        translation: 'Tengo una entrevista de trabajo el próximo lunes'
                    }
                ]
            }
        ],
        grammar: [
            {
                id: 'b1_gram_conditionals',
                title: 'Condicionales',
                description: 'If clauses - Tipo 1 y 2',
                xpReward: 35,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Condicional tipo 1 (posible):',
                        word: 'If + present → will + verb',
                        translation: 'Si + presente → futuro',
                        example: 'If it rains, I will stay home.',
                        exampleTranslation: 'Si llueve, me quedaré en casa.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "If I ___ time, I will help you"',
                        options: ['have', 'had', 'will have', 'having'],
                        correct: 0
                    },
                    {
                        type: 'learn',
                        instruction: 'Condicional tipo 2 (hipotético):',
                        word: 'If + past → would + verb',
                        translation: 'Si + pasado → condicional',
                        example: 'If I were rich, I would travel the world.',
                        exampleTranslation: 'Si fuera rico, viajaría por el mundo.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "If I ___ a bird, I would fly"',
                        options: ['were', 'am', 'will be', 'being'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce:',
                        prompt: 'Si estudias, aprobarás el examen',
                        answer: 'if you study, you will pass the exam',
                        acceptAlternatives: ['if you study you will pass the exam', 'if you study, you will pass the exam.']
                    }
                ]
            },
            {
                id: 'b1_gram_present_perfect',
                title: 'Presente Perfecto',
                description: 'Have/Has + participio',
                xpReward: 30,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Presente perfecto:',
                        word: 'I have worked / She has eaten',
                        translation: 'He trabajado / Ella ha comido',
                        example: 'I have lived here for five years.',
                        exampleTranslation: 'He vivido aquí por cinco años.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Complete: "She ___ never been to Paris"',
                        options: ['has', 'have', 'had', 'is'],
                        correct: 0
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Cuál es el participio de "write"?',
                        options: ['written', 'wrote', 'writed', 'writing'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce:',
                        prompt: 'Ya he terminado mi tarea',
                        answer: 'i have already finished my homework',
                        acceptAlternatives: ["i've already finished my homework", 'i have already finished my homework.']
                    }
                ]
            }
        ],
        phrases: [
            {
                id: 'b1_phrases_opinions',
                title: 'Dar Opiniones',
                description: 'Expresar tu punto de vista',
                xpReward: 25,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Expresar opiniones:',
                        word: 'In my opinion / I believe / I think',
                        translation: 'En mi opinión / Creo / Pienso',
                        example: 'In my opinion, learning English is very important.',
                        exampleTranslation: 'En mi opinión, aprender inglés es muy importante.'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I think technology has changed our lives',
                        translation: 'Pienso que la tecnología ha cambiado nuestras vidas'
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce:',
                        prompt: 'En mi opinión, la educación es fundamental',
                        answer: 'in my opinion, education is fundamental',
                        acceptAlternatives: ['in my opinion education is fundamental', 'in my opinion, education is essential']
                    }
                ]
            }
        ],
        listening: [
            {
                id: 'b1_listen_conversations',
                title: 'Conversaciones',
                description: 'Comprende diálogos complejos',
                xpReward: 30,
                steps: [
                    {
                        type: 'listen_choose',
                        instruction: 'Escucha y selecciona:',
                        audio: "I've been working on this project since last month, and I think we should present it next week.",
                        options: [
                            'The project should be presented next week',
                            'The project was finished yesterday',
                            'The project has been cancelled',
                            'The project starts next month'
                        ],
                        correct: 0
                    },
                    {
                        type: 'listen_write',
                        instruction: 'Escucha y escribe:',
                        audio: 'Could you please send me the report by Friday?',
                        answer: 'could you please send me the report by friday',
                        acceptAlternatives: ['could you please send me the report by friday?']
                    }
                ]
            }
        ],
        speaking: [
            {
                id: 'b1_speak_describe',
                title: 'Describir Experiencias',
                description: 'Habla sobre experiencias pasadas',
                xpReward: 30,
                steps: [
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'Last year I traveled to Europe and visited three countries',
                        translation: 'El año pasado viajé a Europa y visité tres países'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'The most interesting experience was visiting the museums',
                        translation: 'La experiencia más interesante fue visitar los museos'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I would recommend everyone to try new things',
                        translation: 'Le recomendaría a todos probar cosas nuevas'
                    }
                ]
            }
        ]
    },

    // =================== B2 LESSONS ===================
    B2: {
        vocabulary: [
            {
                id: 'b2_vocab_idioms',
                title: 'Expresiones Idiomáticas',
                description: 'Frases hechas en inglés',
                xpReward: 35,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Expresión idiomática:',
                        word: 'Break the ice',
                        translation: 'Romper el hielo',
                        example: "Let me tell a joke to break the ice.",
                        exampleTranslation: 'Déjame contar un chiste para romper el hielo.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '"It\'s raining cats and dogs" significa:',
                        options: ['Llueve mucho', 'Hay mascotas perdidas', 'Está nublado', 'Hace frío'],
                        correct: 0
                    },
                    {
                        type: 'learn',
                        instruction: 'Otra expresión:',
                        word: 'Piece of cake',
                        translation: 'Pan comido / Muy fácil',
                        example: 'The exam was a piece of cake!',
                        exampleTranslation: '¡El examen fue pan comido!'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: '¿Qué significa "once in a blue moon"?',
                        options: ['Muy raramente', 'Cada noche', 'Todos los días', 'Nunca'],
                        correct: 0
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: "Don't count your chickens before they hatch",
                        translation: 'No vendas la piel del oso antes de cazarlo'
                    }
                ]
            }
        ],
        grammar: [
            {
                id: 'b2_gram_passive',
                title: 'Voz Pasiva',
                description: 'Passive voice en todos los tiempos',
                xpReward: 35,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Voz pasiva:',
                        word: 'Subject + be + past participle',
                        translation: 'Sujeto + ser + participio pasado',
                        example: 'The book was written by Shakespeare.',
                        exampleTranslation: 'El libro fue escrito por Shakespeare.'
                    },
                    {
                        type: 'multiple_choice',
                        instruction: 'Elige la voz pasiva correcta:',
                        options: ['The cake was made by my mother', 'My mother was made the cake', 'The cake made by my mother', 'My mother the cake was made'],
                        correct: 0
                    },
                    {
                        type: 'translate',
                        instruction: 'Pasa a voz pasiva:',
                        prompt: 'Someone stole my wallet (My wallet...)',
                        answer: 'my wallet was stolen',
                        acceptAlternatives: ['my wallet was stolen.', 'my wallet was stolen by someone']
                    },
                    {
                        type: 'build_sentence',
                        instruction: 'Ordena las palabras:',
                        words: ['The', 'new', 'hospital', 'will', 'be', 'built', 'next', 'year'],
                        answer: 'The new hospital will be built next year'
                    }
                ]
            }
        ],
        phrases: [
            {
                id: 'b2_phrases_debate',
                title: 'Debate y Argumentación',
                description: 'Estructuras para argumentar',
                xpReward: 30,
                steps: [
                    {
                        type: 'learn',
                        instruction: 'Expresiones para debatir:',
                        word: 'On the one hand... on the other hand',
                        translation: 'Por un lado... por otro lado',
                        example: 'On the one hand, technology helps us. On the other hand, it can be distracting.',
                        exampleTranslation: 'Por un lado, la tecnología nos ayuda. Por otro lado, puede ser distrayente.'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'I strongly believe that education should be free for everyone',
                        translation: 'Creo firmemente que la educación debería ser gratuita para todos'
                    },
                    {
                        type: 'translate',
                        instruction: 'Traduce:',
                        prompt: 'Sin embargo, hay que considerar los costos',
                        answer: 'however, we need to consider the costs',
                        acceptAlternatives: ['however we need to consider the costs', 'however, the costs need to be considered', 'nevertheless, we need to consider the costs']
                    }
                ]
            }
        ],
        listening: [
            {
                id: 'b2_listen_news',
                title: 'Noticias',
                description: 'Comprende noticias y reportajes',
                xpReward: 35,
                steps: [
                    {
                        type: 'listen_choose',
                        instruction: 'Escucha y responde:',
                        audio: 'According to the latest research, renewable energy sources could provide up to 80 percent of global electricity by 2050.',
                        options: [
                            'Renewable energy could provide 80% of electricity by 2050',
                            'Fossil fuels will be eliminated by 2030',
                            'Solar power is the only solution',
                            'Research shows energy costs will double'
                        ],
                        correct: 0
                    },
                    {
                        type: 'listen_write',
                        instruction: 'Escucha y escribe las palabras clave:',
                        audio: 'The government announced a new policy to reduce carbon emissions',
                        answer: 'the government announced a new policy to reduce carbon emissions',
                        acceptAlternatives: ['the government announced a new policy to reduce carbon emissions.']
                    }
                ]
            }
        ],
        speaking: [
            {
                id: 'b2_speak_present',
                title: 'Presentaciones',
                description: 'Habla como un profesional',
                xpReward: 35,
                steps: [
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: "Good morning everyone, I'd like to present our quarterly results",
                        translation: 'Buenos días a todos, me gustaría presentar nuestros resultados trimestrales'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'As you can see from the chart, our revenue has increased significantly',
                        translation: 'Como pueden ver en el gráfico, nuestros ingresos han aumentado significativamente'
                    },
                    {
                        type: 'speak',
                        instruction: 'Pronuncia:',
                        phrase: 'In conclusion, I would like to emphasize the importance of teamwork',
                        translation: 'En conclusión, me gustaría enfatizar la importancia del trabajo en equipo'
                    }
                ]
            }
        ]
    }
};

// Practice phrases for the voice practice section, organized by level
const PRACTICE_PHRASES = {
    A1: [
        { en: 'Hello, how are you?', es: 'Hola, ¿cómo estás?' },
        { en: 'My name is Maria.', es: 'Mi nombre es María.' },
        { en: 'I am from Mexico.', es: 'Soy de México.' },
        { en: 'Nice to meet you.', es: 'Encantado de conocerte.' },
        { en: 'Good morning!', es: '¡Buenos días!' },
        { en: 'Thank you very much.', es: 'Muchas gracias.' },
        { en: 'What is your name?', es: '¿Cuál es tu nombre?' },
        { en: 'I like to read books.', es: 'Me gusta leer libros.' },
        { en: 'The weather is nice today.', es: 'El clima está lindo hoy.' },
        { en: 'I have two brothers.', es: 'Tengo dos hermanos.' }
    ],
    A2: [
        { en: 'I usually go to work by bus.', es: 'Usualmente voy al trabajo en bus.' },
        { en: 'She is studying for her exam.', es: 'Ella está estudiando para su examen.' },
        { en: 'We went to the beach last weekend.', es: 'Fuimos a la playa el fin de semana pasado.' },
        { en: 'Can you help me with this?', es: '¿Puedes ayudarme con esto?' },
        { en: 'I would like a cup of coffee, please.', es: 'Me gustaría una taza de café, por favor.' },
        { en: 'How much does this cost?', es: '¿Cuánto cuesta esto?' },
        { en: 'I need to go to the supermarket.', es: 'Necesito ir al supermercado.' },
        { en: 'She cooked dinner for the family.', es: 'Ella cocinó la cena para la familia.' }
    ],
    B1: [
        { en: 'If I had more time, I would learn another language.', es: 'Si tuviera más tiempo, aprendería otro idioma.' },
        { en: 'I have been working here for three years.', es: 'He estado trabajando aquí por tres años.' },
        { en: 'She suggested that we should go to the cinema.', es: 'Ella sugirió que deberíamos ir al cine.' },
        { en: 'The meeting has been postponed until next week.', es: 'La reunión ha sido pospuesta hasta la próxima semana.' },
        { en: 'I think technology has changed the way we communicate.', es: 'Pienso que la tecnología ha cambiado la forma en que nos comunicamos.' },
        { en: 'Could you tell me where the nearest pharmacy is?', es: '¿Podrías decirme dónde está la farmacia más cercana?' }
    ],
    B2: [
        { en: 'Had I known about the problem earlier, I would have acted differently.', es: 'Si hubiera sabido del problema antes, habría actuado diferente.' },
        { en: 'The research suggests that climate change is accelerating faster than expected.', es: 'La investigación sugiere que el cambio climático se está acelerando más rápido de lo esperado.' },
        { en: 'Nevertheless, we must take into account the economic implications of this decision.', es: 'Sin embargo, debemos tener en cuenta las implicaciones económicas de esta decisión.' },
        { en: 'I strongly believe that investing in education is crucial for the future.', es: 'Creo firmemente que invertir en educación es crucial para el futuro.' },
        { en: 'The government has implemented several measures to address the housing crisis.', es: 'El gobierno ha implementado varias medidas para abordar la crisis habitacional.' }
    ]
};
