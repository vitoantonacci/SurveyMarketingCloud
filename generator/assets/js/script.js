// Survey Generator JavaScript
class SurveyGenerator {
    constructor() {
        this.questions = [];
        this.currentQuestionId = 1;
        this.templates = this.initializeTemplates();
        this.storageKey = 'survey-generator-questions';
        this.editingIndex = undefined;
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeMaterialize();
        this.setupInputStateHandlers();
        this.updateUI();
    }
    
    initializeMaterialize() {
        // Initialize Materialize components
        M.AutoInit();
    }
    
    setupInputStateHandlers() {
        // Handle input state changes for all inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('.input-field input, .input-field select')) {
                this.updateInputState(e.target);
                // Clear error when user starts typing
                this.clearFieldError(e.target);
            }
        });
        
        // Handle dynamic content (answers and aspects)
        document.addEventListener('input', (e) => {
            if (e.target.matches('.answer-item input, .aspect-item input')) {
                this.updateInputState(e.target);
                // Clear error when user starts typing
                this.clearFieldError(e.target);
            }
        });
        
        // Clear errors when dropdown changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.input-field select')) {
                this.clearFieldError(e.target);
            }
        });
    }
    
    updateInputState(input) {
        const hasValue = input.value && input.value.trim() !== '';
        
        // For static form inputs, find the label
        const inputField = input.closest('.input-field');
        if (inputField) {
            const label = inputField.querySelector('label');
            if (label) {
                if (hasValue) {
                    label.style.color = 'var(--primary-color)';
                    label.style.transform = 'translateY(-20px) scale(0.8)';
                    input.style.borderColor = 'var(--primary-color)';
                    input.classList.add('filled');
                } else {
                    label.style.color = 'var(--gray-600)';
                    label.style.transform = 'translateY(0) scale(1)';
                    input.style.borderColor = 'var(--gray-400)';
                    input.classList.remove('filled');
                }
            }
        }
        
        // For dynamic inputs (answers/aspects), just update border
        if (input.closest('.answer-item, .aspect-item')) {
            if (hasValue) {
                input.style.borderColor = 'var(--primary-color)';
                input.classList.add('filled');
            } else {
                input.style.borderColor = 'var(--gray-400)';
                input.classList.remove('filled');
            }
        }
    }
    
    updateAllInputStates() {
        // Update all form inputs
        const formInputs = document.querySelectorAll('.input-field input, .input-field select');
        formInputs.forEach(input => {
            this.updateInputState(input);
            // Force update for pre-filled inputs
            if (input.value && input.value.trim() !== '') {
                input.classList.add('filled');
                const inputField = input.closest('.input-field');
                if (inputField) {
                    const label = inputField.querySelector('label');
                    if (label) {
                        label.style.color = 'var(--primary-color)';
                        label.style.transform = 'translateY(-20px) scale(0.8)';
                        input.style.borderColor = 'var(--primary-color)';
                    }
                }
            }
        });
        
        // Update dynamic inputs
        const dynamicInputs = document.querySelectorAll('.answer-item input, .aspect-item input');
        dynamicInputs.forEach(input => {
            this.updateInputState(input);
            // Force update for pre-filled dynamic inputs
            if (input.value && input.value.trim() !== '') {
                input.classList.add('filled');
                input.style.borderColor = 'var(--primary-color)';
            }
        });
    }
    
    initializeTemplates() {
        return {
            // Default configurations for each question type
            multiple_choice: {
                default: [
                    { text: 'Opzione 1' },
                    { text: 'Opzione 2' },
                    { text: 'Opzione 3' }
                ]
            },
            likert_scale: {
                default: {
                    min: 1,
                    max: 5,
                    labels: {
                        min: '1 = Per niente d\'accordo',
                        max: '5 = Completamente d\'accordo'
                    }
                }
            },
            multi_likert: {
                default: {
                    aspects: [
                        { name: 'Qualità', id: 'qualita' },
                        { name: 'Design', id: 'design' }
                    ],
                    scale: {
                        min: 1,
                        max: 5,
                        labels: {
                            min: '1 = Per niente soddisfatto',
                            max: '5 = Molto soddisfatto'
                        }
                    }
                }
            }
        };
    }
    
    setupEventListeners() {
        // Add question button
        document.getElementById('add-question-btn').addEventListener('click', () => {
            this.showQuestionForm();
        });
        
        // Question template change
        document.getElementById('question-template').addEventListener('change', (e) => {
            this.handleQuestionTemplateChange(e.target.value);
        });
        
        // Add answer button
        document.getElementById('add-answer-btn').addEventListener('click', () => {
            this.addAnswerField();
        });
        
        // Add aspect button
        document.getElementById('add-aspect-btn').addEventListener('click', () => {
            this.addAspectField();
        });
        
        // Form actions
        document.getElementById('cancel-question-btn').addEventListener('click', () => {
            this.hideQuestionForm();
        });
        
        document.getElementById('save-question-btn').addEventListener('click', () => {
            this.saveQuestion();
        });
        
        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.showExportModal();
        });
        
        // Clear all
        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.showClearAllModal();
        });
        
        // Copy code button
        document.getElementById('copy-code-btn').addEventListener('click', () => {
            this.copyCode();
        });
        
        // Modal close button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                this.hideExportModal();
            }
            if (e.target.classList.contains('clear-confirm-btn')) {
                this.confirmClearAll();
            }
            if (e.target.classList.contains('clear-cancel-btn')) {
                this.hideClearAllModal();
            }
        });
    }
    
    showQuestionForm() {
        document.getElementById('question-form').style.display = 'block';
        document.getElementById('add-question-btn').style.display = 'none';
        this.resetForm();
        
        // Update input states when form is shown
        setTimeout(() => {
            this.updateAllInputStates();
        }, 50);
    }
    
    hideQuestionForm() {
        document.getElementById('question-form').style.display = 'none';
        document.getElementById('add-question-btn').style.display = 'inline-flex';
        this.editingIndex = undefined; // Reset editing state
        this.resetForm();
    }
    
    resetForm() {
        document.getElementById('question-title').value = '';
        document.getElementById('question-description').value = '';
        document.getElementById('question-template').value = '';
        document.getElementById('question-required').value = 'true';
        document.getElementById('answers-container').innerHTML = '';
        
        // Hide sections
        document.getElementById('answers-section').style.display = 'none';
        document.getElementById('aspects-section').style.display = 'none';
        
        // Clear validation errors
        this.clearValidationErrors();
        
        // Reset Materialize
        M.updateTextFields();
    }
    
    handleQuestionTemplateChange(value) {
        const answersSection = document.getElementById('answers-section');
        const aspectsSection = document.getElementById('aspects-section');
        const answersContainer = document.getElementById('answers-container');
        const aspectsContainer = document.getElementById('aspects-container');
        
        // Hide all sections first
        answersSection.style.display = 'none';
        aspectsSection.style.display = 'none';
        
        if (!value) {
            return;
        }
        
        // Show answers section for multiple_choice
        if (value === 'multiple_choice') {
            answersSection.style.display = 'block';
            answersContainer.innerHTML = '';
            
            // Add default answers
            const defaultAnswers = this.templates.multiple_choice.default;
            defaultAnswers.forEach(answer => {
                this.addAnswerField(answer.text);
            });
        }
        
        // Show aspects section for multi_likert
        if (value === 'multi_likert') {
            aspectsSection.style.display = 'block';
            aspectsContainer.innerHTML = '';
            
            // Add default aspects
            const defaultAspects = this.templates.multi_likert.default.aspects;
            defaultAspects.forEach(aspect => {
                this.addAspectField(aspect.name);
            });
        }
    }
    
    addAnswerField(value = '') {
        const container = document.getElementById('answers-container');
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-item';
        
        answerDiv.innerHTML = `
            <input type="text" value="${value}" placeholder="Inserisci risposta">
            <button type="button" class="remove-answer-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(answerDiv);
    }
    
    addAspectField(value = '') {
        const container = document.getElementById('aspects-container');
        const aspectDiv = document.createElement('div');
        aspectDiv.className = 'aspect-item';
        
        aspectDiv.innerHTML = `
            <input type="text" value="${value}" placeholder="Inserisci aspetto da valutare">
            <button type="button" class="remove-aspect-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(aspectDiv);
    }
    
    saveQuestion() {
        // Clear previous errors
        this.clearValidationErrors();
        
        const title = document.getElementById('question-title').value.trim();
        const description = document.getElementById('question-description').value.trim();
        const type = document.getElementById('question-template').value;
        const required = document.getElementById('question-required').value === 'true';
        
        let hasErrors = false;
        
        // Validate title
        if (!title) {
            this.showFieldError('question-title', 'Inserisci un titolo per la domanda');
            hasErrors = true;
        }
        
        // Validate type
        if (!type) {
            this.showFieldError('question-template', 'Seleziona un tipo di domanda');
            hasErrors = true;
        }
        
        if (hasErrors) {
            this.scrollToFirstError();
            return;
        }
        
        const question = {
            id: this.currentQuestionId++,
            type: type,
            required: required,
            title: title,
            description: description
        };
        
        // Add type-specific data
        if (type === 'multiple_choice') {
            const answers = this.getMultipleChoiceAnswers();
            if (answers.length === 0) {
                this.showSectionError('answers-section', 'Aggiungi almeno una risposta');
                hasErrors = true;
            } else {
                question.answers = answers;
            }
        } else if (type === 'likert_scale') {
            question.scale = this.templates.likert_scale.default;
        } else if (type === 'multi_likert') {
            const aspects = this.getMultiLikertAspects();
            if (aspects.length === 0) {
                this.showSectionError('aspects-section', 'Aggiungi almeno un aspetto da valutare');
                hasErrors = true;
            } else {
                question.aspects = aspects;
                question.scale = this.templates.multi_likert.default.scale;
            }
        } else if (type === 'open_text') {
            question.placeholder = 'Scrivi qui la tua risposta...';
        }
        
        if (hasErrors) {
            this.scrollToFirstError();
            return;
        }
        
        if (this.editingIndex !== undefined) {
            // Editing existing question
            this.questions[this.editingIndex] = question;
            this.editingIndex = undefined; // Reset editing state
        } else {
            // Adding new question
            this.questions.push(question);
        }
        
        this.saveToStorage();
        this.hideQuestionForm();
        this.updateUI();
    }
    
    getMultipleChoiceAnswers() {
        const answerInputs = document.querySelectorAll('#answers-container .answer-item input');
        const answers = [];
        
        answerInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                answers.push({ text: value });
            }
        });
        
        return answers;
    }
    
    getMultiLikertAspects() {
        const aspectInputs = document.querySelectorAll('#aspects-container .aspect-item input');
        const aspects = [];
        
        aspectInputs.forEach((input, index) => {
            const value = input.value.trim();
            if (value) {
                aspects.push({ 
                    name: value, 
                    id: value.toLowerCase().replace(/\s+/g, '_')
                });
            }
        });
        
        return aspects;
    }
    
    // Validation methods
    clearValidationErrors() {
        // Remove error classes from all elements
        document.querySelectorAll('.input-field.error').forEach(el => {
            el.classList.remove('error');
        });
        
        document.querySelectorAll('.answer-item.error, .aspect-item.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Remove error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
    }
    
    clearFieldError(input) {
        const inputField = input.closest('.input-field');
        const answerItem = input.closest('.answer-item');
        const aspectItem = input.closest('.aspect-item');
        
        if (inputField) {
            inputField.classList.remove('error');
            const errorMsg = inputField.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
        
        if (answerItem) {
            answerItem.classList.remove('error');
        }
        
        if (aspectItem) {
            aspectItem.classList.remove('error');
        }
    }
    
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const inputField = field.closest('.input-field');
        
        if (inputField) {
            inputField.classList.add('error');
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            
            inputField.appendChild(errorDiv);
        }
    }
    
    showSectionError(sectionId, message) {
        const section = document.getElementById(sectionId);
        
        if (section) {
            // Add error message to section header
            const header = section.querySelector('h3');
            if (header) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
                
                header.appendChild(errorDiv);
            }
        }
    }
    
    scrollToFirstError() {
        const firstError = document.querySelector('.input-field.error, .answer-item.error, .aspect-item.error');
        
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Focus the input if it's focusable
            const input = firstError.querySelector('input, select');
            if (input) {
                setTimeout(() => {
                    input.focus();
                }, 500);
            }
        }
    }
    
    // LocalStorage methods
    saveToStorage() {
        try {
            const data = {
                questions: this.questions,
                currentQuestionId: this.currentQuestionId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.questions = data.questions || [];
                this.currentQuestionId = data.currentQuestionId || 1;
                
                // Update currentQuestionId to be higher than existing questions
                if (this.questions.length > 0) {
                    const maxId = Math.max(...this.questions.map(q => q.id));
                    this.currentQuestionId = maxId + 1;
                }
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.questions = [];
            this.currentQuestionId = 1;
        }
    }
    
    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            this.questions = [];
            this.currentQuestionId = 1;
            this.updateUI();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
    
    updateUI() {
        this.updateQuestionsList();
        this.updateActionButtons();
    }
    
    updateQuestionsList() {
        const container = document.getElementById('questions-container');
        
        if (this.questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <h3>Nessuna domanda configurata</h3>
                    <p>Aggiungi la tua prima domanda per iniziare</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.questions.map((question, index) => `
            <div class="question-item">
                <div class="question-header">
                    <div class="question-info">
                        <h4>${question.title}</h4>
                        <p>${question.description || 'Nessuna descrizione'}</p>
                        <div class="question-meta">
                            <span>${this.getTypeLabel(question.type)}</span>
                            <span>${question.required ? 'Obbligatoria' : 'Opzionale'}</span>
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="move-up-btn" onclick="generator.moveQuestion(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="move-down-btn" onclick="generator.moveQuestion(${index}, 'down')" ${index === this.questions.length - 1 ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="edit-question-btn" onclick="generator.editQuestion(${index})">
                            <i class="fas fa-edit"></i> Modifica
                        </button>
                        <button class="remove-question-btn" onclick="generator.removeQuestion(${index})">
                            <i class="fas fa-trash"></i> Rimuovi
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    getTypeLabel(type) {
        const labels = {
            'multiple_choice': 'Scelta Multipla',
            'likert_scale': 'Scala Likert',
            'yes_no': 'Sì/No',
            'open_text': 'Testo Libero',
            'multi_likert': 'Multi-Likert'
        };
        return labels[type] || type;
    }
    
    updateActionButtons() {
        const hasQuestions = this.questions.length > 0;
        document.getElementById('export-btn').disabled = !hasQuestions;
        document.getElementById('clear-all-btn').disabled = !hasQuestions;
    }
    
    editQuestion(index) {
        const question = this.questions[index];
        this.editingIndex = index; // Store the index of the question being edited
        this.showQuestionForm();
        
        // Populate form
        document.getElementById('question-title').value = question.title;
        document.getElementById('question-description').value = question.description || '';
        document.getElementById('question-template').value = question.type;
        document.getElementById('question-required').value = question.required ? 'true' : 'false';
        
        // Update input states for filled fields
        setTimeout(() => {
            this.updateAllInputStates();
        }, 100);
        
        // Trigger template change
        this.handleQuestionTemplateChange(question.type);
        
        // Load answers if applicable
        if (question.type === 'multiple_choice' && question.answers) {
            const container = document.getElementById('answers-container');
            container.innerHTML = '';
            question.answers.forEach(answer => {
                this.addAnswerField(answer.text);
            });
        }
        
        // Load aspects if applicable
        if (question.type === 'multi_likert' && question.aspects) {
            const container = document.getElementById('aspects-container');
            container.innerHTML = '';
            question.aspects.forEach(aspect => {
                this.addAspectField(aspect.name);
            });
        }
        
        // Update states for dynamic inputs
        setTimeout(() => {
            this.updateAllInputStates();
        }, 200);
    }
    
    removeQuestion(index) {
        if (confirm('Sei sicuro di voler rimuovere questa domanda?')) {
            this.questions.splice(index, 1);
            this.saveToStorage();
            this.updateUI();
        }
    }
    
    moveQuestion(index, direction) {
        if (direction === 'up' && index > 0) {
            // Move up
            const temp = this.questions[index];
            this.questions[index] = this.questions[index - 1];
            this.questions[index - 1] = temp;
            this.saveToStorage();
            this.updateUI();
        } else if (direction === 'down' && index < this.questions.length - 1) {
            // Move down
            const temp = this.questions[index];
            this.questions[index] = this.questions[index + 1];
            this.questions[index + 1] = temp;
            this.saveToStorage();
            this.updateUI();
        }
    }
    
    showExportModal() {
        const exportCode = this.generateExportCode();
        document.getElementById('export-code').value = exportCode;
        
        const modal = document.getElementById('export-modal');
        modal.classList.add('open');
        
        // Add close event listener if not already added
        if (!modal.hasAttribute('data-listener-added')) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideExportModal();
                }
            });
            modal.setAttribute('data-listener-added', 'true');
        }
    }
    
    hideExportModal() {
        const modal = document.getElementById('export-modal');
        modal.classList.remove('open');
    }
    
    showClearAllModal() {
        const modal = document.getElementById('clear-all-modal');
        modal.classList.add('open');
        
        // Add close event listener if not already added
        if (!modal.hasAttribute('data-listener-added')) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideClearAllModal();
                }
            });
            modal.setAttribute('data-listener-added', 'true');
        }
    }
    
    hideClearAllModal() {
        const modal = document.getElementById('clear-all-modal');
        modal.classList.remove('open');
    }
    
    confirmClearAll() {
        this.clearStorage();
        this.hideClearAllModal();
    }
    
    generateExportCode() {
        // Create a copy of questions with sequential IDs
        const questionsWithSequentialIds = this.questions.map((question, index) => ({
            ...question,
            id: index + 1
        }));
        
        const questionsJson = JSON.stringify(questionsWithSequentialIds, null, 4);
        return `questions: ${questionsJson}`;
    }
    
    copyCode() {
        const textarea = document.getElementById('export-code');
        textarea.select();
        document.execCommand('copy');
        
        // Show feedback
        const btn = document.getElementById('copy-code-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copiato!';
        btn.style.background = 'var(--primary-color)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }
    
}

// Initialize the generator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.generator = new SurveyGenerator();
});
