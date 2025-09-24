// JavaScript file for Survey Marketing Cloud

// Conditional Logic Engine
var ConditionalLogic = {
    // Build index map for O(1) lookup
    buildIndex: function(questions) {
        var index = {};
        for (var i = 0; i < questions.length; i++) {
            index[questions[i].id] = i;
        }
        return index;
    },
    
    // Get next question ID based on current answer
    getNextId: function(questions, idx, answer, questionIndex) {
        var question = questions[idx];
        var nextId = null;
        
        // Priority 1: For single_choice/yes_no, check answer.goto
        if ((question.type === 'single_choice' || question.type === 'yes_no') && 
            question.answers && answer) {
            for (var i = 0; i < question.answers.length; i++) {
                var ans = question.answers[i];
                var answerId = ans.id || i.toString();
                if (answerId === answer) {
                    // If goto is empty string, treat as default (next question)
                    if (ans.goto === "") {
                        break; // Continue to default behavior
                    } else if (ans.goto) {
                        return ans.goto;
                    }
                }
            }
        }
        
        // Priority 2: Check question.logic rules
        if (question.logic && question.logic.length > 0) {
            for (var j = 0; j < question.logic.length; j++) {
                var rule = question.logic[j];
                if (this.ruleMatch(question, rule.when, answer)) {
                    return rule.goto;
                }
            }
        }
        
        // Priority 3: Default to next question
        if (idx + 1 < questions.length) {
            return questions[idx + 1].id;
        }
        
        return null; // End of survey
    },
    
    // Match rule based on question type and answer
    ruleMatch: function(question, when, answer) {
        switch (question.type) {
            case 'likert_scale':
                return this.numOp(parseInt(answer), when);
            case 'multi_likert':
                return this.matchMultiLikert(answer, when);
            case 'open_text':
                return this.matchOpenText(answer, when);
            default:
                return false;
        }
    },
    
    // Match multi-likert rules
    matchMultiLikert: function(answer, when) {
        if (typeof answer !== 'object' || !answer) return false;
        
        if (when.aspect === '*') {
            // Check if any aspect matches
            for (var aspect in answer) {
                if (this.numOp(parseInt(answer[aspect]), when)) {
                    return true;
                }
            }
            return false;
        } else {
            // Check specific aspect
            return this.numOp(parseInt(answer[when.aspect]), when);
        }
    },
    
    // Match open text rules
    matchOpenText: function(answer, when) {
        if (when.op === 'empty') {
            return !answer || answer.trim() === '';
        } else if (when.op === 'not_empty') {
            return answer && answer.trim() !== '';
        }
        return false;
    },
    
    // Numeric operations
    numOp: function(value, when) {
        if (isNaN(value)) return false;
        
        switch (when.op) {
            case '<=': return value <= when.value;
            case '<': return value < when.value;
            case '>=': return value >= when.value;
            case '>': return value > when.value;
            case '==': return value == when.value;
            case 'between': return value >= when.min && value <= when.max;
            default: return false;
        }
    }
};

function SurveyManager() {
    this.questions = [];
    this.questionIndex = {}; // O(1) lookup map
    this.currentQuestionIndex = 0;
    this.currentQuestionNumber = 1; // Sequential number shown to user
    this.totalQuestionsShown = 0; // Total questions that will be shown
    this.questionPath = []; // Track the path of questions shown to user
    this.results = [];
    this.surveyContainer = document.getElementById('survey-container');
    this.selectedAnswer = null;
    this.clientData = {
        email: null,
        country: null,
        language: null,
        age: null,
        gender: null
    };
    
    this.init();
}

SurveyManager.prototype.init = function() {
    try {
        this.loadClientData();
        this.loadQuestions();
        this.renderCoverPage();
        this.setupEventListeners();
        this.setupCoverEventListeners();
    } catch (error) {
        console.error('Error initializing survey:', error);
    }
};

SurveyManager.prototype.loadClientData = function() {
    // Parse client data from URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    
    this.clientData.email = urlParams.get('email');
    this.clientData.country = urlParams.get('Country');
    this.clientData.language = urlParams.get('Language');
    this.clientData.age = urlParams.get('age');
    this.clientData.gender = urlParams.get('gender');
    
    // Log client data for debugging
    if (this.clientData.email || this.clientData.country || this.clientData.language || this.clientData.age || this.clientData.gender) {
        console.log('Client data loaded:', this.clientData);
    }
};

SurveyManager.prototype.loadQuestions = function() {
    // Load questions from external questionsData variable
    if (typeof questionsData === 'undefined') {
        console.error('questionsData is not defined. Make sure questions.js is loaded before script.js');
        return;
    }
        
    this.questions = questionsData.questions;
    this.questionIndex = ConditionalLogic.buildIndex(this.questions);
    this.totalQuestionsShown = this.calculateTotalQuestionsShown();
    this.coverData = questionsData.cover;
};

SurveyManager.prototype.calculateTotalQuestionsShown = function() {
    // Start with a reasonable estimate, will be updated dynamically
    return this.questions.length;
};

