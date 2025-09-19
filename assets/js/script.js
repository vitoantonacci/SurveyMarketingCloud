// JavaScript file for Survey Marketing Cloud

document.addEventListener('DOMContentLoaded', function() {
    const answerOptions = document.querySelectorAll('.answer-option');
    const confirmBtn = document.getElementById('confirm-btn');
    const checkIcon = document.getElementById('check-icon');
    let selectedAnswer = null;

    // Handle answer selection
    answerOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            answerOptions.forEach(o => o.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Get selected answer
            selectedAnswer = this.getAttribute('data-answer');
            
            // Enable confirm button
            confirmBtn.disabled = false;
            
            // Animate checkmark with drawing effect
            checkIcon.classList.remove('animate');
            checkIcon.style.animation = 'none';
            
            // Reset the path animation
            const path = checkIcon.querySelector('.checkmark-path');
            if (path) {
                path.style.animation = 'none';
                path.style.strokeDashoffset = '-20';
                path.offsetHeight; // Trigger reflow
            }
            
            setTimeout(() => {
                checkIcon.classList.add('animate');
                if (path) {
                    path.style.animation = 'checkmark-draw 0.6s ease-in-out forwards';
                }
            }, 100);
            
            // Add some visual feedback
            this.style.transform = 'scale(1.01)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Handle confirm button click
    confirmBtn.addEventListener('click', function() {
        if (selectedAnswer) {
            console.log('Selected answer:', selectedAnswer);
            
            // Here you can add logic to:
            // - Save the answer
            // - Move to next question
            // - Submit the survey
            // - etc.
            
            // For now, just show an alert
            alert(`Hai selezionato la risposta: ${selectedAnswer}`);
        }
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key >= '1' && e.key <= '5') {
            const index = parseInt(e.key) - 1;
            if (answerOptions[index]) {
                answerOptions[index].click();
            }
        } else if (e.key === 'Enter' && !confirmBtn.disabled) {
            confirmBtn.click();
        }
    });
});
