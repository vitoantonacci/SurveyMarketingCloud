// Thank You Page JavaScript
function ThankYouManager() {
    this.coverWrapper = document.getElementById('cover-wrapper');
    this.thankYouData = null;
    this.surveyData = null;
    
    this.init();
}

ThankYouManager.prototype.init = function() {
    try {
        this.loadSurveyData();
        this.loadThankYouData();
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
    
    // Check if we have an error and load appropriate data
    if (this.surveyData && this.surveyData.hasError) {
        this.thankYouData = questionsData.error;
    } else {
        this.thankYouData = questionsData.thankyou;
    }
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
        completedAt: null,
        hasError: false,
        errorMessage: null,
        clientData: {
            email: null,
            country: null,
            language: null,
            age: null,
            gender: null
        }
    };
    
    // Try to get data from URL parameters (for GET requests)
    var urlParams = new URLSearchParams(window.location.search);
    
    // Check for error parameters FIRST
    if (urlParams.get('error') === 'true') {
        surveyData.hasError = true;
        surveyData.errorMessage = urlParams.get('error_message') || 'Errore sconosciuto';
        // Return immediately if there's an error, even without survey data
        return surveyData;
    }
    
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
    
    // Parse client data from URL parameters
    surveyData.clientData.email = urlParams.get('client_email');
    surveyData.clientData.country = urlParams.get('client_country');
    surveyData.clientData.language = urlParams.get('client_language');
    surveyData.clientData.age = urlParams.get('client_age');
    surveyData.clientData.gender = urlParams.get('client_gender');
    
    if (hasData) {
        surveyData.totalQuestions = parseInt(urlParams.get('total_questions')) || surveyData.results.length;
        surveyData.completedAt = urlParams.get('completed_at') || new Date().toISOString();
    }
    
    // Return surveyData if we have data OR if there's an error OR if we have client data
    return (hasData || surveyData.hasError || surveyData.clientData.email || surveyData.clientData.country || surveyData.clientData.language || surveyData.clientData.age || surveyData.clientData.gender) ? surveyData : null;
};

ThankYouManager.prototype.renderThankYouPage = function() {
    if (!this.coverWrapper || !this.thankYouData) return;
    
    var surveySummary = '';
    var errorMessage = '';
    var clientDataSummary = '';
    
    if (this.surveyData && this.surveyData.results.length > 0) {
        surveySummary = this.generateSurveySummary();
    }
    
    // Client data will be included in the survey summary box
    
    // Add error message if there's an error
    if (this.surveyData && this.surveyData.hasError) {
        errorMessage = '<div style="margin: 20px 0; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">' +
            '<p style="margin: 0; color: #c62828; font-size: 14px;"><strong>Dettagli errore:</strong> ' + 
            (this.surveyData.errorMessage || 'Errore sconosciuto') + '</p>' +
            '</div>';
    }
    
    this.coverWrapper.innerHTML = '<div class="cover-container">' +
        '<div class="cover-content">' +
        '<div class="cover-logo">' +
        getGuessLogo() +
        '</div>' +
        '<h1 class="cover-title">' + this.thankYouData.title + '</h1>' +
        '<p class="cover-description">' + this.thankYouData.description + '</p>' +
        errorMessage +
        surveySummary +
        '<a href="' + this.thankYouData.buttonUrl + '" class="btn waves-effect waves-light cover-btn"' + 
        (this.surveyData && this.surveyData.hasError ? '' : ' target="_blank"') + '>' +
        this.thankYouData.buttonText +
        '</a>' +
        '</div>' +
        '<div class="cover-image">' +
        '<img src="' + this.thankYouData.imageUrl + '" alt="Thank You" />' +
        '</div>' +
        '</div>';
};


ThankYouManager.prototype.generateSurveySummary = function() {
    // Don't show summary if there's an error
    if (this.surveyData && this.surveyData.hasError) return '';
    
    if (!this.surveyData || !this.surveyData.results.length) return '';
    
    var summary = '<div class="survey-summary" style="display: none; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #288749;">';
    summary += '<h3 style="margin: 0 0 15px 0; color: #1d1d1d; font-size: 18px;">Riepilogo delle tue risposte:</h3>';
    
    // Add client data section if available
    if (this.surveyData.clientData && (this.surveyData.clientData.email || this.surveyData.clientData.country || this.surveyData.clientData.language || this.surveyData.clientData.age || this.surveyData.clientData.gender)) {
        summary += '<div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px; border-left: 3px solid #2196f3;">';
        summary += '<h4 style="margin: 0 0 10px 0; color: #1d1d1d; font-size: 16px;">Dati Cliente:</h4>';
        summary += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">';
        
        if (this.surveyData.clientData.email) {
            summary += '<div><strong>Email:</strong> ' + this.surveyData.clientData.email + '</div>';
        }
        if (this.surveyData.clientData.country) {
            summary += '<div><strong>Paese:</strong> ' + this.surveyData.clientData.country + '</div>';
        }
        if (this.surveyData.clientData.language) {
            summary += '<div><strong>Lingua:</strong> ' + this.surveyData.clientData.language + '</div>';
        }
        if (this.surveyData.clientData.age) {
            summary += '<div><strong>Età:</strong> ' + this.surveyData.clientData.age + '</div>';
        }
        if (this.surveyData.clientData.gender) {
            summary += '<div><strong>Genere:</strong> ' + this.surveyData.clientData.gender + '</div>';
        }
        
        summary += '</div>';
        summary += '</div>';
    }
    
    // Create scrollable container with fixed height
    summary += '<div id="answers-container" style="height: 150px; overflow-y: auto; position: relative; margin-bottom: 15px; transition: height 0.3s ease-in-out;">';
    
    for (var i = 0; i < this.surveyData.results.length; i++) {
        var result = this.surveyData.results[i];
        var questionText = this.getQuestionText(result.questionId);
        var questionNumber = this.getQuestionNumber(result.questionId);
        
        summary += '<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef;">';
        summary += '<strong style="color: #1d1d1d;">Domanda ' + questionNumber + ':</strong><br>';
        summary += '<span style="color: #333; font-size: 14px; font-style: italic; margin: 5px 0; display: block;">' + questionText + '</span>';
        summary += '<span style="color: #666; font-size: 14px;"><strong>Risposta:</strong> ' + this.formatAnswer(result) + '</span>';
        summary += '</div>';
    }
    
    // Add fade effect at bottom
    summary += '<div class="fade-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(transparent, #f8f9fa); pointer-events: none;"></div>';
    summary += '</div>';
    
    // Add expand/collapse button
    summary += '<button id="toggle-answers-btn" style="background: none; border: none; color: #288749; cursor: pointer; font-size: 14px; text-decoration: underline; padding: 0; margin-bottom: 15px;">Mostra tutto</button>';
    
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

ThankYouManager.prototype.getQuestionNumber = function(questionId) {
    if (typeof questionsData === 'undefined' || !questionsData.questions) {
        return '?';
    }
    
    // Find the question and return its sequential number based on the order it appears
    // This is a simplified approach - in a real scenario, you'd want to track the actual flow
    for (var i = 0; i < questionsData.questions.length; i++) {
        if (questionsData.questions[i].id === questionId) {
            return i + 1;
        }
    }
    
    return '?';
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
                answersContainer.style.height = '150px';
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
