/**
 * FreeEnglish - AI Engine
 * Adaptive learning engine that evaluates level and plans study paths
 * Uses SM-2 spaced repetition + performance-based difficulty adjustment
 */

const AIEngine = {
    /**
     * Evaluate user's level based on assessment results
     * @param {Array} answers - Array of {correct: boolean, level: string}
     * @returns {Object} Level assessment result
     */
    evaluateLevel(answers) {
        const levelScores = { A1: 0, A2: 0, B1: 0, B2: 0 };
        const levelCounts = { A1: 0, A2: 0, B1: 0, B2: 0 };

        answers.forEach(a => {
            levelCounts[a.level]++;
            if (a.correct) levelScores[a.level]++;
        });

        // Calculate percentage per level
        const levelPercentages = {};
        for (const level of Object.keys(levelScores)) {
            levelPercentages[level] = levelCounts[level] > 0
                ? levelScores[level] / levelCounts[level]
                : 0;
        }

        // Determine level: highest level where user scores >= 60%
        let assignedLevel = 'A1';
        const levelOrder = ['A1', 'A2', 'B1', 'B2'];

        for (const level of levelOrder) {
            if (levelPercentages[level] >= 0.6) {
                assignedLevel = level;
            } else {
                break;
            }
        }

        const totalCorrect = answers.filter(a => a.correct).length;
        const accuracy = Math.round((totalCorrect / answers.length) * 100);

        return {
            level: assignedLevel,
            accuracy,
            totalCorrect,
            totalQuestions: answers.length,
            levelPercentages,
            description: this.getLevelDescription(assignedLevel)
        };
    },

    /**
     * Get a description for the assessed level
     */
    getLevelDescription(level) {
        const descriptions = {
            A1: 'Estás comenzando tu viaje. Empezaremos con vocabulario básico, saludos y frases simples. ¡Paso a paso llegarás lejos!',
            A2: 'Tienes una base sólida. Vamos a trabajar en conversaciones cotidianas, gramática básica y ampliar tu vocabulario.',
            B1: '¡Buen nivel! Podemos enfocarnos en estructuras más complejas, expresar opiniones y mejorar tu fluidez.',
            B2: '¡Excelente nivel! Trabajaremos en perfeccionar tu inglés con expresiones idiomáticas, textos complejos y presentaciones profesionales.'
        };
        return descriptions[level] || descriptions.A1;
    },

    /**
     * Get recommended next lesson based on user progress
     * @param {string} level - Current user level
     * @returns {Object} Recommended lesson
     */
    getRecommendedLesson(level) {
        const levelLessons = LESSONS_DB[level];
        if (!levelLessons) return null;

        const lessonProgress = Storage.getLessonProgress();
        const categoryOrder = ['vocabulary', 'grammar', 'phrases', 'listening', 'speaking'];

        // Priority 1: Incomplete lessons in current level
        for (const category of categoryOrder) {
            if (!levelLessons[category]) continue;
            for (const lesson of levelLessons[category]) {
                if (!lessonProgress[lesson.id] || lessonProgress[lesson.id].completedCount === 0) {
                    return {
                        lesson,
                        category,
                        reason: 'Nueva lección disponible',
                        isNew: true
                    };
                }
            }
        }

        // Priority 2: Lessons with low accuracy for review
        for (const category of categoryOrder) {
            if (!levelLessons[category]) continue;
            for (const lesson of levelLessons[category]) {
                const progress = lessonProgress[lesson.id];
                if (progress && progress.bestAccuracy < 80) {
                    return {
                        lesson,
                        category,
                        reason: 'Repaso recomendado',
                        isNew: false
                    };
                }
            }
        }

        // Priority 3: Oldest completed lesson for spaced repetition
        let oldestLesson = null;
        let oldestDate = new Date();

        for (const category of categoryOrder) {
            if (!levelLessons[category]) continue;
            for (const lesson of levelLessons[category]) {
                const progress = lessonProgress[lesson.id];
                if (progress && progress.lastCompleted) {
                    const date = new Date(progress.lastCompleted);
                    if (date < oldestDate) {
                        oldestDate = date;
                        oldestLesson = { lesson, category };
                    }
                }
            }
        }

        if (oldestLesson) {
            return {
                ...oldestLesson,
                reason: 'Hora de repasar',
                isNew: false
            };
        }

        // Fallback: first lesson of first category available
        for (const category of categoryOrder) {
            if (levelLessons[category] && levelLessons[category].length > 0) {
                return {
                    lesson: levelLessons[category][0],
                    category,
                    reason: 'Sugerido para ti',
                    isNew: true
                };
            }
        }

        return null;
    },

    /**
     * Get all lessons for the current level, organized by category
     * @param {string} level - User level
     * @returns {Object} Organized lessons
     */
    getLessonsForLevel(level) {
        return LESSONS_DB[level] || {};
    },

    /**
     * Calculate category progress
     * @param {string} level - User level
     * @param {string} categoryId - Category ID
     * @returns {Object} Progress info
     */
    getCategoryProgress(level, categoryId) {
        const lessons = LESSONS_DB[level]?.[categoryId] || [];
        const lessonProgress = Storage.getLessonProgress();

        let completed = 0;
        let totalXP = 0;

        lessons.forEach(lesson => {
            const progress = lessonProgress[lesson.id];
            if (progress && progress.completedCount > 0) {
                completed++;
                totalXP += progress.totalXP;
            }
        });

        return {
            total: lessons.length,
            completed,
            percentage: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
            totalXP
        };
    },

    /**
     * Check if user should level up
     * @param {Object} userData - Current user data
     * @returns {string|null} New level or null
     */
    checkLevelUp(userData) {
        const levelOrder = ['A1', 'A2', 'B1', 'B2'];
        const currentIndex = levelOrder.indexOf(userData.level);

        if (currentIndex >= levelOrder.length - 1) return null;

        const currentLevel = userData.level;
        const xpNeeded = LEVELS[currentLevel].xpToNext;

        if (userData.levelXp >= xpNeeded) {
            const newLevel = levelOrder[currentIndex + 1];
            // Reset level XP
            userData.levelXp = userData.levelXp - xpNeeded;
            userData.level = newLevel;
            Storage.setUserData(userData);
            return newLevel;
        }

        return null;
    },

    /**
     * Get level progress percentage
     * @param {Object} userData - User data
     * @returns {number} Progress percentage (0-100)
     */
    getLevelProgress(userData) {
        if (!userData) return 0;
        const xpNeeded = LEVELS[userData.level]?.xpToNext || 500;
        return Math.min(100, Math.round((userData.levelXp / xpNeeded) * 100));
    },

    /**
     * Adaptive difficulty: adjust questions based on recent performance
     * @param {number} recentAccuracy - Recent accuracy (0-100)
     * @param {string} currentLevel - Current level
     * @returns {Object} Difficulty adjustment
     */
    adaptDifficulty(recentAccuracy, currentLevel) {
        if (recentAccuracy >= 90) {
            return {
                action: 'increase',
                message: '¡Vas muy bien! Aumentando la dificultad.',
                addTimer: true
            };
        } else if (recentAccuracy >= 70) {
            return {
                action: 'maintain',
                message: 'Buen ritmo. Mantén la práctica.',
                addTimer: false
            };
        } else {
            return {
                action: 'decrease',
                message: 'Vamos a reforzar los conceptos básicos.',
                addTimer: false,
                suggestReview: true
            };
        }
    },

    /**
     * Get practice phrases for voice practice
     * @param {string} level - User level
     * @returns {Array} Shuffled practice phrases
     */
    getPracticePhrases(level) {
        const phrases = PRACTICE_PHRASES[level] || PRACTICE_PHRASES.A1;
        return this.shuffleArray([...phrases]);
    },

    /**
     * Shuffle an array (Fisher-Yates)
     */
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    /**
     * Get study stats summary
     * @returns {Object} Summary stats
     */
    getStudyStats() {
        const userData = Storage.getUserData();
        const words = Storage.getWords();
        const masteredWords = Storage.getMasteredWords();
        const totalLessons = Storage.getTotalLessons();
        const totalTime = Storage.getTotalTime();

        return {
            level: userData?.level || 'A1',
            totalXP: userData?.xp || 0,
            streak: userData?.streak || 0,
            maxStreak: userData?.maxStreak || 0,
            totalWords: Object.keys(words).length,
            masteredWords: masteredWords.length,
            totalLessons,
            totalTimeMinutes: Math.round(totalTime / 60),
            levelProgress: this.getLevelProgress(userData)
        };
    }
};
