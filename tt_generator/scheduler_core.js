// tt_generator/scheduler_core.js

import {
  collegeInfrastructure,
  saveCollegeInfrastructure,
  allGeneratedSchedules,
} from "./scheduler_data.js";

import { generateTimeSlots, shuffleArray } from "./scheduler_utils.js";
import { renderTimetable } from "./timetable_renderer.js";
import { calculatePreferenceBonus, isSlotBlocked, violatesConsecutiveLimit, violatesDailyLimit } from './teacher_preferences.js';

let allSchedules = {};

export function handleGenerateAll() {
  const startEl = document.getElementById("collegeStartTime");
  const endEl = document.getElementById("collegeEndTime");
  const recessStartEl = document.getElementById("recessStartTime");
  const recessDurEl = document.getElementById("recessDuration");

  collegeInfrastructure.timeSettings.collegeStartTime =
    startEl?.value || "09:00";
  collegeInfrastructure.timeSettings.collegeEndTime = endEl?.value || "16:00";
  collegeInfrastructure.timeSettings.recessStartTime =
    recessStartEl?.value || "12:00";
  collegeInfrastructure.timeSettings.recessDuration = parseInt(
    recessDurEl?.value || 60,
    10
  );

  saveCollegeInfrastructure(collegeInfrastructure);

  if (!collegeInfrastructure.courses?.length)
    return alert("Please define at least one course before generating.");

  alert("Starting timetable generation... This may take a moment.");
  setTimeout(() => generateAllTimetables(), 100);
}

function tryPlaceClass(subject, teacher, room, isLab, batch, schedule, timeSettings, availableSlots) {
  // Apply preference filtering
  const validSlots = availableSlots.filter(slot => {
    // Check hard constraints
    if (isSlotBlocked(teacher, slot.day, slot.time.start)) return false;
    if (violatesConsecutiveLimit(teacher, slot.day, slot.time.start, schedule)) return false;
    if (violatesDailyLimit(teacher, slot.day, schedule)) return false;
    
    return true;
  });
  
  // Sort by preference bonus
  validSlots.sort((a, b) => {
    const bonusA = calculatePreferenceBonus(teacher, a.day, a.time.start, subject.name);
    const bonusB = calculatePreferenceBonus(teacher, b.day, b.time.start, subject.name);
    return bonusB - bonusA;
  });
  
  // Try top 3 slots
  for (let i = 0; i < Math.min(3, validSlots.length); i++) {
    const slot = validSlots[i];
    if (placeClassInSlot(slot, subject, teacher, room, isLab, batch, schedule)) {
      return true;
    }
  }
  
  return false;
}

// 🧾 Teaching load analysis
// Update the teaching load calculation to handle your data structure
(function calculateTeachingLoad() {
  const data = JSON.parse(localStorage.getItem("collegeInfrastructure"));
  if (!data || !data.courses) {
    console.warn("⚠️ No data found in localStorage under 'collegeInfrastructure'");
    return;
  }

  const teacherLoad = {};
  data.courses.forEach((course) => {
    (course.subjects || []).forEach((subj) => {
      const teacher = subj.teacher || "Undefined Teacher";
      if (!teacherLoad[teacher]) teacherLoad[teacher] = 0;

      const lec = subj.lecturesPerWeek ? Number(subj.lecturesPerWeek) : 0;
      teacherLoad[teacher] += lec;

      if (subj.requiresLab && subj.labsPerWeek) {
        const labHours = Number(subj.labsPerWeek) * 2;
        teacherLoad[teacher] += labHours;
      }

      // 🆕 Add elective teacher hours (matching your data structure)
      if (subj.isElective && subj.electiveTeacher) {
        const electiveTeacher = subj.electiveTeacher;
        if (!teacherLoad[electiveTeacher]) teacherLoad[electiveTeacher] = 0;
        teacherLoad[electiveTeacher] += lec;
      }
    });
  });

  const sorted = Object.entries(teacherLoad).sort((a, b) => b[1] - a[1]);
  console.log("📊 Weekly Teaching Load per Teacher:");
  console.table(
    sorted.map(([teacher, hours]) => ({
      Teacher: teacher,
      "Total Hours / Week": hours,
    }))
  );

  const totalHours = sorted.reduce((acc, [, h]) => acc + h, 0);
  console.log(`🏫 Total Weekly Teaching Hours (All Teachers): ${totalHours}`);
})();