SurveyManager.prototype.updateTotalQuestionsShown = function() {
    // Check if there are any conditional logics in the questions
    var hasConditionalLogic = this.hasConditionalLogic();
    
    if (hasConditionalLogic) {
        // Hide progress line and question counter for conditional logic
        this.hideProgressElements();
    } else {
        // Show progress line and question counter for simple surveys
        this.totalQuestionsShown = this.questions.length;
        this.showProgressElements();
        this.updateProgressBar();
    }
};

SurveyManager.prototype.hasConditionalLogic = function() {
    for (var i = 0; i < this.questions.length; i++) {
        var question = this.questions[i];
        
        // Check for goto in answers (single_choice, yes_no)
        if (question.answers) {
            for (var j = 0; j < question.answers.length; j++) {
                if (question.answers[j].goto && question.answers[j].goto !== "") {
                    return true;
                }
            }
        }
        
        // Check for logic rules (likert_scale, multi_likert)
        if (question.logic && question.logic.length > 0) {
            return true;
        }
    }
    
    return false;
};

SurveyManager.prototype.hideProgressElements = function() {
    var progressContainer = document.querySelector('.progress-container');
    var progressBar = document.querySelector('.progress-bar');
    
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    if (progressBar) {
        progressBar.style.display = 'none';
    }
};

SurveyManager.prototype.showProgressElements = function() {
    var progressContainer = document.querySelector('.progress-container');
    var progressBar = document.querySelector('.progress-bar');
    
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }
    if (progressBar) {
        progressBar.style.display = 'block';
    }
};

SurveyManager.prototype.getSimulatedAnswer = function(question) {
    // Return a simulated answer for calculation purposes
    switch (question.type) {
        case 'single_choice':
        case 'yes_no':
            if (question.answers && question.answers.length > 0) {
                // Try to find an answer with goto="" for default behavior
                for (var i = 0; i < question.answers.length; i++) {
                    if (question.answers[i].goto === "") {
                        return question.answers[i].id || i.toString();
                    }
                }
                // If no default found, use first answer
                return question.answers[0].id || '0';
            }
            return '0';
        case 'likert_scale':
            return '3'; // Middle value
        case 'multi_likert':
            var obj = {};
            if (question.aspects) {
                for (var i = 0; i < question.aspects.length; i++) {
                    obj[question.aspects[i].id] = '3';
                }
            }
            return obj;
        case 'open_text':
            return 'test'; // Non-empty text
        default:
            return '0';
    }
};

SurveyManager.prototype.renderCoverPage = function() {
    var coverWrapper = document.getElementById('cover-wrapper');
    if (!coverWrapper) return;
    
    coverWrapper.innerHTML = '<div class="cover-container">' +
        '<div class="cover-content">' +
        '<div class="cover-logo">' +
        getGuessLogo() +
        '</div>' +
        '<h1 class="cover-title">' + this.coverData.title + '</h1>' +
        '<p class="cover-description">' + this.coverData.description + '</p>' +
        '<button class="btn waves-effect waves-light cover-btn" id="start-survey-btn">' +
        this.coverData.buttonText +
        '</button>' +
        '</div>' +
        '<div class="cover-image">' +
        '<img src="' + this.coverData.imageUrl + '" alt="Survey Cover" />' +
        '</div>' +
        '</div>';
};

SurveyManager.prototype.renderCurrentQuestion = function() {
    if (this.currentQuestionIndex >= this.questions.length) {
        this.showResults();
        return;
    }

    var question = this.questions[this.currentQuestionIndex];
    this.surveyContainer.innerHTML = this.generateQuestionHTML(question);
    this.updateProgressBar(question);
    this.setupQuestionEventListeners();
};

