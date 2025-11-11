// tt_generator/course_management.js
import {
  collegeInfrastructure,
  saveCollegeInfrastructure,
} from "./scheduler_data.js";
import { addTag, setupTagInput } from "./scheduler_utils.js";

// ------------------ OPEN MODAL ------------------
export function openModal(courseId = null) {
  const modal = document.getElementById("addCourseModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("courseDetailForm");
  const subjectsList = document.getElementById("subjectsList");
  const batchDisplay = document.getElementById("globalBatchesDisplay");
  const courseEditIdEl = document.getElementById("courseEditId");

  if (!modal || !form || !subjectsList) return;

  form.reset();
  subjectsList.innerHTML = "";
  batchDisplay.innerHTML = "";
  if (courseEditIdEl) courseEditIdEl.value = courseId || "";

  let course = null;
  if (courseId) {
    modalTitle.textContent = "Edit Course";
    course = collegeInfrastructure.courses.find((c) => c.id === courseId);
    if (course) {
      document.getElementById("courseBranch").value = course.branch || "";
      document.getElementById("courseSemester").value = course.semester || "";

      if (course.batches && course.batches.length > 0) {
        course.batches.forEach((b) => addTag(b, batchDisplay, "batch"));
      }

      if (course.subjects && course.subjects.length > 0) {
        course.subjects.forEach((s) => addSubjectRow(s));
      } else {
        addSubjectRow();
      }
    }
  } else {
    modalTitle.textContent = "Add New Course";
    addSubjectRow();
  }

  // Initialize batch input correctly
  const batchList = course ? [...(course.batches || [])] : [];
  setupTagInput("batchInput", batchList, batchDisplay, "batch");

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("visible"), 10);
}

// ------------------ CLOSE MODAL ------------------
export function closeModal() {
  const modal = document.getElementById("addCourseModal");
  if (!modal) return;
  modal.classList.remove("visible");
  setTimeout(() => (modal.style.display = "none"), 300);
}

// ------------------ SAVE COURSE ------------------
export function handleSaveCourse(e) {
  e.preventDefault();

  // ✅ 1. Temporarily disable hidden lab fields to prevent HTML5 validation errors
  const hiddenLabs = [];
  document.querySelectorAll('input[name="labsPerWeek"]').forEach((el) => {
    if (el.style.display === "none") {
      el.disabled = true;
      hiddenLabs.push(el);
    }
  });

  try {
    const courseId = document.getElementById("courseEditId").value;
    console.log(courseId);

    const newCourse = {
      id: courseId || `course_${new Date().getTime()}`,
      branch: document.getElementById("courseBranch").value.trim(),
      semester: document.getElementById("courseSemester").value.trim(),
      subjects: [],
      batches: [],
    };

    // ✅ 2. Collect subjects dynamically
    const subjectRows = document.querySelectorAll(".subject-row");
    subjectRows.forEach((row) => {
      const subjectName = row
        .querySelector('[name="subjectName"]')
        .value.trim();
      const teacher = row.querySelector('[name="teacher"]').value;
      const lecturesPerWeek =
        parseInt(row.querySelector('[name="lecturesPerWeek"]').value, 10) || 0;
      const requiresLab = row.querySelector('[name="requiresLab"]').checked;
      const labsPerWeekEl = row.querySelector('[name="labsPerWeek"]');
      const labsPerWeek = labsPerWeekEl
        ? parseInt(labsPerWeekEl.value, 10) || 0
        : 0;

      const labRoomNo = row.querySelector('[name="labRoomNo"]').value;

      if (subjectName && teacher) {
        newCourse.subjects.push({
          name: subjectName,
          teacher,
          lecturesPerWeek,
          requiresLab,
          labsPerWeek,
          labRoomNo,
        });
      }
    });

    // ✅ 3. Collect batches (tag inputs)
    const batchTags = document.querySelectorAll(
      "#globalBatchesDisplay .tag, #globalBatchesInput .tag"
    );
    const currentBatches = Array.from(batchTags).map((t) =>
      t.textContent.replace("×", "").trim()
    );
    newCourse.batches = currentBatches;

    // ✅ 4. Validation: Ensure labsPerWeek matches batch count
    for (const subj of newCourse.subjects) {
      if (subj.requiresLab && subj.labsPerWeek !== newCourse.batches.length) {
        alert(
          `⚠️ For "${subj.name}", labs per week (${subj.labsPerWeek}) must match number of batches (${newCourse.batches.length}).`
        );
        return; // stop saving
      }
    }

    // ✅ 5. Update existing course or add new one
    const idx = collegeInfrastructure.courses.findIndex(
      (c) => c.id === courseId
    );

    if (idx !== -1) {
      collegeInfrastructure.courses[idx] = {
        ...collegeInfrastructure.courses[idx],
        ...newCourse,
      };
      console.log("✅ Updated existing course:", newCourse);
    } else {
      collegeInfrastructure.courses.push(newCourse);
      console.log("🆕 Added new course:", newCourse);
    }

    // ✅ 6. Save to localStorage
    saveCollegeInfrastructure(collegeInfrastructure);

    // ✅ 7. UI refresh and modal close
    closeModal();
    renderCoursesTable();
  } catch (err) {
    console.error("❌ Error saving course:", err);
    alert(
      "An error occurred while saving the course. Please check the console."
    );
  } finally {
    // ✅ 8. Re-enable hidden inputs for next modal open
    hiddenLabs.forEach((el) => (el.disabled = false));
  }
}

