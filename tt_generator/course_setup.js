// course_setup.js
import {
  collegeInfrastructure,
  loadCollegeInfrastructure,
  updateCollegeInfrastructure,
} from "./scheduler_data.js";
import { setupTagInput, addTag } from "./scheduler_utils.js";
import {
  openModal,
  closeModal,
  renderCoursesTable,
} from "./course_management.js";
import { handleGenerateAll, displayResults } from "./scheduler_core.js";
import {
  loadTeacherPreferences,
  getTeacherPreference,
  updateTeacherPreference,
  calculatePreferenceBonus,
  saveTeacherPreferences,
} from "./teacher_preferences.js";

// ============================================
// MAIN INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 Initializing course setup page...');


  loadCourseDataFromSelector();

  // ============================================
  // STEP 2: LOAD EXISTING INFRASTRUCTURE
  // ============================================
  const saved = loadCollegeInfrastructure();
  updateCollegeInfrastructure(saved);

  loadTeacherPreferences();
  populateTeacherPrefDropdown();

  // --- Render previously saved global tags ---
  const teachersContainer = document.getElementById("globalTeachersInput");
  const roomsContainer = document.getElementById("globalRoomsInput");
  const specializationSubjectContainer = document.getElementById(
    "globalSpecializationsInput"
  );

  if (collegeInfrastructure.allTeachers?.length && teachersContainer) {
    collegeInfrastructure.allTeachers.forEach((t) =>
      addTag(t, teachersContainer, "teacher")
    );
  }
  if (collegeInfrastructure.allRooms?.length && roomsContainer) {
    collegeInfrastructure.allRooms.forEach((r) =>
      addTag(r, roomsContainer, "room")
    );
  }
  if (
    collegeInfrastructure.allSpecializations?.length &&
    specializationSubjectContainer
  ) {
    collegeInfrastructure.allSpecializations.forEach((s) =>
      addTag(s, specializationSubjectContainer, "specialization")
    );
  }

  // --- Setup tag inputs ---
  setupTagInput(
    "teacherInput",
    collegeInfrastructure.allTeachers,
    teachersContainer,
    "teacher"
  );

  // ✅ Classrooms Input
  const classroomInput = document.getElementById("classroomInput");
  const classroomsContainer = document.getElementById("globalClassroomsInput");

  if (classroomInput && classroomsContainer) {
    const existingClassrooms = collegeInfrastructure.allRooms
      .filter((r) => r.endsWith("(C)"))
      .map((r) => r.replace(" (C)", "").trim());
    
    existingClassrooms.forEach((c) => addTag(c, classroomsContainer, "classroom"));

    classroomInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = classroomInput.value.trim();
        if (value) {
          addTag(value, classroomsContainer, "classroom");
          
          const classroomsWithSuffix = Array.from(classroomsContainer.querySelectorAll(".tag-remove"))
            .map((el) => `${el.dataset.text} (C)`);
          
          const existingLabs = collegeInfrastructure.allRooms.filter((r) => r.endsWith("(L)"));
          collegeInfrastructure.allRooms = [...classroomsWithSuffix, ...existingLabs];
          updateCollegeInfrastructure();
          
          classroomInput.value = "";
        }
      }
    });
  }

  // ✅ Labs Input
  const labInput = document.getElementById("labInput");
  const labsContainer = document.getElementById("globalLabsInput");

  if (labInput && labsContainer) {
    const existingLabs = collegeInfrastructure.allRooms
      .filter((r) => r.endsWith("(L)"))
      .map((r) => r.replace(" (L)", "").trim());
    
    existingLabs.forEach((l) => addTag(l, labsContainer, "lab"));

    labInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = labInput.value.trim();
        if (value) {
          addTag(value, labsContainer, "lab");
          
          const labsWithSuffix = Array.from(labsContainer.querySelectorAll(".tag-remove"))
            .map((el) => `${el.dataset.text} (L)`);
          
          const existingClassrooms = collegeInfrastructure.allRooms.filter((r) => r.endsWith("(C)"));
          collegeInfrastructure.allRooms = [...existingClassrooms, ...labsWithSuffix];
          updateCollegeInfrastructure();
          
          labInput.value = "";
        }
      }
    });
  }

  setupTagInput(
    "specializationInput",
    collegeInfrastructure.allSpecializations || [],
    specializationSubjectContainer,
    "specialization"
  );

  // --- Render existing courses ---
  renderCoursesTable();

  // --- Restore time settings ---
  const { timeSettings } = collegeInfrastructure;
  document.getElementById("collegeStartTime").value =
    timeSettings.collegeStartTime || "09:00";
  document.getElementById("collegeEndTime").value =
    timeSettings.collegeEndTime || "16:00";
  document.getElementById("recessStartTime").value =
    timeSettings.recessStartTime || "12:00";
  document.getElementById("recessDuration").value =
    timeSettings.recessDuration || 60;

  // --- Button listeners ---
  document
    .getElementById("addCourseBtn")
    .addEventListener(
      "click",
      () => (window.location.href = `./course_editor.html`)
    );

  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) cancelBtn.addEventListener("click", () => closeModal());

  const courseForm = document.getElementById("courseDetailForm");
  if (courseForm)
    courseForm.addEventListener("submit", (e) => handleSaveCourse(e));

  document
    .getElementById("generateAllBtn")
    .addEventListener("click", handleGenerateAll);

  // --- Check for and display previously generated timetables ---
  const savedSchedulesJSON = sessionStorage.getItem("allGeneratedSchedules");
  if (savedSchedulesJSON) {
    try {
      const savedSchedules = JSON.parse(savedSchedulesJSON);
      if (Object.keys(savedSchedules).length > 0) {
        console.log(
          "Found previously generated schedules in session. Displaying now."
        );
        window.allSchedules = savedSchedules;
        displayResults();
      }
    } catch (error) {
      console.error(
        "Could not parse saved schedules from session storage:",
        error
      );
      sessionStorage.removeItem("allGeneratedSchedules");
    }
  }

  console.log("✅ Timetable Admin Panel initialized successfully");
});

