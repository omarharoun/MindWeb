// Enhanced Knowledge Management App with AI and Quiz Features
class EnhancedKnowledgeApp {
    constructor() {
        this.nodes = JSON.parse(localStorage.getItem('mindweb_nodes') || '[]');
        this.stats = JSON.parse(localStorage.getItem('mindweb_stats') || JSON.stringify({
            totalNodes: 0,
            totalConnections: 0,
            experiencePoints: 0,
            level: 1,
            categories: {},
            quizStats: {
                totalQuizzes: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                averageScore: 0,
                bestStreak: 0,
                timeSpent: 0,
                difficultyProgress: { easy: 0, medium: 0, hard: 0 }
            }
        }));
        this.settings = JSON.parse(localStorage.getItem('mindweb_settings') || JSON.stringify({
            aiEnabled: false,
            openaiApiKey: '',
            notifications: true,
            darkMode: true,
            autoSave: true
        }));
        this.quizzes = JSON.parse(localStorage.getItem('mindweb_quizzes') || '[]');
        
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

        this.colorOptions = [
            '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
            '#f97316', '#06b6d4', '#84cc16', '#6366f1', '#ec4899'
        ];

        this.difficulties = [
            { id: 'easy', name: 'Easy', color: '#10b981', description: 'Basic recall and understanding' },
            { id: 'medium', name: 'Medium', color: '#f59e0b', description: 'Application and analysis' },
            { id: 'hard', name: 'Hard', color: '#ef4444', description: 'Synthesis and evaluation' }
        ];
        
        this.selectedCategory = this.categories[0].id;
        this.selectedColor = this.colorOptions[0];
        this.selectedDifficulty = 'medium';
        this.currentNode = null;
        this.isEditing = false;
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
        this.currentQuiz = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.renderColorPicker();
        this.renderDifficultyButtons();
        this.updateStats();
        this.updateAIFeatures();
        this.renderKnowledgeWeb();
        this.renderProgress();
        this.renderProfile();
        this.renderQuizSetup();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Header buttons
        document.getElementById('quick-add-btn').addEventListener('click', () => {
            this.switchTab('add');
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.switchTab('profile');
        });
        
        // Form submission
        document.getElementById('add-knowledge-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addKnowledgeNode();
        });

        // AI Generate button
        document.getElementById('ai-generate-btn').addEventListener('click', () => {
            this.generateAIContent();
        });
        
        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('delete-node').addEventListener('click', () => {
            this.deleteNode();
        });

        document.getElementById('edit-node').addEventListener('click', () => {
            this.toggleEditMode();
        });

        // Settings events
        document.getElementById('ai-toggle').addEventListener('click', () => {
            this.toggleAI();
        });

        document.getElementById('configure-api-btn').addEventListener('click', () => {
            this.toggleApiKeySection();
        });

        document.getElementById('save-api-key').addEventListener('click', () => {
            this.saveApiKey();
        });

        // Quiz events
        document.getElementById('start-quiz-btn').addEventListener('click', () => {
            this.startQuiz();
        });
        
        // Close modal on backdrop click
        document.getElementById('node-modal').addEventListener('click', (e) => {
            if (e.target.id === 'node-modal') {
                this.closeModal();
            }
        });

        // Drag and drop for nodes
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        let isDragging = false;
        let startPos = { x: 0, y: 0 };

