// Knowledge Management App
class KnowledgeApp {
    constructor() {
        this.nodes = JSON.parse(localStorage.getItem('mindweb_nodes') || '[]');
        this.stats = JSON.parse(localStorage.getItem('mindweb_stats') || JSON.stringify({
            totalNodes: 0,
            totalConnections: 0,
            experiencePoints: 0,
            level: 1,
            categories: {}
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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.updateStats();
        this.renderKnowledgeWeb();
        this.renderProgress();
        this.renderProfile();
    }
    
    setupEventListeners() {
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
        
        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('delete-node').addEventListener('click', () => {
            this.deleteNode();
        });
        
        // Close modal on backdrop click
        document.getElementById('node-modal').addEventListener('click', (e) => {
            if (e.target.id === 'node-modal') {
                this.closeModal();
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
        
        nodeDiv.innerHTML = `
            <div class="node-title" style="color: ${category.color}">${node.title}</div>
            <div class="node-category">${category.name}</div>
            ${node.tags.length > 0 ? `<div class="node-tags">${node.tags.slice(0, 2).join(', ')}</div>` : ''}
        `;
        
        nodeDiv.addEventListener('click', () => {
            this.openNodeModal(node);
        });
        
        return nodeDiv;
    }
    
    openNodeModal(node) {
        this.currentNode = node;
        const modal = document.getElementById('node-modal');
        const modalBody = document.getElementById('modal-body');
        const category = this.categories.find(cat => cat.id === node.category);
        
        // Set modal header border color
        document.querySelector('.modal-header').style.borderBottomColor = category.color;
        
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
    }
    
    closeModal() {
        document.getElementById('node-modal').classList.remove('active');
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
                            <path d="M6 9l6 6 6-6"/>
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
                title: 'Learning Enthusiast',
                description: 'Reached Level 5',
                icon: '⭐',
                color: '#f59e0b',
                isUnlocked: this.stats.level >= 5
            }
        ];
        
        const achievementItems = achievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon" style="background-color: ${achievement.color}20">
                    <span style="font-size: 24px">${achievement.icon}</span>
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
                    <div class="stat-value">0</div>
                    <div class="stat-label">Connections</div>
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
                <h3 class="section-title">Settings</h3>
                <button class="menu-item">
                    <div class="menu-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                        </svg>
                    </div>
                    <div class="menu-text">App Settings</div>
                </button>
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
                <div class="app-version">Version 1.0.0</div>
                <div class="app-description">
                    Build your personal web of knowledge by capturing and connecting insights from your learning journey.
                </div>
            </div>
        `;
    }
    
    exportData() {
        const data = {
            nodes: this.nodes,
            stats: this.stats,
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
        if (confirm('This will permanently delete all your knowledge nodes and progress. This action cannot be undone. Are you sure?')) {
            localStorage.removeItem('mindweb_nodes');
            localStorage.removeItem('mindweb_stats');
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
        messageDiv.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
            </svg>
            ${message}
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
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
                content: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
                category: 'technology',
                tags: ['AI', 'algorithms', 'data science'],
                source: 'Introduction to Statistical Learning',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                position: { x: 100, y: 150 }
            },
            {
                id: '2',
                title: 'The Scientific Method',
                content: 'A systematic approach to understanding the natural world through observation, hypothesis formation, experimentation, and analysis.',
                category: 'science',
                tags: ['research', 'methodology', 'empirical'],
                source: 'Scientific Method Course',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                position: { x: 300, y: 100 }
            },
            {
                id: '3',
                title: 'Stoic Philosophy Principles',
                content: 'Focus on what you can control, accept what you cannot, and find wisdom in the distinction between the two.',
                category: 'philosophy',
                tags: ['stoicism', 'wisdom', 'mindfulness'],
                source: 'Meditations by Marcus Aurelius',
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                position: { x: 200, y: 300 }
            }
        ];
        
        window.app.nodes = sampleNodes;
        window.app.updateStats();
        window.app.saveData();
        window.app.renderKnowledgeWeb();
    }
}, 1000);