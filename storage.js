// Local Storage Management
class StorageManager {
    constructor() {
        this.storageKey = 'collegeTimeTable';
    }

    // Save classes to local storage
    saveClasses(classes) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(classes));
            return true;
        } catch (error) {
            console.error('Error saving to local storage:', error);
            return false;
        }
    }

    // Load classes from local storage
    loadClasses() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading from local storage:', error);
            return [];
        }
    }

    // Clear all classes from local storage
    clearClasses() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing local storage:', error);
            return false;
        }
    }

    // Export classes as JSON
    exportClasses(classes) {
        try {
            const dataStr = JSON.stringify(classes, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `timetable_${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return true;
        } catch (error) {
            console.error('Error exporting classes:', error);
            return false;
        }
    }

    // Export timetable as CSV
    exportCSV(classes) {
        try {
            const headers = ['Subject', 'Instructor', 'Room', 'Day', 'Start Time', 'End Time'];
            const csvContent = [
                headers.join(','),
                ...classes.map(cls => [
                    `"${cls.subject}"`,
                    `"${cls.instructor}"`,
                    `"${cls.room}"`,
                    `"${cls.day}"`,
                    `"${cls.startTime}"`,
                    `"${cls.endTime}"`
                ].join(','))
            ].join('\n');

            const dataBlob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `timetable_${new Date().toISOString().split('T')[0]}.csv`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return true;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            return false;
        }
    }
}

// Initialize storage manager
const storageManager = new StorageManager();