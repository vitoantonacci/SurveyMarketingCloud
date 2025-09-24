// Survey Generator JavaScript
class SurveyGenerator {
    constructor() {
        this.questions = [];
        this.templates = this.initializeTemplates();
        this.storageKey = 'survey-generator-questions';
        this.editingIndex = undefined;
        
        this.init();
    }
    
    // Function to generate unique alphanumeric IDs
    generateUniqueId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
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
        
        // Conditional logic switch
        document.getElementById('enable-conditional-logic').addEventListener('change', (e) => {
            this.handleConditionalLogicToggle(e.target.checked);
        });
        
        // Add logic rule button
        document.getElementById('add-logic-rule-btn').addEventListener('click', () => {
            this.addLogicRuleField();
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
        document.getElementById('conditional-logic-section').style.display = 'none';
        
        // Reset conditional logic
        this.resetConditionalLogic();
        
        // Clear validation errors
        this.clearValidationErrors();
        
        // Reset Materialize
        M.updateTextFields();
    }
    
    handleQuestionTemplateChange(value) {
        const answersSection = document.getElementById('answers-section');
        const aspectsSection = document.getElementById('aspects-section');
        const conditionalLogicSection = document.getElementById('conditional-logic-section');
        const answersContainer = document.getElementById('answers-container');
        const aspectsContainer = document.getElementById('aspects-container');
        
        // Hide all sections first
        answersSection.style.display = 'none';
        aspectsSection.style.display = 'none';
        conditionalLogicSection.style.display = 'none';
        
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
        
        // Show conditional logic section only for supported question types
        if (value === 'open_text') {
            conditionalLogicSection.style.display = 'none';
        } else {
            conditionalLogicSection.style.display = 'block';
        }
        
        // Reset conditional logic
        this.resetConditionalLogic();
        
        // Hide answers helper text initially
        const answersHelperText = document.getElementById('answers-helper-text');
        if (answersHelperText) {
            answersHelperText.style.display = 'none';
        }
    }
    
    addAnswerField(value = '') {
        const container = document.getElementById('answers-container');
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-item';
        
        const conditionalLogicEnabled = document.getElementById('enable-conditional-logic').checked;
        const questionType = document.getElementById('question-template').value;
        
        if (conditionalLogicEnabled && (questionType === 'multiple_choice' || questionType === 'yes_no')) {
            answerDiv.className = 'answer-item with-goto';
            const destinationSelect = this.createQuestionDropdown();
            
            // Set the goto value if we have temp data
            if (this.tempGotoData) {
                const matchingAnswer = this.tempGotoData.find(ans => ans.text === value);
                if (matchingAnswer) {
                    destinationSelect.value = matchingAnswer.goto || '';
                }
            }
            
            answerDiv.innerHTML = `
                <div class="answer-input-row">
                    <input type="text" value="${value}" placeholder="Inserisci risposta">
                    <button type="button" class="remove-answer-btn" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="goto-row">
                    <span>Se selezionata →</span>
                    ${destinationSelect.outerHTML}
                </div>
            `;
        } else {
            answerDiv.innerHTML = `
                <input type="text" value="${value}" placeholder="Inserisci risposta">
                <button type="button" class="remove-answer-btn" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }
        
        container.appendChild(answerDiv);
        
        // Initialize Materialize components for the new select
        if (conditionalLogicEnabled && (questionType === 'multiple_choice' || questionType === 'yes_no')) {
            const select = answerDiv.querySelector('select');
            if (select) {
                M.FormSelect.init(select);
            }
        }
    }
    
    updateAllAnswerFields() {
        const questionType = document.getElementById('question-template').value;
        const conditionalLogicEnabled = document.getElementById('enable-conditional-logic').checked;
        
        if (questionType === 'multiple_choice' || questionType === 'yes_no') {
            const answerItems = document.querySelectorAll('#answers-container .answer-item');
            answerItems.forEach((item) => {
                const input = item.querySelector('input[type="text"]');
                const value = input ? input.value : '';
                
                // Remove the item
                item.remove();
                
                // Recreate it with the new structure
                this.addAnswerField(value);
            });
            
            // Initialize Materialize components for all selects
            setTimeout(() => {
                const selects = document.querySelectorAll('#answers-container select');
                selects.forEach(select => {
                    M.FormSelect.init(select);
                });
            }, 50);
        }
    }
    
    updateGotoFields() {
        const questionType = document.getElementById('question-template').value;
        if (questionType === 'multiple_choice') {
            // Clear existing goto fields
            const container = document.getElementById('goto-container');
            const helperText = container.querySelector('.helper-text');
            container.innerHTML = '';
            if (helperText) {
                container.appendChild(helperText);
            }
            
            // Recreate goto fields for all current answers
            const answerInputs = document.querySelectorAll('#answers-container .answer-item input');
            answerInputs.forEach((input, index) => {
                const value = input.value.trim();
                if (value) {
                    this.addGotoField(value, index);
                }
            });
        }
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
    
    // Conditional Logic Methods
    resetConditionalLogic() {
        document.getElementById('enable-conditional-logic').checked = false;
        document.getElementById('conditional-fields').style.display = 'none';
        document.getElementById('goto-container').innerHTML = '';
        document.getElementById('logic-rules-container').innerHTML = '';
    }
    
    handleConditionalLogicToggle(enabled) {
        const conditionalFields = document.getElementById('conditional-fields');
        const answersHelperText = document.getElementById('answers-helper-text');
        const questionType = document.getElementById('question-template').value;
        
        if (enabled) {
            conditionalFields.style.display = 'block';
            this.setupConditionalFields(questionType);
            
            // Show helper text for answers if it's multiple choice or yes/no
            if (questionType === 'multiple_choice' || questionType === 'yes_no') {
                if (answersHelperText) {
                    answersHelperText.style.display = 'block';
                }
                this.updateAllAnswerFields();
            }
        } else {
            conditionalFields.style.display = 'none';
            
            // Hide helper text for answers
            if (answersHelperText) {
                answersHelperText.style.display = 'none';
            }
            this.updateAllAnswerFields();
        }
    }
    
    setupConditionalFields(questionType) {
        const gotoSection = document.getElementById('goto-section');
        const logicRulesSection = document.getElementById('logic-rules-section');
        
        // Hide all sections first
        gotoSection.style.display = 'none';
        logicRulesSection.style.display = 'none';
        
        // Show appropriate sections based on question type
        if (questionType === 'multiple_choice' || questionType === 'yes_no') {
            // For multiple choice and yes/no, we don't need the goto-section anymore
            // since the dropdowns are now integrated in the answers section
            gotoSection.style.display = 'none';
        } else if (questionType === 'likert_scale' || questionType === 'multi_likert') {
            logicRulesSection.style.display = 'block';
        }
        // Note: open_text does not support conditional logic
    }
    
    setupGotoFields(questionType) {
        const container = document.getElementById('goto-container');
        container.innerHTML = '';
        
        // Add helper text
        const helperText = document.createElement('div');
        helperText.className = 'helper-text';
        helperText.innerHTML = `
            <p><i class="fas fa-info-circle"></i> Seleziona dove indirizzare l'utente per ogni risposta.</p>
            <p><strong>Esempio:</strong> Se risponde "Principiante" → vai alla domanda "Livello base"</p>
        `;
        container.appendChild(helperText);
        
        if (questionType === 'multiple_choice') {
            // Get current answers and create goto fields
            const answerInputs = document.querySelectorAll('#answers-container .answer-item input');
            answerInputs.forEach((input, index) => {
                const value = input.value.trim();
                if (value) {
                    this.addGotoField(value, index);
                }
            });
        } else if (questionType === 'yes_no') {
            // Add default yes/no goto fields
            this.addGotoField('Sì', 'yes');
            this.addGotoField('No', 'no');
        }
    }
    
    addGotoField(answerText, answerId = null) {
        const container = document.getElementById('goto-container');
        const gotoDiv = document.createElement('div');
        gotoDiv.className = 'goto-item';
        
        const destinationSelect = this.createQuestionDropdown();
        
        gotoDiv.innerHTML = `
            <span class="answer-text">${answerText}</span>
            <span>→</span>
            ${destinationSelect.outerHTML}
            <button type="button" class="remove-goto-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(gotoDiv);
    }
    
    addLogicRuleField() {
        const container = document.getElementById('logic-rules-container');
        const questionType = document.getElementById('question-template').value;
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'logic-rule-item';
        
        let conditionHTML = '';
        
        if (questionType === 'likert_scale') {
            conditionHTML = `
                <select class="operator-select">
                    <option value="<=">≤ (minore o uguale)</option>
                    <option value="<">< (minore)</option>
                    <option value=">=">≥ (maggiore o uguale)</option>
                    <option value=">">> (maggiore)</option>
                    <option value="==">= (uguale)</option>
                    <option value="between">tra (range)</option>
                </select>
                <input type="number" class="value-input" placeholder="Valore" min="1" max="5">
                <input type="number" class="max-value-input" placeholder="Max" min="1" max="5" style="display: none;">
            `;
        } else if (questionType === 'multi_likert') {
            conditionHTML = `
                <select class="aspect-select">
                    <option value="*">Qualsiasi aspetto</option>
                </select>
                <select class="operator-select">
                    <option value="<=">≤ (minore o uguale)</option>
                    <option value="<">< (minore)</option>
                    <option value=">=">≥ (maggiore o uguale)</option>
                    <option value=">">> (maggiore)</option>
                    <option value="==">= (uguale)</option>
                </select>
                <input type="number" class="value-input" placeholder="Valore" min="1" max="5">
            `;
        }
        
        const destinationSelect = this.createQuestionDropdown();
        
        ruleDiv.innerHTML = `
            <div class="rule-condition">
                ${conditionHTML}
            </div>
            <span>→</span>
            <div class="rule-goto">
                ${destinationSelect.outerHTML}
            </div>
            <button type="button" class="remove-logic-rule-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(ruleDiv);
        
        // Initialize Materialize components for the new selects
        setTimeout(() => {
            const selects = ruleDiv.querySelectorAll('select');
            selects.forEach(select => {
                M.FormSelect.init(select);
            });
        }, 50);
        
        // Setup event listeners for dynamic behavior
        this.setupLogicRuleListeners(ruleDiv, questionType);
    }
    
    setupLogicRuleListeners(ruleDiv, questionType) {
        const operatorSelect = ruleDiv.querySelector('.operator-select');
        const valueInput = ruleDiv.querySelector('.value-input');
        const maxValueInput = ruleDiv.querySelector('.max-value-input');
        
        if (operatorSelect && valueInput) {
            operatorSelect.addEventListener('change', (e) => {
                if (e.target.value === 'between' && maxValueInput) {
                    maxValueInput.style.display = 'inline-block';
                } else if (maxValueInput) {
                    maxValueInput.style.display = 'none';
                }
            });
        }
        
        // Update aspect options for multi_likert
        if (questionType === 'multi_likert') {
            const aspectSelect = ruleDiv.querySelector('.aspect-select');
            if (aspectSelect) {
                this.updateAspectOptions(aspectSelect);
            }
        }
    }
    
    updateAspectOptions(aspectSelect) {
        const aspectInputs = document.querySelectorAll('#aspects-container .aspect-item input');
        const currentOptions = aspectSelect.querySelectorAll('option:not([value="*"])');
        currentOptions.forEach(option => option.remove());
        
        aspectInputs.forEach((input, index) => {
            const value = input.value.trim();
            if (value) {
                const option = document.createElement('option');
                option.value = value.toLowerCase().replace(/\s+/g, '_');
                option.textContent = value;
                aspectSelect.appendChild(option);
            }
        });
    }
    
    createQuestionDropdown() {
        const select = document.createElement('select');
        select.className = 'destination-select';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Prossima domanda (default)';
        select.appendChild(defaultOption);
        
        // Add existing questions
        this.questions.forEach((question, index) => {
            const option = document.createElement('option');
            option.value = question.id;
            option.textContent = `${index + 1}. ${question.title}`;
            select.appendChild(option);
        });
        
        return select;
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
            id: this.generateUniqueId(),
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
        
        // Add conditional logic data
        const conditionalLogicEnabled = document.getElementById('enable-conditional-logic').checked;
        if (conditionalLogicEnabled) {
            if (type === 'multiple_choice' || type === 'yes_no') {
                const gotoData = this.getGotoData();
                if (gotoData) {
                    question.answers = gotoData;
                }
            } else if (type === 'likert_scale' || type === 'multi_likert') {
                const logicData = this.getLogicData();
                if (logicData) {
                    question.logic = logicData;
                }
            }
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
    
    getGotoData() {
        const answerItems = document.querySelectorAll('#answers-container .answer-item.with-goto');
        const answers = [];
        
        answerItems.forEach((item, index) => {
            const input = item.querySelector('input[type="text"]');
            const destinationSelect = item.querySelector('.goto-row select');
            
            if (input && destinationSelect) {
                const answerText = input.value.trim();
                const gotoValue = destinationSelect.value;
                
                if (answerText) {
                    // Generate unique ID for answer
                    const answerId = this.generateAnswerId(answerText, index);
                    
                    answers.push({
                        id: answerId,
                        text: answerText,
                        goto: gotoValue
                    });
                }
            }
        });
        
        return answers;
    }
    
    getLogicData() {
        const logicRules = document.querySelectorAll('#logic-rules-container .logic-rule-item');
        const rules = [];
        
        logicRules.forEach((rule) => {
            const operatorSelect = rule.querySelector('.operator-select');
            const valueInput = rule.querySelector('.value-input');
            const maxValueInput = rule.querySelector('.max-value-input');
            const aspectSelect = rule.querySelector('.aspect-select');
            const destinationSelect = rule.querySelector('.rule-goto select');
            
            if (!operatorSelect || !destinationSelect) return;
            
            const when = {};
            const goto = destinationSelect.value;
            
            // Build when condition based on question type
            const questionType = document.getElementById('question-template').value;
            
            if (questionType === 'likert_scale') {
                when.op = operatorSelect.value;
                if (operatorSelect.value === 'between') {
                    when.min = parseInt(valueInput.value);
                    when.max = parseInt(maxValueInput.value);
                } else {
                    when.value = parseInt(valueInput.value);
                }
            } else if (questionType === 'multi_likert') {
                if (aspectSelect) {
                    when.aspect = aspectSelect.value;
                }
                when.op = operatorSelect.value;
                when.value = parseInt(valueInput.value);
            }
            
            rules.push({
                when: when,
                goto: goto
            });
        });
        
        return rules;
    }
    
    generateAnswerId(text, index) {
        // Generate a short, stable ID from text
        const cleanText = text.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 3);
        return cleanText + index.toString();
    }
    
    loadGotoData(answers) {
        // This method is no longer needed since goto data is now embedded in answer fields
        // The data will be loaded when the answer fields are recreated with the goto structure
        console.log('loadGotoData called - data will be loaded via answer fields');
    }
    
    loadLogicData(logicRules) {
        const container = document.getElementById('logic-rules-container');
        container.innerHTML = '';
        
        logicRules.forEach(rule => {
            const ruleDiv = document.createElement('div');
            ruleDiv.className = 'logic-rule-item';
            
            const questionType = document.getElementById('question-template').value;
            let conditionHTML = '';
            
            if (questionType === 'likert_scale') {
                conditionHTML = `
                    <select class="operator-select">
                        <option value="<=" ${rule.when.op === '<=' ? 'selected' : ''}>≤ (minore o uguale)</option>
                        <option value="<" ${rule.when.op === '<' ? 'selected' : ''}>< (minore)</option>
                        <option value=">=" ${rule.when.op === '>=' ? 'selected' : ''}>≥ (maggiore o uguale)</option>
                        <option value=">" ${rule.when.op === '>' ? 'selected' : ''}>> (maggiore)</option>
                        <option value="==" ${rule.when.op === '==' ? 'selected' : ''}>= (uguale)</option>
                        <option value="between" ${rule.when.op === 'between' ? 'selected' : ''}>tra (range)</option>
                    </select>
                    <input type="number" class="value-input" placeholder="Valore" min="1" max="5" value="${rule.when.value || rule.when.min || ''}">
                    <input type="number" class="max-value-input" placeholder="Max" min="1" max="5" value="${rule.when.max || ''}" style="${rule.when.op === 'between' ? '' : 'display: none;'}">
                `;
            } else if (questionType === 'multi_likert') {
                conditionHTML = `
                    <select class="aspect-select">
                        <option value="*" ${rule.when.aspect === '*' ? 'selected' : ''}>Qualsiasi aspetto</option>
                    </select>
                    <select class="operator-select">
                        <option value="<=" ${rule.when.op === '<=' ? 'selected' : ''}>≤ (minore o uguale)</option>
                        <option value="<" ${rule.when.op === '<' ? 'selected' : ''}>< (minore)</option>
                        <option value=">=" ${rule.when.op === '>=' ? 'selected' : ''}>≥ (maggiore o uguale)</option>
                        <option value=">" ${rule.when.op === '>' ? 'selected' : ''}>> (maggiore)</option>
                        <option value="==" ${rule.when.op === '==' ? 'selected' : ''}>= (uguale)</option>
                    </select>
                    <input type="number" class="value-input" placeholder="Valore" min="1" max="5" value="${rule.when.value || ''}">
                `;
            }
            
            const destinationSelect = this.createQuestionDropdown();
            destinationSelect.value = rule.goto || '';
            
            ruleDiv.innerHTML = `
                <div class="rule-condition">
                    ${conditionHTML}
                </div>
                <span>→</span>
                <div class="rule-goto">
                    ${destinationSelect.outerHTML}
                </div>
                <button type="button" class="remove-logic-rule-btn" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(ruleDiv);
            
            // Setup event listeners
            this.setupLogicRuleListeners(ruleDiv, questionType);
        });
        
        // Initialize Materialize components for all selects
        setTimeout(() => {
            const selects = container.querySelectorAll('select');
            selects.forEach(select => {
                M.FormSelect.init(select);
            });
        }, 100);
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
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.questions = [];
        }
    }
    
    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            this.questions = [];
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
            
            // Store the goto data for later use
            this.tempGotoData = question.answers;
            
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
        
        // Load conditional logic if present
        if (question.answers && question.answers.some(ans => ans.goto !== undefined)) {
            // This is a multiple_choice or yes_no with goto data
            document.getElementById('enable-conditional-logic').checked = true;
            this.handleConditionalLogicToggle(true);
            // Clear temp data after use
            setTimeout(() => {
                this.tempGotoData = null;
            }, 100);
        } else if (question.logic && question.logic.length > 0) {
            // This is a likert_scale, multi_likert, or open_text with logic data
            document.getElementById('enable-conditional-logic').checked = true;
            this.handleConditionalLogicToggle(true);
            this.loadLogicData(question.logic);
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
        // Export only questions with their conditional logic
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
