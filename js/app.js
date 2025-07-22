(function() {
    const quizApp = {
        quizData: null,
        currentQuestionIndex: 0,
        score: 0,
        elements: {},
        readingTextsMap: new Map(),
        allQuizzes: [],
        savedQuizzes: [],

        init() {
            this.cacheDOMElements();
            this.setupEventListeners();
            this.loadDefaultQuizList();
            this.transitionToScreen('loader-screen');
        },

            cacheDOMElements() {
                const ids = ['loader-screen', 'json-file-input', 'json-text-input', 'loader-error', 'load-quiz-btn', 'welcome-screen', 'welcome-title', 'welcome-description', 'start-btn', 'quiz-screen', 'question-category', 'question-text', 'reading-text-container', 'options-container', 'feedback-text', 'next-btn', 'progress-bar', 'progress-text', 'results-screen', 'score-text', 'score-remark', 'restart-btn', 'load-new-quiz-btn', 'main-header-title', 'hint-overlay', 'close-hint-btn', 'hint-text-content', 'quiz-select', 'quiz-search-input', 'home-btn'];
                ids.forEach(id => {
                    this.elements[id.replace(/-(\w)/g, (m, l) => l.toUpperCase())] = document.getElementById(id);
                });
            },

            setupEventListeners() {
                this.elements.loadQuizBtn.addEventListener('click', () => this.handleLoadRequest());
                this.elements.startBtn.addEventListener('click', () => this.startQuiz());
                this.elements.restartBtn.addEventListener('click', () => this.startQuiz());
                this.elements.loadNewQuizBtn.addEventListener('click', () => this.resetToLoader());
                this.elements.nextBtn.addEventListener('click', () => this.showNextQuestion());
                this.elements.closeHintBtn.addEventListener('click', () => this.hideHint());
                this.elements.hintOverlay.addEventListener('click', e => {
                    if (e.target === this.elements.hintOverlay) this.hideHint();
                });
                this.elements.quizSearchInput.addEventListener('input', () => this.filterQuizOptions());
                this.elements.homeBtn.addEventListener('click', () => this.resetToLoader());
            },
            
            handleLoadRequest() {
                const file = this.elements.jsonFileInput.files[0];
                const text = this.elements.jsonTextInput.value;
                const selectedId = this.elements.quizSelect.value;
                this.elements.loaderError.textContent = '';

                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.saveQuizToLocal(e.target.result);
                        this.processQuizJSON(e.target.result);
                    };
                    reader.onerror = () => this.showLoaderError('Fehler beim Lesen der Datei.');
                    reader.readAsText(file);
                } else if (text.trim()) {
                    this.saveQuizToLocal(text);
                    this.processQuizJSON(text);
                } else if (selectedId) {
                    const selected = this.allQuizzes.find(q => q.id === selectedId);
                    if (selected) {
                        if (selected.source === 'quiz') {
                            this.loadQuizFromFile(selected.file);
                        } else if (selected.source === 'local') {
                            this.processQuizJSON(selected.data);
                        }
                    }
                } else {
                    this.showLoaderError('Bitte eine Datei auswählen, JSON-Text einfügen oder ein Quiz auswählen.');
                }
            },

            async loadQuizFromFile(filename) {
                try {
                    const data = await fetch('quiz/' + filename).then(r => r.json());
                    this.processQuizJSON(data);
                } catch (err) {
                    this.showLoaderError('Konnte Quiz nicht laden.');
                }
            },

            async loadDefaultQuizList() {
                try {
                    const files = await fetch('quiz/index.json').then(r => r.json());
                    this.allQuizzes = [];
                    for (const f of files) {
                        const data = await fetch('quiz/' + f).then(r => r.json());
                        this.allQuizzes.push({ id: `quiz:${f}`, source: 'quiz', file: f, title: data.title });
                    }
                    const saved = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
                    this.savedQuizzes = saved;
                    saved.forEach((q, idx) => {
                        this.allQuizzes.push({ id: `local:${idx}`, source: 'local', data: q.data, title: q.title });
                    });
                    this.populateQuizSelect(this.allQuizzes);
                } catch (e) {
                    console.error(e);
                }
            },

            populateQuizSelect(quizzes) {
                this.elements.quizSelect.innerHTML = '';
                quizzes.forEach(q => {
                    const opt = document.createElement('option');
                    opt.value = q.id;
                    const prefix = q.source === 'quiz' ? '[quiz]' : '[local]';
                    opt.textContent = `${prefix} ${q.title}`;
                    this.elements.quizSelect.appendChild(opt);
                });
            },

            filterQuizOptions() {
                const term = this.elements.quizSearchInput.value.toLowerCase();
                const filtered = this.allQuizzes.filter(q => q.title.toLowerCase().includes(term));
                this.populateQuizSelect(filtered);
            },

            saveQuizToLocal(json) {
                try {
                    const data = typeof json === 'string' ? JSON.parse(json) : json;
                    const stored = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
                    stored.push({ title: data.title, data });
                    localStorage.setItem('savedQuizzes', JSON.stringify(stored));
                } catch (e) {
                    console.error('Konnte Quiz nicht speichern', e);
                }
            },

            processQuizJSON(json) {
                try {
                    const data = typeof json === 'string' ? JSON.parse(json) : json;
                    if (!data.title || !data.questions || !Array.isArray(data.questions)) {
                        throw new Error('Ungültiges JSON-Format. "title" und "questions" sind erforderlich.');
                    }
                    this.quizData = data;
                    localStorage.setItem('quizData', JSON.stringify(this.quizData));
                    if (this.quizData.readingTexts) {
                        this.readingTextsMap.clear();
                        this.quizData.readingTexts.forEach(t => this.readingTextsMap.set(t.id, t.content));
                    }
                    this.elements.mainHeaderTitle.textContent = this.quizData.title;
                    this.injectDynamicCSS();
                    this.renderWelcomeScreen();
                    this.transitionToScreen('welcome-screen');
                } catch (e) {
                    this.showLoaderError(`Fehler: ${e.message}`);
                    this.quizData = null;
                }
            },
            
            showLoaderError(message) {
                this.elements.loaderError.textContent = message;
            },

            transitionToScreen(screenId) {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById(screenId).classList.add('active');
                if (this.elements.homeBtn) {
                    this.elements.homeBtn.style.display = screenId === 'loader-screen' ? 'none' : 'block';
                }
            },
            
            resetToLoader() {
                this.quizData = null;
                localStorage.removeItem('quizData');
                this.elements.jsonFileInput.value = '';
                this.elements.jsonTextInput.value = '';
                this.elements.loaderError.textContent = '';
                this.elements.mainHeaderTitle.textContent = 'Universeller Quiz-Player';
                const oldStyle = document.getElementById('quiz-dynamic-styles');
                if (oldStyle) oldStyle.remove();
                this.loadDefaultQuizList();
                this.transitionToScreen('loader-screen');
            },

            injectDynamicCSS() {
                const oldStyle = document.getElementById('quiz-dynamic-styles');
                if (oldStyle) oldStyle.remove();
                if (this.quizData.cssStyleAdditions) {
                    const styleEl = document.createElement('style');
                    styleEl.id = 'quiz-dynamic-styles';
                    styleEl.textContent = this.quizData.cssStyleAdditions;
                    document.head.appendChild(styleEl);
                }
            },

            renderWelcomeScreen() {
                this.elements.welcomeTitle.textContent = this.quizData.title;
                this.elements.welcomeDescription.textContent = this.quizData.description;
            },

            startQuiz() {
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.transitionToScreen('quiz-screen');
                this.displayQuestion();
            },
            
            displayQuestion() {
                this.elements.nextBtn.style.display = 'none';
                this.elements.feedbackText.textContent = '';
                this.elements.optionsContainer.innerHTML = '';
                
                const q = this.quizData.questions[this.currentQuestionIndex];
                
                this.updateProgressBar();
                this.elements.questionCategory.textContent = q.category;
                this.elements.questionText.innerHTML = q.questionText.replace('{blank}', '<span class="blank"></span>');
                
                if (q.readingTextId && this.readingTextsMap.has(q.readingTextId)) {
                    this.elements.readingTextContainer.innerHTML = this.readingTextsMap.get(q.readingTextId);
                    this.elements.readingTextContainer.style.display = 'block';
                } else {
                    this.elements.readingTextContainer.style.display = 'none';
                }

                q.options.forEach(option => {
                    const button = document.createElement('button');
                    button.innerHTML = option;
                    button.classList.add('option-btn');
                    button.addEventListener('click', () => this.selectAnswer(button, option));
                    this.elements.optionsContainer.appendChild(button);
                });
                
                this.setupHintListeners();
            },

            setupHintListeners() {
                const q = this.quizData.questions[this.currentQuestionIndex];
                if (!q.hints || q.hints.length === 0) return;

                const hintSpans = document.querySelectorAll('#quiz-screen .hint');
                hintSpans.forEach((span, index) => {
                    if (q.hints[index]) {
                        span.addEventListener('click', (event) => {
                            event.stopPropagation();
                            this.showHint(q.hints[index]);
                        });
                    }
                });
            },
            
            selectAnswer(selectedButton, selectedOption) {
                const q = this.quizData.questions[this.currentQuestionIndex];
                const isCorrect = selectedOption === q.correctAnswer;

                if (isCorrect) {
                    this.score++;
                    this.elements.feedbackText.textContent = 'Richtig!';
                    this.elements.feedbackText.className = 'feedback-text correct';
                } else {
                    this.elements.feedbackText.innerHTML = `Falsch. Richtig wäre: ${q.correctAnswer}`;
                    this.elements.feedbackText.className = 'feedback-text incorrect';
                }
                
                Array.from(this.elements.optionsContainer.children).forEach(button => {
                    if (button.innerHTML === q.correctAnswer) button.classList.add('correct');
                    if (button === selectedButton && !isCorrect) button.classList.add('incorrect');
                    button.disabled = true;
                });

                this.elements.nextBtn.style.display = 'block';
            },

            showNextQuestion() {
                this.currentQuestionIndex++;
                if (this.currentQuestionIndex < this.quizData.questions.length) {
                    this.displayQuestion();
                } else { this.showResults(); }
            },
            
            updateProgressBar() {
                const p = ((this.currentQuestionIndex) / this.quizData.questions.length) * 100;
                this.elements.progressBar.style.width = p + '%';
                this.elements.progressText.textContent = `Frage ${this.currentQuestionIndex + 1} von ${this.quizData.questions.length}`;
            },

            showResults() {
                this.transitionToScreen('results-screen');
                const total = this.quizData.questions.length;
                const perc = Math.round((this.score / total) * 100);
                this.elements.scoreText.textContent = `${this.score} / ${total} (${perc}%)`;
                let remark = 'Keine Sorge, Übung macht den Meister!';
                if (perc === 100) remark = 'Perfekt! Du hast alles richtig!';
                else if (perc >= 80) remark = 'Sehr gut! Du hast die Grundlagen drauf.';
                else if (perc >= 50) remark = 'Gut gemacht! Ein bisschen Übung noch.';
                this.elements.scoreRemark.textContent = remark;
            },

            showHint(text) {
                this.elements.hintTextContent.textContent = text;
                this.elements.hintOverlay.classList.add('active');
            },
            
            hideHint() {
                this.elements.hintOverlay.classList.remove('active');
            }
        };
        
        document.addEventListener('DOMContentLoaded', () => quizApp.init());
    })();
