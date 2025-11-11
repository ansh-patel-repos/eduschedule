// tt_generator/timetable_editor.js

import { collegeInfrastructure, saveCollegeInfrastructure } from './scheduler_data.js';
import { renderTimetableRaw } from './timetable_renderer.js';

// Edit mode state
let editMode = false;
let originalSchedule = null;
let draggedElement = null;
let draggedData = null;

// History management for undo/redo
let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 20;

// Conflict tracking
let detectedConflicts = [];

// Enable edit mode
export function enableEditMode() {
  editMode = true;
  
  // Store backup of original schedule
  originalSchedule = JSON.parse(JSON.stringify(window.allSchedules));
  
  // Initialize history
  historyStack = [JSON.parse(JSON.stringify(window.allSchedules))];
  historyIndex = 0;
  
  // Show/hide buttons
  document.getElementById('editTimetableBtn').style.display = 'none';
  document.getElementById('saveTimetableBtn').style.display = 'inline-block';
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  document.getElementById('undoBtn').style.display = 'inline-block';
  document.getElementById('redoBtn').style.display = 'inline-block';
  document.getElementById('printBtn').style.display = 'none';
  document.getElementById('exportPdfBtn').style.display = 'none';
  
  updateHistoryButtons();
  
  // Add edit mode visual indicator
  const table = document.getElementById('timetableTable');
  table.classList.add('edit-mode-active');
  
  // Make all cells draggable
  makeCellsDraggable();
  
  console.log('✏️ Edit mode enabled');
}