export function generateAllTimetables() {
  console.clear();
  console.log("⚙️ Generating structured timetables...");

  const { allTeachers, allRooms, courses, timeSettings } =
    collegeInfrastructure;

  if (!courses || courses.length === 0) {
    alert("⚠️ No courses found.");
    return;
  }

  // Basic validation: ensure labsPerWeek == number of batches for each lab subject
  for (const course of courses) {
    const labSubjects = (course.subjects || []).filter((s) => s.requiresLab);
    if (!labSubjects.length) continue;

    const batchCount = (course.batches || []).length;
    for (const subj of labSubjects) {
      if ((subj.labsPerWeek || 0) !== batchCount) {
        alert(
          `⚠️ Mismatch in "${course.branch} (Sem ${course.semester})" -> "${subj.name}".\n` +
            `batches: ${batchCount}, labsPerWeek: ${subj.labsPerWeek}\n` +
            `Each lab subject should have labsPerWeek equal to the number of batches.`
        );
        console.warn(`Invalid lab config: ${course.branch} ${subj.name}`, {
          batches: batchCount,
          labsPerWeek: subj.labsPerWeek,
        });
        return;
      }
    }
  }

  const schedules = {};
  const timeSlots = generateTimeSlots(timeSettings);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Initialize master schedule
  let masterSchedule = initializeMasterSchedule(
    allTeachers,
    allRooms,
    courses,
    timeSettings
  );

  console.log("Master schedule initialized:", masterSchedule);

  // helper: mark occupancy
  const occupy = (teacher, room, cid, batch, day, start) => {
    if (teacher) masterSchedule.teachers[teacher][day][start] = true;
    if (room) masterSchedule.rooms[room][day][start] = true;
    if (batch) masterSchedule.courses[cid].batches[batch][day][start] = true;
    if (!masterSchedule.courses[cid][day])
      masterSchedule.courses[cid][day] = {};
    masterSchedule.courses[cid][day][start] = true;
  };

  // helper: check free
  const isFree = (teacher, room, cid, batch, day, start) => {
    if (teacher && masterSchedule.teachers[teacher][day][start]) return false;
    if (room && masterSchedule.rooms[room][day][start]) return false;
    if (batch) return !masterSchedule.courses[cid].batches[batch][day][start];
    return !masterSchedule.courses[cid][day][start];
  };

  // 🆕 NEW: Check if all elective teachers are free
  const areElectiveTeachersFree = (electiveDetails, day, start) => {
    if (!electiveDetails || electiveDetails.length === 0) return true;

    for (const elective of electiveDetails) {
      if (
        elective.teacher &&
        masterSchedule.teachers[elective.teacher][day][start]
      ) {
        return false; // elective teacher is busy
      }
    }
    return true; // all elective teachers are free
  };

  // find first available lab room
const findLabRoom = (preferredRoom, day, start) => {
  // ✅ Safety check: ensure room exists in masterSchedule
  if (preferredRoom && masterSchedule.rooms[preferredRoom]?.[day]?.[start] === false) {
    return preferredRoom;
  }
  
  for (const r of allRooms) {
    if (!r.toLowerCase().includes("(l)")) continue;
    
    // ✅ Safety check: ensure room exists in masterSchedule
    if (masterSchedule.rooms[r] && masterSchedule.rooms[r][day] && masterSchedule.rooms[r][day][start] === false) {
      return r;
    }
  }
  
  return null;
};


  // initialize schedules map for each course
  courses.forEach((c) => (schedules[c.id] = { classes: [] }));

  // -----------------------------------------------------------
  // STEP 1: Schedule labs
  // -----------------------------------------------------------
  console.log("🔬 Scheduling labs (parallel across batches)...");

  for (const course of courses) {
    const labSubjects = (course.subjects || []).filter((s) => s.requiresLab);
    const batches = course.batches || [];

    if (!labSubjects.length || !batches.length) continue;

    const rounds = labSubjects[0].labsPerWeek || batches.length;

    for (let round = 0; round < rounds; round++) {
      let assignedThisRound = false;

      for (
        let dayIdx = 0;
        dayIdx < days.length && !assignedThisRound;
        dayIdx++
      ) {
        const day = days[(round + dayIdx) % days.length];

        for (
          let si = 0;
          si < timeSlots.length - 1 && !assignedThisRound;
          si++
        ) {
          const s1 = timeSlots[si],
            s2 = timeSlots[si + 1];
          if (s1.isRecess || s2.isRecess) continue;

          const candidateAssignments = [];
          let allOk = true;

          for (let bi = 0; bi < batches.length; bi++) {
            const batch = batches[bi];
            const subj = labSubjects[(bi + round) % labSubjects.length];
            const teacher = subj.teacher;
            const labRoom = findLabRoom(subj.labRoomNo, day, s1.start);

            if (!labRoom) {
              allOk = false;
              break;
            }

            const teacherFree =
              !masterSchedule.teachers[teacher][day][s1.start] &&
              !masterSchedule.teachers[teacher][day][s2.start];
            const roomFree =
              !masterSchedule.rooms[labRoom][day][s1.start] &&
              !masterSchedule.rooms[labRoom][day][s2.start];
            const batchFree =
              !masterSchedule.courses[course.id].batches[batch][day][
                s1.start
              ] &&
              !masterSchedule.courses[course.id].batches[batch][day][s2.start];

            if (!(teacherFree && roomFree && batchFree)) {
              allOk = false;
              break;
            }

            candidateAssignments.push({
              subject: subj,
              batch,
              teacher,
              labRoom,
              s1,
              s2,
              day,
              courseId: course.id,
            });
          }

          if (allOk && candidateAssignments.length) {
            candidateAssignments.forEach((a) => {
              [a.s1, a.s2].forEach((slot) => {
                schedules[a.courseId].classes.push({
                  day: a.day,
                  start: slot.start,
                  end: slot.end,
                  subject: `${a.subject.name}`,
                  teacher: a.teacher,
                  room: a.labRoom,
                  isLab: true,
                  batch: a.batch,
                });

                occupy(
                  a.teacher,
                  a.labRoom,
                  a.courseId,
                  a.batch,
                  a.day,
                  slot.start
                );
              });
            });

            console.log(
              `🧪 Assigned labs for course ${course.branch} sem ${course.semester} on ${candidateAssignments[0].day} (${s1.start} - ${s2.end})`,
              candidateAssignments.map(
                (c) => `${c.subject.name} - ${c.batch}@${c.labRoom}`
              )
            );

            assignedThisRound = true;
            break;
          }
        }
      }

      if (!assignedThisRound) {
        console.warn(
          `⚠️ Could not assign labs for course ${course.branch} round ${round}.`
        );
      }
    }
  }

  // -----------------------------------------------------------
  // STEP 2: Schedule theory lectures (WITH ELECTIVE LOGIC)
  // -----------------------------------------------------------
  console.log("📚 Scheduling lectures (with elective support)...");

  courses.forEach((course) => {
    const lectureSubjects = (course.subjects || []).filter(
      (s) => s.lecturesPerWeek > 0
    );

    const allSubjects = [...lectureSubjects];
    shuffleArray(allSubjects);

    allSubjects.forEach((subject) => {
      let placedCount = 0;
      const totalLectures = subject.lecturesPerWeek || 0;
      let safeCounter = 0;

      while (
        placedCount < totalLectures &&
        safeCounter < days.length * timeSlots.length * 2
      ) {
        safeCounter++;
        const day = days[(placedCount + safeCounter) % days.length];
        let placed = false;

        for (const slot of timeSlots) {
          if (slot.isRecess) continue;

          // 🆕 Check if this subject has an elective
          const hasElective =
            subject.isElective &&
            subject.electiveTeacher &&
            subject.electiveSubjectName;

          // Find classroom for main subject
          const room = (function findClassroom() {
            for (const r of allRooms) {
              if (!r.toLowerCase().includes("(c)")) continue;
              if (!masterSchedule.rooms[r][day][slot.start]) return r;
            }
            return null;
          })();

          if (!room) continue;

          // Check if main teacher is free
          if (
            !isFree(subject.teacher, room, course.id, null, day, slot.start)
          ) {
            continue;
          }

          // 🆕 If subject has elective, check if elective teacher is free
          if (hasElective) {
            if (
              masterSchedule.teachers[subject.electiveTeacher][day][slot.start]
            ) {
              // Elective teacher is busy, skip this slot
              continue;
            }
          }

          // 🆕 Find room for elective subject if needed
          let electiveRoom = null;
          if (hasElective) {
            for (const r of allRooms) {
              if (!r.toLowerCase().includes("(c)")) continue;
              if (!masterSchedule.rooms[r][day][slot.start] && r !== room) {
                electiveRoom = r;
                break;
              }
            }

            if (!electiveRoom) {
              // No room available for elective, skip this slot
              continue;
            }
          }

          // ✅ Place main subject
          schedules[course.id].classes.push({
            day,
            start: slot.start,
            end: slot.end,
            subject: subject.name,
            teacher: subject.teacher,
            room,
            isElective: subject.isElective || false,
          });

          occupy(subject.teacher, room, course.id, null, day, slot.start);

          // 🆕 ✅ Place elective subject in the SAME time slot
          if (hasElective && electiveRoom) {
            schedules[course.id].classes.push({
              day,
              start: slot.start,
              end: slot.end,
              subject: subject.electiveSubjectName,
              teacher: subject.electiveTeacher,
              room: electiveRoom,
              isElective: true,
              parentSubject: subject.name, // Link to parent subject
            });

            // Mark elective teacher and room as occupied
            occupy(
              subject.electiveTeacher,
              electiveRoom,
              course.id,
              null,
              day,
              slot.start
            );

            console.log(
              `🎓 Placed elective "${subject.electiveSubjectName}" alongside "${subject.name}" on ${day} ${slot.start} with teacher ${subject.electiveTeacher} in room ${electiveRoom}`
            );
          }

          placedCount++;
          placed = true;
          break;
        }

        if (!placed) {
          continue;
        }
      }

      if (placedCount < totalLectures) {
        console.warn(
          `⚠️ Couldn't place all lectures for ${subject.name} (${placedCount}/${totalLectures}) in course ${course.branch}`
        );
      }
    });
  });

  // finalize
  console.log("✅ Timetables generated successfully.");
  window.allSchedules = schedules;
  sessionStorage.setItem("allGeneratedSchedules", JSON.stringify(schedules));
  displayResults();
}

