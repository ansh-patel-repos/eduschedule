// tt_generator/teacher_preferences.js
// Teacher Preference Management System

import { collegeInfrastructure, saveCollegeInfrastructure } from './scheduler_data.js';

// Teacher preference data structure
export const teacherPreferences = {
  teachers: []
};

/**
 * Initialize or load teacher preferences
 */
export function loadTeacherPreferences() {
  const stored = localStorage.getItem('teacherPreferences');
  if (stored) {
    Object.assign(teacherPreferences, JSON.parse(stored));
  }
  return teacherPreferences;
}

/**
 * Save preferences to localStorage
 */
export function saveTeacherPreferences() {
  localStorage.setItem('teacherPreferences', JSON.stringify(teacherPreferences));
  console.log('✅ Teacher preferences saved');
}

/**
 * Get or create preference entry for a teacher
 */
export function getTeacherPreference(teacherName) {
  let pref = teacherPreferences.teachers.find(t => t.name === teacherName);
  
  if (!pref) {
    pref = {
      name: teacherName,
      preferences: {
        preferredSlots: [],      // ["Monday 09:00", "Wednesday 10:00"]
        blockedSlots: [],         // ["Friday 15:00"]
        preferredDays: [],        // ["Monday", "Wednesday", "Friday"]
        maxConsecutiveClasses: 3, // Default: 3
        maxDailyClasses: 5,       // Default: 5
        maxWeeklyHours: 18,       // Default: 18
        subjectPreferences: {}    // { "DBMS": 10, "OS": 8, "Soft Skill": 5 }
      },
      enabled: true
    };
    teacherPreferences.teachers.push(pref);
  }
  
  return pref;
}

/**
 * Update teacher preferences
 */
export function updateTeacherPreference(teacherName, updates) {
  const pref = getTeacherPreference(teacherName);
  Object.assign(pref.preferences, updates);
  saveTeacherPreferences();
  return pref;
}

/**
 * Check if a slot is blocked for a teacher
 */
export function isSlotBlocked(teacherName, day, time) {
  const pref = getTeacherPreference(teacherName);
  if (!pref.enabled) return false;
  
  const slotKey = `${day} ${time}`;
  return pref.preferences.blockedSlots.includes(slotKey);
}

/**
 * Check if a slot is preferred for a teacher
 */
export function isSlotPreferred(teacherName, day, time) {
  const pref = getTeacherPreference(teacherName);
  if (!pref.enabled) return false;
  
  const slotKey = `${day} ${time}`;
  return pref.preferences.preferredSlots.includes(slotKey);
}

/**
 * Check if a day is preferred for a teacher
 */
export function isDayPreferred(teacherName, day) {
  const pref = getTeacherPreference(teacherName);
  if (!pref.enabled) return false;
  
  if (pref.preferences.preferredDays.length === 0) return true; // No preference = all OK
  return pref.preferences.preferredDays.includes(day);
}

/**
 * Get subject preference score (0-10)
 */
export function getSubjectPreferenceScore(teacherName, subjectName) {
  const pref = getTeacherPreference(teacherName);
  return pref.preferences.subjectPreferences[subjectName] || 5; // Default: neutral
}

/**
 * Calculate preference bonus for scheduling
 */
export function calculatePreferenceBonus(teacherName, day, time, subjectName) {
  const pref = getTeacherPreference(teacherName);
  if (!pref.enabled) return 0;
  
  let bonus = 0;
  
  // Blocked slot = reject
  if (isSlotBlocked(teacherName, day, time)) {
    return -9999; // Effectively blocks this slot
  }
  
  // Preferred slot bonus
  if (isSlotPreferred(teacherName, day, time)) {
    bonus += 30;
  }
  
  // Preferred day bonus
  if (isDayPreferred(teacherName, day)) {
    bonus += 15;
  }
  
  // Subject preference bonus
  const subjectScore = getSubjectPreferenceScore(teacherName, subjectName);
  bonus += (subjectScore - 5) * 2; // -10 to +10 based on 0-10 scale
  
  return bonus;
}

