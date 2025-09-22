// Thank You Page JavaScript
function ThankYouManager() {
    this.coverWrapper = document.getElementById('cover-wrapper');
    this.thankYouData = null;
    this.surveyData = null;
    
    this.init();
}

ThankYouManager.prototype.init = function() {
    try {
        this.loadThankYouData();
        this.loadSurveyData();
        this.renderThankYouPage();
        this.setupEventListeners();
    } catch (error) {
        console.error('Error initializing thank you page:', error);
    }
};

ThankYouManager.prototype.loadThankYouData = function() {
    // Load thank you data from external questionsData variable
    if (typeof questionsData === 'undefined') {
        console.error('questionsData is not defined. Make sure questions.js is loaded before thankyou.js');
        return;
    }
        
    this.thankYouData = questionsData.thankyou;
};

ThankYouManager.prototype.loadSurveyData = function() {
    // Parse survey data from URL parameters or form data
    this.surveyData = this.parseSurveyData();
    
    if (this.surveyData) {
        console.log('Survey data loaded:', this.surveyData);
    }
};

ThankYouManager.prototype.parseSurveyData = function() {
    var surveyData = {
        results: [],
        totalQuestions: 0,
        completedAt: null
    };
    
    // Try to get data from URL parameters (for GET requests)
    var urlParams = new URLSearchParams(window.location.search);
    
    // Check if we have survey data in URL parameters
    var hasData = false;
    for (var i = 1; i <= 10; i++) { // Check for up to 10 questions
        var questionParam = urlParams.get('question_' + i);
        if (questionParam) {
            try {
                var result = JSON.parse(decodeURIComponent(questionParam));
                surveyData.results.push(result);
                hasData = true;
            } catch (e) {
                console.error('Error parsing question data:', e);
            }
        }
    }
    
    if (hasData) {
        surveyData.totalQuestions = parseInt(urlParams.get('total_questions')) || surveyData.results.length;
        surveyData.completedAt = urlParams.get('completed_at') || new Date().toISOString();
    }
    
    return hasData ? surveyData : null;
};

ThankYouManager.prototype.renderThankYouPage = function() {
    if (!this.coverWrapper || !this.thankYouData) return;
    
    var surveySummary = '';
    if (this.surveyData && this.surveyData.results.length > 0) {
        surveySummary = this.generateSurveySummary();
    }
    
    this.coverWrapper.innerHTML = '<div class="cover-container">' +
        '<div class="cover-content">' +
        '<div class="cover-logo">' +
        getGuessLogo() +
        '</div>' +
        '<h1 class="cover-title">' + this.thankYouData.title + '</h1>' +
        '<p class="cover-description">' + this.thankYouData.description + '</p>' +
        surveySummary +
        '<a href="' + this.thankYouData.buttonUrl + '" class="btn waves-effect waves-light cover-btn" target="_blank">' +
        this.thankYouData.buttonText +
        '</a>' +
        '</div>' +
        '<div class="cover-image">' +
        '<img src="' + this.thankYouData.imageUrl + '" alt="Thank You" />' +
        '</div>' +
        '</div>';
};

ThankYouManager.prototype.generateSurveySummary = function() {
    if (!this.surveyData || !this.surveyData.results.length) return '';
    
    var summary = '<div class="survey-summary" style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #288749;">';
    summary += '<h3 style="margin: 0 0 15px 0; color: #1d1d1d; font-size: 18px;">Riepilogo delle tue risposte:</h3>';
    
    // Create scrollable container with fixed height
    summary += '<div id="answers-container" style="height: 300px; overflow-y: auto; position: relative; margin-bottom: 15px; transition: height 0.3s ease-in-out;">';
    
    for (var i = 0; i < this.surveyData.results.length; i++) {
        var result = this.surveyData.results[i];
        var questionText = this.getQuestionText(result.questionId);
        
        summary += '<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">';
        summary += '<strong style="color: #1d1d1d;">Domanda ' + result.questionId + ':</strong><br>';
        summary += '<span style="color: #333; font-size: 14px; font-style: italic; margin: 5px 0; display: block;">' + questionText + '</span>';
        summary += '<span style="color: #666; font-size: 14px;"><strong>Risposta:</strong> ' + this.formatAnswer(result) + '</span>';
        summary += '</div>';
    }
    
    // Add fade effect at bottom
    summary += '<div class="fade-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(transparent, #f8f9fa); pointer-events: none;"></div>';
    summary += '</div>';
    
    // Add expand/collapse button
    summary += '<button id="toggle-answers-btn" style="width: 100%; padding: 10px; background: #288749; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-bottom: 15px;">Mostra tutto</button>';
    
    summary += '<div style="margin-top: 15px; font-size: 12px; color: #888;">';
    summary += 'Completato il: ' + new Date(this.surveyData.completedAt).toLocaleString('it-IT');
    summary += '</div>';
    summary += '</div>';
    
    return summary;
};