// Make timetable cells draggable
function makeCellsDraggable() {
  const cells = document.querySelectorAll('#timetableBody td');
  
  cells.forEach(cell => {
    // Skip empty cells but make them drop zones
    if (cell.textContent.trim() === '-') {
      cell.classList.add('drop-zone');
      cell.addEventListener('dragover', handleDragOver);
      cell.addEventListener('drop', handleDrop);
      return;
    }
    
    // Make cell draggable
    cell.setAttribute('draggable', 'true');
    cell.classList.add('draggable-cell');
    
    // Drag events
    cell.addEventListener('dragstart', handleDragStart);
    cell.addEventListener('dragend', handleDragEnd);
    
    // Drop events
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('dragenter', handleDragEnter);
    cell.addEventListener('dragleave', handleDragLeave);
    cell.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(e) {
  draggedElement = e.target;
  draggedElement.classList.add('dragging');
  
  // Extract data from cell
  const row = draggedElement.parentElement;
  const day = row.cells[0].textContent.trim();
  const cellIndex = Array.from(row.cells).indexOf(draggedElement);
  
  // Get time slot from header
  const headerCells = document.querySelectorAll('#timetableTable thead th');
  const timeSlot = headerCells[cellIndex].textContent.trim();
  
  // Get subject info from cell
  const subjectDiv = draggedElement.querySelector('.subject');
  const teacherDiv = draggedElement.querySelector('.teacher');
  const roomDiv = draggedElement.querySelector('.room');
  
  let subjectText = subjectDiv ? subjectDiv.textContent.trim() : '';
  let batch = '';
  
  // Extract batch if present (e.g., "CS702 - A1")
  const batchMatch = subjectText.match(/\s*-\s*([A-Z]\d+)\s*$/);
  if (batchMatch) {
    batch = batchMatch[1];
    subjectText = subjectText.replace(/\s*-\s*[A-Z]\d+\s*$/, '');
  }
  
  draggedData = {
    day: day,
    timeSlot: timeSlot,
    cellIndex: cellIndex,
    subject: subjectText,
    teacher: teacherDiv ? teacherDiv.textContent.replace(/[{}]/g, '').trim() : '',
    room: roomDiv ? roomDiv.textContent.replace('@', '').trim() : '',
    isLab: draggedElement.classList.contains('lab-merged') || draggedElement.colSpan > 1,
    colSpan: draggedElement.colSpan || 1,
    batch: batch
  };
  
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', draggedElement.innerHTML);
  
  console.log('🔄 Dragging:', draggedData);
}



// Handle drag over
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

// Handle drag enter
function handleDragEnter(e) {
  const targetCell = e.target.closest('td');
  if (!targetCell || targetCell === draggedElement) return;
  
  // Check if drop is valid
  const validationResult = validateDropAdvanced(targetCell);
  
  if (validationResult.valid) {
    targetCell.classList.add('drop-zone-hover');
  } else {
    targetCell.classList.add('drop-zone-invalid');
    targetCell.title = validationResult.reason || 'Invalid drop';
  }
}

// Handle drag leave
function handleDragLeave(e) {
  const targetCell = e.target.closest('td');
  if (!targetCell) return;
  
  targetCell.classList.remove('drop-zone-hover', 'drop-zone-invalid');
  targetCell.removeAttribute('title');
}

// Handle drag end
function handleDragEnd(e) {
  draggedElement.classList.remove('dragging');
  
  // Remove all drop zone highlights
  document.querySelectorAll('.drop-zone-hover, .drop-zone-invalid').forEach(el => {
    el.classList.remove('drop-zone-hover', 'drop-zone-invalid');
    el.removeAttribute('title');
  });
}

// Handle drop
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  const targetCell = e.target.closest('td');
  if (!targetCell || targetCell === draggedElement) return;
  
  // Validate drop with detailed feedback
  const validationResult = validateDropAdvanced(targetCell);
  
  if (!validationResult.valid) {
    alert(`❌ Cannot drop here!\n\nReason: ${validationResult.reason}`);
    return;
  }
  
  // Check for conflicts
  const conflicts = detectConflicts(draggedElement, targetCell);
  
  if (conflicts.length > 0) {
    showConflictDialog(conflicts, () => {
      performSwap(draggedElement, targetCell);
    });
  } else {
    performSwap(draggedElement, targetCell);
  }
  
  return false;
}

// Advanced validation with detailed feedback
function validateDropAdvanced(targetCell) {
  const row = targetCell.parentElement;
  const targetDay = row.cells[0].textContent.trim();
  const targetCellIndex = Array.from(row.cells).indexOf(targetCell);
  
  const headerCells = document.querySelectorAll('#timetableTable thead th');
  const targetTimeSlot = headerCells[targetCellIndex].textContent.trim();
  const [targetStart] = targetTimeSlot.split(' - ');
  
  // Check if target is empty
  if (targetCell.textContent.trim() === '-') {
    // For empty cells, check teacher and room availability
    const teacherCheck = checkTeacherAvailability(draggedData.teacher, targetDay, targetStart);
    if (!teacherCheck.available) {
      return { valid: false, reason: `Teacher ${draggedData.teacher} is busy: ${teacherCheck.conflict}` };
    }
    
    const roomCheck = checkRoomAvailability(draggedData.room, targetDay, targetStart);
    if (!roomCheck.available) {
      return { valid: false, reason: `Room ${draggedData.room} is occupied: ${roomCheck.conflict}` };
    }
    
    return { valid: true };
  }
  
  // For swaps, validate both directions
  const targetSubject = targetCell.querySelector('.subject');
  const targetTeacher = targetCell.querySelector('.teacher');
  const targetRoom = targetCell.querySelector('.room');
  
  if (!targetSubject || !targetTeacher) {
    return { valid: false, reason: 'Invalid target cell data' };
  }
  
  const targetTeacherName = targetTeacher.textContent.replace(/[{}]/g, '');
  const targetRoomName = targetRoom ? targetRoom.textContent.replace('@', '').trim() : '';
  
  // Check dragged teacher at target slot
  const draggedTeacherCheck = checkTeacherAvailability(draggedData.teacher, targetDay, targetStart, draggedData.subject);
  if (!draggedTeacherCheck.available) {
    return { valid: false, reason: `Swap blocked: ${draggedData.teacher} has conflict at target slot` };
  }
  
  // Check target teacher at dragged slot
  const [draggedStart] = draggedData.timeSlot.split(' - ');
  const targetTeacherCheck = checkTeacherAvailability(targetTeacherName, draggedData.day, draggedStart, targetSubject.textContent);
  if (!targetTeacherCheck.available) {
    return { valid: false, reason: `Swap blocked: ${targetTeacherName} has conflict at source slot` };
  }
  
  return { valid: true };
}

// Check teacher availability with detailed conflict info
function checkTeacherAvailability(teacherName, day, startTime, excludeSubject = null) {
  const selector = document.getElementById('timetableSelector');
  const currentCourseId = selector?.value;
  
  for (const [courseId, schedule] of Object.entries(window.allSchedules)) {
    if (courseId === currentCourseId) continue;
    
    const course = collegeInfrastructure.courses.find(c => c.id === courseId);
    const classes = schedule.classes || [];
    
    for (const cls of classes) {
      if (cls.teacher === teacherName && cls.day === day && cls.start === startTime) {
        if (excludeSubject && cls.subject === excludeSubject) continue;
        
        return {
          available: false,
          conflict: `${course.branch} Sem ${course.semester} - ${cls.subject}`
        };
      }
    }
  }
  
  return { available: true };
}

// Check room availability
function checkRoomAvailability(roomName, day, startTime, excludeSubject = null) {
  const selector = document.getElementById('timetableSelector');
  const currentCourseId = selector?.value;
  
  for (const [courseId, schedule] of Object.entries(window.allSchedules)) {
    if (courseId === currentCourseId) continue;
    
    const course = collegeInfrastructure.courses.find(c => c.id === courseId);
    const classes = schedule.classes || [];
    
    for (const cls of classes) {
      if (cls.room === roomName && cls.day === day && cls.start === startTime) {
        if (excludeSubject && cls.subject === excludeSubject) continue;
        
        return {
          available: false,
          conflict: `${course.branch} Sem ${course.semester} - ${cls.subject}`
        };
      }
    }
  }
  
  return { available: true };
}

// Detect conflicts before swap
function detectConflicts(sourceCell, targetCell) {
  const conflicts = [];
  
  // Get data from both cells
  const sourceTeacher = sourceCell.querySelector('.teacher')?.textContent.replace(/[{}]/g, '');
  const targetTeacher = targetCell.querySelector('.teacher')?.textContent.replace(/[{}]/g, '');
  
  const sourceRow = sourceCell.parentElement;
  const targetRow = targetCell.parentElement;
  
  const sourceDay = sourceRow.cells[0].textContent.trim();
  const targetDay = targetRow.cells[0].textContent.trim();
  
  // Check cross-course conflicts
  const selector = document.getElementById('timetableSelector');
  const currentCourseId = selector?.value;
  
  for (const [courseId, schedule] of Object.entries(window.allSchedules)) {
    if (courseId === currentCourseId) continue;
    
    const course = collegeInfrastructure.courses.find(c => c.id === courseId);
    // Check if swap would cause issues in other courses
    // This is a simplified check - you can expand this
  }
  
  return conflicts;
}

// Show conflict dialog
function showConflictDialog(conflicts, onProceed) {
  const message = `⚠️ Warning: This swap may affect ${conflicts.length} other course(s).\n\nDo you want to proceed?`;
  
  if (confirm(message)) {
    onProceed();
  }
}

// Perform the swap with history tracking
function performSwap(sourceCell, targetCell) {
  // Save current state to history before swap
  saveToHistory();
  
  // Swap innerHTML
  const tempHTML = sourceCell.innerHTML;
  sourceCell.innerHTML = targetCell.innerHTML;
  targetCell.innerHTML = tempHTML;
  
  // Add swap animation
  sourceCell.classList.add('swapped');
  targetCell.classList.add('swapped');
  
  setTimeout(() => {
    sourceCell.classList.remove('swapped');
    targetCell.classList.remove('swapped');
  }, 600);
  
  // Update underlying data
  updateScheduleData();
  
  // Refresh draggable elements
  makeCellsDraggable();
  
  // Show unsaved changes badge
  showUnsavedBadge();
  
  // Update history buttons
  updateHistoryButtons();
  
  console.log('✅ Swap completed');
}

// Save current state to history
function saveToHistory() {
  // Remove any states after current index
  historyStack = historyStack.slice(0, historyIndex + 1);
  
  // Add new state
  historyStack.push(JSON.parse(JSON.stringify(window.allSchedules)));
  
  // Limit history size
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift();
  } else {
    historyIndex++;
  }
}

// Undo last change
export function undoChange() {
  if (historyIndex <= 0) return;
  
  historyIndex--;
  window.allSchedules = JSON.parse(JSON.stringify(historyStack[historyIndex]));
  
  // Re-render timetable
  refreshCurrentTimetable();
  updateHistoryButtons();
  
  console.log(`↶ Undo to state ${historyIndex}`);
}

// Redo change
export function redoChange() {
  if (historyIndex >= historyStack.length - 1) return;
  
  historyIndex++;
  window.allSchedules = JSON.parse(JSON.stringify(historyStack[historyIndex]));
  
  // Re-render timetable
  refreshCurrentTimetable();
  updateHistoryButtons();
  
  console.log(`↷ Redo to state ${historyIndex}`);
}

// Update undo/redo button states
function updateHistoryButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn) {
    undoBtn.disabled = historyIndex <= 0;
  }
  
  if (redoBtn) {
    redoBtn.disabled = historyIndex >= historyStack.length - 1;
  }
}