SurveyManager.prototype.generateQuestionHTML = function(question) {
    var answersHTML = '';
    var actionButtonHTML = '';
    
    // Generate different UI based on question type
    switch(question.type) {
        case 'single_choice':
            answersHTML = this.generateMultipleChoiceHTML(question);
            actionButtonHTML = this.generateActionButtonHTML(question, true);
            break;
        case 'multiple_choice':
            answersHTML = this.generateMultipleChoiceHTML(question);
            actionButtonHTML = this.generateActionButtonHTML(question, false); // No auto-advance for multiple choice
            break;
        case 'likert_scale':
            answersHTML = this.generateLikertScaleHTML(question);
            actionButtonHTML = this.generateActionButtonHTML(question, true);
            break;
        case 'yes_no':
            answersHTML = this.generateYesNoHTML(question);
            actionButtonHTML = this.generateActionButtonHTML(question, true);
            break;
        case 'open_text':
            answersHTML = this.generateOpenTextHTML(question);
            actionButtonHTML = this.generateActionButtonHTML(question, false);
            break;
        case 'multi_likert':
            answersHTML = this.generateMultiLikertHTML(question);
            actionButtonHTML = this.generateActionButtonHTML(question, true);
            break;
        default:
            answersHTML = this.generateMultipleChoiceHTML(question);
            actionButtonHTML = this.generateActionButtonHTML(question, true);
    }

    // Check if we should show progress elements
    var hasConditionalLogic = this.hasConditionalLogic();
    var progressHTML = '';
    
    if (!hasConditionalLogic) {
        // Show progress line only if no conditional logic
        progressHTML = (this.currentQuestionNumber > 1 ? '<div class="progress-container" id="back-btn">' +
        '<p class="progress-text">' +
        '<i class="fa-thin fa-arrow-left back-arrow"></i>' +
        'Domanda ' + this.currentQuestionNumber + ' di ' + this.totalQuestionsShown +
        '</p>' +
        '</div>' : '<div class="progress-container">' +
        '<p class="progress-text">Domanda ' + this.currentQuestionNumber + ' di ' + this.totalQuestionsShown + '</p>' +
        '</div>');
    } else {
        // Show only back button if conditional logic exists (but only if not first question)
        if (this.currentQuestionNumber > 1) {
            progressHTML = '<div class="progress-container" id="back-btn">' +
            '<p class="progress-text">' +
            '<i class="fa-thin fa-arrow-left back-arrow"></i>' +
            'Indietro' +
            '</p>' +
            '</div>';
        }
    }

    return '<div class="question-block" data-qid="' + question.id + '">' +
        '<!-- Question Header -->' +
        '<div class="question-header">' +
        progressHTML +
        '<h1 class="question-title">' + this.currentQuestionNumber + '. ' + question.title + (question.required ? ' *' : '') + '</h1>' +
        '<p class="question-description">' + question.description + (!question.required ? ' (Risposta opzionale)' : '') + '</p>' +
        '</div>' +
        '<!-- Answer Options -->' +
        '<div class="answers-container">' +
        answersHTML +
        '</div>' +
        '<!-- Action Button -->' +
        '<div class="action-container">' +
        actionButtonHTML +
        '</div>' +
        '</div>';
};

SurveyManager.prototype.generateMultipleChoiceHTML = function(question) {
    var answersHTML = '';
    for (var i = 0; i < question.answers.length; i++) {
        var answer = question.answers[i];
        var letter = String.fromCharCode(65 + i); // A, B, C, D, E...
        
        if (question.type === 'multiple_choice') {
            // For multiple choice, use checkbox
            answersHTML += '<div class="answer-option checkbox-option" data-answer="' + letter + '" onclick="this.querySelector(\'.answer-checkbox\').click()">' +
                '<div class="answer-letter">' + letter + '</div>' +
                '<div class="checkbox-container">' +
                '<input type="checkbox" id="answer-' + letter + '" class="answer-checkbox">' +
                '<div class="checkbox-label">' +
                '<div class="answer-text">' + answer.text + '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        } else {
            // For single choice, use radio-style
            answersHTML += '<div class="answer-option" data-answer="' + letter + '">' +
                '<div class="answer-letter">' + letter + '</div>' +
                '<div class="answer-text">' + answer.text + '</div>' +
                '</div>';
        }
    }
    return answersHTML;
};

SurveyManager.prototype.generateLikertScaleHTML = function(question) {
    var scaleHTML = '<div class="likert-scale">';
    var scale = question.scale;
    
    // Scale options
    scaleHTML += '<div class="scale-options">';
    for (var i = scale.min; i <= scale.max; i++) {
        scaleHTML += '<div class="scale-option" data-value="' + i + '">' +
            '<div class="scale-number">' + i + '</div>' +
            '</div>';
    }
    scaleHTML += '</div>';
    
    // Scale labels
    scaleHTML += '<div class="scale-labels">' +
        '<span class="scale-label-min">' + scale.labels.min + '</span>' +
        '<span class="scale-label-max">' + scale.labels.max + '</span>' +
        '</div>';
    
    scaleHTML += '</div>';
    
    return scaleHTML;
};

SurveyManager.prototype.generateYesNoHTML = function(question) {
    var html = '';
    
    if (question.answers && question.answers.length > 0) {
        // Use custom answers if provided
        for (var i = 0; i < question.answers.length; i++) {
            var answer = question.answers[i];
            var icon = answer.id === 'yes' ? 'fa-check' : 'fa-xmark';
            html += '<div class="yes-no-option" data-answer="' + answer.id + '">' +
                '<div class="answer-letter"><i class="fa-thin ' + icon + '"></i></div>' +
                '<div class="answer-text">' + answer.text + '</div>' +
                '</div>';
        }
    } else {
        // Default yes/no options
        html = '<div class="yes-no-option" data-answer="yes">' +
            '<div class="answer-letter"><i class="fa-thin fa-check"></i></div>' +
            '<div class="answer-text">Sì</div>' +
            '</div>' +
            '<div class="yes-no-option" data-answer="no">' +
            '<div class="answer-letter"><i class="fa-thin fa-xmark"></i></div>' +
            '<div class="answer-text">No</div>' +
            '</div>';
    }
    
    return html;
};

SurveyManager.prototype.generateOpenTextHTML = function(question) {
    return '<div class="open-text-container">' +
        '<textarea class="open-text-input" id="open-text-' + question.id + '" ' +
        'placeholder="' + (question.placeholder || 'Scrivi la tua risposta...') + '" ' +
        'rows="4"></textarea>' +
        '</div>';
};

