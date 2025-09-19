// JavaScript file for Survey Marketing Cloud

function SurveyManager() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.surveyContainer = document.getElementById('survey-container');
    this.selectedAnswer = null;
    
    this.init();
}

SurveyManager.prototype.init = function() {
    try {
        this.loadQuestions();
        this.renderCurrentQuestion();
        this.setupEventListeners();
    } catch (error) {
        console.error('Error initializing survey:', error);
    }
};

SurveyManager.prototype.loadQuestions = function() {
    // Questions data object
    var questionsData = {
            questions: [
                {
                    id: 1,
                    title: "Qual è la tua esperienza con i prodotti digitali?",
                    description: "Aiutaci a capire meglio le tue preferenze per migliorare i nostri servizi",
                    answers: [
                        {
                            text: "Sono un principiante, ho poca esperienza"
                        },
                        {
                            text: "Ho un'esperienza intermedia"
                        },
                        {
                            text: "Sono abbastanza esperto"
                        },
                        {
                            text: "Sono molto esperto"
                        },
                        {
                            text: "Sono un esperto professionista"
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Quale dispositivo utilizzi principalmente?",
                    description: "Ci aiuta a ottimizzare l'esperienza per il tuo dispositivo preferito",
                    answers: [
                        {
                            text: "Smartphone"
                        },
                        {
                            text: "Tablet"
                        },
                        {
                            text: "Laptop/Desktop"
                        },
                        {
                            text: "Tutti i dispositivi"
                        }
                    ]
                }
            ]
        };
        
        this.questions = questionsData.questions;
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
    for (var i = 0; i < question.answers.length; i++) {
        var answer = question.answers[i];
        var letter = String.fromCharCode(65 + i); // A, B, C, D, E...
        answersHTML += '<div class="answer-option" data-answer="' + letter + '">' +
            '<div class="answer-letter">' + letter + '</div>' +
            '<div class="answer-text">' + answer.text + '</div>' +
            '</div>';
    }

    return '<!-- Question Header -->' +
        '<div class="question-header">' +
        '<p class="progress-text">Domanda ' + question.id + ' di ' + this.questions.length + '</p>' +
        '<h1 class="question-title">' + question.id + ' <i class="fa-thin fa-arrow-right"></i> ' + question.title + '</h1>' +
        '<p class="question-description">' + question.description + '</p>' +
        '</div>' +
        '<!-- Answer Options -->' +
        '<div class="answers-container">' +
        answersHTML +
        '</div>' +
        '<!-- Action Button -->' +
        '<div class="action-container">' +
        '<button class="btn waves-effect waves-light" id="confirm-btn" disabled>' +
        'OK' +
        '<div id="check-icon" class="checkmark">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path class="checkmark-path" d="M20 6L9 17l-5-5"/>' +
        '</svg>' +
        '</div>' +
        '</button>' +
        '</div>';
};

SurveyManager.prototype.updateProgressBar = function(question) {
    // Remove existing progress bar
    var existingProgress = document.querySelector('.progress-indicator');
    if (existingProgress) {
        existingProgress.remove();
    }

    // Create new progress bar
    var progressBar = document.createElement('div');
    progressBar.className = 'progress-indicator';
    progressBar.innerHTML = '<div class="progress-fill" style="width: ' + ((question.id / this.questions.length) * 100) + '%"></div>';
    
    // Add to wrapper
    var wrapper = document.querySelector('.survey-wrapper');
    wrapper.appendChild(progressBar);
};

SurveyManager.prototype.setupQuestionEventListeners = function() {
    var answerOptions = document.querySelectorAll('.answer-option');
    var confirmBtn = document.getElementById('confirm-btn');
    var checkIcon = document.getElementById('check-icon');
    var self = this;

    // Handle answer selection
    for (var i = 0; i < answerOptions.length; i++) {
        answerOptions[i].addEventListener('click', function() {
            self.handleAnswerSelection(this, answerOptions, confirmBtn, checkIcon);
        });
    }

    // Handle confirm button click
    confirmBtn.addEventListener('click', function() {
        self.handleConfirmClick();
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        self.handleKeyboardNavigation(e, answerOptions, confirmBtn);
    });
};

SurveyManager.prototype.handleAnswerSelection = function(selectedOption, allOptions, confirmBtn, checkIcon) {
    // Remove selected class from all options
    for (var i = 0; i < allOptions.length; i++) {
        allOptions[i].classList.remove('selected');
    }
    
    // Add selected class to clicked option
    selectedOption.classList.add('selected');
    
    // Get selected answer
    this.selectedAnswer = selectedOption.getAttribute('data-answer');
    
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
    if (this.selectedAnswer) {
        // Save the answer
        this.answers.push({
            questionId: this.questions[this.currentQuestionIndex].id,
            answer: this.selectedAnswer
        });

        console.log('Answer saved:', {
            questionId: this.questions[this.currentQuestionIndex].id,
            answer: this.selectedAnswer
        });

        // Disable the button to prevent multiple clicks
        var confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.disabled = true;

        // Transition immediately since animation already completed
        this.transitionToNextQuestion();
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
    // Add fade out animation
    this.surveyContainer.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    this.surveyContainer.style.opacity = '0';
    this.surveyContainer.style.transform = 'translateY(20px)';
    
    var self = this;
    setTimeout(function() {
        var resultsHTML = '<div class="question-header">' +
            '<h1 class="question-title">Survey Completato!</h1>' +
            '<p class="question-description">Grazie per aver completato il survey. Ecco le tue risposte:</p>' +
            '</div>' +
            '<div class="answers-container">';
        
        for (var i = 0; i < self.answers.length; i++) {
            var answer = self.answers[i];
            resultsHTML += '<div class="answer-option selected">' +
                '<div class="answer-letter">Q' + answer.questionId + '</div>' +
                '<div class="answer-text">Risposta: ' + answer.answer + '</div>' +
                '</div>';
        }
        
        resultsHTML += '</div>';
        self.surveyContainer.innerHTML = resultsHTML;
        
        // Reset container styles
        self.surveyContainer.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
        self.surveyContainer.style.transform = 'translateY(-20px)';
        
        // Fade in with slide up animation
        setTimeout(function() {
            self.surveyContainer.style.opacity = '1';
            self.surveyContainer.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
};

SurveyManager.prototype.setupEventListeners = function() {
    // Global event listeners can be added here if needed
};

// Initialize the survey when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SurveyManager();
});