ThankYouManager.prototype.getQuestionText = function(questionId) {
    if (typeof questionsData === 'undefined' || !questionsData.questions) {
        return 'Domanda non disponibile';
    }
    
    for (var i = 0; i < questionsData.questions.length; i++) {
        if (questionsData.questions[i].id === questionId) {
            return questionsData.questions[i].title;
        }
    }
    
    return 'Domanda non trovata';
};

ThankYouManager.prototype.formatAnswer = function(result) {
    if (!result.answer) return 'Nessuna risposta';
    
    // Handle case where answer might be a string representation of an object
    var answer = result.answer;
    if (typeof answer === 'string' && answer.startsWith('{')) {
        try {
            answer = JSON.parse(answer);
        } catch (e) {
            console.error('Error parsing answer:', e);
        }
    }
    
    switch (result.questionType) {
        case 'multiple_choice':
            return this.formatMultipleChoiceAnswer(result.questionId, answer);
        case 'likert_scale':
            return 'Punteggio: ' + answer + '/5';
        case 'yes_no':
            return answer === 'yes' ? 'Sì' : 'No';
        case 'open_text':
            return answer.length > 100 ? answer.substring(0, 100) + '...' : answer;
        case 'multi_likert':
            if (typeof answer === 'object' && answer !== null) {
                var aspects = [];
                for (var aspect in answer) {
                    aspects.push(aspect + ': ' + answer[aspect] + '/5');
                }
                return aspects.join(', ');
            }
            return answer;
        default:
            return answer;
    }
};

ThankYouManager.prototype.formatMultipleChoiceAnswer = function(questionId, answerLetter) {
    if (typeof questionsData === 'undefined' || !questionsData.questions) {
        return answerLetter;
    }
    
    // Find the question
    var question = null;
    for (var i = 0; i < questionsData.questions.length; i++) {
        if (questionsData.questions[i].id === questionId) {
            question = questionsData.questions[i];
            break;
        }
    }
    
    if (!question || !question.answers) {
        return answerLetter;
    }
    
    // Find the answer text for the given letter
    var answerIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
    if (answerIndex >= 0 && answerIndex < question.answers.length) {
        return answerLetter + ') ' + question.answers[answerIndex].text;
    }
    
    return answerLetter;
};

ThankYouManager.prototype.setupEventListeners = function() {
    var self = this;
    var toggleBtn = document.getElementById('toggle-answers-btn');
    var answersContainer = document.getElementById('answers-container');
    var fadeOverlay = document.querySelector('.fade-overlay');
    
    if (toggleBtn && answersContainer) {
        var isExpanded = false;
        
        toggleBtn.addEventListener('click', function() {
            if (isExpanded) {
                // Collapse
                answersContainer.style.height = '300px';
                fadeOverlay.style.display = 'block';
                toggleBtn.textContent = 'Mostra tutto';
                isExpanded = false;
            } else {
                // Expand
                answersContainer.style.height = 'auto';
                fadeOverlay.style.display = 'none';
                toggleBtn.textContent = 'Mostra meno';
                isExpanded = true;
            }
        });
    }
};

// Initialize the thank you page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ThankYouManager();
});
