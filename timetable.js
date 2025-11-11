// Timetable Management with Auto Generation, Recess, Monday-Saturday
class TimetableManager {
    constructor() {
        this.classes = [];
        this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Load course setup data from localStorage
        this.loadCourseSetup();
        
        this.rooms = ["101", "102", "103", "104", "105", "106"];
        this.loadClasses();
    }

    loadCourseSetup() {
        const courseSetup = JSON.parse(localStorage.getItem('courseSetup') || '{}');
        
        // Use data from course setup or fallback to defaults
        this.subjects = courseSetup.subjects || ["Math", "Physics", "Chemistry", "Biology", "English", "History"];
        this.instructors = courseSetup.teachers || ["Mr. A", "Ms. B", "Mr. C", "Ms. D", "Mr. E", "Ms. F"];
        this.lectureDuration = courseSetup.lectureDuration || 60;
        this.timeSlots = courseSetup.timeSlots || this.generateDefaultTimeSlots();
        
        // Store original setup values for reference
        this.startHour = 8;
        this.endHour = 17;
        this.recessTime = { start: "13:00", end: "14:00" };
    }

    generateDefaultTimeSlots() {
        // Fallback time slot generation if no course setup exists
        const slots = [];
        for (let hour = this.startHour; hour <= this.endHour; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            if (timeStr >= this.recessTime.start && timeStr < this.recessTime.end) {
                // Skip recess time - it's handled by the course setup generation
                continue;
            } else {
                slots.push({ start: timeStr, end: this.addDuration(timeStr, this.lectureDuration) });
            }
        }
        return slots;
    }

    autoGenerateTimetable() {
        this.classes = [];
        let subjectIndex = 0;
        
        this.days.forEach(day => {
            this.timeSlots.forEach(slot => {
                const subject = this.subjects[subjectIndex % this.subjects.length];
                const instructor = this.instructors[subjectIndex % this.instructors.length];
                const room = this.rooms[subjectIndex % this.rooms.length];

                this.classes.push({
                    id: this.generateId(),
                    subject,
                    instructor,
                    room,
                    day,
                    startTime: slot.start,
                    endTime: slot.end
                });

                subjectIndex++;
            });
        });
        
        this.saveClasses();
        this.renderTimetable();
    }

    addDuration(timeStr, minutesToAdd) {
        const [hour, minute] = timeStr.split(":").map(Number);
        const totalMinutes = hour * 60 + minute + minutesToAdd;
        const newHour = Math.floor(totalMinutes / 60);
        const newMin = totalMinutes % 60;
        return `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveClasses() {
        localStorage.setItem("timetable", JSON.stringify(this.classes));
    }

    loadClasses() {
        const data = localStorage.getItem("timetable");
        if (data) this.classes = JSON.parse(data);
        this.renderTimetable();
    }

    renderTimetable() {
        const tbody = document.getElementById("timetableBody");
        if (!tbody) return;

        tbody.innerHTML = "";
        
        // Create time slots for rendering (including recess detection)
        const renderSlots = this.createRenderSlots();
        
        renderSlots.forEach(slot => {
            const row = document.createElement("tr");
            const timeCell = document.createElement("td");
            timeCell.textContent = slot.isRecess ? "Recess" : slot.displayTime;
            timeCell.className = slot.isRecess ? "recess" : "time";
            row.appendChild(timeCell);

            this.days.forEach(day => {
                const cell = document.createElement("td");
                if (slot.isRecess) {
                    cell.textContent = "Break";
                    cell.className = "recess-cell";
                } else {
                    const entry = this.classes.find(cls => cls.day === day && cls.startTime === slot.time);
                    if (entry) {
                        cell.innerHTML = `
                            <strong>${entry.subject}</strong><br>
                            ${entry.instructor}<br>
                            Room: ${entry.room}
                        `;
                        cell.className = "class-cell";
                    }
                }
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });
    }

    createRenderSlots() {
        const courseSetup = JSON.parse(localStorage.getItem('courseSetup') || '{}');
        const renderSlots = [];
        
        if (!courseSetup.collegeStartTime || !courseSetup.collegeEndTime) {
            // Fallback to time slots if no course setup
            return this.timeSlots.map(slot => ({
                time: slot.start,
                displayTime: slot.start,
                isRecess: false
            }));
        }

        // Parse college times
        const startMinutes = this.timeToMinutes(courseSetup.collegeStartTime);
        const endMinutes = this.timeToMinutes(courseSetup.collegeEndTime);
        const recessStartMinutes = this.timeToMinutes(courseSetup.recessStartTime);
        const recessEndMinutes = recessStartMinutes + (courseSetup.recessDuration || 60);

        // Generate all time slots including recess
        let currentMinutes = startMinutes;
        while (currentMinutes < endMinutes) {
            const timeStr = this.minutesToTime(currentMinutes);
            
            // Check if this is recess time
            if (currentMinutes >= recessStartMinutes && currentMinutes < recessEndMinutes) {
                if (renderSlots.length === 0 || !renderSlots[renderSlots.length - 1].isRecess) {
                    renderSlots.push({
                        time: timeStr,
                        displayTime: `${this.minutesToTime(recessStartMinutes)} - ${this.minutesToTime(recessEndMinutes)}`,
                        isRecess: true
                    });
                }
                currentMinutes += courseSetup.recessDuration || 60;
            } else {
                // Regular class slot
                const slot = this.timeSlots.find(s => s.start === timeStr);
                if (slot) {
                    renderSlots.push({
                        time: timeStr,
                        displayTime: `${slot.start} - ${slot.end}`,
                        isRecess: false
                    });
                }
                currentMinutes += this.lectureDuration;
            }
        }

        return renderSlots;
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}

const timetableManager = new TimetableManager();
timetableManager.autoGenerateTimetable(); // Call to generate auto timetable on load