SurveyManager.prototype.generateMultiLikertHTML = function(question) {
    var multiLikertHTML = '<div class="multi-likert-container">';
    var scale = question.scale;
    
    for (var i = 0; i < question.aspects.length; i++) {
        var aspect = question.aspects[i];
        multiLikertHTML += '<div class="multi-likert-aspect">' +
            '<div class="aspect-name">' + aspect.name + '</div>' +
            '<div class="aspect-scale">';
        
        for (var j = scale.min; j <= scale.max; j++) {
            multiLikertHTML += '<div class="scale-option" data-aspect="' + aspect.id + '" data-value="' + j + '">' +
                '<div class="scale-number">' + j + '</div>' +
                '</div>';
        }
        
        multiLikertHTML += '</div></div>';
    }
    
    // Scale labels
    multiLikertHTML += '<div class="scale-labels">' +
        '<span class="scale-label-min">' + scale.labels.min + '</span>' +
        '<span class="scale-label-max">' + scale.labels.max + '</span>' +
        '</div>';
    
    multiLikertHTML += '</div>';
    return multiLikertHTML;
};

SurveyManager.prototype.generateActionButtonHTML = function(question, showCheckmark) {
    var buttonText = this.currentQuestionNumber === this.totalQuestionsShown ? 'INVIA' : 'AVANTI';
    var checkmarkHTML = showCheckmark ? 
        '<div id="check-icon" class="checkmark">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path class="checkmark-path" d="M20 6L9 17l-5-5"/>' +
        '</svg>' +
        '</div>' : '';
    
    return '<button class="btn waves-effect waves-light" id="confirm-btn" ' + 
        (question.required ? 'disabled' : '') + '>' +
        buttonText + checkmarkHTML +
        '</button>';
};

SurveyManager.prototype.updateProgressBar = function(question) {
    // Don't update progress bar if there's conditional logic
    if (this.hasConditionalLogic()) {
        return;
    }
    
    var progressBar = document.querySelector('.progress-indicator');
    var progressFill = document.querySelector('.progress-fill');
    
    if (!progressBar) {
        // Create progress bar if it doesn't exist
        progressBar = document.createElement('div');
        progressBar.className = 'progress-indicator';
        progressBar.innerHTML = '<div class="progress-fill" style="width: 0%"></div>';
        
        // Add to wrapper
        var wrapper = document.querySelector('.survey-wrapper');
        wrapper.appendChild(progressBar);
        progressFill = progressBar.querySelector('.progress-fill');
    }
    
    // Update width with animation based on sequential numbering
    var newWidth = ((this.currentQuestionNumber / this.totalQuestionsShown) * 100);
    progressFill.style.width = newWidth + '%';
};

SurveyManager.prototype.setupQuestionEventListeners = function() {
    var currentQuestion = this.questions[this.currentQuestionIndex];
    var confirmBtn = document.getElementById('confirm-btn');
    var self = this;

    // Handle different question types
    switch(currentQuestion.type) {
        case 'single_choice':
        case 'multiple_choice':
            this.setupMultipleChoiceListeners(confirmBtn);
            break;
        case 'likert_scale':
            this.setupLikertScaleListeners(confirmBtn);
            break;
        case 'yes_no':
            this.setupYesNoListeners(confirmBtn);
            break;
        case 'open_text':
            this.setupOpenTextListeners(confirmBtn);
            break;
        case 'multi_likert':
            this.setupMultiLikertListeners(confirmBtn);
            break;
    }

    // Handle confirm button click
    confirmBtn.addEventListener('click', function() {
        self.handleConfirmClick();
    });

    // Handle back button click (if exists)
    var backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            self.handleBackClick();
        });
    }
};

SurveyManager.prototype.setupMultipleChoiceListeners = function(confirmBtn) {
    var answerOptions = document.querySelectorAll('.answer-option');
    var checkIcon = document.getElementById('check-icon');
    var self = this;
    var currentQuestion = this.questions[this.currentQuestionIndex];

    for (var i = 0; i < answerOptions.length; i++) {
        if (currentQuestion.type === 'multiple_choice') {
            // For multiple choice, handle checkbox clicks
            var checkbox = answerOptions[i].querySelector('.answer-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    self.handleMultipleChoiceSelection(this, answerOptions, confirmBtn, checkIcon);
                });
            }
        } else {
            // For single choice, handle option clicks
            answerOptions[i].addEventListener('click', function() {
                self.handleAnswerSelection(this, answerOptions, confirmBtn, checkIcon);
            });
        }
    }
};

SurveyManager.prototype.setupLikertScaleListeners = function(confirmBtn) {
    var scaleOptions = document.querySelectorAll('.scale-option');
    var checkIcon = document.getElementById('check-icon');
    var self = this;

    for (var i = 0; i < scaleOptions.length; i++) {
        scaleOptions[i].addEventListener('click', function() {
            self.handleScaleSelection(this, scaleOptions, confirmBtn, checkIcon);
        });
    }
};

SurveyManager.prototype.setupYesNoListeners = function(confirmBtn) {
    var yesNoOptions = document.querySelectorAll('.yes-no-option');
    var checkIcon = document.getElementById('check-icon');
    var self = this;

    for (var i = 0; i < yesNoOptions.length; i++) {
        yesNoOptions[i].addEventListener('click', function() {
            self.handleYesNoSelection(this, yesNoOptions, confirmBtn, checkIcon);
        });
    }
};

