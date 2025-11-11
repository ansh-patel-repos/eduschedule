// tt_generator/course_editor.js
import {
  collegeInfrastructure,
  saveCollegeInfrastructure,
} from "./scheduler_data.js";
import { setupTagInput, addTag } from "./scheduler_utils.js";

// 🟣 --- DOM Elements ---
const form = document.getElementById("courseDetailForm");
const subjectsList = document.getElementById("subjectsList");
const batchesDisplay = document.getElementById("globalBatchesDisplay");
const courseIdEl = document.getElementById("courseEditId");
const titleEl = document.getElementById("editorTitle");
const addSubjectBtn = document.getElementById("addSubjectBtn");

// --- Read course ID from URL ---
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

// --- Load data from localStorage ---
let infra = JSON.parse(localStorage.getItem("collegeInfrastructure"));
if (!infra || !infra.courses) {
  alert("⚠️ No saved data found. Redirecting...");
  window.location.href = "./course_setup.html";
}
let course = infra.courses.find((c) => c.id === editId);

// === Add Subject Row (Your Original, Correct Version) ===
function addSubjectRow(subject = {}) {
  const row = document.createElement("div");
  row.className = "subject-row"; // This will be styled as a card by your CSS

  const teacherOptions = (infra.allTeachers || [])
    .map(t => `<option value="${t}" ${subject.teacher === t ? "selected" : ""}>${t}</option>`)
    .join("");
  const electiveTeacherOptions = (infra.allTeachers || [])
    .map(t => `<option value="${t}" ${subject.electiveTeacher === t ? "selected" : ""}>${t}</option>`)
    .join("");
  const labRoomOptions = (infra.allRooms || [])
    .filter(r => r.toLowerCase().includes("(l)"))
    .map(r => `<option value="${r}" ${subject.labRoomNo === r ? "selected" : ""}>${r}</option>`)
    .join("");
  const specializationOptions = (infra.allSpecializations || [])
    .map(s => `<option value="${s}" ${subject.specialization === s ? "selected" : ""}>${s}</option>`)
    .join("");

  row.innerHTML = `
    <div class="subject-card-body">
      <div class="form-group">
        <label>Subject Name</label>
        <input type="text" name="subjectName" value="${subject.name || ""}" required>
      </div>
      <div class="form-group">
        <label>Teacher</label>
        <select name="teacher" required>
          <option value="">Select Teacher</option>
          ${teacherOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Lectures/Week</label>
        <input type="number" name="lecturesPerWeek" value="${subject.lecturesPerWeek || 3}" min="1">
      </div>
    </div>
    <div class="subject-card-footer">
      <label><input type="checkbox" name="requiresLab" ${subject.requiresLab ? "checked" : ""}> Has Lab</label>
      <label><input type="checkbox" name="isElective" ${subject.isElective ? "checked" : ""}> Is Elective</label>
    </div>
    <div class="subject-extra-details"></div>
    <button type="button" class="btn btn-small remove-subject-btn"><i class="fas fa-times"></i></button>
  `;
  subjectsList.appendChild(row);

  const extraDetailsContainer = row.querySelector('.subject-extra-details');
  const labCheckbox = row.querySelector('[name="requiresLab"]');
  const electiveCheckbox = row.querySelector('[name="isElective"]');

  const renderExtraDetails = () => {
    extraDetailsContainer.innerHTML = '';
    if (labCheckbox.checked) {
      const labGroup = document.createElement('div');
      labGroup.className = 'lab-details-group form-group';
      labGroup.innerHTML = `
        <label>Lab Details</label>
        <input type="number" name="labsPerWeek" value="${subject.labsPerWeek || 1}" min="1" placeholder="Labs per Week">
        <select name="labRoomNo"><option value="">Select Lab Room</option>${labRoomOptions}</select>
      `;
      extraDetailsContainer.appendChild(labGroup);
    }
    if (electiveCheckbox.checked) {
      const electiveGroup = document.createElement('div');
      electiveGroup.className = 'elective-details-group form-group';
      electiveGroup.innerHTML = `
        <label>Elective Details</label>
        <select name="specialization"><option value="">Select Specialization</option>${specializationOptions}</select>
        <input type="text" name="electiveSubjectName" value="${subject.electiveSubjectName || ""}" placeholder="Elective Subject Name">
        <select name="electiveTeacher"><option value="">Select Elective Teacher</option>${electiveTeacherOptions}</select>
      `;
      extraDetailsContainer.appendChild(electiveGroup);
    }
  };

  labCheckbox.addEventListener("change", renderExtraDetails);
  electiveCheckbox.addEventListener("change", renderExtraDetails);
  row.querySelector(".remove-subject-btn").addEventListener("click", () => row.remove());
  renderExtraDetails();
}

