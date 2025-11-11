// tt_selector.js

// Toggle Optional Section
function toggleOptional() {
  const section = document.getElementById('optionalSection');
  section.classList.toggle('expanded');
}

// Form Submission
document.getElementById('courseForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get selected values
  const courseType = document.querySelector('input[name="courseType"]:checked').value;
  const lectureDuration = document.querySelector('input[name="lectureDuration"]:checked').value;
  const sections = document.querySelector('input[name="sections"]')?.value || 1;
  const workingDays = document.querySelector('select[name="workingDays"]')?.value || 6;

  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  btnText.style.display = 'none';
  btnLoader.style.display = 'flex';
  submitBtn.disabled = true;

  // Store data in localStorage
  const courseData = {
    courseType,
    lectureDuration: parseInt(lectureDuration),
    sections: parseInt(sections),
    workingDays: parseInt(workingDays),
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('selectedCourseData', JSON.stringify(courseData));

  console.log('Course Data Saved:', courseData);

  // Simulate processing and redirect
  setTimeout(() => {
    window.location.href = '../tt_generator/course_setup.html';
  }, 1000);
});

// Add smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add entrance animations
window.addEventListener('load', () => {
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.animation = `slideUp 0.6s ease-out forwards`;
    }, index * 100);
  });
});
