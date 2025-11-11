// tt_generator/scheduler_utils.js
import { collegeInfrastructure, saveCollegeInfrastructure } from "./scheduler_data.js";

export function generateTimeSlots(settings) {
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const toTimeString = (mins) => {
    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const slots = [];
  let current = toMinutes(settings.collegeStartTime);
  const endMinutes = toMinutes(settings.collegeEndTime);
  const recessStart = toMinutes(settings.recessStartTime);
  const recessEnd = recessStart + settings.recessDuration;
  const lectureDuration = settings.lectureDuration;

  while (current < endMinutes) {
    const next = current + lectureDuration;
    if (next > endMinutes) break;
    slots.push({
      start: toTimeString(current),
      end: toTimeString(next),
      isRecess: current >= recessStart && current < recessEnd,
    });
    current = next;
  }
  return slots;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array; // Return the array for chaining if needed
}

/**
 * UPDATED FUNCTION: Sets up a tag input field.
 * Now instantly saves changes for global tags (teacher, room, specialization).
 */
export function setupTagInput(inputId, initialTags, container, type) {
  const input = document.getElementById(inputId);
  if (!input || !container) return;

  container.addEventListener("click", () => input.focus());

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input.value.trim();
      
      const existingTags = Array.from(container.querySelectorAll('.tag-remove')).map(el => el.dataset.text);

      if (value && !existingTags.includes(value)) {
        addTag(value, container, type);
        input.value = "";

        // --- Instant Save Logic ---
        // We only perform instant saves for the global tags on the main admin page.
        // Batch tags are handled separately by the course editor's main save button.
        let needsSave = false;
        if (type === "teacher") {
          collegeInfrastructure.allTeachers.push(value);
          needsSave = true;
        } else if (type === "room") {
          collegeInfrastructure.allRooms.push(value);
          needsSave = true;
        } else if (type === "specialization") {
          collegeInfrastructure.allSpecializations.push(value);
          needsSave = true;
        }

        if (needsSave) {
          saveCollegeInfrastructure(collegeInfrastructure);
          console.log(`Saved new ${type}: ${value}`);
        }
      }
    }
  });
}

export function addTag(text, container, type) {
  if (!text || !container) return;

  // Use full name for rooms and specializations, but initials for teachers
  let displayText = text;
  if (type === "teacher") {
    const parts = text.trim().split(/\s+/);
    displayText = parts.map((p) => p[0]?.toUpperCase()).join("");
  }

  const tag = document.createElement("div");
  tag.className = "tag";
  tag.title = text; // The full text is always available on hover
  tag.innerHTML = `
    ${displayText}
    <button type="button" class="tag-remove" data-text="${text}" data-type="${type}">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(tag);
  // Add event listener to the new button
  tag.querySelector(".tag-remove").addEventListener("click", handleRemoveTag);
}

/**
 * UPDATED FUNCTION: Handles the removal of a tag.
 * Now instantly saves changes for global tags.
 */
export function handleRemoveTag(e) {
  const button = e.currentTarget;
  const text = button.dataset.text;
  const type = button.dataset.type;

  // --- Instant Save Logic ---
  let needsSave = false;
  if (type === "teacher") {
    collegeInfrastructure.allTeachers = collegeInfrastructure.allTeachers.filter((t) => t !== text);
    needsSave = true;
  } else if (type === "room") {
    collegeInfrastructure.allRooms = collegeInfrastructure.allRooms.filter((r) => r !== text);
    needsSave = true;
  } else if (type === "specialization") {
    collegeInfrastructure.allSpecializations = collegeInfrastructure.allSpecializations.filter((s) => s !== text);
    needsSave = true;
  }

  if (needsSave) {
    saveCollegeInfrastructure(collegeInfrastructure);
    console.log(`Removed ${type}: ${text}`);
  }

  // Remove tag from the UI
  const tagEl = button.closest(".tag");
  if (tagEl) tagEl.remove();
}