/**
 * Check if adding a class violates max consecutive limit
 */
export function violatesConsecutiveLimit(teacherName, day, time, schedule) {
  const pref = getTeacherPreference(teacherName);
  if (!pref.enabled) return false;
  
  const maxConsecutive = pref.preferences.maxConsecutiveClasses;
  
  // Count consecutive classes before and after this slot
  let consecutiveCount = 1; // Current slot
  
  // Count backwards
  let prevTime = getPreviousTimeSlot(time);
  while (prevTime) {
    const hasClass = schedule.classes.some(
      c => c.day === day && c.start === prevTime && c.teacher === teacherName
    );
    if (hasClass) {
      consecutiveCount++;
      prevTime = getPreviousTimeSlot(prevTime);
    } else {
      break;
    }
  }
  
  // Count forwards
  let nextTime = getNextTimeSlot(time);
  while (nextTime) {
    const hasClass = schedule.classes.some(
      c => c.day === day && c.start === nextTime && c.teacher === teacherName
    );
    if (hasClass) {
      consecutiveCount++;
      nextTime = getNextTimeSlot(nextTime);
    } else {
      break;
    }
  }
  
  return consecutiveCount > maxConsecutive;
}

/**
 * Check if adding a class violates daily class limit
 */
export function violatesDailyLimit(teacherName, day, schedule) {
  const pref = getTeacherPreference(teacherName);
  if (!pref.enabled) return false;
  
  const currentDayClasses = schedule.classes.filter(
    c => c.day === day && c.teacher === teacherName
  ).length;
  
  return currentDayClasses >= pref.preferences.maxDailyClasses;
}

/**
 * Get teacher preference satisfaction report
 */
export function getPreferenceSatisfactionReport(schedule) {
  const report = {};
  
  teacherPreferences.teachers.forEach(teacherPref => {
    if (!teacherPref.enabled) return;
    
    const teacherName = teacherPref.name;
    const classes = schedule.classes.filter(c => c.teacher === teacherName);
    
    let totalSlots = classes.length;
    let preferredSlotsUsed = 0;
    let blockedSlotsViolated = 0;
    let preferredDaysUsed = 0;
    
    classes.forEach(cls => {
      if (isSlotPreferred(teacherName, cls.day, cls.start)) {
        preferredSlotsUsed++;
      }
      if (isSlotBlocked(teacherName, cls.day, cls.start)) {
        blockedSlotsViolated++;
      }
      if (isDayPreferred(teacherName, cls.day)) {
        preferredDaysUsed++;
      }
    });
    
    const satisfactionScore = totalSlots > 0 
      ? Math.round(((preferredSlotsUsed + preferredDaysUsed) / (totalSlots * 2)) * 100)
      : 0;
    
    report[teacherName] = {
      totalClasses: totalSlots,
      preferredSlotsUsed,
      blockedSlotsViolated,
      preferredDaysUsed,
      satisfactionScore,
      grade: satisfactionScore >= 80 ? 'Excellent' : 
             satisfactionScore >= 60 ? 'Good' : 
             satisfactionScore >= 40 ? 'Fair' : 'Poor'
    };
  });
  
  return report;
}

// Helper functions
function getPreviousTimeSlot(time) {
  const [hour, minute] = time.split(':').map(Number);
  if (hour === 9 && minute === 0) return null; // First slot
  return `${String(hour - 1).padStart(2, '0')}:${minute}`;
}

function getNextTimeSlot(time) {
  const [hour, minute] = time.split(':').map(Number);
  if (hour === 16 && minute === 0) return null; // Last slot
  return `${String(hour + 1).padStart(2, '0')}:${minute}`;
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.teacherPreferences = teacherPreferences;
  window.loadTeacherPreferences = loadTeacherPreferences;
  window.saveTeacherPreferences = saveTeacherPreferences;
  window.getTeacherPreference = getTeacherPreference;
  window.updateTeacherPreference = updateTeacherPreference;
  window.getPreferenceSatisfactionReport = getPreferenceSatisfactionReport;
}
