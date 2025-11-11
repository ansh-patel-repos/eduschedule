// tt_generator/scheduler_data.js
export const collegeInfrastructure = {
  allTeachers: [],
  allRooms: [],
  allSpecializations: [],
  courses: [],
  timeSettings: {
    collegeStartTime: "09:00",
    collegeEndTime: "16:00",
    recessStartTime: "12:00",
    recessDuration: 60,
    lectureDuration: 60,
  },
};

export let allGeneratedSchedules = {};

export function saveCollegeInfrastructure(data) {
  try {
    localStorage.setItem("collegeInfrastructure", JSON.stringify(data));
  } catch (error) {
    console.error("Error saving college infrastructure:", error);
  }
}

export function loadCollegeInfrastructure() {
  try {
    const data = localStorage.getItem("collegeInfrastructure");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading college infrastructure:", error);
    return null;
  }
}

export function updateCollegeInfrastructure(savedData) {
  if (savedData && typeof savedData === "object") {
    // ✅ Mutate the existing object instead of replacing it
    Object.assign(collegeInfrastructure, savedData);

    // Ensure properties exist
    if (!Array.isArray(collegeInfrastructure.allTeachers))
      collegeInfrastructure.allTeachers = [];
    if (!Array.isArray(collegeInfrastructure.allRooms))
      collegeInfrastructure.allRooms = [];
    if (!Array.isArray(collegeInfrastructure.courses))
      collegeInfrastructure.courses = [];

    // Merge nested time settings properly
    collegeInfrastructure.timeSettings = Object.assign(
      {},
      {
        collegeStartTime: "09:00",
        collegeEndTime: "16:00",
        recessStartTime: "12:00",
        recessDuration: 60,
        lectureDuration: 60,
      },
      savedData.timeSettings || {}
    );
  }

  return collegeInfrastructure;
}

