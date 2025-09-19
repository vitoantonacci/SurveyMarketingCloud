// JavaScript file for Survey Marketing Cloud

function SurveyManager() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.results = [];
    this.surveyContainer = document.getElementById('survey-container');
    this.selectedAnswer = null;
    
    this.init();
}

SurveyManager.prototype.init = function() {
    try {
        this.loadQuestions();
        this.renderCoverPage();
        this.setupEventListeners();
        this.setupCoverEventListeners();
    } catch (error) {
        console.error('Error initializing survey:', error);
    }
};

SurveyManager.prototype.loadQuestions = function() {
    // Questions data object
    var questionsData = {
        cover: {
            title: "Scopri le tue preferenze digitali",
            description: "Un breve sondaggio per capire meglio le tue abitudini e preferenze tecnologiche. Ci aiuterà a migliorare i nostri servizi.",
            buttonText: "Inizia il sondaggio",
            imageUrl: "https://images.typeform.com/images/RMtyJ36PEuNA/image/default-firstframe.png"
        },
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
    this.coverData = questionsData.cover;
};

SurveyManager.prototype.renderCoverPage = function() {
    var coverWrapper = document.getElementById('cover-wrapper');
    if (!coverWrapper) return;
    
    coverWrapper.innerHTML = '<div class="cover-container">' +
        '<div class="cover-content">' +
        '<div class="cover-logo">' +
        '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 337.9 69.8" style="enable-background:new 0 0 337.9 69.8;" xml:space="preserve">' +
        '<g>' +
        '<path d="M41.8,35.7l1.1,0.1c4.3,0.3,5.8,1,6.3,1.4c0.4,0.3,1.2,1.5,1.2,6.2v15.5c0,0.7-0.2,1.3-0.5,1.6c-0.2,0.2-1,0.7-3.9,1.7c-1.4,0.5-2.8,0.8-4.3,1c-1.5,0.2-2.9,0.3-4,0.3c-6.6,0-12.2-2.4-16.7-7.2c-4.5-4.8-6.8-11.6-6.8-20.2c0-10.5,2.3-18.1,6.8-22.6c4.5-4.5,9.8-6.8,15.7-6.8c5.9,0,10.5,1.9,14.1,5.7c2,2.2,4,5.7,6,10.2l0.3,0.7h4.2L60.5,0.5h-4.1l-0.3,0.7c-0.3,0.8-0.8,1.5-1.2,1.9c-0.2,0.2-0.8,0.5-2.2,0.5c-0.2,0-1.1-0.1-6-1.5C43.1,1,39.2,0.5,35.3,0.5c-10.7,0-19.5,3.7-26,11.1c-5.9,6.7-8.9,14.8-8.9,24.1c0,10.6,3.8,19.2,11.2,25.6c6.7,5.7,15.1,8.6,24.9,8.6c5.3,0,10.8-1,16.5-2.9c7.6-2.6,9.2-4.2,9.2-5.7V42.1c0-2.7,0.5-4.6,1.6-5.4c0.3-0.3,1.3-0.7,4.2-0.9l1.1-0.1v-4.1H41.8V35.7z"></path>' +
        '<path d="M122.1,5.7l1.1,0.1c3.2,0.3,5.4,1.1,6.5,2.2c0.6,0.6,1.6,2.7,1.6,9.2v25.4c0,6-0.7,10.5-2.2,13.3c-2.5,5-7.4,7.4-15,7.4c-6.8,0-11.3-2.3-13.8-7.1c-1.3-2.7-2-6.5-2-11.4V13.3c0-4.2,0.8-5.6,1.3-6c0.5-0.5,2-1.3,6.6-1.6l1.1-0.1V1.6h-30v4.1l1.1,0.1c4.5,0.3,6,1.2,6.5,1.6c0.5,0.4,1.3,1.8,1.3,6v30.5c0,6.2,1.1,11.3,3.2,15.1c4,7.2,11.6,10.9,22.5,10.9c11.1,0,18.7-3.7,22.7-11c2.1-3.9,3.2-9.4,3.2-16.3V17.1c0-6.3,0.9-8.4,1.5-9c0.7-0.8,2.3-1.8,6.6-2.3l1-0.1v-4h-24.9V5.7z"></path>' +
        '<path d="M212.6,50.3c-2.4,5.3-5,8.6-7.9,9.9c-3,1.4-7.7,2.1-14.1,2.1c-7.4,0-9.9-0.3-10.7-0.5c-0.2-0.1-1-0.3-1-2.3v-23h13.9c4.9,0,6.5,0.9,7,1.5c0.7,0.7,1.7,2.5,2.5,6.9l0.2,1h4.4V21h-4.4l-0.2,1c-0.8,4.4-1.8,6.2-2.5,6.9c-0.5,0.6-2.1,1.5-7.1,1.5h-13.9V9.8c0-1.5,0.2-1.9,0.2-1.9c0,0,0.3-0.2,1.7-0.2h13.3c6.8,0,9.3,0.9,10.3,1.7c1,0.7,2.3,2.7,3.3,7.6l0.2,1h4.6l-0.4-16.3h-54.1v4.1l1.1,0.1c4.3,0.3,5.8,1.2,6.2,1.6c0.5,0.5,1.2,1.9,1.2,6v43.4c0,4.5-0.8,5.6-1.2,5.9c-0.5,0.4-2,1.2-6.3,1.6l-1.1,0.1v4h54.8l5.1-18.8h-5L212.6,50.3z"></path>' +
        '<path d="M261.6,30.6l-8.6-5.3c-3.1-1.9-5.4-3.7-6.8-5.4c-1.3-1.6-2-3.4-2-5.7c0-2.4,0.8-4.3,2.5-5.6c1.8-1.4,3.8-2.1,6.2-2.1c3.2,0,6.4,1.2,9.7,3.5c3.3,2.3,5.7,6.5,7.2,12.4l0.2,0.9h4.5l-2.4-23.1h-4l-0.2,0.9c-0.2,0.9-0.5,1.5-0.8,2c-0.2,0.3-0.8,0.4-1.5,0.4c-0.2,0-1-0.2-5-1.6c-3.2-1.1-6.1-1.7-8.4-1.7c-5.7,0-10.3,1.8-13.8,5.2c-3.5,3.5-5.2,7.9-5.2,13.1c0,4,1.5,7.7,4.5,11c1.6,1.7,3.7,3.4,6.2,5l8.3,5.2c4.7,2.9,7.8,5.1,9.2,6.5c2.1,2.1,3.1,4.6,3.1,7.5c0,3.2-1,5.6-3,7.3c-2.1,1.8-4.4,2.7-7.3,2.7c-5.4,0-9.8-2.1-13.5-6.4c-2.1-2.5-4-5.9-5.6-10.1l-0.3-0.8h-4.4l3.2,23.1h4.2l0.2-1c0.1-0.7,0.3-1.3,0.6-1.8c0.2-0.3,0.6-0.5,1.3-0.5c0.2,0,1,0.2,5.3,1.6c3.4,1.2,6.7,1.8,9.8,1.8c6.3,0,11.5-1.8,15.6-5.4c4.1-3.6,6.2-8.2,6.2-13.7c0-4.1-1.2-7.6-3.5-10.6C271,37.1,267,34,261.6,30.6z"></path>' +
        '</g>' +
        '<path d="M334.3,40c-2.3-2.9-6.2-6-11.6-9.4l-8.6-5.3c-3.1-1.9-5.4-3.7-6.8-5.4c-1.3-1.6-2-3.4-2-5.7c0-2.4,0.8-4.3,2.5-5.6c1.8-1.4,3.8-2.1,6.2-2.1c3.2,0,6.4,1.2,9.7,3.5c3.3,2.3,5.7,6.5,7.2,12.4l0.2,0.9h4.5l-2.4-23.1h-4l-0.2,0.9c-0.2,0.9-0.5,1.5-0.8,2c-0.2,0.3-0.8,0.4-1.6,0.4c-0.2,0-1-0.2-5-1.6c-3.2-1.1-6.1-1.7-8.4-1.7c-5.7,0-10.3,1.8-13.8,5.2c-3.5,3.5-5.2,7.9-5.2,13.1c0,4,1.5,7.7,4.5,11c1.6,1.7,3.7,3.4,6.2,5l8.3,5.2c4.7,2.9,7.8,5.1,9.2,6.5c2.1,2.1,3.1,4.6,3.1,7.5c0,3.2-1,5.6-3,7.3c-2.1,1.8-4.4,2.7-7.3,2.7c-5.4,0-9.8-2.1-13.5-6.4c-2.1-2.5-4-5.9-5.6-10.1l-0.3-0.8h-4.4l3.2,23.1h4.2l0.2-1c0.1-0.7,0.3-1.3,0.6-1.8c0.2-0.3,0.6-0.5,1.3-0.5c0.2,0,1,0.2,5.3,1.6c3.4,1.2,6.7,1.8,9.8,1.8c6.3,0,11.5-1.8,15.6-5.4c4.1-3.6,6.2-8.2,6.2-13.7C337.8,46.6,336.6,43,334.3,40z"></path>' +
        '</svg>' +
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
        (question.id > 1 ? '<div class="progress-container" id="back-btn">' +
        '<p class="progress-text">' +
        '<i class="fa-thin fa-arrow-left back-arrow"></i>' +
        'Domanda ' + question.id + ' di ' + this.questions.length +
        '</p>' +
        '</div>' : '<div class="progress-container">' +
        '<p class="progress-text">Domanda ' + question.id + ' di ' + this.questions.length + '</p>' +
        '</div>') +
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

    // Handle back button click (if exists)
    var backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            self.handleBackClick();
        });
    }

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
        this.results.push({
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

SurveyManager.prototype.handleBackClick = function() {
    if (this.currentQuestionIndex > 0) {
        // Get the previous answer before removing it
        var previousAnswer = this.results[this.results.length - 1];
        
        // Remove last answer from results
        this.results.pop();
        
        // Start transition animation
        this.surveyContainer.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        this.surveyContainer.style.opacity = '0';
        this.surveyContainer.style.transform = 'translateY(20px)';
        
        var self = this;
        setTimeout(function() {
            // Move to previous question
            self.currentQuestionIndex--;
            self.selectedAnswer = previousAnswer ? previousAnswer.answer : null;
            
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

SurveyManager.prototype.preselectAnswer = function(answerLetter) {
    var answerOptions = document.querySelectorAll('.answer-option');
    var confirmBtn = document.getElementById('confirm-btn');
    var checkIcon = document.getElementById('check-icon');
    
    for (var i = 0; i < answerOptions.length; i++) {
        if (answerOptions[i].getAttribute('data-answer') === answerLetter) {
            // Add selected class
            answerOptions[i].classList.add('selected');
            
            // Enable confirm button
            confirmBtn.disabled = false;
            
            // Animate checkmark
            this.animateCheckmark(checkIcon);
            
            break;
        }
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
        
        for (var i = 0; i < self.results.length; i++) {
            var answer = self.results[i];
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

// Initialize the survey when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SurveyManager();
});