SurveyManager.prototype.setupOpenTextListeners = function(confirmBtn) {
    var textarea = document.querySelector('.open-text-input');
    var self = this;

    if (textarea) {
        textarea.addEventListener('input', function() {
            self.handleTextInput(this, confirmBtn);
        });
    }
};

SurveyManager.prototype.setupMultiLikertListeners = function(confirmBtn) {
    var scaleOptions = document.querySelectorAll('.multi-likert-container .scale-option');
    var checkIcon = document.getElementById('check-icon');
    var self = this;

    for (var i = 0; i < scaleOptions.length; i++) {
        scaleOptions[i].addEventListener('click', function() {
            self.handleMultiLikertSelection(this, scaleOptions, confirmBtn, checkIcon);
        });
    }
};

SurveyManager.prototype.handleAnswerSelection = function(selectedOption, allOptions, confirmBtn, checkIcon) {
    // Remove selected class from all options
    for (var i = 0; i < allOptions.length; i++) {
        allOptions[i].classList.remove('selected');
    }
    
    // Add selected class to clicked option
    selectedOption.classList.add('selected');
    
    // Get selected answer - use answer ID if available, otherwise fallback to data-answer
    var currentQuestion = this.questions[this.currentQuestionIndex];
    var answerIndex = parseInt(selectedOption.getAttribute('data-answer').charCodeAt(0) - 65); // A=0, B=1, etc.
    
    if (currentQuestion.answers && currentQuestion.answers[answerIndex] && currentQuestion.answers[answerIndex].id) {
        this.selectedAnswer = currentQuestion.answers[answerIndex].id;
    } else {
        this.selectedAnswer = selectedOption.getAttribute('data-answer');
    }
    
    // Enable confirm button
    confirmBtn.disabled = false;
    
    // Animate checkmark with drawing effect
    this.animateCheckmark(checkIcon);
    
    // Add some visual feedback
    var self = this;
    selectedOption.style.transform = 'scale(1.01)';
    setTimeout(function() {
        selectedOption.style.transform = '';
    }, 150);
    
    // Auto-proceed after checkmark animation completes
    setTimeout(function() {
        if (self.selectedAnswer) {
            self.handleConfirmClick();
        }
    }, 600); // Wait for checkmark animation (0.6s) + buffer
};

SurveyManager.prototype.handleScaleSelection = function(selectedOption, allOptions, confirmBtn, checkIcon) {
    // Remove selected class from all options
    for (var i = 0; i < allOptions.length; i++) {
        allOptions[i].classList.remove('selected');
    }
    
    // Add selected class to clicked option
    selectedOption.classList.add('selected');
    
    // Get selected value
    this.selectedAnswer = selectedOption.getAttribute('data-value');
    
    // Enable confirm button
    confirmBtn.disabled = false;
    
    // Animate checkmark with drawing effect
    this.animateCheckmark(checkIcon);
    
    // Add some visual feedback
    var self = this;
    selectedOption.style.transform = 'scale(1.05)';
    setTimeout(function() {
        selectedOption.style.transform = '';
    }, 150);
    
    // Auto-proceed after checkmark animation completes
    setTimeout(function() {
        if (self.selectedAnswer) {
            self.handleConfirmClick();
        }
    }, 600);
};

SurveyManager.prototype.handleYesNoSelection = function(selectedOption, allOptions, confirmBtn, checkIcon) {
    // Remove selected class from all options
    for (var i = 0; i < allOptions.length; i++) {
        allOptions[i].classList.remove('selected');
    }
    
    // Add selected class to clicked option
    selectedOption.classList.add('selected');
    
    // Get selected answer - use answer ID if available, otherwise fallback to data-answer
    var currentQuestion = this.questions[this.currentQuestionIndex];
    var answerValue = selectedOption.getAttribute('data-answer');
    
    if (currentQuestion.answers) {
        for (var j = 0; j < currentQuestion.answers.length; j++) {
            if (currentQuestion.answers[j].id === answerValue) {
                this.selectedAnswer = currentQuestion.answers[j].id;
                break;
            }
        }
    }
    
    if (!this.selectedAnswer) {
        this.selectedAnswer = answerValue;
    }
    
    // Enable confirm button
    confirmBtn.disabled = false;
    
    // Animate checkmark with drawing effect
    this.animateCheckmark(checkIcon);
    
    // Add some visual feedback
    var self = this;
    selectedOption.style.transform = 'scale(1.05)';
    setTimeout(function() {
        selectedOption.style.transform = '';
    }, 150);
    
    // Auto-proceed after checkmark animation completes
    setTimeout(function() {
        if (self.selectedAnswer) {
            self.handleConfirmClick();
        }
    }, 600);
};

SurveyManager.prototype.handleTextInput = function(textarea, confirmBtn) {
    var currentQuestion = this.questions[this.currentQuestionIndex];
    var text = textarea.value.trim();
    
    // Store the text as selected answer
    this.selectedAnswer = text;
    
    // Enable/disable button based on required status and text content
    if (currentQuestion.required) {
        confirmBtn.disabled = text.length === 0;
    } else {
        confirmBtn.disabled = false;
    }
};

