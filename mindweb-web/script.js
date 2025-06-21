// Enhanced Knowledge Management App with AI Integration and Practice Mode
class KnowledgeApp {
    constructor() {
        this.nodes = JSON.parse(localStorage.getItem('mindweb_nodes') || '[]');
        this.stats = JSON.parse(localStorage.getItem('mindweb_stats') || JSON.stringify({
            totalNodes: 0,
            totalConnections: 0,
            experiencePoints: 0,
            level: 1,
            categories: {},
            quizzesTaken: 0,
            averageScore: 0,
            totalTimeSpent: 0
        }));
        
        this.aiSettings = JSON.parse(localStorage.getItem('mindweb_ai_settings') || JSON.stringify({
            enabled: false,
            apiKey: '',
            autoTags: false
        }));
        
        this.categories = [
            { id: 'science', name: 'Science', color: '#3b82f6' },
            { id: 'technology', name: 'Technology', color: '#8b5cf6' },
            { id: 'history', name: 'History', color: '#f59e0b' },
            { id: 'philosophy', name: 'Philosophy', color: '#10b981' },
            { id: 'literature', name: 'Literature', color: '#ef4444' },
            { id: 'arts', name: 'Arts', color: '#f97316' },
            { id: 'mathematics', name: 'Mathematics', color: '#06b6d4' },
            { id: 'health', name: 'Health', color: '#84cc16' },
            { id: 'business', name: 'Business', color: '#6366f1' },
            { id: 'personal', name: 'Personal', color: '#ec4899' }
        ];
        
        this.selectedCategory = this.categories[0].id;
        this.currentNode = null;
        this.currentTheme = localStorage.getItem('mindweb_theme') || 'dark';
        
        // Quiz state
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.quizAnswers = [];
        this.quizStartTime = null;
        this.quizTimer = null;
        this.selectedDifficulty = 'easy';
        
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.setupEventListeners();
        this.renderCategories();
        this.updateStats();
        this.renderKnowledgeWeb();
        this.renderProgress();
        this.renderProfile();
        this.loadAISettings();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#theme-toggle svg');
        if (this.currentTheme === 'light') {
            themeIcon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            `;
        } else {
            themeIcon.innerHTML = `
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            `;
        }
    }
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mindweb_theme', this.currentTheme);
            this.applyTheme();
        });
        
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Quick add button
        document.getElementById('quick-add-btn').addEventListener('click', () => {
            this.switchTab('add');
        });
        
        // Form submission
        document.getElementById('add-knowledge-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addKnowledgeNode();
        });
        
        // AI Generate buttons
        document.getElementById('ai-generate-title').addEventListener('click', () => {
            this.generateAIContent('title');
        });
        
        document.getElementById('ai-generate-content').addEventListener('click', () => {
            this.generateAIContent('content');
        });
        
        document.getElementById('ai-generate-tags').addEventListener('click', () => {
            this.generateAIContent('tags');
        });
        
        // AI option buttons
        document.querySelectorAll('.ai-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.target.dataset.prompt;
                const section = e.target.closest('.form-section').querySelector('input, textarea');
                this.generateAIContentWithPrompt(section.id, prompt);
            });
        });
        
        // Practice mode
        document.getElementById('start-practice').addEventListener('click', () => {
            this.startPracticeMode();
        });
        
        document.getElementById('retry-quiz').addEventListener('click', () => {
            this.resetPracticeMode();
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedDifficulty = e.target.dataset.difficulty;
            });
        });
        
        // Quiz navigation
        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });
        
        document.getElementById('prev-question').addEventListener('click', () => {
            this.prevQuestion();
        });
        
        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('delete-node').addEventListener('click', () => {
            this.deleteNode();
        });
        
        // AI Settings modal
        document.getElementById('close-ai-settings').addEventListener('click', () => {
            this.closeAISettings();
        });
        
        document.getElementById('save-ai-settings').addEventListener('click', () => {
            this.saveAISettings();
        });
        
        // Close modals on backdrop click
        document.getElementById('node-modal').addEventListener('click', (e) => {
            if (e.target.id === 'node-modal') {
                this.closeModal();
            }
        });
        
        document.getElementById('ai-settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'ai-settings-modal') {
                this.closeAISettings();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeAISettings();
            }
        });
    }
    
    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Refresh content if needed
        if (tabName === 'progress') {
            this.renderProgress();
        } else if (tabName === 'profile') {
            this.renderProfile();
        } else if (tabName === 'practice') {
            this.resetPracticeMode();
        }
    }
    
    renderCategories() {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'category-button';
            button.textContent = category.name;
            button.style.setProperty('--category-color', category.color);
            button.style.setProperty('--category-color-light', category.color + '30');
            button.style.setProperty('--category-shadow', category.color + '40');
            button.setAttribute('aria-pressed', category.id === this.selectedCategory);
            
            if (category.id === this.selectedCategory) {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.category-button').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                this.selectedCategory = category.id;
            });
            
            container.appendChild(button);
        });
    }
    
    async generateAIContent(type) {
        if (!this.aiSettings.enabled || !this.aiSettings.apiKey) {
            this.showAISettings();
            return;
        }
        
        const button = document.getElementById(`ai-generate-${type}`);
        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<div class="loading"></div> Generating...';
        
        try {
            let prompt = '';
            let currentContent = '';
            
            switch (type) {
                case 'title':
                    currentContent = document.getElementById('content').value;
                    prompt = `Generate a concise, engaging title for this knowledge: "${currentContent}". Return only the title, no quotes or extra text.`;
                    break;
                case 'content':
                    currentContent = document.getElementById('title').value;
                    prompt = `Expand and enhance this knowledge topic: "${currentContent}". Provide detailed, educational content that explains the concept clearly. Include key points, examples, and practical applications.`;
                    break;
                case 'tags':
                    const title = document.getElementById('title').value;
                    const content = document.getElementById('content').value;
                    prompt = `Generate relevant tags for this knowledge: Title: "${title}", Content: "${content}". Return 3-5 tags separated by commas, no extra text.`;
                    break;
            }
            
            const response = await this.callOpenAI(prompt);
            
            if (response) {
                const targetElement = document.getElementById(type);
                if (type === 'tags') {
                    targetElement.value = response.trim();
                } else {
                    targetElement.value = response.trim();
                    targetElement.style.height = 'auto';
                    targetElement.style.height = targetElement.scrollHeight + 'px';
                }
                
                this.showMessage(`AI generated ${type} successfully!`, 'success');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            this.showMessage('Failed to generate content. Please check your API key.', 'error');
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }
    
    async generateAIContentWithPrompt(fieldId, promptType) {
        if (!this.aiSettings.enabled || !this.aiSettings.apiKey) {
            this.showAISettings();
            return;
        }
        
        const field = document.getElementById(fieldId);
        const currentValue = field.value;
        
        let prompt = '';
        switch (promptType) {
            case 'creative-title':
                prompt = `Create a creative, engaging title for: "${currentValue}". Make it catchy and memorable.`;
                break;
            case 'descriptive-title':
                prompt = `Create a clear, descriptive title for: "${currentValue}". Focus on accuracy and clarity.`;
                break;
            case 'question-title':
                prompt = `Turn this into a thought-provoking question: "${currentValue}". Start with What, How, Why, or When.`;
                break;
            case 'expand-content':
                prompt = `Expand this content with more details and examples: "${currentValue}". Add depth and practical insights.`;
                break;
            case 'add-examples':
                prompt = `Add concrete examples and case studies to this content: "${currentValue}". Make it more practical and relatable.`;
                break;
            case 'suggest-connections':
                prompt = `Suggest how this knowledge connects to other fields and concepts: "${currentValue}". Highlight interdisciplinary relationships.`;
                break;
        }
        
        try {
            const response = await this.callOpenAI(prompt);
            if (response) {
                field.value = response.trim();
                if (field.tagName === 'TEXTAREA') {
                    field.style.height = 'auto';
                    field.style.height = field.scrollHeight + 'px';
                }
                this.showMessage('Content enhanced with AI!', 'success');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            this.showMessage('Failed to enhance content. Please try again.', 'error');
        }
    }
    
    async callOpenAI(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.aiSettings.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that generates educational content. Be concise, accurate, and engaging.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    addKnowledgeNode() {
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('content').value.trim();
        const tags = document.getElementById('tags').value.trim();
        const source = document.getElementById('source').value.trim();
        
        if (!title || !content) {
            this.showMessage('Please provide both title and content.', 'error');
            return;
        }
        
        const node = {
            id: Date.now().toString(),
            title,
            content,
            category: this.selectedCategory,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            source: source || null,
            createdAt: new Date().toISOString(),
            position: {
                x: Math.random() * 400 + 50,
                y: Math.random() * 400 + 50
            }
        };
        
        this.nodes.push(node);
        this.updateStats();
        this.saveData();
        
        // Reset form
        document.getElementById('add-knowledge-form').reset();
        this.selectedCategory = this.categories[0].id;
        this.renderCategories();
        
        this.showMessage('Knowledge node added successfully!', 'success');
        this.renderKnowledgeWeb();
        
        // Switch to home tab after a delay
        setTimeout(() => {
            this.switchTab('home');
        }, 1500);
    }
    
    updateStats() {
        this.stats.totalNodes = this.nodes.length;
        this.stats.experiencePoints = (this.nodes.length * 10) + (this.stats.quizzesTaken * 25);
        this.stats.level = Math.floor(this.stats.experiencePoints / 100) + 1;
        
        // Update categories count
        this.stats.categories = {};
        this.nodes.forEach(node => {
            this.stats.categories[node.category] = (this.stats.categories[node.category] || 0) + 1;
        });
        
        // Update header stats
        document.getElementById('header-stats').textContent = 
            `${this.stats.totalNodes} nodes • Level ${this.stats.level}`;
    }
    
    renderKnowledgeWeb() {
        const emptyState = document.getElementById('empty-state');
        const webContainer = document.getElementById('web-container');
        const nodesContainer = document.getElementById('nodes-container');
        
        if (this.nodes.length === 0) {
            emptyState.style.display = 'flex';
            webContainer.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        webContainer.style.display = 'block';
        
        nodesContainer.innerHTML = '';
        
        this.nodes.forEach(node => {
            const nodeElement = this.createNodeElement(node);
            nodesContainer.appendChild(nodeElement);
        });
    }
    
    createNodeElement(node) {
        const category = this.categories.find(cat => cat.id === node.category);
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'knowledge-node';
        nodeDiv.style.left = node.position.x + 'px';
        nodeDiv.style.top = node.position.y + 'px';
        nodeDiv.style.backgroundColor = category.color + '20';
        nodeDiv.style.borderColor = category.color;
        nodeDiv.setAttribute('role', 'button');
        nodeDiv.setAttribute('tabindex', '0');
        nodeDiv.setAttribute('aria-label', `Knowledge node: ${node.title}`);
        
        nodeDiv.innerHTML = `
            <div class="node-title" style="color: ${category.color}">${node.title}</div>
            <div class="node-category">${category.name}</div>
            ${node.tags.length > 0 ? `<div class="node-tags">${node.tags.slice(0, 2).join(', ')}</div>` : ''}
        `;
        
        const openModal = () => this.openNodeModal(node);
        nodeDiv.addEventListener('click', openModal);
        nodeDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
        
        return nodeDiv;
    }
    
    openNodeModal(node) {
        this.currentNode = node;
        const modal = document.getElementById('node-modal');
        const modalBody = document.getElementById('modal-body');
        const category = this.categories.find(cat => cat.id === node.category);
        
        modal.setAttribute('aria-hidden', 'false');
        
        modalBody.innerHTML = `
            <div class="category-badge" style="background-color: ${category.color}30; color: ${category.color}">
                ${category.name}
            </div>
            <h3 class="node-title-modal">${node.title}</h3>
            <p class="node-content-modal">${node.content}</p>
            
            ${node.tags.length > 0 ? `
                <div class="tags-section">
                    <div class="section-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        <span class="section-header-title">Tags</span>
                    </div>
                    <div class="tags-container">
                        ${node.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${node.source ? `
                <div class="source-section">
                    <div class="source-label">Source:</div>
                    <div class="source-text">${node.source}</div>
                </div>
            ` : ''}
            
            <div class="meta-section">
                <div class="section-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span class="section-header-title">Created ${new Date(node.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        document.getElementById('close-modal').focus();
    }
    
    closeModal() {
        const modal = document.getElementById('node-modal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        this.currentNode = null;
    }
    
    deleteNode() {
        if (!this.currentNode) return;
        
        if (confirm('Are you sure you want to delete this knowledge node? This action cannot be undone.')) {
            this.nodes = this.nodes.filter(node => node.id !== this.currentNode.id);
            this.updateStats();
            this.saveData();
            this.renderKnowledgeWeb();
            this.closeModal();
            this.showMessage('Knowledge node deleted.', 'success');
        }
    }
    
    // Practice Mode Functions
    startPracticeMode() {
        if (this.nodes.length < 3) {
            this.showMessage('You need at least 3 knowledge nodes to start a quiz.', 'error');
            return;
        }
        
        this.generateQuiz();
        document.getElementById('practice-setup').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        this.quizStartTime = Date.now();
        this.startQuizTimer();
        this.displayCurrentQuestion();
    }
    
    generateQuiz() {
        const questionCounts = { easy: 5, medium: 10, hard: 15 };
        const questionCount = questionCounts[this.selectedDifficulty];
        
        // Shuffle nodes and select random ones for questions
        const shuffledNodes = [...this.nodes].sort(() => Math.random() - 0.5);
        const selectedNodes = shuffledNodes.slice(0, Math.min(questionCount, this.nodes.length));
        
        this.currentQuiz = selectedNodes.map(node => this.generateQuestionFromNode(node));
        this.currentQuestionIndex = 0;
        this.quizAnswers = new Array(this.currentQuiz.length).fill(null);
    }
    
    generateQuestionFromNode(node) {
        const questionTypes = ['multiple-choice', 'true-false', 'fill-blank'];
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        const category = this.categories.find(cat => cat.id === node.category);
        
        switch (type) {
            case 'multiple-choice':
                return this.generateMultipleChoice(node, category);
            case 'true-false':
                return this.generateTrueFalse(node, category);
            case 'fill-blank':
                return this.generateFillBlank(node, category);
            default:
                return this.generateMultipleChoice(node, category);
        }
    }
    
    generateMultipleChoice(node, category) {
        const questions = [
            `What is the main concept discussed in "${node.title}"?`,
            `Which category does "${node.title}" belong to?`,
            `What is a key aspect of ${node.title}?`
        ];
        
        const question = questions[Math.floor(Math.random() * questions.length)];
        
        // Generate options based on the question type
        let correctAnswer, options;
        
        if (question.includes('category')) {
            correctAnswer = category.name;
            options = [
                correctAnswer,
                ...this.categories.filter(cat => cat.id !== node.category)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(cat => cat.name)
            ];
        } else {
            // Generate options from content
            const words = node.content.split(' ').filter(word => word.length > 4);
            correctAnswer = node.title;
            options = [
                correctAnswer,
                ...this.nodes.filter(n => n.id !== node.id)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(n => n.title)
            ];
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        return {
            type: 'multiple-choice',
            question,
            options,
            correctAnswer,
            node
        };
    }
    
    generateTrueFalse(node, category) {
        const statements = [
            `"${node.title}" belongs to the ${category.name} category.`,
            `The main topic of this knowledge is ${node.title}.`,
            `This knowledge was created recently.`
        ];
        
        const statement = statements[Math.floor(Math.random() * statements.length)];
        const isTrue = Math.random() > 0.3; // 70% chance of true statements
        
        return {
            type: 'true-false',
            question: statement,
            options: ['True', 'False'],
            correctAnswer: isTrue ? 'True' : 'False',
            node
        };
    }
    
    generateFillBlank(node, category) {
        const sentence = `The main concept of _____ is discussed in the ${category.name} category.`;
        
        return {
            type: 'fill-blank',
            question: sentence,
            options: [
                node.title,
                ...this.nodes.filter(n => n.id !== node.id)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(n => n.title)
            ].sort(() => Math.random() - 0.5),
            correctAnswer: node.title,
            node
        };
    }
    
    displayCurrentQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];
        const progressElement = document.getElementById('quiz-progress');
        const questionElement = document.getElementById('question-text');
        const optionsElement = document.getElementById('answer-options');
        
        progressElement.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.length}`;
        questionElement.textContent = question.question;
        
        optionsElement.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'answer-option';
            optionElement.textContent = option;
            optionElement.setAttribute('role', 'button');
            optionElement.setAttribute('tabindex', '0');
            optionElement.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
            
            if (this.quizAnswers[this.currentQuestionIndex] === option) {
                optionElement.classList.add('selected');
            }
            
            const selectOption = () => {
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionElement.classList.add('selected');
                this.quizAnswers[this.currentQuestionIndex] = option;
                this.updateQuizNavigation();
            };
            
            optionElement.addEventListener('click', selectOption);
            optionElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectOption();
                }
            });
            