export function initializeMasterSchedule(
  allTeachers,
  allRooms,
  courses,
  settings
) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = generateTimeSlots(settings);

  const structure = () =>
    Object.fromEntries(
      days.map((day) => [
        day,
        Object.fromEntries(timeSlots.map((t) => [t.start, false])),
      ])
    );

  const masterSchedule = {
    teachers: {},
    rooms: {},
    courses: {},
  };

  // Teachers
  allTeachers.forEach((t) => (masterSchedule.teachers[t] = structure()));

  // Rooms
  allRooms.forEach((r) => (masterSchedule.rooms[r] = structure()));

  // Courses + nested batches
  courses.forEach((c) => {
    masterSchedule.courses[c.id] = structure();
    masterSchedule.courses[c.id].batches = {};

    if (Array.isArray(c.batches)) {
      c.batches.forEach((b) => {
        masterSchedule.courses[c.id].batches[b] = structure();
      });
    }
  });

  return masterSchedule;
}

export function displayResults() {
  const container = document.getElementById("timetableContainer");
  const selector = document.getElementById("timetableSelector");

  if (!container || !selector) {
    console.warn("Timetable container or selector not found.");
    return;
  }

  const allSchedules = window.allSchedules || {};
  const scheduleKeys = Object.keys(allSchedules);

  if (scheduleKeys.length === 0) {
    alert(
      "⚠️ No timetables were generated. Please check your data or try again."
    );
    return;
  }

  container.style.display = "block";

  selector.innerHTML = "";
  scheduleKeys.forEach((courseId) => {
    const course = collegeInfrastructure.courses.find((c) => c.id === courseId);
    if (course) {
      const opt = document.createElement("option");
      opt.value = courseId;
      opt.textContent = `${course.branch} - Semester ${course.semester}`;
      selector.appendChild(opt);
    }
  });

  const firstId = scheduleKeys[0];
  const firstCourse = collegeInfrastructure.courses.find(
    (c) => c.id === firstId
  );

  if (firstCourse) {
    renderTimetable(
      allSchedules[firstId],
      firstCourse,
      collegeInfrastructure.timeSettings
    );
  }

  selector.onchange = (e) => {
    const selectedId = e.target.value;
    const selectedCourse = collegeInfrastructure.courses.find(
      (c) => c.id === selectedId
    );

    if (selectedCourse && allSchedules[selectedId]) {
      renderTimetable(
        allSchedules[selectedId],
        selectedCourse,
        collegeInfrastructure.timeSettings
      );
    } else {
      console.warn("No schedule found for course:", selectedId);
    }
  };

  container.scrollIntoView({ behavior: "smooth" });
}