SurveyManager.prototype.handleMultiLikertSelection = function(selectedOption, allOptions, confirmBtn, checkIcon) {
    var aspect = selectedOption.getAttribute('data-aspect');
    var value = selectedOption.getAttribute('data-value');
    
    // Remove selected class from all options for this aspect
    var aspectOptions = document.querySelectorAll('.scale-option[data-aspect="' + aspect + '"]');
    for (var i = 0; i < aspectOptions.length; i++) {
        aspectOptions[i].classList.remove('selected');
    }
    
    // Add selected class to clicked option
    selectedOption.classList.add('selected');
    
    // Store the answer (initialize if needed)
    if (!this.selectedAnswer) {
        this.selectedAnswer = {};
    }
    this.selectedAnswer[aspect] = value;
    
    // Check if all aspects are answered
    var currentQuestion = this.questions[this.currentQuestionIndex];
    var allAspectsAnswered = true;
    for (var j = 0; j < currentQuestion.aspects.length; j++) {
        if (!this.selectedAnswer[currentQuestion.aspects[j].id]) {
            allAspectsAnswered = false;
            break;
        }
    }
    
    // Enable confirm button if all aspects are answered
    if (allAspectsAnswered) {
        confirmBtn.disabled = false;
        this.animateCheckmark(checkIcon);
        
        // Auto-proceed after checkmark animation completes
        var self = this;
        setTimeout(function() {
            if (self.selectedAnswer && allAspectsAnswered) {
                self.handleConfirmClick();
            }
        }, 600); // Wait for checkmark animation (0.6s) + buffer
    }
    
    // Add some visual feedback
    var self = this;
    selectedOption.style.transform = 'scale(1.05)';
    setTimeout(function() {
        selectedOption.style.transform = '';
    }, 150);
};

SurveyManager.prototype.animateCheckmark = function(checkIcon) {
    checkIcon.classList.remove('animate');
    checkIcon.style.animation = 'none';
    
    // Reset the path animation
    var path = checkIcon.querySelector('.checkmark-path');
    if (path) {
        path.style.animation = 'none';
        path.style.strokeDashoffset = '-20';
        path.offsetHeight; // Trigger reflow
    }
    
    var self = this;
    setTimeout(function() {
        checkIcon.classList.add('animate');
        if (path) {
            path.style.animation = 'checkmark-draw 0.6s ease-in-out forwards';
        }
    }, 100);
};

SurveyManager.prototype.handleConfirmClick = function() {
    var currentQuestion = this.questions[this.currentQuestionIndex];
    
    // Validate required questions
    if (currentQuestion.required) {
        var isValid = false;
        
        if (currentQuestion.type === 'multi_likert') {
            // For multi-likert, check if all aspects are answered
            if (this.selectedAnswer && typeof this.selectedAnswer === 'object') {
                var allAspectsAnswered = true;
                for (var i = 0; i < currentQuestion.aspects.length; i++) {
                    if (!this.selectedAnswer[currentQuestion.aspects[i].id]) {
                        allAspectsAnswered = false;
                        break;
                    }
                }
                isValid = allAspectsAnswered;
            }
        } else {
            // For other question types, check if answer exists and is not empty
            isValid = this.selectedAnswer && (typeof this.selectedAnswer === 'string' ? this.selectedAnswer.trim() !== '' : true);
        }
        
        if (!isValid) {
            this.showValidationError('Questa domanda è obbligatoria');
            return;
        }
    }
    
    // Save the answer (even if empty for optional questions)
    var answerToSave = this.selectedAnswer || '';
    
    // For multi_likert, ensure the object is properly serialized
    if (currentQuestion.type === 'multi_likert' && typeof answerToSave === 'object') {
        answerToSave = JSON.stringify(answerToSave);
    }
    
    this.results.push({
        questionId: currentQuestion.id,
        answer: answerToSave,
        questionType: currentQuestion.type
    });

    console.log('Answer saved:', {
        questionId: currentQuestion.id,
        answer: answerToSave,
        questionType: currentQuestion.type
    });

    // Disable the button to prevent multiple clicks
    var confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.disabled = true;

    // Calculate next question using conditional logic
    var nextQuestionId = ConditionalLogic.getNextId(this.questions, this.currentQuestionIndex, this.selectedAnswer, this.currentQuestionIndex);
    
    console.log('Conditional Logic Debug:', {
        currentQuestion: currentQuestion.id,
        currentAnswer: this.selectedAnswer,
        nextQuestionId: nextQuestionId,
        questionIndex: this.questionIndex
    });
    
    if (nextQuestionId === null) {
        // End of survey
        console.log('End of survey reached');
        this.showResults();
    } else {
        // Find next question index
        var nextIndex = this.questionIndex[nextQuestionId];
        if (nextIndex !== undefined) {
            console.log('Navigating to question:', nextQuestionId, 'at index:', nextIndex);
            this.currentQuestionIndex = nextIndex;
            this.currentQuestionNumber++; // Increment sequential number
            this.questionPath.push(nextIndex); // Track the path
            this.selectedAnswer = null;
            
            // Update total questions shown dynamically
            this.updateTotalQuestionsShown();
            
            this.renderCurrentQuestion();
        } else {
            console.error('Next question not found:', nextQuestionId);
            this.showResults();
        }
    }
};