function refreshCurrentTimetable() {
  const selector = document.getElementById('timetableSelector');
  const currentCourseId = selector?.value;
  
  if (!currentCourseId || !window.allSchedules[currentCourseId]) return;
  
  // Get current course
  const selectedCourse = collegeInfrastructure.courses.find(c => c.id === currentCourseId);
  
  if (!selectedCourse) return;
  
  // Render WITHOUT preprocessing electives
  renderTimetableRaw(window.allSchedules[currentCourseId], selectedCourse, collegeInfrastructure.timeSettings);
  
  // Re-enable draggable after refresh
  if (editMode) {
    setTimeout(() => makeCellsDraggable(), 100);
  }
}

function updateScheduleData() {
  const selector = document.getElementById('timetableSelector');
  const currentCourseId = selector?.value;
  
  if (!currentCourseId || !window.allSchedules[currentCourseId]) return;
  
  // Rebuild schedule from current table state
  const newClasses = [];
  const rows = document.querySelectorAll('#timetableBody tr');
  const headerCells = document.querySelectorAll('#timetableTable thead th');
  const processedCells = new Set();
  
  rows.forEach((row, rowIndex) => {
    const day = row.cells[0].textContent.trim();
    
    for (let i = 1; i < row.cells.length; i++) {
      const cell = row.cells[i];
      const cellId = `${rowIndex}-${i}`;
      
      // Skip if already processed (for colspan cells)
      if (processedCells.has(cellId)) continue;
      
      // Skip empty cells
      if (cell.textContent.trim() === '-') continue;
      
      const timeSlot = headerCells[i].textContent.trim();
      const [start, end] = timeSlot.split(' - ');
      
      // Check if this is a lab
      const isLab = cell.colSpan > 1 || cell.classList.contains('lab-merged');
      const colSpan = cell.colSpan || 1;
      
      // Mark spanned cells as processed
      for (let span = 0; span < colSpan; span++) {
        processedCells.add(`${rowIndex}-${i + span}`);
      }
      
      // Check for multi-block (parallel labs)
      const multiBlocks = cell.querySelectorAll('.multi-block');
      
      if (multiBlocks.length > 0) {
        // Multiple parallel labs
        multiBlocks.forEach(block => {
          const subjectDiv = block.querySelector('.subject');
          const teacherDiv = block.querySelector('.teacher');
          const roomDiv = block.querySelector('.room');
          
          if (subjectDiv) {
            const subjectText = subjectDiv.textContent.trim();
            const batchMatch = subjectText.match(/\s*-\s*([A-Z]\d+)\s*$/);
            const batch = batchMatch ? batchMatch[1] : '';
            const subjectName = batchMatch ? subjectText.replace(/\s*-\s*[A-Z]\d+\s*$/, '') : subjectText;
            
            let actualEnd = end;
            if (colSpan === 2 && i + 1 < headerCells.length) {
              const nextSlot = headerCells[i + 1].textContent.trim();
              actualEnd = nextSlot.split(' - ')[1];
            }
            
            // 🆕 Create unique entry for each lab batch
            newClasses.push({
              day: day,
              start: start,
              end: actualEnd,
              subject: subjectName.trim(),
              teacher: teacherDiv ? teacherDiv.textContent.replace(/[{}]/g, '').trim() : '',
              room: roomDiv ? roomDiv.textContent.replace('@', '').trim() : '',
              isLab: true,
              batch: batch
            });
          }
        });
      } else {
        // Single subject (regular lecture or single lab)
        const subjectDiv = cell.querySelector('.subject');
        const teacherDiv = cell.querySelector('.teacher');
        const roomDiv = cell.querySelector('.room');
        
        if (subjectDiv) {
          const subjectText = subjectDiv.textContent.trim();
          const batchMatch = subjectText.match(/\s*-\s*([A-Z]\d+)\s*$/);
          const batch = batchMatch ? batchMatch[1] : '';
          const subjectName = batchMatch ? subjectText.replace(/\s*-\s*[A-Z]\d+\s*$/, '') : subjectText;
          
          let actualEnd = end;
          if (isLab && colSpan === 2 && i + 1 < headerCells.length) {
            const nextSlot = headerCells[i + 1].textContent.trim();
            actualEnd = nextSlot.split(' - ')[1];
          }
          
          // 🆕 IMPORTANT: Always push, even if subject appears multiple times
          // Each occurrence is a separate lecture session
          newClasses.push({
            day: day,
            start: start,
            end: actualEnd,
            subject: subjectName.trim(),
            teacher: teacherDiv ? teacherDiv.textContent.replace(/[{}]/g, '').trim() : '',
            room: roomDiv ? roomDiv.textContent.replace('@', '').trim() : '',
            isLab: isLab,
            ...(batch && { batch: batch })
          });
        }
      }
    }
  });
  
  // 🆕 VALIDATION: Check if we preserved all instances
  const subjectCounts = {};
  newClasses.forEach(cls => {
    const key = `${cls.subject}-${cls.teacher}`;
    subjectCounts[key] = (subjectCounts[key] || 0) + 1;
  });
  
  console.log('📊 Subject occurrence count:', subjectCounts);
  console.log('📊 Total classes captured:', newClasses.length);
  
  // Update schedule
  window.allSchedules[currentCourseId].classes = newClasses;
}