            optionsElement.appendChild(optionElement);
        });
        
        this.updateQuizNavigation();
    }
    
    updateQuizNavigation() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === this.currentQuiz.length - 1) {
            nextBtn.textContent = 'Finish Quiz';
            nextBtn.disabled = this.quizAnswers[this.currentQuestionIndex] === null;
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.disabled = this.quizAnswers[this.currentQuestionIndex] === null;
        }
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex === this.currentQuiz.length - 1) {
            this.finishQuiz();
        } else {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
        }
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
        }
    }
    
    finishQuiz() {
        clearInterval(this.quizTimer);
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - this.quizStartTime) / 1000);
        
        // Calculate score
        let correctAnswers = 0;
        this.currentQuiz.forEach((question, index) => {
            if (this.quizAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / this.currentQuiz.length) * 100);
        const xpEarned = correctAnswers * 5 + (score >= 80 ? 25 : 0);
        
        // Update stats
        this.stats.quizzesTaken++;
        this.stats.experiencePoints += xpEarned;
        this.stats.totalTimeSpent += timeSpent;
        this.stats.averageScore = this.stats.averageScore === 0 ? 
            score : Math.round((this.stats.averageScore + score) / 2);
        
        this.updateStats();
        this.saveData();
        
        // Show results
        this.showQuizResults(score, correctAnswers, timeSpent, xpEarned);
    }
    
    showQuizResults(score, correctAnswers, timeSpent, xpEarned) {
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';
        
        document.getElementById('results-score').textContent = `${score}%`;
        document.getElementById('correct-answers').textContent = correctAnswers;
        document.getElementById('total-questions').textContent = this.currentQuiz.length;
        document.getElementById('time-taken').textContent = this.formatTime(timeSpent);
        document.getElementById('xp-earned').textContent = `+${xpEarned}`;
        
        const messages = [
            { min: 90, message: "Outstanding! You're a knowledge master!" },
            { min: 80, message: "Excellent work! You're making great progress." },
            { min: 70, message: "Good job! Keep up the learning momentum." },
            { min: 60, message: "Not bad! Review your knowledge and try again." },
            { min: 0, message: "Keep studying! Every attempt makes you stronger." }
        ];
        
        const message = messages.find(m => score >= m.min).message;
        document.getElementById('results-message').textContent = message;
    }
    
    resetPracticeMode() {
        document.getElementById('practice-setup').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';
        
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.quizAnswers = [];
        this.quizStartTime = null;
        
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
        }
    }
    
    startQuizTimer() {
        const timeLimit = { easy: 300, medium: 600, hard: 900 }; // seconds
        let timeLeft = timeLimit[this.selectedDifficulty];
        
        const timerElement = document.getElementById('quiz-timer');
        
        this.quizTimer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = this.formatTime(timeLeft);
            
            if (timeLeft <= 0) {
                this.finishQuiz();
            }
        }, 1000);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // AI Settings Functions
    showAISettings() {
        document.getElementById('ai-settings-modal').classList.add('active');
        document.getElementById('ai-settings-modal').setAttribute('aria-hidden', 'false');
    }
    
    closeAISettings() {
        document.getElementById('ai-settings-modal').classList.remove('active');
        document.getElementById('ai-settings-modal').setAttribute('aria-hidden', 'true');
    }
    
    loadAISettings() {
        document.getElementById('ai-enabled').checked = this.aiSettings.enabled;
        document.getElementById('api-key').value = this.aiSettings.apiKey;
        document.getElementById('auto-tags').checked = this.aiSettings.autoTags;
    }
    
    saveAISettings() {
        this.aiSettings.enabled = document.getElementById('ai-enabled').checked;
        this.aiSettings.apiKey = document.getElementById('api-key').value.trim();
        this.aiSettings.autoTags = document.getElementById('auto-tags').checked;
        
        localStorage.setItem('mindweb_ai_settings', JSON.stringify(this.aiSettings));
        this.closeAISettings();
        this.showMessage('AI settings saved successfully!', 'success');
    }
    
    renderProgress() {
        this.renderStatsGrid();
        this.renderLevelSection();
        this.renderCategoriesSection();
        this.renderAchievementsSection();
    }
    
    renderStatsGrid() {
        const statsGrid = document.getElementById('stats-grid');
        const currentLevelProgress = this.stats.experiencePoints % 100;
        
        statsGrid.innerHTML = `
            <div class="progress-card" style="border-left-color: #3b82f6">
                <div class="card-header">
                    <div class="card-icon" style="background-color: #3b82f620">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                            <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v15A2.5 2.5 0 0 0 9.5 22h5a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 14.5 2h-5Z"/>
                            <path d="M9 6h6"/>
                            <path d="M9 10h6"/>
                            <path d="M9 14h3"/>
                        </svg>
                    </div>
                    <div class="card-title">Total Knowledge</div>
                </div>
                <div class="card-value" style="color: #3b82f6">${this.stats.totalNodes}</div>
                <div class="card-subtitle">Nodes created</div>
            </div>
            
            <div class="progress-card" style="border-left-color: #10b981">
                <div class="card-header">
                    <div class="card-icon" style="background-color: #10b98120">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                        </svg>
                    </div>
                    <div class="card-title">Current Level</div>
                </div>
                <div class="card-value" style="color: #10b981">${this.stats.level}</div>
                <div class="card-subtitle">${100 - currentLevelProgress} XP to next level</div>
            </div>
            
            <div class="progress-card" style="border-left-color: #f59e0b">
                <div class="card-header">
                    <div class="card-icon" style="background-color: #f59e0b20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polygon points="10,8 16,12 10,16 10,8"/>
                        </svg>
                    </div>
                    <div class="card-title">Quizzes Taken</div>
                </div>
                <div class="card-value" style="color: #f59e0b">${this.stats.quizzesTaken}</div>
                <div class="card-subtitle">Average score: ${this.stats.averageScore}%</div>
            </div>
            
            <div class="progress-card" style="border-left-color: #8b5cf6">
                <div class="card-header">
                    <div class="card-icon" style="background-color: #8b5cf620">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <div class="card-title">Experience</div>
                </div>
                <div class="card-value" style="color: #8b5cf6">${this.stats.experiencePoints}</div>
                <div class="card-subtitle">Total XP earned</div>
            </div>
        `;
    }
    
    renderLevelSection() {
        const levelSection = document.getElementById('level-section');
        const currentLevelProgress = this.stats.experiencePoints % 100;
        
        levelSection.innerHTML = `
            <h2 class="section-title">Level Progress</h2>
            <div class="level-card">
                <div class="level-header">
                    <div class="level-text">Level ${this.stats.level}</div>
                    <div class="level-xp">${currentLevelProgress}/100 XP</div>
                </div>
                <div class="level-progress-bar">
                    <div class="level-progress-fill" style="width: ${currentLevelProgress}%"></div>
                </div>
            </div>
        `;
    }
    
    renderCategoriesSection() {
        const categoriesSection = document.getElementById('categories-section');
        
        const categoryItems = this.categories.map(category => {
            const count = this.stats.categories[category.id] || 0;
            const percentage = this.stats.totalNodes > 0 ? (count / this.stats.totalNodes) * 100 : 0;
            
            return `
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-dot" style="background-color: ${category.color}"></div>
                        <div class="category-name">${category.name}</div>
                        <div class="category-count">${count}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.max(percentage, 5)}%; background-color: ${category.color}"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        categoriesSection.innerHTML = `
            <h2 class="section-title">Knowledge by Category</h2>
            <div class="categories-card">
                ${categoryItems}
            </div>
        `;
    }
    
    renderAchievementsSection() {
        const achievementsSection = document.getElementById('achievements-section');
        
        const achievements = [
            {
                title: 'First Knowledge Node',
                description: 'Created your first knowledge node',
                icon: '🎯',
                color: '#10b981',
                isUnlocked: this.stats.totalNodes > 0
            },
            {
                title: 'Knowledge Builder',
                description: 'Created 10 knowledge nodes',
                icon: '🧠',
                color: '#3b82f6',
                isUnlocked: this.stats.totalNodes >= 10
            },
            {
                title: 'Quiz Master',
                description: 'Completed 5 quizzes',
                icon: '🏆',
                color: '#f59e0b',
                isUnlocked: this.stats.quizzesTaken >= 5
            },
            {
                title: 'Learning Enthusiast',
                description: 'Reached Level 5',
                icon: '⭐',
                color: '#8b5cf6',
                isUnlocked: this.stats.level >= 5
            },
            {
                title: 'AI Assistant',
                description: 'Used AI features to enhance knowledge',
                icon: '🤖',
                color: '#ef4444',
                isUnlocked: this.aiSettings.enabled && this.aiSettings.apiKey
            }
        ];
        
        const achievementItems = achievements.map(achievement => `
            <div class="achievement-item ${achievement.isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon" style="background-color: ${achievement.color}20">
                    <span style="font-size: 24px; ${achievement.isUnlocked ? '' : 'filter: grayscale(100%); opacity: 0.5;'}">${achievement.icon}</span>
                </div>
                <div class="achievement-content">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
                ${achievement.isUnlocked ? '<div class="achievement-badge">✓</div>' : ''}
            </div>
        `).join('');
        
        achievementsSection.innerHTML = `
            <h2 class="section-title">Achievements</h2>
            <div class="achievements-card">
                ${achievementItems}
            </div>
        `;
    }
    
    renderProfile() {
        const profileCard = document.getElementById('profile-card');
        const menuSections = document.getElementById('menu-sections');
        
        profileCard.innerHTML = `
            <div class="profile-header">
                <div class="avatar-container">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="profile-info">
                    <div class="profile-name">Knowledge Explorer</div>
                    <div class="profile-level">Level ${this.stats.level}</div>
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-value">${this.stats.totalNodes}</div>
                    <div class="stat-label">Nodes</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-value">${this.stats.quizzesTaken}</div>
                    <div class="stat-label">Quizzes</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <div class="stat-value">${this.stats.experiencePoints}</div>
                    <div class="stat-label">XP</div>
                </div>
            </div>
        `;
        
        menuSections.innerHTML = `
            <div class="menu-section">
                <h3 class="section-title">AI & Features</h3>
                <button class="menu-item" onclick="app.showAISettings()">
                    <div class="menu-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <div class="menu-text">AI Settings</div>
                </button>
            </div>
            
            <div class="menu-section">
                <h3 class="section-title">Data Management</h3>
                <button class="menu-item" onclick="app.exportData()">
                    <div class="menu-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </div>
                    <div class="menu-text">Export Data</div>
                </button>
            </div>
            
            <div class="menu-section">
                <h3 class="section-title">Danger Zone</h3>
                <button class="menu-item" onclick="app.clearAllData()">
                    <div class="menu-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </div>
                    <div class="menu-text danger">Clear All Data</div>
                </button>
            </div>
            
            <div class="app-info">
                <div class="app-name">MindWeb</div>
                <div class="app-version">Version 2.0.0</div>
                <div class="app-description">
                    AI-powered knowledge management with interactive learning and testing features.
                </div>
            </div>
        `;
    }
    
    exportData() {
        const data = {
            nodes: this.nodes,
            stats: this.stats,
            aiSettings: { ...this.aiSettings, apiKey: '' }, // Don't export API key
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindweb-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }
    
    clearAllData() {
        if (confirm('This will permanently delete all your knowledge nodes, progress, and settings. This action cannot be undone. Are you sure?')) {
            localStorage.removeItem('mindweb_nodes');
            localStorage.removeItem('mindweb_stats');
            localStorage.removeItem('mindweb_ai_settings');
            localStorage.removeItem('mindweb_theme');
            location.reload();
        }
    }
    
    saveData() {
        localStorage.setItem('mindweb_nodes', JSON.stringify(this.nodes));
        localStorage.setItem('mindweb_stats', JSON.stringify(this.stats));
    }
    
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `success-message`;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '3000';
        messageDiv.setAttribute('role', 'alert');
        messageDiv.setAttribute('aria-live', 'polite');
        
        const icon = type === 'success' ? 
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        
        messageDiv.innerHTML = `${icon} ${message}`;
        
        if (type === 'error') {
            messageDiv.style.background = 'linear-gradient(135deg, var(--error-color), #dc2626)';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KnowledgeApp();
});

// Add some sample data for demo purposes
setTimeout(() => {
    if (window.app && window.app.nodes.length === 0) {
        const sampleNodes = [
            {
                id: '1',
                title: 'Machine Learning Fundamentals',
                content: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It involves algorithms that can identify patterns in data and make predictions or decisions based on that data.',
                category: 'technology',
                tags: ['AI', 'algorithms', 'data science', 'neural networks'],
                source: 'Introduction to Statistical Learning',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                position: { x: 100, y: 150 }
            },
            {
                id: '2',
                title: 'The Scientific Method',
                content: 'A systematic approach to understanding the natural world through observation, hypothesis formation, experimentation, and analysis. It provides a framework for conducting reliable and reproducible research.',
                category: 'science',
                tags: ['research', 'methodology', 'empirical', 'hypothesis'],
                source: 'Scientific Method Course',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                position: { x: 300, y: 100 }
            },
            {
                id: '3',
                title: 'Stoic Philosophy Principles',
                content: 'Focus on what you can control, accept what you cannot, and find wisdom in the distinction between the two. Stoicism teaches emotional resilience and rational thinking in the face of adversity.',
                category: 'philosophy',
                tags: ['stoicism', 'wisdom', 'mindfulness', 'resilience'],
                source: 'Meditations by Marcus Aurelius',
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                position: { x: 200, y: 300 }
            },
            {
                id: '4',
                title: 'Quantum Computing Basics',
                content: 'Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information in ways that classical computers cannot. It promises exponential speedups for certain computational problems.',
                category: 'technology',
                tags: ['quantum', 'computing', 'superposition', 'qubits'],
                source: 'Quantum Computing: An Applied Approach',
                createdAt: new Date(Date.now() - 345600000).toISOString(),
                position: { x: 400, y: 200 }
            },
            {
                id: '5',
                title: 'Renaissance Art Movement',
                content: 'The Renaissance marked a cultural rebirth in Europe, characterized by renewed interest in classical learning, humanism, and artistic innovation. Artists like Leonardo da Vinci and Michelangelo revolutionized art with techniques like perspective and anatomical accuracy.',
                category: 'arts',
                tags: ['renaissance', 'art history', 'humanism', 'perspective'],
                source: 'Art History Textbook',
                createdAt: new Date(Date.now() - 432000000).toISOString(),
                position: { x: 150, y: 400 }
            }
        ];
        
        window.app.nodes = sampleNodes;
        window.app.updateStats();
        window.app.saveData();
        window.app.renderKnowledgeWeb();
    }
}, 1000);