        document.addEventListener('mousedown', (e) => {
            const node = e.target.closest('.knowledge-node');
            if (node) {
                isDragging = true;
                this.draggedNode = node;
                const rect = node.getBoundingClientRect();
                const container = document.getElementById('web-container').getBoundingClientRect();
                
                startPos = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                node.classList.add('dragging');
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging && this.draggedNode) {
                const container = document.getElementById('web-container');
                const containerRect = container.getBoundingClientRect();
                
                const x = e.clientX - containerRect.left - startPos.x + container.scrollLeft;
                const y = e.clientY - containerRect.top - startPos.y + container.scrollTop;
                
                this.draggedNode.style.left = Math.max(0, x) + 'px';
                this.draggedNode.style.top = Math.max(0, y) + 'px';
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging && this.draggedNode) {
                const nodeId = this.draggedNode.dataset.nodeId;
                const node = this.nodes.find(n => n.id === nodeId);
                
                if (node) {
                    node.position.x = parseInt(this.draggedNode.style.left);
                    node.position.y = parseInt(this.draggedNode.style.top);
                    this.saveData();
                    this.renderConnections();
                }

                this.draggedNode.classList.remove('dragging');
                this.draggedNode = null;
                isDragging = false;
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
        } else if (tabName === 'play') {
            this.renderQuizSetup();
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
            
            if (category.id === this.selectedCategory) {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.category-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                this.selectedCategory = category.id;
            });
            
            container.appendChild(button);
        });
    }

    renderColorPicker() {
        const container = document.getElementById('color-picker');
        container.innerHTML = '';
        
        this.colorOptions.forEach(color => {
            const option = document.createElement('div');
            option.className = 'color-option';
            option.style.backgroundColor = color;
            
            if (color === this.selectedColor) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.selectedColor = color;
            });
            
            container.appendChild(option);
        });
    }

    renderDifficultyButtons() {
        const container = document.getElementById('difficulty-buttons');
        container.innerHTML = '';
        
        this.difficulties.forEach(difficulty => {
            const button = document.createElement('div');
            button.className = 'difficulty-button';
            button.style.setProperty('--difficulty-color', difficulty.color);
            button.style.setProperty('--difficulty-color-light', difficulty.color + '20');
            
            if (difficulty.id === this.selectedDifficulty) {
                button.classList.add('selected');
            }
            
            button.innerHTML = `
                <div class="difficulty-name" style="color: ${difficulty.color}">${difficulty.name}</div>
                <div class="difficulty-description">${difficulty.description}</div>
            `;
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-button').forEach(btn => {
                    btn.classList.remove('selected');
                });
                button.classList.add('selected');
                this.selectedDifficulty = difficulty.id;
            });
            
            container.appendChild(button);
        });
    }

    async generateAIContent() {
        if (!this.settings.aiEnabled || !this.settings.openaiApiKey) {
            this.showMessage('Please configure your OpenAI API key in settings first.', 'error');
            return;
        }

        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');
        const prompt = titleInput.value || 'Generate educational content about a topic of your choice';

        const button = document.getElementById('ai-generate-btn');
        const originalText = button.textContent;
        button.textContent = 'Generating...';
        button.disabled = true;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that generates educational content for a knowledge management app. Provide clear, concise, and informative responses.',
                        },
                        {
                            role: 'user',
                            content: `Generate educational content about: ${prompt}. Make it informative and suitable for a knowledge base.`,
                        },
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI content');
            }

            const data = await response.json();
            const generatedContent = data.choices[0]?.message?.content || '';
            
            if (generatedContent) {
                contentInput.value = generatedContent;
                this.showMessage('AI content generated successfully!', 'success');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            this.showMessage('Failed to generate AI content. Please check your API key.', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    updateAIFeatures() {
        const aiButton = document.getElementById('ai-generate-btn');
        const aiToggle = document.getElementById('ai-toggle');
        const apiKeyStatus = document.getElementById('api-key-status');
        
        if (this.settings.aiEnabled) {
            aiToggle.classList.add('active');
            aiButton.disabled = !this.settings.openaiApiKey;
        } else {
            aiToggle.classList.remove('active');
            aiButton.disabled = true;
        }

        if (this.settings.openaiApiKey) {
            apiKeyStatus.textContent = 'Configured';
            apiKeyStatus.style.color = '#10b981';
        } else {
            apiKeyStatus.textContent = 'Not configured';
            apiKeyStatus.style.color = '#ef4444';
        }
    }

    toggleAI() {
        this.settings.aiEnabled = !this.settings.aiEnabled;
        this.saveSettings();
        this.updateAIFeatures();
    }

    toggleApiKeySection() {
        const section = document.getElementById('api-key-section');
        section.classList.toggle('hidden');
        
        if (!section.classList.contains('hidden')) {
            document.getElementById('api-key-input').value = this.settings.openaiApiKey || '';
        }
    }

    saveApiKey() {
        const input = document.getElementById('api-key-input');
        this.settings.openaiApiKey = input.value.trim();
        this.saveSettings();
        this.updateAIFeatures();
        this.toggleApiKeySection();
        this.showMessage('API key saved successfully!', 'success');
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
            },
            color: this.selectedColor,
            connections: [],
            aiGenerated: content.includes('AI-generated') || false,
            media: []
        };
        
        this.nodes.push(node);
        this.updateStats();
        this.saveData();
        
        // Reset form
        document.getElementById('add-knowledge-form').reset();
        this.selectedCategory = this.categories[0].id;
        this.selectedColor = this.colorOptions[0];
        this.renderCategories();
        this.renderColorPicker();
        
        this.showMessage('Knowledge node added successfully!', 'success');
        this.renderKnowledgeWeb();
        
        // Switch to home tab after a delay
        setTimeout(() => {
            this.switchTab('home');
        }, 1500);
    }
    
    updateStats() {
        this.stats.totalNodes = this.nodes.length;
        this.stats.experiencePoints = this.nodes.length * 10;
        this.stats.level = Math.floor(this.stats.experiencePoints / 100) + 1;
        
        // Update categories count
        this.stats.categories = {};
        this.nodes.forEach(node => {
            this.stats.categories[node.category] = (this.stats.categories[node.category] || 0) + 1;
        });
        
        // Update header stats
        document.getElementById('header-stats').textContent = 
            `${this.stats.totalNodes} nodes • Level ${this.stats.level}`;

        // Update quiz stats
        document.getElementById('available-nodes').textContent = this.nodes.length;
        document.getElementById('total-quizzes').textContent = this.stats.quizStats.totalQuizzes;
        document.getElementById('average-score').textContent = Math.round(this.stats.quizStats.averageScore) + '%';

        // Enable/disable start quiz button
        const startQuizBtn = document.getElementById('start-quiz-btn');
        if (this.nodes.length > 0) {
            startQuizBtn.disabled = false;
            startQuizBtn.classList.remove('disabled');
        } else {
            startQuizBtn.disabled = true;
            startQuizBtn.classList.add('disabled');
        }
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

        this.renderConnections();
    }

    renderConnections() {
        const connectionsContainer = document.getElementById('connections-container');
        connectionsContainer.innerHTML = '';

        this.nodes.forEach(node => {
            node.connections.forEach(connectionId => {
                const connectedNode = this.nodes.find(n => n.id === connectionId);
                if (connectedNode) {
                    const line = this.createConnectionLine(node, connectedNode);
                    connectionsContainer.appendChild(line);
                }
            });
        });
    }

    createConnectionLine(startNode, endNode) {
        const startX = startNode.position.x + 70; // Center of node
        const startY = startNode.position.y + 50;
        const endX = endNode.position.x + 70;
        const endY = endNode.position.y + 50;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        line.className = 'connection-line';
        line.style.position = 'absolute';
        line.style.left = Math.min(startX, endX) + 'px';
        line.style.top = Math.min(startY, endY) + 'px';
        line.style.width = Math.abs(endX - startX) + 'px';
        line.style.height = Math.abs(endY - startY) + 'px';
        line.style.pointerEvents = 'none';
        line.style.zIndex = '1';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        path.setAttribute('x1', startX > endX ? Math.abs(endX - startX) : 0);
        path.setAttribute('y1', startY > endY ? Math.abs(endY - startY) : 0);
        path.setAttribute('x2', startX > endX ? 0 : Math.abs(endX - startX));
        path.setAttribute('y2', startY > endY ? 0 : Math.abs(endY - startY));
        path.setAttribute('stroke', '#3b82f6');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '5,5');
        path.setAttribute('opacity', '0.6');

        line.appendChild(path);
        return line;
    }
    
    createNodeElement(node) {
        const category = this.categories.find(cat => cat.id === node.category);
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'knowledge-node';
        nodeDiv.dataset.nodeId = node.id;
        nodeDiv.style.left = node.position.x + 'px';
        nodeDiv.style.top = node.position.y + 'px';
        nodeDiv.style.backgroundColor = (node.color || category?.color || '#6b7280') + '20';
        nodeDiv.style.borderColor = node.color || category?.color || '#6b7280';
        
        let badges = '';
        if (node.aiGenerated) {
            badges += '<div class="ai-badge">AI</div>';
        }
        if (node.media && node.media.length > 0) {
            badges += `<div class="media-indicator">${node.media.length}</div>`;
        }
        
        nodeDiv.innerHTML = `
            ${badges}
            <div class="node-title" style="color: ${node.color || category?.color || '#6b7280'}">${node.title}</div>
            <div class="node-category">${category?.name || 'Unknown'}</div>
            ${node.tags.length > 0 ? `<div class="node-tags">${node.tags.slice(0, 2).join(', ')}</div>` : ''}
        `;
        
        nodeDiv.addEventListener('click', (e) => {
            if (!this.draggedNode) {
                this.openNodeModal(node);
            }
        });
        
        return nodeDiv;
    }
    
    openNodeModal(node) {
        this.currentNode = node;
        this.isEditing = false;
        const modal = document.getElementById('node-modal');
        const modalHeader = document.getElementById('modal-header');
        const modalBody = document.getElementById('modal-body');
        const category = this.categories.find(cat => cat.id === node.category);
        
        // Set modal header border color
        modalHeader.style.borderBottomColor = node.color || category?.color || '#6b7280';
        
        this.renderModalContent();
        modal.classList.add('active');
    }

    renderModalContent() {
        if (!this.currentNode) return;

        const modalBody = document.getElementById('modal-body');
        const category = this.categories.find(cat => cat.id === this.currentNode.category);
        const nodeColor = this.currentNode.color || category?.color || '#6b7280';

        if (this.isEditing) {
            modalBody.innerHTML = `
                <div class="form-section">
                    <label>Title</label>
                    <textarea id="edit-title" style="background: #334155; border: 1px solid #475569; border-radius: 12px; padding: 16px; color: #f8fafc; width: 100%; font-family: inherit; resize: vertical;">${this.currentNode.title}</textarea>
                </div>
                
                <div class="form-section">
                    <label>Content</label>
                    <textarea id="edit-content" rows="6" style="background: #334155; border: 1px solid #475569; border-radius: 12px; padding: 16px; color: #f8fafc; width: 100%; font-family: inherit; resize: vertical;">${this.currentNode.content}</textarea>
                    
                    <div class="ai-generate-section">
                        <button type="button" class="ai-generate-button" id="modal-ai-generate" ${!this.settings.aiEnabled || !this.settings.openaiApiKey ? 'disabled' : ''}>
                            ✨ AI Enhance Content
                        </button>
                    </div>
                </div>

                <div class="form-section">
                    <label>Node Color</label>
                    <div class="color-picker" id="modal-color-picker"></div>
                </div>
                
                <div class="form-section">
                    <label>Tags</label>
                    <input type="text" id="edit-tags" value="${this.currentNode.tags.join(', ')}" style="background: #334155; border: 1px solid #475569; border-radius: 12px; padding: 16px; color: #f8fafc; width: 100%; font-family: inherit;">
                </div>

                <button class="save-button" id="save-node-changes" style="margin-top: 20px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    Save Changes
                </button>
            `;

            // Render color picker for modal
            this.renderModalColorPicker();

            // Add event listeners
            document.getElementById('save-node-changes').addEventListener('click', () => {
                this.saveNodeChanges();
            });

            const modalAiBtn = document.getElementById('modal-ai-generate');
            if (modalAiBtn) {
                modalAiBtn.addEventListener('click', () => {
                    this.generateModalAIContent();
                });
            }
        } else {
            modalBody.innerHTML = `
                <div style="background-color: ${nodeColor}20; color: ${nodeColor}; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px; font-size: 12px; font-weight: 500;">
                    ${category?.name || 'Unknown'}
                </div>
                
                ${this.currentNode.aiGenerated ? '<div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 4px 8px; border-radius: 12px; display: inline-block; font-size: 10px; font-weight: 700; margin-bottom: 16px;">AI Generated</div>' : ''}
                
                <h3 style="font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 16px; line-height: 1.3;">${this.currentNode.title}</h3>
                <p style="font-size: 16px; color: #cbd5e1; line-height: 1.5; margin-bottom: 24px;">${this.currentNode.content}</p>

                ${this.currentNode.tags.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin-right: 8px;">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                            <span style="font-size: 14px; font-weight: 500; color: #94a3b8;">Tags</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${this.currentNode.tags.map(tag => `<span style="background-color: #475569; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; color: #e2e8f0;">${tag}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${this.currentNode.connections.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin-right: 8px;">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                            <span style="font-size: 14px; font-weight: 500; color: #94a3b8;">Connected to ${this.currentNode.connections.length} nodes</span>
                        </div>
                    </div>
                ` : ''}

                ${this.currentNode.source ? `
                    <div style="margin-bottom: 24px;">
                        <div style="font-size: 14px; font-weight: 500; color: #94a3b8; margin-bottom: 4px;">Source:</div>
                        <div style="font-size: 14px; color: #cbd5e1; font-style: italic;">${this.currentNode.source}</div>
                    </div>
                ` : ''}

                <div style="margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin-right: 8px;">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span style="font-size: 14px; font-weight: 500; color: #94a3b8;">Created ${new Date(this.currentNode.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        }
    }

    renderModalColorPicker() {
        const container = document.getElementById('modal-color-picker');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.colorOptions.forEach(color => {
            const option = document.createElement('div');
            option.className = 'color-option';
            option.style.backgroundColor = color;
            
            if (color === (this.currentNode.color || this.categories.find(c => c.id === this.currentNode.category)?.color)) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                document.querySelectorAll('#modal-color-picker .color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.currentNode.color = color;
            });
            
            container.appendChild(option);
        });
    }

    async generateModalAIContent() {
        if (!this.settings.aiEnabled || !this.settings.openaiApiKey) {
            this.showMessage('Please configure your OpenAI API key in settings first.', 'error');
            return;
        }

        const contentInput = document.getElementById('edit-content');
        const titleInput = document.getElementById('edit-title');
        const prompt = `Enhance and expand this content: Title: "${titleInput.value}" Content: "${contentInput.value}"`;

        const button = document.getElementById('modal-ai-generate');
        const originalText = button.textContent;
        button.textContent = 'Enhancing...';
        button.disabled = true;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.settings.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that enhances educational content. Improve and expand the given content while maintaining its core meaning.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI content');
            }

            const data = await response.json();
            const enhancedContent = data.choices[0]?.message?.content || '';
            
            if (enhancedContent) {
                contentInput.value = enhancedContent;
                this.showMessage('Content enhanced with AI!', 'success');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            this.showMessage('Failed to enhance content. Please check your API key.', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        this.renderModalContent();
        
        const editButton = document.getElementById('edit-node');
        if (this.isEditing) {
            editButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                Save
            `;
        } else {
            editButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
            `;
        }
    }

    saveNodeChanges() {
        if (!this.currentNode) return;

        const title = document.getElementById('edit-title').value.trim();
        const content = document.getElementById('edit-content').value.trim();
        const tags = document.getElementById('edit-tags').value.trim();

        if (!title || !content) {
            this.showMessage('Title and content are required.', 'error');
            return;
        }

        // Update the node
        this.currentNode.title = title;
        this.currentNode.content = content;
        this.currentNode.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

        // Save changes
        this.saveData();
        this.renderKnowledgeWeb();
        this.toggleEditMode();
        this.showMessage('Node updated successfully!', 'success');
    }
    
    closeModal() {
        document.getElementById('node-modal').classList.remove('active');
        this.currentNode = null;
        this.isEditing = false;
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

    // Quiz functionality
    renderQuizSetup() {
        this.updateStats(); // Ensure quiz stats are up to date
    }

    async startQuiz() {
        if (this.nodes.length === 0) {
            this.showMessage('Add some knowledge nodes first to generate quizzes!', 'error');
            return;
        }

        try {
            const quiz = await this.generateQuiz();
            this.currentQuiz = {
                quiz,
                currentQuestionIndex: 0,
                answers: {},
                startTime: Date.now(),
                score: 0,
                isCompleted: false
            };

            this.renderQuizQuestion();
        } catch (error) {
            this.showMessage('Failed to generate quiz. Please try again.', 'error');
        }
    }

    async generateQuiz() {
        // Simple quiz generation - in a real app, this could use AI
        const selectedNodes = this.nodes.slice(0, Math.min(5, this.nodes.length));
        const questions = [];

        selectedNodes.forEach((node, index) => {
            // Generate a simple multiple choice question
            const question = {
                id: `q${index}`,
                type: 'multiple-choice',
                question: `What is the main topic of "${node.title}"?`,
                options: [
                    node.content.split('.')[0] + '.',
                    'A completely different concept',
                    'An unrelated topic',
                    'Something else entirely'
                ],
                correctAnswer: node.content.split('.')[0] + '.',
                explanation: `This question is based on the content of "${node.title}".`,
                difficulty: this.selectedDifficulty,
                nodeId: node.id,
                category: node.category
            };

            questions.push(question);
        });

        return {
            id: Date.now().toString(),
            title: `Knowledge Quiz - ${new Date().toLocaleDateString()}`,
            questions,
            difficulty: this.selectedDifficulty,
            timeLimit: 300, // 5 minutes
            createdAt: new Date().toISOString()
        };
    }

    renderQuizQuestion() {
        if (!this.currentQuiz) return;

        const setupCard = document.getElementById('quiz-setup');
        const container = document.getElementById('quiz-container');
        
        setupCard.style.display = 'none';
        container.classList.remove('hidden');

        const question = this.currentQuiz.quiz.questions[this.currentQuiz.currentQuestionIndex];
        const progress = ((this.currentQuiz.currentQuestionIndex + 1) / this.currentQuiz.quiz.questions.length) * 100;

        container.innerHTML = `
            <div style="background: rgba(30, 41, 59, 0.6); padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div style="flex: 1; margin-right: 20px;">
                        <div style="height: 4px; background: #334155; border-radius: 2px; margin-bottom: 8px;">
                            <div style="height: 100%; background: #3b82f6; border-radius: 2px; width: ${progress}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="font-size: 12px; color: #94a3b8;">
                            Question ${this.currentQuiz.currentQuestionIndex + 1} of ${this.currentQuiz.quiz.questions.length}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span style="font-size: 16px; font-weight: 700; color: #f8fafc;" id="quiz-timer">5:00</span>
                    </div>
                </div>
            </div>

            <div style="background: rgba(30, 41, 59, 0.6); padding: 32px; border-radius: 20px;">
                <div style="font-size: 12px; color: #3b82f6; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${question.type.replace('-', ' ')}
                </div>
                <h2 style="font-size: 24px; font-weight: 600; color: #f8fafc; line-height: 1.4; margin-bottom: 32px;">
                    ${question.question}
                </h2>

                <div style="display: flex; flex-direction: column; gap: 16px;" id="quiz-answers">
                    ${question.options ? question.options.map((option, index) => `
                        <button class="quiz-answer-btn" data-answer="${option}" style="
                            background: rgba(51, 65, 85, 0.8);
                            border: 1px solid rgba(71, 85, 105, 0.5);
                            border-radius: 12px;
                            padding: 20px;
                            color: #f8fafc;
                            font-size: 16px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            text-align: left;
                        " onmouseover="this.style.background='rgba(71, 85, 105, 0.8)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(51, 65, 85, 0.8)'; this.style.transform='translateY(0)'">
                            ${option}
                        </button>
                    `).join('') : ''}
                </div>
            </div>
        `;

        // Add event listeners to answer buttons
        document.querySelectorAll('.quiz-answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.answerQuestion(e.target.dataset.answer);
            });
        });

        // Start timer
        this.startQuizTimer();
    }

    startQuizTimer() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
        }

        let timeRemaining = 300; // 5 minutes
        const timerElement = document.getElementById('quiz-timer');

        this.quizTimer = setInterval(() => {
            timeRemaining--;
            
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (timeRemaining <= 0) {
                clearInterval(this.quizTimer);
                this.completeQuiz();
            }
        }, 1000);
    }

    answerQuestion(answer) {
        if (!this.currentQuiz) return;

        const currentQuestion = this.currentQuiz.quiz.questions[this.currentQuiz.currentQuestionIndex];
        const isCorrect = answer === currentQuestion.correctAnswer;
        
        this.currentQuiz.answers[currentQuestion.id] = answer;
        if (isCorrect) {
            this.currentQuiz.score++;
        }

        this.currentQuiz.currentQuestionIndex++;

        if (this.currentQuiz.currentQuestionIndex >= this.currentQuiz.quiz.questions.length) {
            this.completeQuiz();
        } else {
            this.renderQuizQuestion();
        }
    }

    completeQuiz() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
        }

        if (!this.currentQuiz) return;

        const timeSpent = (Date.now() - this.currentQuiz.startTime) / 1000;
        const scorePercentage = (this.currentQuiz.score / this.currentQuiz.quiz.questions.length) * 100;

        // Update quiz stats
        this.stats.quizStats.totalQuizzes++;
        this.stats.quizStats.correctAnswers += this.currentQuiz.score;
        this.stats.quizStats.totalQuestions += this.currentQuiz.quiz.questions.length;
        this.stats.quizStats.timeSpent += Math.round(timeSpent / 60);
        this.stats.quizStats.difficultyProgress[this.selectedDifficulty]++;
        this.stats.quizStats.averageScore = (this.stats.quizStats.correctAnswers / this.stats.quizStats.totalQuestions) * 100;

        // Add bonus XP
        const bonusXP = Math.round(scorePercentage / 10);
        this.stats.experiencePoints += bonusXP;
        this.stats.level = Math.floor(this.stats.experiencePoints / 100) + 1;

        this.saveData();
        this.renderQuizResults(scorePercentage, timeSpent);
    }

    renderQuizResults(scorePercentage, timeSpent) {
        const container = document.getElementById('quiz-container');
        
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="margin-bottom: 32px;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-bottom: 16px;">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                        <path d="M4 22h16"/>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                    <h2 style="font-size: 32px; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">Quiz Complete!</h2>
                </div>

                <div style="background: rgba(30, 41, 59, 0.6); border-radius: 20px; padding: 40px; margin-bottom: 32px;">
                    <div style="font-size: 48px; font-weight: 700; color: #3b82f6; margin-bottom: 8px;">
                        ${Math.round(scorePercentage)}%
                    </div>
                    <div style="font-size: 16px; color: #94a3b8;">
                        ${this.currentQuiz.score} out of ${this.currentQuiz.quiz.questions.length} correct
                    </div>
                </div>

                <div style="display: flex; justify-content: space-around; margin-bottom: 32px;">
                    <div style="text-align: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" style="margin-bottom: 8px;">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <div style="font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">
                            ${Math.floor(timeSpent / 60)}:${Math.round(timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8;">Time Taken</div>
                    </div>
                    <div style="text-align: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-bottom: 8px;">
                            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                        </svg>
                        <div style="font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">
                            ${this.selectedDifficulty}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8;">Difficulty</div>
                    </div>
                    <div style="text-align: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="margin-bottom: 8px;">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                        </svg>
                        <div style="font-size: 18px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">
                            ${scorePercentage >= 80 ? 'Excellent' : scorePercentage >= 60 ? 'Good' : 'Keep Learning'}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8;">Performance</div>
                    </div>
                </div>

                <button class="start-quiz-button" id="try-again-btn" style="margin: 0 auto;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M3 21v-5h5"/>
                    </svg>
                    Try Again
                </button>
            </div>
        `;

        document.getElementById('try-again-btn').addEventListener('click', () => {
            this.resetQuiz();
        });

        this.showMessage(`Quiz completed! Score: ${Math.round(scorePercentage)}%`, 'success');
    }

    resetQuiz() {
        this.currentQuiz = null;
        const setupCard = document.getElementById('quiz-setup');
        const container = document.getElementById('quiz-container');
        
        setupCard.style.display = 'block';
        container.classList.add('hidden');
        
        this.updateStats();
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
            
            <div class="progress-card" style="border-left-color: #8b5cf6">
                <div class="card-header">
                    <div class="card-icon" style="background-color: #8b5cf620">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M16 12l-4-4-4 4"/>
                            <path d="M12 16V8"/>
                        </svg>
                    </div>
                    <div class="card-title">Quiz Performance</div>
                </div>
                <div class="card-value" style="color: #8b5cf6">${Math.round(this.stats.quizStats.averageScore)}%</div>
                <div class="card-subtitle">${this.stats.quizStats.totalQuizzes} quizzes taken</div>
            </div>
            
            <div class="progress-card" style="border-left-color: #f59e0b">
                <div class="card-header">
                    <div class="card-icon" style="background-color: #f59e0b20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                        </svg>
                    </div>
                    <div class="card-title">Experience</div>
                </div>
                <div class="card-value" style="color: #f59e0b">${this.stats.experiencePoints}</div>
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="font-size: 18px; font-weight: 700; color: #f8fafc;">Level ${this.stats.level}</div>
                    <div style="font-size: 14px; font-weight: 500; color: #94a3b8;">${currentLevelProgress}/100 XP</div>
                </div>
                <div style="height: 8px; background-color: #334155; border-radius: 4px;">
                    <div style="height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 4px; width: ${currentLevelProgress}%; transition: width 0.3s ease;"></div>
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
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <div style="width: 12px; height: 12px; border-radius: 6px; background-color: ${category.color}; margin-right: 12px;"></div>
                        <div style="font-size: 14px; font-weight: 500; color: #e2e8f0; flex: 1;">${category.name}</div>
                        <div style="font-size: 14px; font-weight: 700; color: #94a3b8;">${count}</div>
                    </div>
                    <div style="height: 4px; background-color: #334155; border-radius: 2px;">
                        <div style="height: 100%; border-radius: 2px; min-width: 4px; width: ${Math.max(percentage, 5)}%; background-color: ${category.color}; transition: width 0.3s ease;"></div>
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
                isUnlocked: this.stats.quizStats.totalQuizzes >= 5
            },
            {
                title: 'AI Explorer',
                description: 'Used AI to generate content',
                icon: '✨',
                color: '#8b5cf6',
                isUnlocked: this.nodes.some(node => node.aiGenerated)
            },
            {
                title: 'Learning Enthusiast',
                description: 'Reached Level 5',
                icon: '⭐',
                color: '#ef4444',
                isUnlocked: this.stats.level >= 5
            }
        ];
        
        const achievementItems = achievements.map(achievement => `
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 48px; height: 48px; border-radius: 12px; background-color: ${achievement.color}20; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                    <span style="font-size: 24px">${achievement.icon}</span>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 4px;">${achievement.title}</div>
                    <div style="font-size: 14px; color: #94a3b8;">${achievement.description}</div>
                </div>
                ${achievement.isUnlocked ? '<div style="width: 24px; height: 24px; border-radius: 12px; background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">✓</div>' : ''}
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
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 64px; height: 64px; border-radius: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Knowledge Explorer</div>
                    <div style="font-size: 14px; font-weight: 500; color: #94a3b8;">Level ${this.stats.level}</div>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-around;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${this.stats.totalNodes}</div>
                    <div style="font-size: 12px; font-weight: 500; color: #94a3b8;">Nodes</div>
                </div>
                <div style="width: 1px; height: 32px; background-color: #334155;"></div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${this.stats.quizStats.totalQuizzes}</div>
                    <div style="font-size: 12px; font-weight: 500; color: #94a3b8;">Quizzes</div>
                </div>
                <div style="width: 1px; height: 32px; background-color: #334155;"></div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${this.stats.experiencePoints}</div>
                    <div style="font-size: 12px; font-weight: 500; color: #94a3b8;">XP</div>
                </div>
            </div>
        `;
        
        menuSections.innerHTML = `
            <div class="settings-section">
                <h2 class="section-title">App Settings</h2>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                            </svg>
                        </div>
                        <div class="setting-text">
                            <h3>App Settings</h3>
                            <p>Customize your experience</p>
                        </div>
                    </div>
                </div>

                <div class="setting-item" onclick="app.exportData()">
                    <div class="setting-info">
                        <div class="setting-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </div>
                        <div class="setting-text">
                            <h3>Export Data</h3>
                            <p>Download your knowledge web</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h2 class="section-title">Danger Zone</h2>
                
                <div class="setting-item" onclick="app.clearAllData()">
                    <div class="setting-info">
                        <div class="setting-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </div>
                        <div class="setting-text">
                            <h3 style="color: #dc2626;">Clear All Data</h3>
                            <p>Permanently delete everything</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px; margin-bottom: 40px;">
                <div style="font-size: 24px; font-weight: 700; color: #3b82f6; margin-bottom: 4px;">MindWeb</div>
                <div style="font-size: 14px; font-weight: 500; color: #64748b; margin-bottom: 16px;">Version 1.0.0</div>
                <div style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
                    Build your personal web of knowledge by capturing and connecting insights from your learning journey.
                </div>
            </div>
        `;
    }
    
    exportData() {
        const data = {
            nodes: this.nodes,
            stats: this.stats,
            settings: this.settings,
            quizzes: this.quizzes,
            exportDate: new Date().toISOString()
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
            localStorage.removeItem('mindweb_settings');
            localStorage.removeItem('mindweb_quizzes');
            location.reload();
        }
    }
    
    saveData() {
        localStorage.setItem('mindweb_nodes', JSON.stringify(this.nodes));
        localStorage.setItem('mindweb_stats', JSON.stringify(this.stats));
    }

    saveSettings() {
        localStorage.setItem('mindweb_settings', JSON.stringify(this.settings));
    }
    
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
            </svg>
            ${message}
        `;
        
        if (type === 'error') {
            messageDiv.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            messageDiv.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                ${message}
            `;
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnhancedKnowledgeApp();
});