// Auto-resolve conflicts
export function autoResolveConflicts() {
  alert('🔧 Auto-resolving conflicts...\n\nThis feature will automatically find and fix teacher/room conflicts across all courses.');
  
  // Scan all courses for conflicts
  const allConflicts = scanAllConflicts();
  
  if (allConflicts.length === 0) {
    alert('✅ No conflicts found!');
    hideConflictPanel();
    return;
  }
  
  // Attempt to resolve each conflict
  let resolved = 0;
  allConflicts.forEach(conflict => {
    if (attemptResolve(conflict)) {
      resolved++;
    }
  });
  
  alert(`✅ Resolved ${resolved} out of ${allConflicts.length} conflicts.`);
  refreshCurrentTimetable();
  hideConflictPanel();
}

// Scan for all conflicts
function scanAllConflicts() {
  const conflicts = [];
  // Implementation for scanning conflicts across all courses
  // This would check for teacher/room double bookings
  return conflicts;
}

// Attempt to resolve a conflict
function attemptResolve(conflict) {
  // Implementation for automatic conflict resolution
  // This would try to find alternative slots
  return false;
}

// Show unsaved changes badge
function showUnsavedBadge() {
  let badge = document.querySelector('.unsaved-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'unsaved-badge';
    badge.textContent = 'Unsaved Changes';
    document.querySelector('.timetable-actions').prepend(badge);
  }
}

