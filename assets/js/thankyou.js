// Thank You Page JavaScript
function ThankYouManager() {
    this.coverWrapper = document.getElementById('cover-wrapper');
    this.thankYouData = null;
    
    this.init();
}

ThankYouManager.prototype.init = function() {
    try {
        this.loadThankYouData();
        this.renderThankYouPage();
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

ThankYouManager.prototype.renderThankYouPage = function() {
    if (!this.coverWrapper || !this.thankYouData) return;
    
    this.coverWrapper.innerHTML = '<div class="cover-container">' +
        '<div class="cover-content">' +
        '<div class="cover-logo">' +
        getGuessLogo() +
        '</div>' +
        '<h1 class="cover-title">' + this.thankYouData.title + '</h1>' +
        '<p class="cover-description">' + this.thankYouData.description + '</p>' +
        '<a href="' + this.thankYouData.buttonUrl + '" class="btn waves-effect waves-light cover-btn" target="_blank">' +
        this.thankYouData.buttonText +
        '</a>' +
        '</div>' +
        '<div class="cover-image">' +
        '<img src="' + this.thankYouData.imageUrl + '" alt="Thank You" />' +
        '</div>' +
        '</div>';
};

// Initialize the thank you page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ThankYouManager();
});