// Add some sample data for demo purposes
setTimeout(() => {
    if (window.app && window.app.nodes.length === 0) {
        const sampleNodes = [
            {
                id: '1',
                title: 'Machine Learning Fundamentals',
                content: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
                category: 'technology',
                tags: ['AI', 'algorithms', 'data science'],
                source: 'Introduction to Statistical Learning',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                position: { x: 100, y: 150 },
                color: '#8b5cf6',
                connections: [],
                aiGenerated: false,
                media: []
            },
            {
                id: '2',
                title: 'The Scientific Method',
                content: 'A systematic approach to understanding the natural world through observation, hypothesis formation, experimentation, and analysis.',
                category: 'science',
                tags: ['research', 'methodology', 'empirical'],
                source: 'Scientific Method Course',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                position: { x: 300, y: 100 },
                color: '#3b82f6',
                connections: [],
                aiGenerated: false,
                media: []
            },
            {
                id: '3',
                title: 'Stoic Philosophy Principles',
                content: 'Focus on what you can control, accept what you cannot, and find wisdom in the distinction between the two.',
                category: 'philosophy',
                tags: ['stoicism', 'wisdom', 'mindfulness'],
                source: 'Meditations by Marcus Aurelius',
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                position: { x: 200, y: 300 },
                color: '#10b981',
                connections: [],
                aiGenerated: false,
                media: []
            }
        ];
        
        window.app.nodes = sampleNodes;
        window.app.updateStats();
        window.app.saveData();
        window.app.renderKnowledgeWeb();
    }
}, 1000);