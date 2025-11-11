// Contact form functionality
class ContactManager {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.successMessage = document.getElementById('contactSuccess');
        this.faqItems = document.querySelectorAll('.faq-item');
        
        this.initializeEventListeners();
        this.initializeFAQ();
    }

    initializeEventListeners() {
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // Add input validation
        const inputs = this.contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    handleFormSubmission() {
        const formData = new FormData(this.contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        if (!this.validateForm(data)) {
            return;
        }

        // Simulate form submission
        this.showLoadingState();
        
        // Simulate API call delay
        setTimeout(() => {
            this.hideLoadingState();
            this.showSuccessMessage();
            this.resetForm();
        }, 2000);
    }

    validateForm(data) {
        let isValid = true;
        const errors = {};

        // Validate required fields
        if (!data.firstName.trim()) {
            errors.firstName = 'First name is required';
            isValid = false;
        }

        if (!data.lastName.trim()) {
            errors.lastName = 'Last name is required';
            isValid = false;
        }

        if (!data.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!data.subject) {
            errors.subject = 'Please select a subject';
            isValid = false;
        }

        if (!data.message.trim()) {
            errors.message = 'Message is required';
            isValid = false;
        } else if (data.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters long';
            isValid = false;
        }

        // Display errors
        this.displayErrors(errors);
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let error = '';

        switch (field.name) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    error = `${field.name === 'firstName' ? 'First' : 'Last'} name is required`;
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'subject':
                if (!value) {
                    error = 'Please select a subject';
                }
                break;
            case 'message':
                if (!value) {
                    error = 'Message is required';
                } else if (value.length < 10) {
                    error = 'Message must be at least 10 characters long';
                }
                break;
        }

        if (error) {
            this.showFieldError(field, error);
        } else {
            this.clearFieldError(field);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    displayErrors(errors) {
        // Clear previous errors
        this.clearAllErrors();

        // Show new errors
        Object.keys(errors).forEach(fieldName => {
            const field = this.contactForm.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, errors[fieldName]);
            }
        });
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#dc2626';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        `;
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    clearAllErrors() {
        const errorElements = this.contactForm.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
        
        const inputs = this.contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    }

    showLoadingState() {
        const submitButton = this.contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    hideLoadingState() {
        const submitButton = this.contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }

    showSuccessMessage() {
        this.successMessage.style.display = 'block';
        this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 5000);
    }

    resetForm() {
        this.contactForm.reset();
        this.clearAllErrors();
    }

    initializeFAQ() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                this.toggleFAQItem(item);
            });
        });
    }

    toggleFAQItem(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        this.faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    }

    // Add character counter for message field
    initializeCharacterCounter() {
        const messageField = document.getElementById('message');
        if (!messageField) return;

        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-top: 4px;
        `;
        
        messageField.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const length = messageField.value.length;
            const minLength = 10;
            const maxLength = 1000;
            
            counter.textContent = `${length}/${maxLength} characters`;
            
            if (length < minLength) {
                counter.style.color = '#dc2626';
            } else if (length > maxLength * 0.9) {
                counter.style.color = '#d97706';
            } else {
                counter.style.color = 'var(--text-secondary)';
            }
        };
        
        messageField.addEventListener('input', updateCounter);
        updateCounter();
    }

    // Add auto-save functionality
    initializeAutoSave() {
        const inputs = this.contactForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Load saved data
            const savedValue = localStorage.getItem(`contact_${input.name}`);
            if (savedValue && input.type !== 'submit') {
                input.value = savedValue;
            }
            
            // Save on input
            input.addEventListener('input', () => {
                localStorage.setItem(`contact_${input.name}`, input.value);
            });
        });
        
        // Clear saved data on successful submission
        this.contactForm.addEventListener('submit', () => {
            setTimeout(() => {
                inputs.forEach(input => {
                    localStorage.removeItem(`contact_${input.name}`);
                });
            }, 2000);
        });
    }
}

// Initialize contact manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactManager = new ContactManager();
    contactManager.initializeCharacterCounter();
    contactManager.initializeAutoSave();
});

// Add smooth scrolling for contact methods
document.addEventListener('DOMContentLoaded', () => {
    const contactMethods = document.querySelectorAll('.contact-method');
    
    contactMethods.forEach(method => {
        method.addEventListener('click', () => {
            const methodType = method.querySelector('h3').textContent.toLowerCase();
            
            if (methodType === 'email') {
                window.location.href = 'mailto:support@eduschedule.com';
            } else if (methodType === 'phone') {
                window.location.href = 'tel:+15551234567';
            }
        });
    });
});

// Add form analytics (placeholder for future implementation)
class ContactAnalytics {
    static trackFormStart() {
        console.log('Contact form started');
    }
    
    static trackFormSubmit(data) {
        console.log('Contact form submitted:', data.subject);
    }
    
    static trackFieldError(fieldName, error) {
        console.log('Form validation error:', fieldName, error);
    }
}

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactManager;
}