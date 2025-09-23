// Survey Generator JavaScript
class SurveyGenerator {
    constructor() {
        this.questions = [];
        this.currentQuestionId = 1;
        this.templates = this.initializeTemplates();
        
        this.init();
    }
    
    init() {
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
            }
        });
        
        // Handle dynamic content (answers and aspects)
        document.addEventListener('input', (e) => {
            if (e.target.matches('.answer-item input, .aspect-item input')) {
                this.updateInputState(e.target);
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
                    input.style.borderColor = 'var(--primary-color)';
                    input.classList.add('filled');
                } else {
                    label.style.color = 'var(--gray-600)';
                    input.style.borderColor = 'var(--gray-200)';
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
                input.style.borderColor = 'var(--gray-200)';
                input.classList.remove('filled');
            }
        }
    }
    
    updateAllInputStates() {
        // Update all form inputs
        const formInputs = document.querySelectorAll('.input-field input, .input-field select');
        formInputs.forEach(input => this.updateInputState(input));
        
        // Update dynamic inputs
        const dynamicInputs = document.querySelectorAll('.answer-item input, .aspect-item input');
        dynamicInputs.forEach(input => this.updateInputState(input));
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
        
        // Copy code button
        document.getElementById('copy-code-btn').addEventListener('click', () => {
            this.copyCode();
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
        const title = document.getElementById('question-title').value.trim();
        const description = document.getElementById('question-description').value.trim();
        const type = document.getElementById('question-template').value;
        const required = document.getElementById('question-required').value === 'true';
        
        if (!title || !type) {
            alert('Inserisci titolo e tipo domanda');
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
                alert('Aggiungi almeno una risposta');
                return;
            }
            question.answers = answers;
        } else if (type === 'likert_scale') {
            question.scale = this.templates.likert_scale.default;
        } else if (type === 'multi_likert') {
            const aspects = this.getMultiLikertAspects();
            if (aspects.length === 0) {
                alert('Aggiungi almeno un aspetto da valutare');
                return;
            }
            question.aspects = aspects;
            question.scale = this.templates.multi_likert.default.scale;
        } else if (type === 'open_text') {
            question.placeholder = 'Scrivi qui la tua risposta...';
        }
        
        this.questions.push(question);
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
    }
    
    editQuestion(index) {
        const question = this.questions[index];
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
        
        // Remove the question from the list (will be re-added when saved)
        this.questions.splice(index, 1);
        this.updateUI();
    }
    
    removeQuestion(index) {
        if (confirm('Sei sicuro di voler rimuovere questa domanda?')) {
            this.questions.splice(index, 1);
            this.updateUI();
        }
    }
    
    moveQuestion(index, direction) {
        if (direction === 'up' && index > 0) {
            // Move up
            const temp = this.questions[index];
            this.questions[index] = this.questions[index - 1];
            this.questions[index - 1] = temp;
            this.updateUI();
        } else if (direction === 'down' && index < this.questions.length - 1) {
            // Move down
            const temp = this.questions[index];
            this.questions[index] = this.questions[index + 1];
            this.questions[index + 1] = temp;
            this.updateUI();
        }
    }
    
    showExportModal() {
        const exportCode = this.generateExportCode();
        document.getElementById('export-code').value = exportCode;
        
        const modal = document.getElementById('export-modal');
        const instance = M.Modal.getInstance(modal) || M.Modal.init(modal);
        instance.open();
    }
    
    generateExportCode() {
        const questionsJson = JSON.stringify(this.questions, null, 4);
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
        btn.style.background = '#28a745';
        
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
