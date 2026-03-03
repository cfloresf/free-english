/**
 * FreeEnglish - Storage Module
 * Handles all data persistence via localStorage
 */

const Storage = {
    KEYS: {
        USER_DATA: 'fe_user_data',
        PROGRESS: 'fe_progress',
        LESSONS: 'fe_lessons',
        WORDS: 'fe_words',
        SETTINGS: 'fe_settings',
        DAILY: 'fe_daily'
    },

    // ============ USER DATA ============
    getUserData() {
        const data = localStorage.getItem(this.KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    },

    setUserData(data) {
        localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(data));
    },

    createUser(name) {
        const userData = {
            name: name || 'Estudiante',
            level: 'A1',
            xp: 0,
            levelXp: 0,
            createdAt: new Date().toISOString(),
            streak: 0,
            maxStreak: 0,
            lastActiveDate: new Date().toISOString().split('T')[0],
            assessmentDone: false
        };
        this.setUserData(userData);
        return userData;
    },

    updateLevel(level) {
        const userData = this.getUserData();
        if (userData) {
            userData.level = level;
            this.setUserData(userData);
        }
    },

    addXP(amount) {
        const userData = this.getUserData();
        if (userData) {
            userData.xp += amount;
            userData.levelXp += amount;
            this.setUserData(userData);
            // Also update daily XP
            this.addDailyXP(amount);
        }
        return userData;
    },

    // ============ DAILY TRACKING ============
    getDailyData() {
        const today = new Date().toISOString().split('T')[0];
        const data = localStorage.getItem(this.KEYS.DAILY);
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.date === today) return parsed;
        }
        // New day, reset
        const dailyData = {
            date: today,
            xp: 0,
            lessonsCompleted: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            timeSpentSeconds: 0
        };
        localStorage.setItem(this.KEYS.DAILY, JSON.stringify(dailyData));
        return dailyData;
    },

    addDailyXP(amount) {
        const daily = this.getDailyData();
        daily.xp += amount;
        localStorage.setItem(this.KEYS.DAILY, JSON.stringify(daily));
        return daily;
    },

    addDailyLesson() {
        const daily = this.getDailyData();
        daily.lessonsCompleted += 1;
        localStorage.setItem(this.KEYS.DAILY, JSON.stringify(daily));
        return daily;
    },

    addDailyAnswer(correct) {
        const daily = this.getDailyData();
        daily.totalAnswers += 1;
        if (correct) daily.correctAnswers += 1;
        localStorage.setItem(this.KEYS.DAILY, JSON.stringify(daily));
        return daily;
    },

    addDailyTime(seconds) {
        const daily = this.getDailyData();
        daily.timeSpentSeconds += seconds;
        localStorage.setItem(this.KEYS.DAILY, JSON.stringify(daily));
        return daily;
    },

    // ============ STREAK ============
    updateStreak() {
        const userData = this.getUserData();
        if (!userData) return;

        const today = new Date().toISOString().split('T')[0];
        const lastActive = userData.lastActiveDate;

        if (lastActive === today) return; // Already counted today

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (lastActive === yesterday) {
            userData.streak += 1;
        } else if (lastActive !== today) {
            userData.streak = 1;
        }

        if (userData.streak > userData.maxStreak) {
            userData.maxStreak = userData.streak;
        }

        userData.lastActiveDate = today;
        this.setUserData(userData);
    },

    // ============ LESSON PROGRESS ============
    getLessonProgress() {
        const data = localStorage.getItem(this.KEYS.LESSONS);
        return data ? JSON.parse(data) : {};
    },

    saveLessonResult(lessonId, result) {
        const lessons = this.getLessonProgress();
        if (!lessons[lessonId]) {
            lessons[lessonId] = {
                completedCount: 0,
                bestAccuracy: 0,
                lastCompleted: null,
                totalXP: 0
            };
        }
        lessons[lessonId].completedCount += 1;
        lessons[lessonId].lastCompleted = new Date().toISOString();
        lessons[lessonId].totalXP += result.xp;
        if (result.accuracy > lessons[lessonId].bestAccuracy) {
            lessons[lessonId].bestAccuracy = result.accuracy;
        }
        localStorage.setItem(this.KEYS.LESSONS, JSON.stringify(lessons));
    },

    isLessonCompleted(lessonId) {
        const lessons = this.getLessonProgress();
        return lessons[lessonId] && lessons[lessonId].completedCount > 0;
    },

    // ============ WORD TRACKING (SM-2 Spaced Repetition) ============
    getWords() {
        const data = localStorage.getItem(this.KEYS.WORDS);
        return data ? JSON.parse(data) : {};
    },

    trackWord(word, correct) {
        const words = this.getWords();
        if (!words[word]) {
            words[word] = {
                word: word,
                easeFactor: 2.5,
                interval: 1,
                repetitions: 0,
                nextReview: new Date().toISOString(),
                mastered: false,
                seenCount: 0,
                correctCount: 0
            };
        }

        const w = words[word];
        w.seenCount += 1;

        if (correct) {
            w.correctCount += 1;
            w.repetitions += 1;

            // SM-2 algorithm
            if (w.repetitions === 1) {
                w.interval = 1;
            } else if (w.repetitions === 2) {
                w.interval = 6;
            } else {
                w.interval = Math.round(w.interval * w.easeFactor);
            }

            w.easeFactor = Math.max(1.3, w.easeFactor + 0.1);

            if (w.correctCount >= 5 && w.correctCount / w.seenCount >= 0.8) {
                w.mastered = true;
            }
        } else {
            w.repetitions = 0;
            w.interval = 1;
            w.easeFactor = Math.max(1.3, w.easeFactor - 0.2);
            w.mastered = false;
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + w.interval);
        w.nextReview = nextDate.toISOString();

        words[word] = w;
        localStorage.setItem(this.KEYS.WORDS, JSON.stringify(words));
        return w;
    },

    getMasteredWords() {
        const words = this.getWords();
        return Object.values(words).filter(w => w.mastered);
    },

    getWordsCount() {
        return Object.keys(this.getWords()).length;
    },

    // ============ SETTINGS ============
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
            dailyGoal: 100,
            speechRate: 1,
            autoPlay: true
        };
    },

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    // ============ PROGRESS HISTORY ============
    getProgressHistory() {
        const key = 'fe_history';
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    saveProgressEntry(entry) {
        const key = 'fe_history';
        const history = this.getProgressHistory();
        history.push({
            ...entry,
            timestamp: new Date().toISOString()
        });
        // Keep last 100 entries
        if (history.length > 100) history.shift();
        localStorage.setItem(key, JSON.stringify(history));
    },

    getWeeklyXP() {
        const history = this.getProgressHistory();
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const today = new Date();
        const weekData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayXP = history
                .filter(h => h.timestamp.startsWith(dateStr))
                .reduce((sum, h) => sum + (h.xp || 0), 0);
            weekData.push({
                day: days[date.getDay()],
                xp: dayXP,
                isToday: i === 0
            });
        }

        return weekData;
    },

    getTotalTime() {
        const history = this.getProgressHistory();
        return history.reduce((sum, h) => sum + (h.timeSpent || 0), 0);
    },

    getTotalLessons() {
        const lessons = this.getLessonProgress();
        return Object.values(lessons).reduce((sum, l) => sum + l.completedCount, 0);
    },

    // ============ RESET ============
    resetAll() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('fe_history');
    }
};