SurveyManager.prototype.transitionToNextQuestion = function() {
    // Add fade out animation
    this.surveyContainer.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    this.surveyContainer.style.opacity = '0';
    this.surveyContainer.style.transform = 'translateY(20px)';
    
    var self = this;
    setTimeout(function() {
        // Move to next question
        self.currentQuestionIndex++;
        self.selectedAnswer = null;
        
        // Reset container styles
        self.surveyContainer.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
        self.surveyContainer.style.transform = 'translateY(-20px)';
        
        // Render new question
        self.renderCurrentQuestion();
        
        // Fade in with slide up animation
        setTimeout(function() {
            self.surveyContainer.style.opacity = '1';
            self.surveyContainer.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
};

SurveyManager.prototype.handleBackClick = function() {
    if (this.currentQuestionNumber > 1) {
        // Get the previous answer before removing it
        var previousAnswer = this.results[this.results.length - 1];
        
        // Remove last answer from results
        this.results.pop();
        
        // Decrement sequential number
        this.currentQuestionNumber--;
        
        // Remove current question from path and get previous
        this.questionPath.pop();
        var previousIndex = this.questionPath[this.questionPath.length - 1];
        
        // Start transition animation
        this.surveyContainer.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        this.surveyContainer.style.opacity = '0';
        this.surveyContainer.style.transform = 'translateY(20px)';
        
        var self = this;
        setTimeout(function() {
            // Move to previous question using tracked path
            self.currentQuestionIndex = previousIndex;
            self.selectedAnswer = previousAnswer ? previousAnswer.answer : null;
            
            // Update total questions shown dynamically
            self.updateTotalQuestionsShown();
            
            // Reset container styles
            self.surveyContainer.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            self.surveyContainer.style.transform = 'translateY(-20px)';
            
            // Render previous question
            self.renderCurrentQuestion();
            
            // Fade in with slide up animation
            setTimeout(function() {
                self.surveyContainer.style.opacity = '1';
                self.surveyContainer.style.transform = 'translateY(0)';
                
                // Preselect the previous answer if it exists
                if (self.selectedAnswer) {
                    self.preselectAnswer(self.selectedAnswer);
                }
            }, 50);
        }, 300);
    }
};

SurveyManager.prototype.showValidationError = function(message) {
    // Remove existing error message
    var existingError = document.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    var errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.innerHTML = '<i class="fa-thin fa-exclamation-triangle"></i> ' + message;
    
    // Insert after question description
    var questionHeader = document.querySelector('.question-header');
    if (questionHeader) {
        questionHeader.appendChild(errorDiv);
    }
    
    // Auto-remove after 3 seconds
    var self = this;
    setTimeout(function() {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
};

SurveyManager.prototype.preselectAnswer = function(answerValue) {
    var currentQuestion = this.questions[this.currentQuestionIndex];
    var confirmBtn = document.getElementById('confirm-btn');
    var checkIcon = document.getElementById('check-icon');
    
    switch(currentQuestion.type) {
        case 'single_choice':
            var answerOptions = document.querySelectorAll('.answer-option');
            for (var i = 0; i < answerOptions.length; i++) {
                var dataAnswer = answerOptions[i].getAttribute('data-answer');
                var answerIndex = parseInt(dataAnswer.charCodeAt(0) - 65);
                var answerId = currentQuestion.answers && currentQuestion.answers[answerIndex] ? 
                    currentQuestion.answers[answerIndex].id : dataAnswer;
                
                if (answerId === answerValue || dataAnswer === answerValue) {
                    answerOptions[i].classList.add('selected');
                    confirmBtn.disabled = false;
                    this.animateCheckmark(checkIcon);
                    break;
                }
            }
            break;
        case 'multiple_choice':
            var answerOptions = document.querySelectorAll('.answer-option');
            if (Array.isArray(answerValue)) {
                // Handle multiple selected answers
                for (var i = 0; i < answerOptions.length; i++) {
                    var dataAnswer = answerOptions[i].getAttribute('data-answer');
                    var answerIndex = parseInt(dataAnswer.charCodeAt(0) - 65);
                    var answerId = currentQuestion.answers && currentQuestion.answers[answerIndex] ? 
                        currentQuestion.answers[answerIndex].id : dataAnswer;
                    
                    if (answerValue.indexOf(answerId) !== -1 || answerValue.indexOf(dataAnswer) !== -1) {
                        var checkbox = answerOptions[i].querySelector('.answer-checkbox');
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    }
                }
                confirmBtn.disabled = false;
                this.animateCheckmark(checkIcon);
            }
            break;
        case 'likert_scale':
            var scaleOptions = document.querySelectorAll('.scale-option');
            for (var i = 0; i < scaleOptions.length; i++) {
                if (scaleOptions[i].getAttribute('data-value') === answerValue) {
                    scaleOptions[i].classList.add('selected');
                    confirmBtn.disabled = false;
                    this.animateCheckmark(checkIcon);
                    break;
                }
            }
            break;
        case 'yes_no':
            var yesNoOptions = document.querySelectorAll('.yes-no-option');
            for (var i = 0; i < yesNoOptions.length; i++) {
                if (yesNoOptions[i].getAttribute('data-answer') === answerValue) {
                    yesNoOptions[i].classList.add('selected');
                    confirmBtn.disabled = false;
                    this.animateCheckmark(checkIcon);
                    break;
                }
            }
            break;
        case 'open_text':
            var textarea = document.querySelector('.open-text-input');
            if (textarea) {
                textarea.value = answerValue;
                confirmBtn.disabled = currentQuestion.required && answerValue.trim() === '';
            }
            break;
    }
};

SurveyManager.prototype.handleKeyboardNavigation = function(e, answerOptions, confirmBtn) {
    if (e.key >= '1' && e.key <= '5') {
        var index = parseInt(e.key) - 1;
        if (answerOptions[index]) {
            answerOptions[index].click();
        }
    } else if (e.key === 'Enter' && !confirmBtn.disabled) {
        confirmBtn.click();
    }
};

SurveyManager.prototype.showResults = function() {
    // Hide the survey container immediately to prevent flickering
    this.surveyContainer.style.display = 'none';
    
    // Submit survey data immediately
    this.submitSurveyData();
};

SurveyManager.prototype.submitSurveyData = function() {
    // Build URL with survey data as parameters
    var params = new URLSearchParams();
    
    // Add survey results as URL parameters
    for (var i = 0; i < this.results.length; i++) {
        var result = this.results[i];
        params.append('question_' + result.questionId, JSON.stringify(result));
    }
    
    // Add client data if available
    if (this.clientData.email) params.append('client_email', this.clientData.email);
    if (this.clientData.country) params.append('client_country', this.clientData.country);
    if (this.clientData.language) params.append('client_language', this.clientData.language);
    if (this.clientData.age) params.append('client_age', this.clientData.age);
    if (this.clientData.gender) params.append('client_gender', this.clientData.gender);
    
    // Add total questions count
    params.append('total_questions', this.questions.length);
    
    // Add completion timestamp
    params.append('completed_at', new Date().toISOString());
    
    // In a real production scenario, this would be replaced with actual API call error handling
    // For now, we assume successful submission unless an actual error occurs
    // Example: if (apiCallFailed) { params.append('error', 'true'); params.append('error_message', 'Errore di connessione al server'); }
    
    // Redirect to thank you page with data
    window.location.href = 'thankyou.html?' + params.toString();
};

SurveyManager.prototype.setupEventListeners = function() {
    // Global event listeners can be added here if needed
};

SurveyManager.prototype.setupCoverEventListeners = function() {
    var startBtn = document.getElementById('start-survey-btn');
    var self = this;
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            self.startSurvey();
        });
    }
};

SurveyManager.prototype.startSurvey = function() {
    var coverWrapper = document.getElementById('cover-wrapper');
    var surveyWrapper = document.getElementById('survey-wrapper');
    
    // Initialize question path with first question
    this.questionPath = [this.currentQuestionIndex];
    
    // Start fade out animation for cover page
    coverWrapper.classList.add('fade-out');
    
    // After fade out completes, switch to survey
    var self = this;
    setTimeout(function() {
        coverWrapper.style.display = 'none';
        surveyWrapper.style.display = 'flex';
        self.renderCurrentQuestion();
    }, 300); // Match CSS transition duration
};

SurveyManager.prototype.handleMultipleChoiceSelection = function(checkbox, allOptions, confirmBtn, checkIcon) {
    var currentQuestion = this.questions[this.currentQuestionIndex];
    var selectedAnswers = [];
    
    // Collect all selected answers and update visual state
    for (var i = 0; i < allOptions.length; i++) {
        var optionCheckbox = allOptions[i].querySelector('.answer-checkbox');
        if (optionCheckbox && optionCheckbox.checked) {
            // Add selected class for visual feedback
            allOptions[i].classList.add('selected');
            
            var selectedAnswer = allOptions[i].getAttribute('data-answer');
            var answerIndex = parseInt(selectedAnswer.charCodeAt(0) - 65);
            var answerId = currentQuestion.answers && currentQuestion.answers[answerIndex] ? 
                currentQuestion.answers[answerIndex].id : selectedAnswer;
            selectedAnswers.push(answerId || selectedAnswer);
        } else {
            // Remove selected class if unchecked
            allOptions[i].classList.remove('selected');
        }
    }
    
    // Store the selected answers
    this.selectedAnswer = selectedAnswers;
    
    // Enable confirm button if at least one answer is selected
    if (selectedAnswers.length > 0) {
        confirmBtn.disabled = false;
        if (checkIcon) {
            checkIcon.style.display = 'block';
        }
    } else {
        confirmBtn.disabled = true;
        if (checkIcon) {
            checkIcon.style.display = 'none';
        }
    }
};

// Initialize the survey when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SurveyManager();
});