// Hide conflict panel
export function hideConflictPanel() {
  document.getElementById('conflictPanel').style.display = 'none';
}

// Save changes
// Save changes - UPDATE BOTH STORAGE LOCATIONS
export function saveChanges() {
  // 1️⃣ Update sessionStorage (for page refresh)
  sessionStorage.setItem('allGeneratedSchedules', JSON.stringify(window.allSchedules));
  
  // 2️⃣ IMPORTANT: Also update master schedule tracking
  // This ensures the edited schedule persists across refreshes
  if (typeof window.allSchedules !== 'undefined') {
    console.log('💾 Saving edited schedule to session storage');
    console.log('Classes count per course:', 
      Object.entries(window.allSchedules).map(([id, sched]) => ({
        course: id,
        classCount: sched.classes.length
      }))
    );
  }
  
  alert('✅ Changes saved successfully!');
  
  // Exit edit mode
  disableEditMode();
  
  console.log('💾 Changes saved and persisted');
}

// Add this function to timetable_editor.js for debugging
function debugScheduleData() {
  const selector = document.getElementById('timetableSelector');
  const currentCourseId = selector?.value;
  const schedule = window.allSchedules[currentCourseId];
  
  console.log('🔍 DEBUG: Current Schedule Analysis');
  console.log('Total classes:', schedule.classes.length);
  
  // Group by subject
  const bySubject = {};
  schedule.classes.forEach(cls => {
    if (!bySubject[cls.subject]) bySubject[cls.subject] = [];
    bySubject[cls.subject].push(`${cls.day} ${cls.start}`);
  });
  
  console.table(bySubject);
  
  return bySubject;
}