// === Load Course Editor ===
function loadCourse() {
  form.reset();
  subjectsList.innerHTML = "";
  batchesDisplay.innerHTML = "";
  if (course) {
    titleEl.textContent = "Edit Course";
    courseIdEl.value = course.id;
    document.getElementById("courseBranch").value = course.branch || "";
    document.getElementById("courseSemester").value = course.semester || "";
    if (course.subjects && course.subjects.length > 0) course.subjects.forEach(addSubjectRow);
    else addSubjectRow();
    if (course.batches && course.batches.length > 0) course.batches.forEach(b => addTag(b, batchesDisplay, "batch"));
  } else {
    titleEl.textContent = "Add New Course";
    addSubjectRow();
  }
  setupTagInput("batchInput", course?.batches || [], batchesDisplay, "batch");
}

// === Save Course Handler (Corrected and Robust Version) ===
function handleSave(e) {
  e.preventDefault();
  const newCourse = {
    id: editId || `course_${Date.now()}`,
    branch: document.getElementById("courseBranch").value.trim(),
    semester: document.getElementById("courseSemester").value.trim(),
    subjects: [],
    batches: [],
  };
  document.querySelectorAll(".subject-row").forEach(row => {
    const s = {
      name: row.querySelector('[name="subjectName"]').value.trim(),
      teacher: row.querySelector('[name="teacher"]').value,
      lecturesPerWeek: parseInt(row.querySelector('[name="lecturesPerWeek"]').value, 10) || 0,
      requiresLab: row.querySelector('[name="requiresLab"]').checked,
      isElective: row.querySelector('[name="isElective"]').checked,
    };
    if (s.requiresLab) {
      const labsPerWeekInput = row.querySelector('[name="labsPerWeek"]');
      const labRoomNoInput = row.querySelector('[name="labRoomNo"]');
      s.labsPerWeek = labsPerWeekInput ? parseInt(labsPerWeekInput.value, 10) || 0 : 0;
      s.labRoomNo = labRoomNoInput ? labRoomNoInput.value : "";
    } else {
      s.labsPerWeek = 0; s.labRoomNo = "";
    }
    if (s.isElective) {
      const specializationInput = row.querySelector('[name="specialization"]');
      const electiveSubjectNameInput = row.querySelector('[name="electiveSubjectName"]');
      const electiveTeacherInput = row.querySelector('[name="electiveTeacher"]');
      s.specialization = specializationInput ? specializationInput.value : "";
      s.electiveSubjectName = electiveSubjectNameInput ? electiveSubjectNameInput.value : "";
      s.electiveTeacher = electiveTeacherInput ? electiveTeacherInput.value : "";
    } else {
      s.specialization = ""; s.electiveSubjectName = ""; s.electiveTeacher = "";
    }
    if (s.name && s.teacher) newCourse.subjects.push(s);
  });
  const batchTags = batchesDisplay.querySelectorAll(".tag .tag-remove");
  newCourse.batches = Array.from(batchTags).map(button => button.dataset.text);
  const idx = infra.courses.findIndex(c => c.id === newCourse.id);
  if (idx !== -1) infra.courses[idx] = newCourse;
  else infra.courses.push(newCourse);
  saveCollegeInfrastructure(infra);
  alert("✅ Course saved successfully!");
  window.location.href = "./course_setup.html";
}

// === Event Listeners ===
addSubjectBtn.addEventListener("click", () => addSubjectRow());
form.addEventListener("submit", handleSave);
document.getElementById("cancelBtn").addEventListener("click", () => {
  window.location.href = "./course_setup.html";
});

// === Init ===
loadCourse();