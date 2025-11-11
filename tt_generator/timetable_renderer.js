// tt_generator/timetable_renderer.js
import { generateTimeSlots } from "./scheduler_utils.js";
import { collegeInfrastructure } from "./scheduler_data.js";

export function renderTimetable(scheduleData, courseInfo, timeSettings) {
  const headRow = document.querySelector(
    "#timetableTable thead .timetable-header-row"
  );
  const body = document.getElementById("timetableBody");
  if (!headRow || !body) return;

  const slots = generateTimeSlots(timeSettings);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const visibleSlots = slots.filter((s) => !s.isRecess);

  headRow.innerHTML = '<th class="day-header">Day</th>';
  body.innerHTML = "";

  // Header row for time slots
  visibleSlots.forEach((slot) => {
    const th = document.createElement("th");
    th.textContent = `${slot.start} - ${slot.end}`;
    headRow.appendChild(th);
  });

  const processedClasses = [];
  const electiveMap = {};

  // Build map of electives by day/time/parent
  scheduleData.classes.forEach((c) => {
    if (c.isElective && c.parentSubject) {
      const key = `${c.day}|${c.start}|${c.parentSubject}`;
      if (!electiveMap[key]) electiveMap[key] = [];
      electiveMap[key].push(c);
    }
  });

  // Process all classes, grouping electives with parents
  scheduleData.classes.forEach((c) => {
    // Skip standalone electives (they'll be attached to parent)
    if (c.isElective && c.parentSubject) return;

    const key = `${c.day}|${c.start}|${c.subject}`;
    const relatedElectives = electiveMap[key] || [];

    // If this subject has electives, create a grouped entry
    if (relatedElectives.length > 0) {
      processedClasses.push({
        ...c,
        isElectiveGroup: true,
        isLab: false, // 🔧 CRITICAL: Elective groups are NOT labs!
        choices: [
          {
            subject: c.subject,
            teacher: c.teacher,
            room: c.room || "",
          },
          ...relatedElectives.map((e) => ({
            subject: e.subject,
            teacher: e.teacher,
            room: e.room || "",
          })),
        ],
      });
    } else {
      processedClasses.push(c);
    }
  });

  // Group all classes by (day + start) - USE PROCESSED CLASSES
  const grouped = {};
  processedClasses.forEach((c) => {
    const key = `${c.day}|${c.start}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  // --- REST OF YOUR EXISTING CODE STAYS EXACTLY THE SAME ---
  // (Keep everything below this unchanged)

  days.forEach((day) => {
    const row = document.createElement("tr");
    const dayCell = document.createElement("td");
    dayCell.className = "day-cell";
    dayCell.textContent = day;
    row.appendChild(dayCell);

    for (let i = 0; i < visibleSlots.length; i++) {
      const slot = visibleSlots[i];
      const key = `${day}|${slot.start}`;
      const classes = grouped[key] || [];

      // Empty cell
      if (classes.length === 0) {
        const td = document.createElement("td");
        td.textContent = "-";
        row.appendChild(td);
        continue;
      }

      if (classes.length === 1) {
        const cls = classes[0];

        // ✅ Check for elective group
        if (cls.isElectiveGroup) {
          const td = document.createElement("td");
          td.className = "class-cell multi-class";
          td.innerHTML = cls.choices
            .map(
              (choice) => `
            <div class="multi-block">
              <div class="subject">${choice.subject}</div>
              <div class="teacher">{${choice.teacher}}</div>
              <div class="room">${choice.room}</div>
            </div>
          `
            )
            .join('<hr class="divider">');
          row.appendChild(td);
          continue;
        }

        // --- Original logic for single subject or lab ---
        const span = cls.isLab && cls.end !== slot.end ? 2 : 1;
        const td = document.createElement("td");
        td.className = `class-cell ${cls.isLab ? "lab-merged" : ""}`;
        td.innerHTML = `
          <div class="subject">${cls.subject}</div>
          <div class="teacher">${cls.teacher || ""}</div>
          <div class="room">${cls.room || ""}</div>
        `;
        if (span > 1) td.colSpan = span;
        row.appendChild(td);
        if (span > 1) i++;
        continue;
      }

      // --- Multiple classes (parallel labs) ---
      const td = document.createElement("td");
      td.className = "class-cell multi-class";
      td.colSpan = 2;

      td.innerHTML = classes
        .map(
          (c) => `
        <div class="multi-block" style="margin-bottom:6px;">
          <div class="subject">${c.subject} - <span style="font-weight:600;">${
            c.batch
          }</span></div>
          <div class="teacher">${c.teacher || ""}</div>
          <div class="room">${c.room || ""}</div>
          <hr class="divider">
        </div>
      `
        )
        .join("");

      row.appendChild(td);
      i++;
    }

    body.appendChild(row);
  });
}

export function printTimetable() {
  const hide = [".navbar", ".admin-panel-container", ".timetable-actions"];
  hide.forEach((s) =>
    document.querySelectorAll(s).forEach((el) => (el.style.display = "none"))
  );
  window.print();
  hide.forEach((s) =>
    document.querySelectorAll(s).forEach((el) => (el.style.display = ""))
  );
}

// Render timetable without elective grouping preprocessing
export function renderTimetableRaw(scheduleData, courseInfo, timeSettings) {
  const headRow = document.querySelector(
    "#timetableTable thead .timetable-header-row"
  );
  const body = document.getElementById("timetableBody");
  if (!headRow || !body) return;

  const slots = generateTimeSlots(timeSettings);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const visibleSlots = slots.filter((s) => !s.isRecess);

  headRow.innerHTML = '<th class="day-header">Day</th>';
  body.innerHTML = "";

  // Header row for time slots
  visibleSlots.forEach((slot) => {
    const th = document.createElement("th");
    th.textContent = `${slot.start} - ${slot.end}`;
    headRow.appendChild(th);
  });

  // Group all classes by (day + start) - NO PREPROCESSING
  const grouped = {};
  scheduleData.classes.forEach((c) => {
    const key = `${c.day}|${c.start}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  // Build timetable rows (keep existing logic)
  days.forEach((day) => {
    const row = document.createElement("tr");
    const dayCell = document.createElement("td");
    dayCell.className = "day-cell";
    dayCell.textContent = day;
    row.appendChild(dayCell);

    for (let i = 0; i < visibleSlots.length; i++) {
      const slot = visibleSlots[i];
      const key = `${day}|${slot.start}`;
      const classes = grouped[key] || [];

      // Empty cell
      if (classes.length === 0) {
        const td = document.createElement("td");
        td.textContent = "-";
        row.appendChild(td);
        continue;
      }

      if (classes.length === 1) {
        const cls = classes[0];

        // ✅ NEW: Check for elective group flag
        if (cls.isElectiveGroup) {
          const td = document.createElement("td");
          td.className = "class-cell multi-class";
          // 🔧 FIX: Electives are 1-hour, NOT 2-hour slots!
          // Do NOT set colSpan = 2 for elective groups
          td.innerHTML = cls.choices
            .map(
              (choice) => `
      <div class="multi-block">
        <div class="subject">${choice.subject}</div>
        <div class="teacher">{${choice.teacher}}</div>
        <div class="room">@ ${choice.room}</div>
      </div>
    `
            )
            .join('<hr class="divider">');
          row.appendChild(td);
          continue; // ✅ Don't increment i (it's only 1 slot)
        }

        const span = cls.isLab && cls.end !== slot.end ? 2 : 1;
        const td = document.createElement("td");
        td.className = `class-cell ${cls.isLab ? "lab-merged" : ""}`;
        td.innerHTML = `
    <div class="subject">${cls.subject}</div>
    <div class="teacher">${cls.teacher || ""}</div>
    <div class="room">${cls.room || ""}</div>
  `;
        if (span > 1) td.colSpan = span;
        row.appendChild(td);
        if (span > 1) i++; // Only skip next slot for actual 2-hour labs
        continue;
      }

      // Multiple classes (parallel labs)
      const td = document.createElement("td");
      td.className = "class-cell multi-class";
      td.colSpan = 2;

      td.innerHTML = classes
        .map(
          (c) => `
        <div class="multi-block" style="margin-bottom:6px;">
          <div class="subject">${c.subject} - <span style="font-weight:600;">${
            c.batch
          }</span></div>
          <div class="teacher">${c.teacher || ""}</div>
          <div class="room">${c.room || ""}</div>
          <hr class="divider">
        </div>
      `
        )
        .join("");

      row.appendChild(td);
      i++;
    }

    body.appendChild(row);
  });
}

export function exportToPDF() {
  if (!window.jspdf || !window.html2canvas) {
    return alert("jsPDF and html2canvas must be loaded for PDF export.");
  }

  const { jsPDF } = window.jspdf;
  const container = document.getElementById("timetableContainer");
  const actions = container.querySelector(".timetable-actions");
  const selectorContainer = container.querySelector(
    ".timetable-selector-container"
  );
  const existingLogo = container.querySelector("img");

  // Get current course info
  const selector = document.getElementById("timetableSelector");
  const selectedId = selector?.value;
  const selectedCourse = collegeInfrastructure.courses.find(
    (c) => c.id === selectedId
  );

  if (!selectedCourse) {
    alert("No course selected");
    return;
  }

  // ============================================
  // 🆕 FIX: Store original styles and expand container
  // ============================================
  const originalContainerStyle = container.style.cssText;
  const originalBodyOverflow = document.body.style.overflow;

  // Expand container to show full content
  container.style.cssText = `
    position: relative;
    width: 100%;
    max-width: none;
    height: auto;
    max-height: none;
    overflow: visible;
    padding: 0;
    margin: 0;
  `;

  // Prevent body scroll during capture
  document.body.style.overflow = 'hidden';

  // ============================================
  // CREATE MODERN PDF HEADER
  // ============================================
  const pdfHeader = document.createElement("div");
  pdfHeader.className = "pdf-only-header";
  pdfHeader.style.cssText = 'page-break-inside: avoid;';
  pdfHeader.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 25px 30px;
      border-radius: 0;
      margin: 0 0 20px 0;
      position: relative;
      overflow: hidden;
    ">
      <!-- Background Pattern -->
      <div style="
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        opacity: 0.1;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(255,255,255,0.3) 10px,
          rgba(255,255,255,0.3) 20px
        );
      "></div>
      
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
      ">
        <!-- University Logo Section -->
        <div style="
          display: flex;
          align-items: center;
          gap: 20px;
        ">
          <div style="
            background: white;
            padding: 10px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          ">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaqQNwmS0yJreGcQbctWmpn-GlMATGSH6HaQ&s" 
              alt="University Logo" 
              style="height: 70px; width: auto; display: block;"
            >
          </div>
          <div style="color: white;">
            <h1 style="
              margin: 0 0 5px 0;
              font-size: 1.8rem;
              font-weight: 700;
              letter-spacing: -0.5px;
            ">INDRASHIL UNIVERSITY</h1>
            <p style="
              margin: 0;
              font-size: 0.9rem;
              opacity: 0.9;
              font-weight: 400;
            ">School of Engineering - BTech</p>
          </div>
        </div>
        
        <!-- Course Info Section -->
        <div style="
          text-align: right;
          color: white;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 15px 25px;
          border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.2);
        ">
          <h2 style="
            margin: 0 0 8px 0;
            font-size: 1.4rem;
            font-weight: 700;
            letter-spacing: 0.5px;
          ">CLASS TIMETABLE</h2>
          <div style="
            font-size: 1.1rem;
            font-weight: 600;
            margin: 5px 0;
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 6px;
            display: inline-block;
          ">
            ${selectedCourse.branch} - Semester ${selectedCourse.semester}
          </div>
          <div style="font-size: 0.85rem; margin: 8px 0 0 0; opacity: 0.95;">
            <strong>Effective From:</strong> ${new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  `;

  // ============================================
  // CREATE MODERN PDF FOOTER
  // ============================================
  const pdfFooter = document.createElement("div");
  pdfFooter.className = "pdf-only-footer";
  pdfFooter.style.cssText = 'page-break-inside: avoid;';
  pdfFooter.innerHTML = `
    <div style="
      margin-top: 25px;
      padding: 15px 30px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      border-radius: 8px;
      border-top: 3px solid #667eea;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: #666;
    ">
      <div>
        <strong style="color: #333;">Generated on:</strong> 
        ${new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })} at ${new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div style="font-weight: 600; color: #667eea;">
        EduSchedule Timetable System
      </div>
    </div>
  `;

  // Insert header and footer
  container.insertBefore(pdfHeader, container.firstChild);
  container.appendChild(pdfFooter);

  // ============================================
  // STYLE THE TABLE
  // ============================================
  const table = container.querySelector("table");
  if (table) {
    // 🆕 Ensure table is fully visible
    table.style.cssText = `
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 12px;
      overflow: visible;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      background: white;
      font-family: 'Segoe UI', Arial, sans-serif;
      page-break-inside: auto;
    `;

    // Style table header
    const thead = table.querySelector("thead");
    if (thead) {
      thead.style.cssText = `
        background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
      `;

      thead.querySelectorAll("th").forEach((th, index) => {
        th.style.cssText = `
          padding: 15px 12px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: white;
          text-align: ${index === 0 ? "left" : "center"};
          border-bottom: 3px solid #667eea;
        `;
      });
    }

    // Style table body
    const tbody = table.querySelector("tbody");
    if (tbody) {
      const rows = tbody.querySelectorAll("tr");

      rows.forEach((row, rowIndex) => {
        // 🆕 Allow row breaks if needed
        row.style.pageBreakInside = 'auto';
        row.style.background = rowIndex % 2 === 0 ? "#ffffff" : "#f8f9fa";

        const cells = row.querySelectorAll("td");
        cells.forEach((cell, cellIndex) => {
          cell.style.cssText = `
            padding: 12px 10px;
            font-size: 0.75rem;
            border: 1px solid #e2e8f0;
            vertical-align: top;
          `;

          if (cellIndex === 0) {
            cell.style.cssText += `
              font-weight: 700;
              color: #2d3748;
              background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
              border-right: 3px solid #667eea;
              font-size: 0.85rem;
            `;
          } else {
            const text = cell.textContent.trim();

            if (text === "-" || text === "") {
              cell.style.cssText += `
                background: #f7fafc;
                color: #cbd5e0;
                text-align: center;
                font-weight: 600;
              `;
            } else if (text.toLowerCase().includes("recess")) {
              cell.style.cssText += `
                background: linear-gradient(135deg, #fef5e7 0%, #fdeaa8 100%);
                color: #856404;
                font-weight: 700;
                text-align: center;
                font-size: 0.8rem;
              `;
            } else {
              const lines = cell.innerHTML.split("<br>");
              
              if (lines.length > 0) {
                const subject = lines[0].trim();
                const teacher = lines[1]?.trim() || "";
                const room = lines[2]?.trim() || "";

                let bgColor = "#e8f4fd";
                let borderColor = "#4299e1";

                if (room.includes("(L)")) {
                  bgColor = "#fef5e7";
                  borderColor = "#f59e0b";
                } else if (room.includes("(C)")) {
                  bgColor = "#e8f4fd";
                  borderColor = "#4299e1";
                }

                cell.style.cssText += `
                  background: ${bgColor};
                  border-left: 4px solid ${borderColor};
                  padding-left: 12px;
                `;

                cell.innerHTML = `
                  <div style="
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 5px;
                    font-size: 0.8rem;
                    line-height: 1.3;
                  ">${subject}</div>
                  <div style="
                    color: #4a5568;
                    font-size: 0.7rem;
                    margin-bottom: 3px;
                  ">👨‍🏫 ${teacher}</div>
                  <div style="
                    color: #718096;
                    font-size: 0.7rem;
                    font-weight: 600;
                  ">📍 ${room}</div>
                `;
              }
            }
          }
        });
      });
    }
  }

  alert("Generating PDF, please wait...");

  // Hide unnecessary elements
  if (selectorContainer) selectorContainer.style.display = "none";
  if (actions) actions.style.display = "none";
  if (existingLogo) existingLogo.style.display = "none";

  // ============================================
  // 🆕 WAIT FOR DOM TO UPDATE THEN CAPTURE
  // ============================================
  setTimeout(() => {
    html2canvas(container, {
      scale: 2.5, // High quality
      logging: false,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowHeight: container.scrollHeight, // 🔥 KEY FIX: Capture full height
      height: container.scrollHeight, // 🔥 KEY FIX: Set explicit height
      allowTaint: true,
    })
      .then((canvas) => {
        // Cleanup
        pdfHeader.remove();
        pdfFooter.remove();
        container.style.cssText = originalContainerStyle;
        document.body.style.overflow = originalBodyOverflow;

        if (selectorContainer) selectorContainer.style.display = "";
        if (actions) actions.style.display = "";
        if (existingLogo) existingLogo.style.display = "";

        // Reset table styles
        if (table) {
          table.style.cssText = "";
          const thead = table.querySelector("thead");
          const tbody = table.querySelector("tbody");
          if (thead) {
            thead.style.cssText = "";
            thead.querySelectorAll("th").forEach((th) => (th.style.cssText = ""));
          }
          if (tbody) {
            tbody.querySelectorAll("tr").forEach((row) => {
              row.style.cssText = "";
              row.querySelectorAll("td").forEach((cell) => (cell.style.cssText = ""));
            });
          }
        }

        // Create PDF
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // 🆕 Calculate if content needs multiple pages
        const aspectRatio = imgWidth / imgHeight;
        const imgScaledWidth = pdfWidth - 10; // 5mm margin on each side
        const imgScaledHeight = imgScaledWidth / aspectRatio;

        let yPosition = 5; // Start position

        if (imgScaledHeight > pdfHeight - 10) {
          // Content exceeds one page - split into multiple pages
          const pagesNeeded = Math.ceil(imgScaledHeight / (pdfHeight - 10));
          
          for (let page = 0; page < pagesNeeded; page++) {
            if (page > 0) {
              pdf.addPage();
            }

            const sourceY = (canvas.height / pagesNeeded) * page;
            const sourceHeight = canvas.height / pagesNeeded;

            // Create a temporary canvas for this page
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = sourceHeight;
            const pageCtx = pageCanvas.getContext('2d');
            
            pageCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );

            const pageImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(
              pageImgData,
              "PNG",
              5,
              5,
              pdfWidth - 10,
              pdfHeight - 10,
              undefined,
              "FAST"
            );
          }
        } else {
          // Single page
          const centerY = (pdfHeight - imgScaledHeight) / 2;
          pdf.addImage(
            imgData,
            "PNG",
            5,
            centerY,
            imgScaledWidth,
            imgScaledHeight,
            undefined,
            "FAST"
          );
        }

        const fileName = `${selectedCourse.branch}_Sem${selectedCourse.semester}_Timetable_${new Date().getFullYear()}.pdf`;
        pdf.save(fileName);

        console.log("✅ PDF generated successfully:", fileName);
      })
      .catch((err) => {
        // Cleanup on error
        pdfHeader.remove();
        pdfFooter.remove();
        container.style.cssText = originalContainerStyle;
        document.body.style.overflow = originalBodyOverflow;
        if (selectorContainer) selectorContainer.style.display = "";
        if (actions) actions.style.display = "";
        if (existingLogo) existingLogo.style.display = "";

        console.error("PDF generation failed:", err);
        alert("Sorry, an error occurred while creating the PDF.");
      });
  }, 500); // Wait for DOM to render
}



export function displayResults() {
  const container = document.getElementById("timetableContainer");
  const selector = document.getElementById("timetableSelector");
  const table = document.getElementById("timetableTable");
  const body = document.getElementById("timetableBody");

  if (!container || !selector || !table || !body) {
    console.warn("Timetable DOM elements not found.");
    return;
  }

  const allSchedules = window.allSchedules || {};
  const courseKeys = Object.keys(allSchedules);
  if (courseKeys.length === 0) {
    alert("No timetables could be generated.");
    return;
  }

  // ✅ Make visible
  container.style.display = "block";

  // Populate dropdown with courses
  selector.innerHTML = "";
  courseKeys.forEach((courseId) => {
    const course = collegeInfrastructure.courses.find((c) => c.id === courseId);
    if (course) {
      const option = document.createElement("option");
      option.value = courseId;
      option.textContent = `${course.branch} - Semester ${course.semester}`;
      selector.appendChild(option);
    }
  });

  // Automatically render first course timetable
  const firstCourseId = courseKeys[0];
  const firstCourse = collegeInfrastructure.courses.find(
    (c) => c.id === firstCourseId
  );
  if (firstCourse) {
    renderTimetable(
      allSchedules[firstCourseId],
      firstCourse,
      collegeInfrastructure.timeSettings
    );
  }

  // Change event for selector
  selector.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    const selectedCourse = collegeInfrastructure.courses.find(
      (c) => c.id === selectedId
    );
    if (selectedCourse) {
      renderTimetable(
        allSchedules[selectedId],
        selectedCourse,
        collegeInfrastructure.timeSettings
      );
    }
  });
}