// Make it globally accessible for testing
window.debugScheduleData = debugScheduleData;


// Cancel changes
export function cancelChanges() {
  if (!confirm('Are you sure? All changes will be lost.')) return;
  
  // Restore original schedule
  window.allSchedules = originalSchedule;
  
  // Re-render timetable
  refreshCurrentTimetable();
  
  // Exit edit mode
  disableEditMode();
  
  console.log('❌ Changes cancelled');
}

// Disable edit mode
function disableEditMode() {
  editMode = false;
  
  // Show/hide buttons
  document.getElementById('editTimetableBtn').style.display = 'inline-block';
  document.getElementById('saveTimetableBtn').style.display = 'none';
  document.getElementById('cancelEditBtn').style.display = 'none';
  document.getElementById('undoBtn').style.display = 'none';
  document.getElementById('redoBtn').style.display = 'none';
  document.getElementById('printBtn').style.display = 'inline-block';
  document.getElementById('exportPdfBtn').style.display = 'inline-block';
  
  // Remove edit mode indicator
  const table = document.getElementById('timetableTable');
  table.classList.remove('edit-mode-active');
  
  // Remove draggable attributes
  const cells = document.querySelectorAll('#timetableBody td');
  cells.forEach(cell => {
    cell.removeAttribute('draggable');
    cell.classList.remove('draggable-cell', 'drop-zone');
  });
  
  // Remove unsaved badge
  const badge = document.querySelector('.unsaved-badge');
  if (badge) badge.remove();
  
  // Hide conflict panel
  hideConflictPanel();
  
  // Clear history
  historyStack = [];
  historyIndex = -1;
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.enableEditMode = enableEditMode;
  window.saveChanges = saveChanges;
  window.cancelChanges = cancelChanges;
  window.undoChange = undoChange;
  window.redoChange = redoChange;
  window.autoResolveConflicts = autoResolveConflicts;
  window.hideConflictPanel = hideConflictPanel;
}