// ============================================
// 🆕 LOAD COURSE DATA FROM tt_selector
// ============================================
function loadCourseDataFromSelector() {
  console.log('📥 Checking for data from course selector...');
  
  // Get data from localStorage
  const savedCourseData = localStorage.getItem('selectedCourseData');
  
  if (savedCourseData) {
    try {
      // Parse the JSON data
      const courseData = JSON.parse(savedCourseData);
      
      console.log('✅ Found course selector data:', courseData);
      
      // Extract values
      const { courseType, lectureDuration, sections, workingDays, timestamp } = courseData;
      
      // Show welcome banner
      showWelcomeBanner(courseType, lectureDuration, sections, workingDays);
      
      // Apply course-specific defaults
      applyCourseDefaults(courseType, lectureDuration);
      
      // Show course badge in header
      showCourseBadge(courseType);
      
    } catch (error) {
      console.error('❌ Error parsing course selector data:', error);
    }
  } else {
    console.log('ℹ️ No course selector data found. Using defaults.');
  }
}

// ============================================
// 🆕 SHOW WELCOME BANNER
// ============================================
function showWelcomeBanner(courseType, lectureDuration, sections, workingDays) {
  // Create banner element
  const banner = document.createElement('div');
  banner.className = 'course-welcome-banner';
  banner.innerHTML = `
    <div class="banner-content">
      <div class="banner-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="banner-text">
        <h3>Course Configuration Loaded</h3>
        <div class="banner-details">
          <span><i class="fas fa-graduation-cap"></i> <strong>Type:</strong> ${courseType}</span>
          <span><i class="fas fa-clock"></i> <strong>Duration:</strong> ${lectureDuration} min/class</span>
          <span><i class="fas fa-users"></i> <strong>Sections:</strong> ${sections}</span>
          <span><i class="fas fa-calendar"></i> <strong>Working Days:</strong> ${workingDays} days/week</span>
        </div>
      </div>
      <button class="banner-close" onclick="this.closest('.course-welcome-banner').remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Insert at top of container
  const container = document.querySelector('.container') || document.body;
  if (container.firstChild) {
    container.insertBefore(banner, container.firstChild);
  } else {
    container.appendChild(banner);
  }
  
  // Auto-hide after 10 seconds
  // setTimeout(() => {
  //   banner.style.opacity = '0';
  //   banner.style.transform = 'translateY(-20px)';
  //   setTimeout(() => banner.remove(), 500);
  // }, 10000);
}

// ============================================
// 🆕 APPLY COURSE-SPECIFIC DEFAULTS
// ============================================
function applyCourseDefaults(courseType, lectureDuration) {
  console.log(`⚙️ Applying defaults for ${courseType} course`);
  
  // Course-specific time settings
  const courseDefaults = {
    'Engineering': {
      startTime: '09:00',
      endTime: '16:30',
      recessStart: '13:00',
      recessDuration: 60
    },
    'Medical': {
      startTime: '08:00',
      endTime: '17:00',
      recessStart: '13:00',
      recessDuration: 60
    },
    'Arts': {
      startTime: '09:30',
      endTime: '15:30',
      recessStart: '12:30',
      recessDuration: 45
    },
    'Commerce': {
      startTime: '09:00',
      endTime: '16:00',
      recessStart: '13:00',
      recessDuration: 60
    },
    'Science': {
      startTime: '09:00',
      endTime: '15:30',
      recessStart: '12:30',
      recessDuration: 45
    },
    'Management': {
      startTime: '10:00',
      endTime: '17:00',
      recessStart: '13:30',
      recessDuration: 60
    }
  };
  
  const defaults = courseDefaults[courseType] || courseDefaults['Engineering'];
  
  // Set time fields if they exist
  const startTimeInput = document.getElementById('collegeStartTime');
  const endTimeInput = document.getElementById('collegeEndTime');
  const recessStartInput = document.getElementById('recessStartTime');
  const recessDurationInput = document.getElementById('recessDuration');
  
  if (startTimeInput) startTimeInput.value = defaults.startTime;
  if (endTimeInput) endTimeInput.value = defaults.endTime;
  if (recessStartInput) recessStartInput.value = defaults.recessStart;
  if (recessDurationInput) recessDurationInput.value = defaults.recessDuration;
  
  // Save to infrastructure
  collegeInfrastructure.timeSettings = {
    collegeStartTime: defaults.startTime,
    collegeEndTime: defaults.endTime,
    recessStartTime: defaults.recessStart,
    recessDuration: defaults.recessDuration,
    defaultLectureDuration: lectureDuration
  };
  
  updateCollegeInfrastructure();
  
  console.log('✅ Time settings configured:', collegeInfrastructure.timeSettings);
}

// ============================================
// 🆕 SHOW COURSE BADGE IN HEADER
// ============================================
function showCourseBadge(courseType) {
  // Check if badge already exists
  if (document.querySelector('.course-type-badge')) return;
  
  const badge = document.createElement('div');
  badge.className = 'course-type-badge';
  badge.innerHTML = `
    <i class="fas fa-graduation-cap"></i>
    <span>${courseType} Course</span>
  `;
  
  // Add to header or body
  const header = document.querySelector('header') || document.querySelector('.container');
  if (header) {
    header.appendChild(badge);
  }
}

// ============================================
// TEACHER PREFERENCE FUNCTIONS
// ============================================

function loadTeacherPrefForm() {
  const teacherName = document.getElementById("teacherPrefSelect").value;
  const formContainer = document.getElementById("teacherPrefForm");

  if (!teacherName) {
    if (formContainer) formContainer.style.display = "none";
    return;
  }

  const pref = getTeacherPreference(teacherName);
  const nameHeader = document.getElementById("selectedTeacherName");

  if (nameHeader) {
    nameHeader.textContent = `Preferences for ${teacherName}`;
  }

  if (formContainer) {
    formContainer.style.display = "block";
  }

  // Load numeric preferences
  const maxConsecutive = document.getElementById("maxConsecutive");
  const maxDaily = document.getElementById("maxDaily");

  if (maxConsecutive)
    maxConsecutive.value = pref.preferences.maxConsecutiveClasses || 3;
  if (maxDaily) maxDaily.value = pref.preferences.maxDailyClasses || 5;

  // Load preferred days checkboxes
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  days.forEach((day) => {
    const checkbox = document.getElementById(`pref${day}`);
    if (checkbox) {
      checkbox.checked = pref.preferences.preferredDays.includes(day);
    }
  });

  // Load slot lists
  renderSlotList(
    "preferredSlotsList",
    pref.preferences.preferredSlots || [],
    "preferred"
  );

  renderSlotList(
    "blockedSlotsList",
    pref.preferences.blockedSlots || [],
    "blocked"
  );
}

function populateTeacherPrefDropdown() {
  const select = document.getElementById("teacherPrefSelect");
  if (!select) return;

  select.innerHTML = '<option value="">-- Select a teacher --</option>';

  collegeInfrastructure.allTeachers.forEach((teacher) => {
    const option = document.createElement("option");
    option.value = teacher;
    option.textContent = teacher;
    select.appendChild(option);
  });

  select.addEventListener("change", loadTeacherPrefForm);
}

// ... (rest of your existing teacher preference functions remain the same)

console.log("📚 course_setup.js loaded with teacher preferences support");
