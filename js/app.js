/**
 * FreeEnglish - Main Application
 * Handles all UI interactions, screen navigation, and lesson flow
 * v2.0 - AI-powered dynamic lesson generation
 */

const App = {
    currentScreen: 'splash-screen',
    assessmentAnswers: [],
    currentAssessmentIndex: 0,
    currentLesson: null,
    currentStep: 0,
    lessonXP: 0,
    lessonCorrect: 0,
    lessonTotal: 0,
    lessonStartTime: null,
    selectedOption: null,
    practicePhrases: [],
    practiceIndex: 0,
    isAIMode: false,
    currentWeakness: null,

    // ========== INITIALIZATION ==========
    async init() {
        Speech.init();
        await LLMEngine.init();
        this.isAIMode = LLMEngine.isReady();

        // Check if user exists
        const userData = Storage.getUserData();

        // Show splash screen for 2 seconds then decide where to go
        setTimeout(() => {
            if (userData && userData.assessmentDone) {
                Storage.updateStreak();
                // If no AI available, prompt for API key
                if (!LLMEngine.isReady()) {
                    this.showApiKeyModal();
                }
                this.showScreen('dashboard-screen');
                this.renderDashboard();
            } else if (userData) {
                this.showScreen('assessment-screen');
                this.startAssessment();
            } else {
                this.showScreen('onboarding-screen');
            }
        }, 2000);

        this.bindEvents();
    },

    // ========== EVENT BINDING ==========
    bindEvents() {
        // Onboarding
        document.getElementById('btn-start-assessment').addEventListener('click', () => {
            const name = document.getElementById('user-name').value.trim();
            Storage.createUser(name || 'Estudiante');
            this.showScreen('assessment-screen');
            this.startAssessment();
        });

        // Assessment result
        document.getElementById('btn-start-learning').addEventListener('click', () => {
            // If AI mode is available, generate first AI lesson immediately
            if (LLMEngine.isReady()) {
                this.generateAndStartAILesson();
            } else {
                // Show dashboard and prompt for API key
                this.showScreen('dashboard-screen');
                this.renderDashboard();
                this.showApiKeyModal();
            }
        });

        // Dashboard navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.handleNavigation(tab);
            });
        });

        // Settings
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.showScreen('settings-screen');
            this.renderSettings();
        });

        document.getElementById('btn-back-settings').addEventListener('click', () => {
            this.saveSettings();
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        });

        document.getElementById('btn-reset-progress').addEventListener('click', () => {
            if (confirm('¿Estás seguro? Se perderá todo tu progreso.')) {
                Storage.resetAll();
                location.reload();
            }
        });

        document.getElementById('btn-retake-assessment').addEventListener('click', () => {
            const userData = Storage.getUserData();
            if (userData) {
                userData.assessmentDone = false;
                Storage.setUserData(userData);
            }
            this.showScreen('assessment-screen');
            this.startAssessment();
        });

        // Lesson
        document.getElementById('btn-back-lesson').addEventListener('click', () => {
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        });

        document.getElementById('btn-check-answer').addEventListener('click', () => {
            this.checkAnswer();
        });

        document.getElementById('btn-next-step').addEventListener('click', () => {
            this.nextStep();
        });

        // Feedback continue button (inside the feedback overlay)
        document.getElementById('btn-feedback-continue').addEventListener('click', () => {
            this.nextStep();
        });

        // Lesson complete - AI dynamic flow
        document.getElementById('btn-next-lesson').addEventListener('click', () => {
            if (this.isAIMode) {
                // Generate post-lesson assessment
                this.startPostLessonAssessment();
            } else {
                const recommended = AIEngine.getRecommendedLesson(Storage.getUserData().level);
                if (recommended) {
                    this.startLesson(recommended.lesson, recommended.category);
                } else {
                    this.showScreen('dashboard-screen');
                    this.renderDashboard();
                }
            }
        });

        document.getElementById('btn-back-dashboard').addEventListener('click', () => {
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        });

        // Practice
        document.getElementById('btn-back-practice').addEventListener('click', () => {
            Speech.stop();
            Speech.stopRecognition();
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        });

        document.getElementById('btn-play-audio').addEventListener('click', () => {
            const text = document.getElementById('prompt-english').textContent;
            const settings = Storage.getSettings();
            Speech.speak(text, settings.speechRate);
        });

        document.getElementById('btn-record').addEventListener('click', () => {
            this.toggleRecording();
        });

        document.getElementById('btn-next-practice').addEventListener('click', () => {
            this.nextPracticePhrase();
        });

        // Progress back
        document.getElementById('btn-back-progress').addEventListener('click', () => {
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        });

        // Level indicator click
        document.querySelector('.level-indicator')?.addEventListener('click', () => {
            this.showScreen('progress-screen');
            this.renderProgress();
        });

        // API Key Modal
        document.getElementById('btn-save-api-key')?.addEventListener('click', () => {
            const key = document.getElementById('modal-api-key-input').value.trim();
            if (key.length > 10) {
                LLMEngine.setApiKey(key);
                this.isAIMode = true;
                document.getElementById('api-key-modal').classList.add('hidden');
                this.showToast('✅', '¡IA configurada! Las lecciones serán generadas dinámicamente.');
                this.renderDashboard();
            } else {
                this.showToast('⚠️', 'La clave API parece inválida');
            }
        });

        document.getElementById('btn-skip-api-key')?.addEventListener('click', () => {
            document.getElementById('api-key-modal').classList.add('hidden');
            this.isAIMode = false;
            this.showScreen('dashboard-screen');
            this.renderDashboard();
        });
    },

    // ========== SCREEN MANAGEMENT ==========
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
            screen.scrollTop = 0;
        }
    },

    handleNavigation(tab) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');

        switch (tab) {
            case 'home':
                this.showScreen('dashboard-screen');
                this.renderDashboard();
                break;
            case 'lessons':
                // Show categories in dashboard then scroll
                this.showScreen('dashboard-screen');
                this.renderDashboard();
                document.querySelector('.lesson-categories')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'practice':
                this.showScreen('practice-screen');
                this.initPractice();
                break;
            case 'progress':
                this.showScreen('progress-screen');
                this.renderProgress();
                break;
        }
    },

    // ========== ASSESSMENT ==========
    async startAssessment() {
        this.assessmentAnswers = [];
        this.currentAssessmentIndex = 0;
        
        // Show loading if in AI mode
        if (this.isAIMode) {
            this.showAILoading('Preparando evaluación con IA...', 'Estamos creando un test de 12 preguntas de diferentes niveles');
            try {
                this.generatedAssessment = await LLMEngine.generateInitialAssessment();
                this.hideAILoading();
            } catch (error) {
                console.error('AI Assessment generation failed:', error);
                this.hideAILoading();
                this.showToast('⚠️', 'Error con IA, generando test estándar');
                this.generatedAssessment = QuestionGenerator.generateAssessment(5);
            }
        } else {
            // Generate unique assessment questions each time
            this.generatedAssessment = QuestionGenerator.generateAssessment(5);
        }
        
        this.renderAssessmentQuestion();
    },

    renderAssessmentQuestion() {
        const questions = this.generatedAssessment;
        const question = questions[this.currentAssessmentIndex];
        if (!question) {
            this.finishAssessmentFlow();
            return;
        }

        const total = questions.length;
        const current = this.currentAssessmentIndex + 1;

        document.getElementById('assessment-progress-fill').style.width =
            `${(current / total) * 100}%`;
        document.getElementById('assessment-counter').textContent = `${current}/${total}`;
        document.getElementById('assessment-level-badge').textContent = question.level;

        const questionArea = document.getElementById('assessment-question-area');
        questionArea.innerHTML = `
            <span class="question-type">Pregunta ${current}</span>
            <p class="question-text">${question.question}</p>
            ${question.context ? `<p class="question-context">${question.context}</p>` : ''}
        `;

        // Shuffle options so correct answer is in a random position
        const shuffled = this.shuffleOptions(question.options, question.correct);

        const optionsArea = document.getElementById('assessment-options');
        optionsArea.innerHTML = shuffled.options.map((opt, i) => `
            <button class="option-btn" data-index="${i}" id="assessment-opt-${i}">${opt}</button>
        `).join('');

        // Bind option clicks with shuffled correct index
        const correctIndex = shuffled.correctIndex;
        optionsArea.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAssessmentAnswer(parseInt(e.target.dataset.index), question, correctIndex);
            });
        });
    },

    handleAssessmentAnswer(selectedIndex, question, correctIndex) {
        const correct = selectedIndex === correctIndex;
        const buttons = document.querySelectorAll('#assessment-options .option-btn');

        buttons.forEach(btn => {
            btn.disabled = true;
            const idx = parseInt(btn.dataset.index);
            if (idx === correctIndex) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex && !correct) {
                btn.classList.add('incorrect');
            }
        });

        this.assessmentAnswers.push({
            level: question.level,
            correct,
            questionType: question.questionType || (question.question.includes('Complete') ? 'grammar' : 'meaning')
        });

        setTimeout(() => {
            this.currentAssessmentIndex++;
            this.renderAssessmentQuestion();
        }, 1000);
    },

    finishAssessment() {
        let result;
        if (this.isAIMode && this.generatedAssessment.length > 5) {
            // AI Based Leveling
            const finalLevel = LLMEngine.calculateLevelFromAssessment(this.assessmentAnswers);
            const correctCount = this.assessmentAnswers.filter(a => a.correct).length;
            const accuracy = Math.round((correctCount / this.assessmentAnswers.length) * 100);
            
            result = {
                level: finalLevel,
                accuracy: accuracy,
                totalCorrect: correctCount,
                description: `Basado en tu desempeño con la IA, tu nivel estimado es ${finalLevel}.`
            };
        } else {
            result = AIEngine.evaluateLevel(this.assessmentAnswers);
        }

        // Analyze weaknesses for AI lesson generation
        const weakness = LLMEngine.analyzeWeaknesses(this.assessmentAnswers, result.level);
        this.currentWeakness = weakness;
        Storage.saveWeaknessAnalysis(weakness);

        // Save to user data
        const userData = Storage.getUserData();
        userData.level = result.level;
        userData.assessmentDone = true;
        Storage.setUserData(userData);
        Storage.updateStreak();

        this.showScreen('result-screen');
        this.renderResult(result);
    },

    renderResult(result) {
        // Animate the ring
        setTimeout(() => {
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (result.accuracy / 100) * circumference;
            document.getElementById('result-ring-fill').style.strokeDashoffset = offset;
        }, 500);

        document.getElementById('result-level').textContent = result.level;
        document.getElementById('result-percent').textContent = `${result.accuracy}%`;
        document.getElementById('result-description').textContent = result.description;
        document.getElementById('stat-correct').textContent = result.totalCorrect;
        document.getElementById('stat-accuracy').textContent = `${result.accuracy}%`;
        document.getElementById('stat-level').textContent = result.level;
    },

    // ========== DASHBOARD ==========
    renderDashboard() {
        const userData = Storage.getUserData();
        if (!userData) return;

        // Greeting
        const hour = new Date().getHours();
        let greeting = 'Buenas noches';
        if (hour < 12) greeting = 'Buenos días';
        else if (hour < 18) greeting = 'Buenas tardes';
        document.getElementById('greeting-text').textContent = `${greeting}, ${userData.name}`;

        // Streak
        document.getElementById('streak-count').textContent = userData.streak;

        // Level
        document.getElementById('header-level').querySelector('.level-text').textContent = userData.level;

        // Daily progress
        const daily = Storage.getDailyData();
        const settings = Storage.getSettings();
        const dailyGoal = settings.dailyGoal;

        document.querySelector('#daily-xp .xp-value').textContent = daily.xp;
        document.querySelector('#daily-xp .xp-target').textContent = dailyGoal;
        document.getElementById('daily-progress-fill').style.width =
            `${Math.min(100, (daily.xp / dailyGoal) * 100)}%`;
        document.getElementById('lessons-today').textContent = daily.lessonsCompleted;
        document.getElementById('accuracy-today').textContent =
            daily.totalAnswers > 0 ? `${Math.round((daily.correctAnswers / daily.totalAnswers) * 100)}%` : '0%';
        document.getElementById('time-today').textContent = Math.round(daily.timeSpentSeconds / 60);

        // Categories
        this.renderCategories(userData.level);

        // Recommended lesson
        this.renderRecommended(userData.level);

        // Activity
        this.renderActivity();

        // Set nav active
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.getElementById('nav-home')?.classList.add('active');
    },

    renderCategories(level) {
        const grid = document.getElementById('categories-grid');
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentLevelIndex = levels.indexOf(level);
        
        // Header for curriculum
        const sectionTitle = document.querySelector('.section-header h3');
        if (sectionTitle) sectionTitle.textContent = 'Tu Plan de Estudios (CEFR)';

        const completedTopics = Storage.getCompletedTopics(level);
        const totalTopics = CURRICULUM[level]?.length || 0;
        const progressPercent = Math.round((completedTopics.length / totalTopics) * 100) || 0;

        grid.innerHTML = `
            <div class="curriculum-container" style="grid-column: 1 / -1; width: 100%;">
                <div class="level-progress-bar-container" style="margin-bottom: 20px; background: var(--bg-secondary); padding: 15px; border-radius: 12px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: 600;">Progreso nivel ${level}</span>
                        <span style="color: var(--accent-primary); font-weight: bold;">${progressPercent}%</span>
                    </div>
                    <div class="progress-track" style="height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${progressPercent}%; height: 100%; background: var(--accent-primary); transition: width 0.5s ease;"></div>
                    </div>
                    ${progressPercent >= 100 ? `<p style="margin-top: 10px; font-size: 13px; color: #4ade80;">✨ ¡Nivel completado! Sigue practicando para subir al siguiente.</p>` : ''}
                </div>
                
                <div class="topics-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                    ${CURRICULUM[level].map((topic, index) => {
                        const isCompleted = completedTopics.includes(topic.id);
                        return `
                            <div class="category-card curriculum-card ${isCompleted ? 'completed' : ''}" 
                                 data-topic-id="${topic.id}" 
                                 style="border-left: 4px solid ${isCompleted ? '#4ade80' : 'var(--accent-primary)'}; opacity: ${isCompleted ? '0.8' : '1'};">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <div class="category-name" style="font-size: 15px; margin-bottom: 4px;">${topic.title}</div>
                                        <div class="category-count" style="font-size: 12px; opacity: 0.7;">${topic.focus.toUpperCase()}</div>
                                    </div>
                                    <div class="topic-status-icon">${isCompleted ? '✅' : '📖'}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        grid.querySelectorAll('.curriculum-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const topicId = e.currentTarget.dataset.topicId;
                const topic = CURRICULUM[level].find(t => t.id === topicId);
                this.generateAndStartAILesson([topic.focus], topic);
            });
        });
    },

    showCategoryLessons(categoryId) {
        const userData = Storage.getUserData();
        const lessons = LESSONS_DB[userData.level]?.[categoryId] || [];
        const category = CATEGORIES.find(c => c.id === categoryId);

        if (lessons.length === 0) {
            this.showToast('📚', 'No hay lecciones disponibles en esta categoría');
            return;
        }

        // Find first incomplete lesson, or first lesson
        const lessonProgress = Storage.getLessonProgress();
        let targetLesson = lessons.find(l => !lessonProgress[l.id] || lessonProgress[l.id].completedCount === 0);
        if (!targetLesson) targetLesson = lessons[0];

        this.startLesson(targetLesson, categoryId);
    },

    renderRecommended(level) {
        const container = document.getElementById('recommended-lesson');
        const completedTopics = Storage.getCompletedTopics(level);
        const allTopics = CURRICULUM[level];
        const nextTopic = allTopics.find(t => !completedTopics.includes(t.id)) || allTopics[0];

        if (LLMEngine.isReady()) {
            container.innerHTML = `
                <span class="recommended-badge">🤖 Próximo Paso</span>
                <h4 class="recommended-title">Continúa con: ${nextTopic.title}</h4>
                <p class="recommended-desc">Basado en tu plan de estudios de nivel ${level}</p>
                <div class="recommended-meta" style="margin-top: 12px;">
                    <span>⭐ ~25 XP</span>
                    <span>📝 5 ejercicios</span>
                    <span>🎯 Enfoque: ${nextTopic.focus.toUpperCase()}</span>
                </div>
            `;

            container.onclick = () => {
                this.generateAndStartAILesson([nextTopic.focus], nextTopic);
            };
        } else {
            // Fallback to static
            const recommended = AIEngine.getRecommendedLesson(level);
            if (!recommended) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">🎉</span>
                        <p>¡Has completado todas las lecciones de este nivel!</p>
                    </div>
                `;
                return;
            }

            const cat = CATEGORIES.find(c => c.id === recommended.category);
            container.innerHTML = `
                <span class="recommended-badge">${recommended.reason}</span>
                <h4 class="recommended-title">${cat?.emoji || '📚'} ${recommended.lesson.title}</h4>
                <p class="recommended-desc">${recommended.lesson.description}</p>
                <div class="recommended-meta">
                    <span>⭐ ${recommended.lesson.xpReward} XP</span>
                    <span>📝 ${recommended.lesson.steps.length} ejercicios</span>
                    <span>${recommended.isNew ? '🆕 Nueva' : '🔄 Repaso'}</span>
                </div>
            `;

            container.onclick = () => {
                this.startLesson(recommended.lesson, recommended.category);
            };
        }
    },

    renderActivity() {
        const history = Storage.getProgressHistory();
        const list = document.getElementById('activity-list');

        if (history.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>Completa tu primera lección para ver tu actividad</p>
                </div>
            `;
            return;
        }

        const recent = history.slice(-5).reverse();
        list.innerHTML = recent.map(item => {
            const catIcon = {
                vocabulary: 'vocab',
                grammar: 'grammar',
                listening: 'listening',
                speaking: 'speaking',
                phrases: 'vocab',
                reading: 'grammar'
            };

            const timeAgo = this.timeAgo(new Date(item.timestamp));

            return `
                <div class="activity-item">
                    <div class="activity-icon ${catIcon[item.category] || 'vocab'}">
                        ${CATEGORIES.find(c => c.id === item.category)?.emoji || '📚'}
                    </div>
                    <div class="activity-info">
                        <div class="activity-name">${item.lessonTitle || 'Lección'}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                    <div class="activity-xp">+${item.xp} XP</div>
                </div>
            `;
        }).join('');
    },

    // ========== LESSON FLOW ==========
    startLesson(lesson, category) {
        // Create a copy of the lesson with dynamically generated steps
        const userData = Storage.getUserData();
        const level = userData?.level || 'A1';

        // Generate dynamic steps and mix with some original steps
        const dynamicSteps = QuestionGenerator.generateLessonSteps(level, category, 4);
        const originalSteps = [...lesson.steps];

        // Mix: take first 2 original steps (usually "learn" intro) + dynamic exercises
        const mixedSteps = [];
        let origIdx = 0;

        // Start with a learn step from original if available
        for (let i = 0; i < originalSteps.length && origIdx < 2; i++) {
            if (originalSteps[i].type === 'learn') {
                mixedSteps.push(originalSteps[i]);
                origIdx++;
            }
        }

        // Add dynamic steps
        for (const step of dynamicSteps) {
            if (step.type !== 'learn') {
                mixedSteps.push(step);
            }
        }

        // If we have less than 5 steps, add more from originals
        for (const step of originalSteps) {
            if (mixedSteps.length >= 6) break;
            if (!mixedSteps.includes(step)) {
                mixedSteps.push(step);
            }
        }

        this.currentLesson = { ...lesson, steps: mixedSteps };
        this.currentStep = 0;
        this.lessonXP = 0;
        this.lessonCorrect = 0;
        this.lessonTotal = 0;
        this.lessonStartTime = Date.now();
        this.selectedOption = null;
        this.currentCategory = category;

        this.showScreen('lesson-screen');
        this.renderLessonStep();
    },

    renderLessonStep() {
        const step = this.currentLesson.steps[this.currentStep];
        if (!step) {
            this.completeLesson();
            return;
        }

        const total = this.currentLesson.steps.length;
        const current = this.currentStep + 1;

        document.getElementById('lesson-progress-fill').style.width =
            `${(current / total) * 100}%`;
        document.getElementById('lesson-step-counter').textContent = `${current}/${total}`;
        document.getElementById('lesson-xp-value').textContent = this.lessonXP;

        const content = document.getElementById('lesson-content');
        const btnCheck = document.getElementById('btn-check-answer');
        const btnNext = document.getElementById('btn-next-step');
        const feedback = document.getElementById('lesson-feedback');

        btnCheck.classList.remove('hidden');
        btnNext.classList.add('hidden');
        feedback.classList.add('hidden');
        this.selectedOption = null;

        switch (step.type) {
            case 'learn':
                this.renderLearnStep(content, step);
                btnCheck.classList.add('hidden');
                btnNext.classList.remove('hidden');
                break;
            case 'multiple_choice':
                this.renderMultipleChoiceStep(content, step);
                break;
            case 'translate':
                this.renderTranslateStep(content, step);
                break;
            case 'speak':
                this.renderSpeakStep(content, step);
                break;
            case 'listen_choose':
                this.renderListenChooseStep(content, step);
                break;
            case 'listen_write':
                this.renderListenWriteStep(content, step);
                break;
            case 'build_sentence':
                this.renderBuildSentenceStep(content, step);
                break;
            default:
                this.renderLearnStep(content, step);
                btnCheck.classList.add('hidden');
                btnNext.classList.remove('hidden');
        }
    },

    renderLearnStep(container, step) {
        const settings = Storage.getSettings();
        container.innerHTML = `
            <div class="lesson-type-badge">📖 Aprender</div>
            <p class="lesson-instruction">${step.instruction}</p>
            <div class="lesson-example">
                <div class="example-english">
                    <span>${step.word}</span>
                    <button class="example-audio-btn" id="btn-learn-audio" aria-label="Escuchar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
                    </button>
                </div>
                <div class="example-spanish">${step.translation}</div>
            </div>
            ${step.example ? `
                <div class="lesson-example" style="border-left: 3px solid var(--accent-tertiary);">
                    <div class="example-english">
                        <span style="font-size: 16px;">"${step.example}"</span>
                        <button class="example-audio-btn" id="btn-example-audio" aria-label="Escuchar ejemplo">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
                        </button>
                    </div>
                    <div class="example-spanish">${step.exampleTranslation}</div>
                </div>
            ` : ''}
        `;

        // Audio buttons
        document.getElementById('btn-learn-audio')?.addEventListener('click', () => {
            Speech.speak(step.word, settings.speechRate);
        });
        document.getElementById('btn-example-audio')?.addEventListener('click', () => {
            Speech.speak(step.example, settings.speechRate);
        });

        // Auto-play if enabled
        if (settings.autoPlay) {
            setTimeout(() => Speech.speak(step.word, settings.speechRate), 500);
        }

        // Track word
        if (step.word) {
            const words = step.word.split('/').map(w => w.trim());
            words.forEach(w => {
                if (w.length > 1 && !w.includes(',')) {
                    Storage.trackWord(w.toLowerCase(), true);
                }
            });
        }
    },

    renderMultipleChoiceStep(container, step) {
        // Shuffle options
        const shuffled = this.shuffleOptions(step.options, step.correct);
        this._currentShuffledCorrect = shuffled.correctIndex;

        container.innerHTML = `
            <div class="lesson-type-badge">🎯 Selecciona</div>
            <p class="lesson-instruction">${step.instruction}</p>
            <div class="lesson-options" id="lesson-options">
                ${shuffled.options.map((opt, i) => `
                    <button class="lesson-option" data-index="${i}" id="lesson-opt-${i}">${opt}</button>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.lesson-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.lesson-option').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedOption = parseInt(e.target.dataset.index);
            });
        });
    },

    renderTranslateStep(container, step) {
        container.innerHTML = `
            <div class="lesson-type-badge">✍️ Traducir</div>
            <p class="lesson-instruction">${step.instruction}</p>
            <div class="lesson-example">
                <div class="example-english" style="font-size: 18px;">${step.prompt}</div>
            </div>
            <div class="lesson-input-group">
                <label>Tu respuesta en inglés:</label>
                <input type="text" class="lesson-input" id="translate-input" placeholder="Escribe aquí..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            </div>
        `;

        // Focus input
        setTimeout(() => document.getElementById('translate-input')?.focus(), 300);
    },

    renderSpeakStep(container, step) {
        const settings = Storage.getSettings();
        container.innerHTML = `
            <div class="lesson-type-badge">🎤 Pronunciar</div>
            <p class="lesson-instruction">${step.instruction}</p>
            <div class="lesson-example">
                <div class="example-english">
                    <span>${step.phrase}</span>
                    <button class="example-audio-btn" id="btn-speak-audio" aria-label="Escuchar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
                    </button>
                </div>
                <div class="example-spanish">${step.translation}</div>
            </div>
            <div class="voice-visualizer" id="lesson-voice-viz">
                <div class="voice-waves">
                    <div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div>
                </div>
                <p class="voice-status" id="lesson-voice-status">Presiona "Verificar" y habla</p>
            </div>
            <div id="lesson-voice-result" class="voice-result">
                <div class="voice-transcript" id="lesson-voice-transcript"></div>
                <div class="voice-score" id="lesson-voice-score"></div>
            </div>
        `;

        document.getElementById('btn-speak-audio')?.addEventListener('click', () => {
            Speech.speak(step.phrase, settings.speechRate);
        });

        if (settings.autoPlay) {
            setTimeout(() => Speech.speak(step.phrase, settings.speechRate), 500);
        }
    },

    renderListenChooseStep(container, step) {
        const settings = Storage.getSettings();
        // Shuffle options
        const shuffled = this.shuffleOptions(step.options, step.correct);
        this._currentShuffledCorrect = shuffled.correctIndex;

        container.innerHTML = `
            <div class="lesson-type-badge">🎧 Escuchar</div>
            <p class="lesson-instruction">${step.instruction}</p>
            <div style="text-align: center; margin-bottom: 20px;">
                <button class="btn-audio" id="btn-listen-audio" aria-label="Escuchar" style="width: 64px; height: 64px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
                </button>
            </div>
            <div class="lesson-options" id="lesson-options">
                ${shuffled.options.map((opt, i) => `
                    <button class="lesson-option" data-index="${i}" id="lesson-opt-${i}" style="grid-column: span 2;">${opt}</button>
                `).join('')}
            </div>
        `;

        document.getElementById('btn-listen-audio')?.addEventListener('click', () => {
            Speech.speak(step.audio, settings.speechRate);
        });

        // Auto play the audio
        setTimeout(() => Speech.speak(step.audio, settings.speechRate), 500);

        container.querySelectorAll('.lesson-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.lesson-option').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedOption = parseInt(e.target.dataset.index);
            });
        });
    },

    renderListenWriteStep(container, step) {
        const settings = Storage.getSettings();
        container.innerHTML = `
            <div class="lesson-type-badge">🎧✍️ Escuchar y Escribir</div>
            <p class="lesson-instruction">${step.instruction}</p>
            <div style="text-align: center; margin-bottom: 20px;">
                <button class="btn-audio" id="btn-listen-audio" aria-label="Escuchar" style="width: 64px; height: 64px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
                </button>
            </div>
            <div class="lesson-input-group">
                <label>Escribe lo que escuchas:</label>
                <input type="text" class="lesson-input" id="translate-input" placeholder="Escribe aquí..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            </div>
        `;

        document.getElementById('btn-listen-audio')?.addEventListener('click', () => {
            Speech.speak(step.audio, settings.speechRate);
        });

        setTimeout(() => Speech.speak(step.audio, settings.speechRate), 500);
        setTimeout(() => document.getElementById('translate-input')?.focus(), 800);
    },

    renderBuildSentenceStep(container, step) {
        const shuffled = AIEngine.shuffleArray([...step.words]);

        container.innerHTML = `
            <div class="lesson-type-badge">🧩 Ordenar</div>
            <p class="lesson-instruction">${step.instruction}</p>
            <div class="sentence-builder" id="sentence-builder"></div>
            <div class="word-bank" id="word-bank">
                ${shuffled.map((word, i) => `
                    <button class="word-token" data-word="${word}" data-index="${i}" id="word-${i}">${word}</button>
                `).join('')}
            </div>
        `;

        this.selectedWords = [];

        container.querySelectorAll('.word-token').forEach(token => {
            token.addEventListener('click', (e) => {
                const word = e.target.dataset.word;
                if (e.target.classList.contains('used')) {
                    // Remove from builder
                    this.selectedWords = this.selectedWords.filter(w => w !== word);
                    e.target.classList.remove('used');
                } else {
                    this.selectedWords.push(word);
                    e.target.classList.add('used');
                }
                this.updateSentenceBuilder();
            });
        });
    },

    updateSentenceBuilder() {
        const builder = document.getElementById('sentence-builder');
        if (!builder) return;
        builder.innerHTML = this.selectedWords.map(w =>
            `<span class="word-token in-builder">${w}</span>`
        ).join('');
    },

    // ========== CHECK ANSWER ==========
    checkAnswer() {
        const step = this.currentLesson.steps[this.currentStep];
        if (!step) return;

        let correct = false;
        let feedbackMessage = '';

        switch (step.type) {
            case 'multiple_choice':
            case 'listen_choose':
                if (this.selectedOption === null) {
                    this.showToast('⚠️', 'Selecciona una opción');
                    return;
                }
                const shuffledCorrect = this._currentShuffledCorrect;
                correct = this.selectedOption === shuffledCorrect;
                // Find the correct answer text from original options
                feedbackMessage = correct
                    ? '¡Excelente respuesta!'
                    : `La respuesta correcta es: "${step.options[step.correct]}"`;

                // Show correct/incorrect on buttons
                document.querySelectorAll('.lesson-option').forEach(btn => {
                    btn.disabled = true;
                    const idx = parseInt(btn.dataset.index);
                    if (idx === shuffledCorrect) btn.classList.add('correct');
                    else if (idx === this.selectedOption && !correct) btn.classList.add('incorrect');
                });
                break;

            case 'translate':
            case 'listen_write': {
                const input = document.getElementById('translate-input');
                if (!input || !input.value.trim()) {
                    this.showToast('⚠️', 'Escribe tu respuesta');
                    return;
                }
                const userAnswer = input.value.trim().toLowerCase();
                const correctAnswer = step.answer.toLowerCase();
                const alternatives = (step.acceptAlternatives || []).map(a => a.toLowerCase());

                correct = userAnswer === correctAnswer || alternatives.includes(userAnswer);

                // Fuzzy match: also check if very close (1-2 char difference)
                if (!correct) {
                    correct = this.fuzzyMatch(userAnswer, correctAnswer);
                }

                feedbackMessage = correct
                    ? '¡Bien hecho!'
                    : `Respuesta correcta: "${step.answer}"`;

                input.classList.add(correct ? 'correct' : 'incorrect');
                input.disabled = true;
                break;
            }

            case 'speak': {
                // Start speech recognition
                if (!Speech.isRecognitionSupported()) {
                    this.showToast('⚠️', 'Tu navegador no soporta reconocimiento de voz');
                    // Allow to pass anyway
                    correct = true;
                    feedbackMessage = '¡Sigue practicando!';
                    break;
                }

                const viz = document.getElementById('lesson-voice-viz');
                const status = document.getElementById('lesson-voice-status');
                const resultDiv = document.getElementById('lesson-voice-result');
                const btnCheck = document.getElementById('btn-check-answer');

                if (!Speech.isRecording) {
                    viz?.classList.add('recording');
                    status.textContent = 'Escuchando... habla ahora';
                    btnCheck.querySelector('span').textContent = 'Detener';

                    Speech.startRecognition(
                        (transcript, confidence) => {
                            // Final result
                            viz?.classList.remove('recording');
                            status.textContent = 'Resultado:';

                            const comparison = Speech.comparePronunciation(step.phrase, transcript);

                            resultDiv.classList.add('visible');
                            document.getElementById('lesson-voice-transcript').textContent = `"${transcript}"`;
                            document.getElementById('lesson-voice-score').innerHTML = `
                                <span class="score-badge ${comparison.rating}">${comparison.score}% - ${comparison.message}</span>
                            `;

                            correct = comparison.score >= 50;
                            feedbackMessage = comparison.message;

                            this.processAnswer(correct, feedbackMessage);
                            btnCheck.querySelector('span').textContent = 'Verificar';
                        },
                        (interim) => {
                            status.textContent = `"${interim}"`;
                        },
                        () => {
                            viz?.classList.remove('recording');
                            btnCheck.querySelector('span').textContent = 'Verificar';
                        }
                    );
                    return; // Don't process answer yet
                } else {
                    Speech.stopRecognition();
                    return;
                }
            }

            case 'build_sentence': {
                if (!this.selectedWords || this.selectedWords.length === 0) {
                    this.showToast('⚠️', 'Ordena las palabras');
                    return;
                }
                const builtSentence = this.selectedWords.join(' ');
                correct = builtSentence === step.answer;
                feedbackMessage = correct
                    ? '¡Perfecto orden!'
                    : `Orden correcto: "${step.answer}"`;

                const builder = document.getElementById('sentence-builder');
                builder?.classList.add(correct ? 'correct' : 'incorrect');
                break;
            }

            default:
                correct = true;
        }

        this.processAnswer(correct, feedbackMessage);
    },

    processAnswer(correct, feedbackMessage) {
        this.lessonTotal++;
        if (correct) {
            this.lessonCorrect++;
            this.lessonXP += 5;
        }

        Storage.addDailyAnswer(correct);

        // Track words if applicable
        const step = this.currentLesson.steps[this.currentStep];
        if (step.word) {
            Storage.trackWord(step.word.toLowerCase().split('/')[0].trim(), correct);
        }

        // Show feedback with continue button inside it
        this.showLessonFeedback(correct, feedbackMessage);

        // Hide the check button since feedback has its own continue button
        document.getElementById('btn-check-answer').classList.add('hidden');
    },

    showLessonFeedback(correct, message) {
        const feedback = document.getElementById('lesson-feedback');
        const feedbackContent = feedback.querySelector('.feedback-content');
        const icon = document.getElementById('feedback-icon');
        const title = document.getElementById('feedback-title');
        const msg = document.getElementById('feedback-message');

        feedbackContent.className = 'feedback-content ' + (correct ? 'success' : 'error');
        icon.textContent = correct ? '✅' : '❌';
        title.textContent = correct ? '¡Correcto!' : 'Incorrecto';
        msg.textContent = message;

        feedback.classList.remove('hidden');

        // Play a small sound effect via Speech API
        if (correct) {
            // Short positive feedback
        }
    },

    nextStep() {
        this.currentStep++;
        document.getElementById('lesson-feedback').classList.add('hidden');

        if (this.currentStep >= this.currentLesson.steps.length) {
            this.completeLesson();
        } else {
            this.renderLessonStep();
        }
    },

    completeLesson() {
        const timeSpent = Math.round((Date.now() - this.lessonStartTime) / 1000);
        const accuracy = this.lessonTotal > 0
            ? Math.round((this.lessonCorrect / this.lessonTotal) * 100)
            : 100;

        // Bonus XP for high accuracy
        let bonusXP = 0;
        if (accuracy === 100) bonusXP = 10;
        else if (accuracy >= 80) bonusXP = 5;

        const totalXP = this.lessonXP + this.currentLesson.xpReward + bonusXP;

        // Save progress
        Storage.saveLessonResult(this.currentLesson.id, {
            xp: totalXP,
            accuracy,
            timeSpent
        });

        Storage.addXP(totalXP);
        Storage.addDailyLesson();
        Storage.addDailyTime(timeSpent);

        Storage.saveProgressEntry({
            lessonId: this.currentLesson.id,
            lessonTitle: this.currentLesson.title,
            category: this.currentCategory,
            xp: totalXP,
            accuracy,
            timeSpent
        });

        // Mark curriculum topic as completed if applicable
        if (this.currentLesson.topicId) {
            Storage.markTopicCompleted(Storage.getUserData().level, this.currentLesson.topicId);
        }

        // Show complete screen
        this.showScreen('lesson-complete-screen');
        this.renderLessonComplete(totalXP, accuracy, timeSpent);
    },

    renderLessonComplete(xp, accuracy, timeSeconds) {
        document.getElementById('complete-xp').textContent = `+${xp}`;
        document.getElementById('complete-accuracy').textContent = `${accuracy}%`;

        const minutes = Math.floor(timeSeconds / 60);
        const seconds = timeSeconds % 60;
        document.getElementById('complete-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Create confetti
        this.createConfetti();
    },

    createConfetti() {
        const container = document.getElementById('confetti-container');
        container.innerHTML = '';
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
            container.appendChild(confetti);
        }
    },

    // ========== VOICE PRACTICE ==========
    initPractice() {
        const userData = Storage.getUserData();
        if (!userData) return;

        document.getElementById('practice-level').textContent = userData.level;
        this.practicePhrases = AIEngine.getPracticePhrases(userData.level);
        this.practiceIndex = 0;

        this.renderPracticePhrase();
    },

    renderPracticePhrase() {
        if (this.practiceIndex >= this.practicePhrases.length) {
            this.practiceIndex = 0;
            this.practicePhrases = AIEngine.getPracticePhrases(Storage.getUserData().level);
        }

        const phrase = this.practicePhrases[this.practiceIndex];
        document.getElementById('prompt-english').textContent = phrase.en;
        document.getElementById('prompt-spanish').textContent = phrase.es;

        // Reset voice state
        const viz = document.getElementById('voice-visualizer');
        viz?.classList.remove('recording');
        document.getElementById('voice-status').textContent = 'Toca el micrófono para hablar';
        document.getElementById('voice-result').classList.remove('visible');
        document.getElementById('btn-record').classList.remove('recording');
    },

    toggleRecording() {
        const btn = document.getElementById('btn-record');
        const viz = document.getElementById('voice-visualizer');
        const status = document.getElementById('voice-status');
        const resultDiv = document.getElementById('voice-result');

        if (!Speech.isRecognitionSupported()) {
            this.showToast('⚠️', 'Tu navegador no soporta reconocimiento de voz. Usa Chrome para mejor compatibilidad.');
            return;
        }

        if (Speech.isRecording) {
            Speech.stopRecognition();
            btn.classList.remove('recording');
            viz?.classList.remove('recording');
            status.textContent = 'Grabación detenida';
            return;
        }

        btn.classList.add('recording');
        viz?.classList.add('recording');
        status.textContent = 'Escuchando... habla ahora';
        resultDiv.classList.remove('visible');

        const phrase = this.practicePhrases[this.practiceIndex];

        Speech.startRecognition(
            (transcript, confidence) => {
                btn.classList.remove('recording');
                viz?.classList.remove('recording');

                const comparison = Speech.comparePronunciation(phrase.en, transcript);

                resultDiv.classList.add('visible');
                document.getElementById('voice-transcript').textContent = `Tu: "${transcript}"`;
                document.getElementById('voice-score').innerHTML = `
                    <span class="score-badge ${comparison.rating}">${comparison.score}% - ${comparison.message}</span>
                `;
                status.textContent = 'Resultado:';

                // Track XP for practice
                if (comparison.score >= 60) {
                    Storage.addXP(3);
                    Storage.addDailyXP(3);
                }
            },
            (interim) => {
                status.textContent = `"${interim}"`;
            },
            () => {
                btn.classList.remove('recording');
                viz?.classList.remove('recording');
            }
        );
    },

    nextPracticePhrase() {
        Speech.stop();
        Speech.stopRecognition();
        this.practiceIndex++;
        this.renderPracticePhrase();

        // Auto play 
        const settings = Storage.getSettings();
        if (settings.autoPlay) {
            const phrase = this.practicePhrases[this.practiceIndex];
            if (phrase) {
                setTimeout(() => Speech.speak(phrase.en, settings.speechRate), 300);
            }
        }
    },

    // ========== PROGRESS ==========
    renderProgress() {
        const stats = AIEngine.getStudyStats();
        const userData = Storage.getUserData();

        document.getElementById('progress-level').textContent = stats.level;

        // Level progress ring
        const progress = stats.levelProgress;
        const circumference = 2 * Math.PI * 34;
        const offset = circumference - (progress / 100) * circumference;
        setTimeout(() => {
            document.getElementById('level-progress-ring').style.strokeDashoffset = offset;
        }, 300);
        document.getElementById('level-percent').textContent = `${progress}%`;

        // Stats
        document.getElementById('total-lessons').textContent = stats.totalLessons;
        document.getElementById('total-words').textContent = stats.totalWords;
        document.getElementById('max-streak').textContent = stats.maxStreak;
        document.getElementById('total-time').textContent =
            stats.totalTimeMinutes >= 60
                ? `${Math.round(stats.totalTimeMinutes / 60)}h`
                : `${stats.totalTimeMinutes}m`;

        // Weekly chart
        this.renderWeeklyChart();

        // Mastered words
        this.renderMasteredWords();
    },

    renderWeeklyChart() {
        const weekData = Storage.getWeeklyXP();
        const maxXP = Math.max(...weekData.map(d => d.xp), 10);

        const container = document.getElementById('weekly-chart');
        container.innerHTML = weekData.map(d => `
            <div class="chart-bar-container">
                <div class="chart-bar">
                    <div class="chart-bar-fill" style="height: ${(d.xp / maxXP) * 100}%"></div>
                </div>
                <span class="chart-day ${d.isToday ? 'today' : ''}">${d.day}</span>
            </div>
        `).join('');
    },

    renderMasteredWords() {
        const mastered = Storage.getMasteredWords();
        const container = document.getElementById('mastered-words');

        if (mastered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🌱</span>
                    <p>Las palabras que domines aparecerán aquí</p>
                </div>
            `;
            return;
        }

        container.innerHTML = mastered.map(w =>
            `<span class="word-chip">${w.word}</span>`
        ).join('');
    },

    // ========== SETTINGS ==========
    renderSettings() {
        const settings = Storage.getSettings();
        const userData = Storage.getUserData();

        document.getElementById('settings-name').value = userData?.name || '';
        document.getElementById('settings-daily-goal').value = settings.dailyGoal;
        document.getElementById('settings-speech-rate').value = settings.speechRate;
        document.getElementById('settings-autoplay').checked = settings.autoPlay;
        document.getElementById('settings-api-key').value = Storage.getApiKey();
        document.getElementById('settings-ai-mode').textContent = LLMEngine.getModeLabel();
    },

    saveSettings() {
        const name = document.getElementById('settings-name').value.trim();
        const settings = {
            dailyGoal: parseInt(document.getElementById('settings-daily-goal').value),
            speechRate: parseFloat(document.getElementById('settings-speech-rate').value),
            autoPlay: document.getElementById('settings-autoplay').checked
        };

        Storage.saveSettings(settings);

        // Save API key
        const apiKey = document.getElementById('settings-api-key').value.trim();
        LLMEngine.setApiKey(apiKey);
        this.isAIMode = LLMEngine.isReady();

        const userData = Storage.getUserData();
        if (userData && name) {
            userData.name = name;
            Storage.setUserData(userData);
        }

        this.showToast('✅', 'Configuración guardada');
    },

    // ========== UTILITIES ==========
    showToast(icon, message) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-icon').textContent = icon;
        document.getElementById('toast-message').textContent = message;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Hace un momento';
        if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
        return `Hace ${Math.floor(seconds / 86400)} días`;
    },

    fuzzyMatch(str1, str2) {
        if (Math.abs(str1.length - str2.length) > 2) return false;
        let differences = 0;
        const maxLen = Math.max(str1.length, str2.length);
        for (let i = 0; i < maxLen; i++) {
            if (str1[i] !== str2[i]) differences++;
            if (differences > 2) return false;
        }
        return true;
    },

    /**
     * Shuffle options array and track the new position of the correct answer
     * @param {Array} options - Original options array
     * @param {number} correctIndex - Index of correct answer in original array
     * @returns {Object} { options: shuffledArray, correctIndex: newCorrectIndex }
     */
    shuffleOptions(options, correctIndex) {
        const correctAnswer = options[correctIndex];
        const shuffled = [...options];
        // Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const newCorrectIndex = shuffled.indexOf(correctAnswer);
        return { options: shuffled, correctIndex: newCorrectIndex };
    },

    // ========== AI LESSON GENERATION ==========
    showAILoading(title, subtitle) {
        const overlay = document.getElementById('ai-loading-overlay');
        document.getElementById('ai-loading-title').textContent = title || 'Generando tu lección...';
        document.getElementById('ai-loading-subtitle').textContent = subtitle || 'La IA está creando contenido personalizado para ti';
        overlay.classList.remove('hidden');
    },

    hideAILoading() {
        document.getElementById('ai-loading-overlay').classList.add('hidden');
    },

    showApiKeyModal() {
        document.getElementById('api-key-modal').classList.remove('hidden');
    },

    async generateAndStartAILesson(focusAreas, curriculumTopic) {
        const userData = Storage.getUserData();
        if (!userData) return;

        const level = userData.level;
        const weakness = Storage.getWeaknessAnalysis();
        const weakAreas = focusAreas || weakness?.weakAreas || ['vocabulary', 'grammar'];
        const previousTopics = LLMEngine.getPreviousTopics();

        this.showAILoading(
            '🧠 Creando tu lección...',
            curriculumTopic 
                ? `Diseñando ejercicios sobre "${curriculumTopic.title}" (Nivel ${level})`
                : `Analizando tus debilidades y generando ejercicios de nivel ${level}`
        );

        try {
            const lesson = await LLMEngine.generateLesson(level, weakAreas, {
                previousTopics,
                curriculumTopic: curriculumTopic?.title
            });

            // Save topic context if it's from curriculum
            if (curriculumTopic) {
                lesson.topicId = curriculumTopic.id;
            }

            // Save context
            LLMEngine.saveLessonContext(lesson);

            this.hideAILoading();

            // Determine the primary category
            const primaryCategory = focusAreas?.[0] || curriculumTopic?.focus || 'vocabulary';
            this.startLesson(lesson, primaryCategory);

        } catch (error) {
            console.error('AI Lesson generation failed:', error);
            this.hideAILoading();

            // Fallback to static lessons
            this.showToast('⚠️', error.message || 'Error generando lección con IA.');
            const recommended = AIEngine.getRecommendedLesson(level);
            if (recommended) {
                this.startLesson(recommended.lesson, recommended.category);
            } else {
                this.showScreen('dashboard-screen');
                this.renderDashboard();
            }
        }
    },

    /**
     * Start a post-lesson assessment generated by AI
     */
    async startPostLessonAssessment() {
        if (!this.currentLesson || !LLMEngine.isReady()) {
            this.showScreen('dashboard-screen');
            this.renderDashboard();
            return;
        }

        const userData = Storage.getUserData();
        const level = userData.level;

        this.showAILoading(
            '📝 Preparando evaluación...',
            'Creando preguntas basadas en lo que acabas de aprender'
        );

        try {
            const questions = await LLMEngine.generatePostAssessment(this.currentLesson, level);

            this.hideAILoading();

            // Start the assessment with AI-generated questions
            this.assessmentAnswers = [];
            this.currentAssessmentIndex = 0;
            this.generatedAssessment = questions;
            this._isPostLessonAssessment = true;

            this.showScreen('assessment-screen');
            this.renderAssessmentQuestion();

        } catch (error) {
            console.error('Post-assessment generation failed:', error);
            this.hideAILoading();
            this.showToast('⚠️', 'Error generando evaluación. Generando nueva lección...');
            this.generateAndStartAILesson();
        }
    },

    finishAssessmentFlow() {
        if (this._isPostLessonAssessment) {
            this._isPostLessonAssessment = false;

            // Analyze the post-lesson assessment
            const result = AIEngine.evaluateLevel(this.assessmentAnswers);
            const weakness = LLMEngine.analyzeWeaknesses(this.assessmentAnswers, result.level);
            this.currentWeakness = weakness;
            Storage.saveWeaknessAnalysis(weakness);

            // Check if user should level up
            const userData = Storage.getUserData();
            const completedTopics = Storage.getCompletedTopics(userData.level);
            const totalTopics = CURRICULUM[userData.level]?.length || 10;
            const progress = (completedTopics.length / totalTopics);

            // Level up only if 100% curriculum is done AND accuracy is good
            if (progress >= 1.0 && result.accuracy >= 70) {
                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const idx = levels.indexOf(userData.level);
                if (idx < levels.length - 1) {
                    userData.level = levels[idx + 1];
                    Storage.setUserData(userData);
                    result.description = `¡Increíble! Has completado el currículo y avanzado al nivel ${userData.level}.`;
                }
            } else {
                result.description = `Has completado la lección. Progreso de nivel: ${Math.round(progress * 100)}%`;
            }

            // Show brief result, then generate next lesson
            this.showScreen('result-screen');
            this.renderResult(result);

            // Change the "Start Learning" button to generate next AI lesson
            const btn = document.getElementById('btn-start-learning');
            btn.querySelector('span').textContent = 'Continuar Plan';
            btn.onclick = () => {
                this.showScreen('dashboard-screen');
                this.renderDashboard();
            };
        } else {
            this.finishAssessment();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
