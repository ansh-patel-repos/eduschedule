// Main Application Logic
class TimetableApp {
    constructor() {
        this.initializeEventListeners();
        this.initializeModal();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('classForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditFormSubmission();
        });

        // Control buttons
        document.getElementById('clearAll').addEventListener('click', () => {
            this.handleClearAll();
        });

        document.getElementById('exportTimetable').addEventListener('click', () => {
            timetableManager.exportTimetable();
            this.showMessage('Timetable exported successfully!', 'success');
        });

        document.getElementById('printTimetable').addEventListener('click', () => {
            timetableManager.printTimetable();
        });

        // Cancel edit button
        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.resetForm();
        });
    }

    initializeModal() {
        const modal = document.getElementById('editModal');
        const closeModal = document.getElementById('closeModal');
        const cancelEditModal = document.getElementById('cancelEditModal');

        closeModal.addEventListener('click', () => {
            this.closeEditModal();
        });

        cancelEditModal.addEventListener('click', () => {
            this.closeEditModal();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.closeEditModal();
            }
        });
    }

    handleFormSubmission() {
        const formData = this.getFormData('classForm');
        const result = timetableManager.addClass(formData);
        
        if (result.success) {
            this.showMessage(result.message, 'success');
            this.resetForm();
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    handleEditFormSubmission() {
        const formData = this.getFormData('editForm');
        const result = timetableManager.updateClass(timetableManager.editingId, formData);
        
        if (result.success) {
            this.showMessage(result.message, 'success');
            this.closeEditModal();
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    handleClearAll() {
        if (timetableManager.classes.length === 0) {
            this.showMessage('No classes to clear!', 'error');
            return;
        }

        if (confirm('Are you sure you want to clear all classes? This action cannot be undone.')) {
            timetableManager.clearAllClasses();
            this.showMessage('All classes cleared successfully!', 'success');
        }
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    }

    resetForm() {
        document.getElementById('classForm').reset();
        document.getElementById('submitBtn').textContent = 'Add Class';
        document.getElementById('cancelEdit').style.display = 'none';
        timetableManager.editingId = null;
        this.hideMessages();
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('editForm').reset();
        timetableManager.editingId = null;
    }

    showMessage(message, type) {
        this.hideMessages();
        
        const messageElement = document.getElementById(type === 'error' ? 'errorMessage' : 'successMessage');
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.hideMessages();
            }, 3000);
        }
    }

    hideMessages() {
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
    }

    // Utility method to validate time format
    isValidTime(timeString) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    // Format time for display
    formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    // Initialize tooltips (if needed)
    initializeTooltips() {
        // Add any tooltip functionality here
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+N: New class
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                document.getElementById('subject').focus();
            }
            
            // Ctrl+P: Print
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                timetableManager.printTimetable();
            }
            
            // Ctrl+E: Export
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                timetableManager.exportTimetable();
            }
        });
    }

    // Initialize drag and drop functionality (future enhancement)
    initializeDragAndDrop() {
        // Placeholder for drag and drop functionality
        // This could be implemented to allow rearranging classes
    }

    // Initialize responsive behavior
    initializeResponsiveBehavior() {
        // Handle window resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Adjust layout based on screen size
        const container = document.querySelector('.container');
        if (window.innerWidth < 768) {
            container.classList.add('mobile-layout');
        } else {
            container.classList.remove('mobile-layout');
        }
    }

    // Initialize accessibility features
    initializeAccessibility() {
        // Add ARIA labels and roles
        const timetable = document.getElementById('timetable');
        timetable.setAttribute('role', 'grid');
        timetable.setAttribute('aria-label', 'Weekly class timetable');

        // Add keyboard navigation for timetable
        this.addKeyboardNavigation();
    }

    addKeyboardNavigation() {
        const classSlots = document.querySelectorAll('.class-slot');
        classSlots.forEach((slot, index) => {
            slot.setAttribute('tabindex', '0');
            slot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    slot.click();
                }
            });
        });
    }

    // Theme management (future enhancement)
    initializeThemes() {
        // Add support for light/dark themes
        const savedTheme = localStorage.getItem('timetable-theme') || 'light';
        document.body.classList.add(`theme-${savedTheme}`);
    }

    // Auto-save functionality
    initializeAutoSave() {
        // Auto-save form data as user types
        const formInputs = document.querySelectorAll('#classForm input, #classForm select');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.autoSaveFormData();
            });
        });
    }

    autoSaveFormData() {
        const formData = this.getFormData('classForm');
        localStorage.setItem('timetable-draft', JSON.stringify(formData));
    }

    restoreFormData() {
        const draftData = localStorage.getItem('timetable-draft');
        if (draftData) {
            const data = JSON.parse(draftData);
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input) input.value = data[key];
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TimetableApp();
    
    // Initialize additional features
    app.handleKeyboardShortcuts();
    app.initializeResponsiveBehavior();
    app.initializeAccessibility();
    app.initializeAutoSave();
    app.restoreFormData();
    
    // Initial resize check
    app.handleResize();
    
    console.log('College Timetable Generator initialized successfully!');
});

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // Could show user-friendly error message here
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('Application is online');
});

window.addEventListener('offline', () => {
    console.log('Application is offline - data will be saved locally');
});