// ------------------ ADD SUBJECT ROW ------------------
export function addSubjectRow(subject = {}) {
  const subjectsList = document.getElementById("subjectsList");
  if (!subjectsList) return;

  const row = document.createElement("div");
  row.className = "subject-row";

  const teacherOptions = collegeInfrastructure.allTeachers
    .map(
      (t) =>
        `<option value="${t}" ${
          subject.teacher === t ? "selected" : ""
        }>${t}</option>`
    )
    .join("");

  const labRoomOptions = collegeInfrastructure.allRooms
    .filter((r) => r.toLowerCase().includes("(l)"))
    .map(
      (r) =>
        `<option value="${r}" ${
          subject.labRoomNo === r ? "selected" : ""
        }>${r}</option>`
    )
    .join("");

  // 🧠 Get specialization options (from global list)
  const specializationOptions = (collegeInfrastructure.allSpecializations || [])
    .map(
      (s) =>
        `<option value="${s}" ${
          subject.specialization === s ? "selected" : ""
        }>${s}</option>`
    )
    .join("");

  row.innerHTML = `
    <input type="text" name="subjectName" value="${
      subject.name || ""
    }" placeholder="Subject Name" required>

    <select name="teacher" required>
      <option value="">Select Teacher</option>${teacherOptions}
    </select>

    <input type="number" name="lecturesPerWeek" value="${
      subject.lecturesPerWeek || 3
    }" placeholder="Lec/Wk" min="1">

    <input 
      type="number" 
      name="labsPerWeek" 
      class="labs-input" 
      placeholder="Labs/Wk"
      value="${subject.labsPerWeek ?? ""}" 
      min="1" 
      style="display:${subject.requiresLab ? "inline-block" : "none"}"
    />

    <label>
      <input type="checkbox" name="requiresLab" ${
        subject.requiresLab ? "checked" : ""
      }> Lab
    </label>

    <select name="labRoomNo" class="lab-room-dropdown" style="display:${
      subject.requiresLab ? "inline-block" : "none"
    };">
      <option value="">Select Lab Room</option>${labRoomOptions}
    </select>

    <!-- 🟩 New Elective Section -->
   <!-- 🟩 Enhanced Inline Elective Section -->
<div class="elective-inline-group" style="display:flex; align-items:center; gap:8px;">
  <label class="elective-checkbox">
    <input type="checkbox" name="isElective" ${
      subject.isElective ? "checked" : ""
    }> Elective
  </label>

  <select name="specialization" class="specialization-dropdown" style="display:${
    subject.isElective ? "inline-flex" : "none"
  };">
    <option value="">Select Specialization</option>${specializationOptions}
  </select>

  <div class="elective-details" style="display:${
    subject.isElective ? "inline-flex" : "none"
  };">
    <input 
      type="text" 
      name="electiveSubjectName" 
      value="${subject.electiveSubjectName || ""}" 
      placeholder="Elective Subject Name"
    />
    <select name="electiveTeacher">
      <option value="">Select Teacher</option>
      ${teacherOptions}
    </select>
  </div>
</div>


    <button type="button" class="btn btn-danger btn-small remove-subject-btn">
      <i class="fas fa-times"></i>
    </button>
  `;

  subjectsList.appendChild(row);

  // Remove subject event
  row
    .querySelector(".remove-subject-btn")
    .addEventListener("click", () => row.remove());

  // 🟦 Lab toggle
  const labCheckbox = row.querySelector('[name="requiresLab"]');
  const labsInput = row.querySelector('[name="labsPerWeek"]');
  const labRoomDropdown = row.querySelector('[name="labRoomNo"]');
  labCheckbox.addEventListener("change", () => {
    const show = labCheckbox.checked;
    labsInput.style.display = show ? "inline-block" : "none";
    labRoomDropdown.style.display = show ? "inline-block" : "none";
  });

  // 🟩 Elective toggle logic
  const electiveCheckbox = row.querySelector('[name="isElective"]');
  const specializationDropdown = row.querySelector('[name="specialization"]');
  const electiveDetails = row.querySelector(".elective-details");

  electiveCheckbox.addEventListener("change", () => {
    const show = electiveCheckbox.checked;
    specializationDropdown.style.display = show ? "inline-block" : "none";
    electiveDetails.style.display = show ? "inline-block" : "none";
  });
}

// ------------------ RENDER COURSES TABLE ------------------
export function renderCoursesTable() {
  const tbody = document.querySelector("#coursesTable tbody");
  if (!tbody) return;

  const newTbody = tbody.cloneNode(false);
  tbody.parentNode.replaceChild(newTbody, tbody);

  (collegeInfrastructure.courses || []).forEach((course) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${course.branch}</td>
      <td>${course.semester}</td>
      <td>${course.subjects.length}</td>
      <td>
        <button class="btn btn-secondary btn-small" data-id="${course.id}" data-action="edit">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-danger btn-small" data-id="${course.id}" data-action="delete">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    `;
    newTbody.appendChild(row);
  });

  newTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "edit") {
    window.location.href = `./course_editor.html?id=${id}`;
}
    else if (action === "delete") handleDeleteCourse(id);
  });
}

// ------------------ DELETE COURSE ------------------
export function handleDeleteCourse(courseId) {
  if (!courseId) return;
  if (confirm("Are you sure you want to delete this course?")) {
    collegeInfrastructure.courses = collegeInfrastructure.courses.filter(
      (c) => c.id !== courseId
    );
    saveCollegeInfrastructure(collegeInfrastructure);
    renderCoursesTable();
  }
}
