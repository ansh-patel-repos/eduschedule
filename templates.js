// Template management functionality
class TemplateManager {
    constructor() {
        this.templates = {
            engineering: {
                name: 'Engineering Schedule',
                classes: [
                    { subject: 'Mathematics', instructor: 'Dr. Smith', room: 'Room 101', day: 'Monday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Physics', instructor: 'Prof. Johnson', room: 'Lab 201', day: 'Monday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Chemistry', instructor: 'Dr. Brown', room: 'Lab 301', day: 'Monday', startTime: '11:00', endTime: '12:00' },
                    { subject: 'Programming', instructor: 'Mr. Davis', room: 'Computer Lab', day: 'Tuesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Engineering Drawing', instructor: 'Prof. Wilson', room: 'Room 102', day: 'Tuesday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'English', instructor: 'Ms. Taylor', room: 'Room 103', day: 'Wednesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Mathematics', instructor: 'Dr. Smith', room: 'Room 101', day: 'Wednesday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Physics Lab', instructor: 'Prof. Johnson', room: 'Lab 201', day: 'Thursday', startTime: '09:00', endTime: '11:00' }
                ]
            },
            business: {
                name: 'Business Schedule',
                classes: [
                    { subject: 'Business Administration', instructor: 'Prof. Anderson', room: 'Room 201', day: 'Monday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Economics', instructor: 'Dr. Martinez', room: 'Room 202', day: 'Monday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Accounting', instructor: 'Ms. Garcia', room: 'Room 203', day: 'Tuesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Marketing', instructor: 'Mr. Rodriguez', room: 'Room 204', day: 'Tuesday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Statistics', instructor: 'Dr. Lee', room: 'Room 205', day: 'Wednesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Management', instructor: 'Prof. White', room: 'Room 206', day: 'Wednesday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Business Law', instructor: 'Ms. Thompson', room: 'Room 207', day: 'Thursday', startTime: '09:00', endTime: '10:00' }
                ]
            },
            science: {
                name: 'Science Schedule',
                classes: [
                    { subject: 'Biology', instructor: 'Dr. Green', room: 'Bio Lab', day: 'Monday', startTime: '08:00', endTime: '09:00' },
                    { subject: 'Chemistry', instructor: 'Prof. Blue', room: 'Chem Lab', day: 'Monday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Physics', instructor: 'Dr. Red', room: 'Physics Lab', day: 'Monday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Mathematics', instructor: 'Prof. Black', room: 'Room 301', day: 'Tuesday', startTime: '08:00', endTime: '09:00' },
                    { subject: 'Biology Lab', instructor: 'Dr. Green', room: 'Bio Lab', day: 'Tuesday', startTime: '14:00', endTime: '16:00' },
                    { subject: 'Chemistry Lab', instructor: 'Prof. Blue', room: 'Chem Lab', day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
                    { subject: 'Physics Lab', instructor: 'Dr. Red', room: 'Physics Lab', day: 'Thursday', startTime: '14:00', endTime: '16:00' },
                    { subject: 'Research Methods', instructor: 'Dr. Gray', room: 'Room 302', day: 'Friday', startTime: '09:00', endTime: '10:00' }
                ]
            },
            arts: {
                name: 'Arts Schedule',
                classes: [
                    { subject: 'Literature', instructor: 'Prof. Shakespeare', room: 'Room 401', day: 'Monday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'History', instructor: 'Dr. Ancient', room: 'Room 402', day: 'Monday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Philosophy', instructor: 'Prof. Wisdom', room: 'Room 403', day: 'Tuesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Fine Arts', instructor: 'Ms. Creative', room: 'Art Studio', day: 'Tuesday', startTime: '10:00', endTime: '12:00' },
                    { subject: 'Language Studies', instructor: 'Dr. Polyglot', room: 'Room 404', day: 'Wednesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Sociology', instructor: 'Prof. Social', room: 'Room 405', day: 'Wednesday', startTime: '10:00', endTime: '11:00' }
                ]
            },
            medical: {
                name: 'Medical Schedule',
                classes: [
                    { subject: 'Anatomy', instructor: 'Dr. Bones', room: 'Anatomy Lab', day: 'Monday', startTime: '08:00', endTime: '10:00' },
                    { subject: 'Physiology', instructor: 'Prof. Function', room: 'Room 501', day: 'Monday', startTime: '10:00', endTime: '12:00' },
                    { subject: 'Biochemistry', instructor: 'Dr. Molecule', room: 'Biochem Lab', day: 'Tuesday', startTime: '08:00', endTime: '10:00' },
                    { subject: 'Pathology', instructor: 'Prof. Disease', room: 'Path Lab', day: 'Tuesday', startTime: '10:00', endTime: '12:00' },
                    { subject: 'Clinical Skills', instructor: 'Dr. Practice', room: 'Clinical Lab', day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
                    { subject: 'Pharmacology', instructor: 'Prof. Drugs', room: 'Room 502', day: 'Thursday', startTime: '08:00', endTime: '10:00' },
                    { subject: 'Surgery Basics', instructor: 'Dr. Surgeon', room: 'OR Simulator', day: 'Thursday', startTime: '14:00', endTime: '16:00' },
                    { subject: 'Medical Ethics', instructor: 'Prof. Ethics', room: 'Room 503', day: 'Friday', startTime: '09:00', endTime: '10:00' }
                ]
            },
            'computer-science': {
                name: 'Computer Science Schedule',
                classes: [
                    { subject: 'Programming Fundamentals', instructor: 'Prof. Code', room: 'CS Lab 1', day: 'Monday', startTime: '09:00', endTime: '11:00' },
                    { subject: 'Data Structures', instructor: 'Dr. Algorithm', room: 'CS Lab 2', day: 'Monday', startTime: '11:00', endTime: '12:00' },
                    { subject: 'Database Systems', instructor: 'Prof. Query', room: 'CS Lab 3', day: 'Tuesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Computer Networks', instructor: 'Dr. Protocol', room: 'Network Lab', day: 'Tuesday', startTime: '10:00', endTime: '11:00' },
                    { subject: 'Software Engineering', instructor: 'Prof. Design', room: 'Room 601', day: 'Wednesday', startTime: '09:00', endTime: '10:00' },
                    { subject: 'Web Development', instructor: 'Ms. Frontend', room: 'CS Lab 1', day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
                    { subject: 'Project Work', instructor: 'Dr. Build', room: 'Project Lab', day: 'Thursday', startTime: '14:00', endTime: '17:00' },
                    { subject: 'Machine Learning', instructor: 'Prof. AI', room: 'AI Lab', day: 'Friday', startTime: '09:00', endTime: '11:00' }
                ]
            }
        };
    }

    loadTemplate(templateId) {
        const template = this.templates[templateId];
        if (!template) {
            this.showMessage('Template not found!', 'error');
            return;
        }

        // Store template data in localStorage
        localStorage.setItem('selectedTemplate', JSON.stringify(template));
        
        // Show success message
        this.showMessage(`${template.name} template loaded! Redirecting to generator...`, 'success');
        
        // Redirect to generator page after a short delay
        setTimeout(() => {
            window.location.href = 'tt_generator/course_setup.html';
        }, 1500);
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.template-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `template-message ${type === 'error' ? 'error-message' : 'success-message'}`;
        messageElement.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            ${message}
        `;

        // Add to page
        const container = document.querySelector('.container');
        container.insertBefore(messageElement, container.firstChild);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    // Initialize template preview animations
    initializeAnimations() {
        const templateCards = document.querySelectorAll('.template-card');
        
        templateCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Add search functionality
    initializeSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search templates...';
        searchInput.className = 'template-search';
        searchInput.style.cssText = `
            width: 100%;
            max-width: 400px;
            padding: 12px 16px;
            margin: 0 auto 2rem;
            display: block;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: var(--font-size-base);
            background: var(--bg-primary);
        `;

        const container = document.querySelector('.container');
        const templatesGrid = document.querySelector('.templates-grid');
        container.insertBefore(searchInput, templatesGrid);

        searchInput.addEventListener('input', (e) => {
            this.filterTemplates(e.target.value);
        });
    }

    filterTemplates(searchTerm) {
        const templateCards = document.querySelectorAll('.template-card');
        const searchLower = searchTerm.toLowerCase();

        templateCards.forEach(card => {
            const title = card.querySelector('.template-info h3').textContent.toLowerCase();
            const description = card.querySelector('.template-info p').textContent.toLowerCase();
            
            if (title.includes(searchLower) || description.includes(searchLower)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Add template statistics
    updateTemplateStats() {
        const templateCards = document.querySelectorAll('.template-card');
        
        templateCards.forEach((card, index) => {
            const templateIds = Object.keys(this.templates);
            const templateId = templateIds[index];
            const template = this.templates[templateId];
            
            if (template) {
                const statsElement = card.querySelector('.template-stats');
                const classCount = template.classes.length;
                const uniqueDays = [...new Set(template.classes.map(c => c.day))].length;
                const avgHoursPerDay = Math.round(
                    template.classes.reduce((total, cls) => {
                        const start = this.timeToMinutes(cls.startTime);
                        const end = this.timeToMinutes(cls.endTime);
                        return total + (end - start);
                    }, 0) / uniqueDays / 60
                );
                
                statsElement.innerHTML = `
                    <span><i class="fas fa-clock"></i> ${avgHoursPerDay} hours/day</span>
                    <span><i class="fas fa-book"></i> ${classCount} classes</span>
                `;
            }
        });
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
}

// Global function for template buttons
function loadTemplate(templateId) {
    const templateManager = new TemplateManager();
    templateManager.loadTemplate(templateId);
}

// Initialize template manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const templateManager = new TemplateManager();
    templateManager.initializeAnimations();
    templateManager.initializeSearch();
    templateManager.updateTemplateStats();
});

// Add CSS for template messages
const templateStyle = document.createElement('style');
templateStyle.textContent = `
    .template-message {
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    }
    
    .template-message.success-message {
        background: #f0fdf4;
        color: #059669;
        border-left: 4px solid #059669;
    }
    
    .template-message.error-message {
        background: #fef2f2;
        color: #dc2626;
        border-left: 4px solid #dc2626;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .template-search:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
`;
document.head.appendChild(templateStyle);