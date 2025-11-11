# 📚 Automated Timetable Generator

A modern, intelligent web-based timetable generator for educational institutions. Create optimized class schedules with automatic conflict resolution, teacher preferences, and professional PDF exports.

![Project Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

### 🎯 **Core Functionality**
- **Smart Scheduling Algorithm** - Automatic conflict detection and resolution
- **Teacher Preferences** - Set preferred time slots and blocked periods
- **Multi-Course Support** - Handle multiple branches and semesters simultaneously
- **Room Management** - Separate handling for classrooms and laboratories
- **Drag & Drop Editor** - Visual timetable editing interface
- **Professional PDF Export** - Generate print-ready timetables with custom branding

### 🌐 **Website Features**
- Modern landing page with feature showcase
- About page with project information
- Templates gallery with pre-designed examples
- Contact form with validation
- Fully responsive design for all devices

### 💾 **Technical Highlights**
- Pure frontend application (no backend required)
- LocalStorage for automatic data persistence
- Modular CSS architecture (14 separate modules)
- Cross-browser compatible
- Modern ES6+ JavaScript

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Live Server** extension (VS Code) OR any local server setup

### Installation & Running

**Method 1: VS Code Live Server (Recommended)**

```
# 1. Clone the repository
git clone https://github.com/ansh-patel-repos/eduschedule.git

# 2. Open in VS Code
cd eduschedule
code .

# 3. Install "Live Server" extension from VS Code marketplace (if not installed)

# 4. Right-click on index.html and select "Open with Live Server"
# Or click "Go Live" button in the bottom right corner of VS Code
```

**Method 2: Using Command Line**

```
# Clone the repository
git clone https://github.com/ansh-patel-repos/eduschedule.git
cd eduschedule

# Start a local server (choose one):

# Option A - Python 3
python -m http.server 8000

# Option B - Node.js
npx http-server -p 8000

# Option C - PHP
php -S localhost:8000
```

### Access the Application

After starting the server, open your browser and navigate to:

```
http://localhost:5500      # If using VS Code Live Server
http://localhost:8000      # If using Python/Node/PHP
```

**⚠️ Important:** The app requires a local server to function properly due to JavaScript module imports. Opening HTML files directly in the browser will not work.

---

### 🔗 Quick Navigation

- **Homepage**: `http://localhost:5500/`
- **Course Selector**: `http://localhost:5500/tt_selection/tt_selector.html`
- **Timetable Generator**: `http://localhost:5500/tt_generator/course_setup.html`
- **About Page**: `http://localhost:5500/about.html`
- **Templates Gallery**: `http://localhost:5500/templates.html`

---

## 📖 How to Use

### Step 1: Select Course Configuration
1. Navigate to the course selector page
2. Choose course type (Engineering, Medical, Arts, etc.)
3. Select lecture duration (45 min / 1 hour / 1.5 hours / 2 hours)
4. Configure basic settings

### Step 2: Add Resources
- **Teachers**: Add faculty members to the system
- **Classrooms**: Add room numbers (e.g., 101, 102, 103)
- **Labs**: Add laboratory names
- **Specializations**: Add elective subjects if needed
- **Time Slots**: Set college start/end times and recess

### Step 3: Create Courses
1. Click "Add New Course"
2. Enter course details:
   - Branch (e.g., CSE, Mechanical, Civil)
   - Semester number
   - Number of batches
   - Subjects for each batch type
3. Assign teachers and rooms to subjects
4. Save the course

### Step 4: Set Teacher Preferences (Optional)
- Select teacher from dropdown
- Set maximum consecutive classes
- Set maximum daily classes
- Define preferred days and time slots
- Block unavailable time slots
- Save preferences

### Step 5: Generate & Export
1. Click "Generate All Timetables"
2. Wait for the algorithm to process
3. Review generated schedules
4. Make manual adjustments using drag-drop editor
5. Export to professional PDF

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and semantic markup |
| **CSS3** | Modern styling with Grid, Flexbox, Gradients |
| **JavaScript (ES6+)** | Core logic and interactivity |
| **LocalStorage API** | Data persistence |
| **jsPDF** | PDF generation |
| **html2canvas** | HTML to image conversion |
| **Font Awesome** | Icon library |

---

## 📁 Project Structure

```
eduschedule/
├── index.html                 # Homepage
├── about.html                 # About page
├── contact.html               # Contact page
├── templates.html             # Templates gallery
├── styles.css                 # Global styles
├── script.js                  # Homepage script
├── navigation.js              # Navigation logic
├── timetable.js               # Timetable utilities
├── contact.js                 # Contact form logic
├── templates.js               # Templates logic
├── storage.js                 # Storage management
│
├── tt_selection/              # Course selector module
│   ├── tt_selector.html
│   ├── tt_selector.css
│   └── tt_selector.js
│
└── tt_generator/              # Main generator module
    ├── css/                   # Modular CSS files
    │   ├── 1_base.css
    │   ├── 2_navigation.css
    │   ├── 3_forms.css
    │   ├── 4_buttons.css
    │   ├── 5_tags.css
    │   ├── 6_cards.css
    │   ├── 7_tables.css
    │   ├── 8_modals.css
    │   ├── 9_timetables.css
    │   ├── 10_editor.css
    │   ├── 11_drag-drop.css
    │   ├── 12_preferences.css
    │   ├── 13_animations.css
    │   └── 14_responsive.css
    │
    ├── course_setup.html
    ├── course_setup.css
    ├── course_setup.js
    ├── course_editor.html
    ├── course_editor.js
    ├── course_management.js
    ├── scheduler_core.js
    ├── scheduler_data.js
    ├── scheduler_utils.js
    ├── teacher_preferences.js
    ├── timetable_editor.js
    └── timetable_renderer.js
```

---

## 🎨 Customization

### Change Color Scheme
Edit CSS variables in `styles.css` or `tt_generator/css/1_base.css`:

```
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #4CAF50;
  --danger-color: #f44336;
  --warning-color: #ff9800;
}
```

### Modify Time Settings
Default configuration in `tt_generator/course_setup.html`:
- College Start: 9:00 AM
- College End: 4:00 PM
- Recess Start: 12:00 PM
- Recess Duration: 60 minutes
- Lecture Duration: Configurable (45/60/90/120 min)

---

## 📊 Scheduling Algorithm

The system uses a **constraint satisfaction algorithm** with:

### Conflict Detection
- Teacher availability conflicts
- Room booking conflicts
- Batch schedule conflicts
- Time slot constraints

### Optimization Criteria
- Minimize schedule gaps
- Respect teacher preferences
- Balance workload distribution
- Maximize resource utilization

### Constraint Types
- **Hard Constraints**: Must be satisfied (no conflicts allowed)
- **Soft Constraints**: Preferred but optional (teacher preferences)

---

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Opera | 76+ |

---

## 🐛 Troubleshooting

### Issue: "Cannot access modules" or blank page
**Solution**: 
- Make sure you're using a local server (Live Server, Python, etc.)
- Do NOT open HTML files directly by double-clicking
- Check that you're accessing via `http://localhost:XXXX`
- If using VS Code Live Server, ensure the port (usually 5500) is not blocked

### Issue: Styles not loading in tt_generator
**Solution**:
- Verify all CSS files in `tt_generator/css/` folder exist
- Check browser console (F12) for any 404 errors
- Make sure file paths are correct (relative paths)

### Issue: Data not saving
**Solution**: 
- Check browser allows localStorage
- Disable incognito/private mode
- Clear browser cache and reload

### Issue: PDF not generating
**Solution**: 
- Verify jsPDF and html2canvas libraries are loaded
- Check browser console for errors
- Try in a different browser

### Issue: Timetable has conflicts
**Solution**: 
- Review teacher assignments
- Check room availability
- Verify batch configurations
- Adjust time slots

---

## 🔮 Future Enhancements

- [ ] Firebase integration for multi-user access
- [ ] User authentication system
- [ ] Real-time collaboration
- [ ] Email notifications
- [ ] Calendar export (iCal, Google Calendar)
- [ ] Excel/CSV import/export
- [ ] Mobile app version (React Native)
- [ ] Advanced analytics dashboard
- [ ] Machine learning for optimization
- [ ] Dark mode support
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ES6+ JavaScript features
- Follow consistent naming conventions
- Add comments for complex logic
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@ansh-patel-repos](https://github.com/ansh-patel-repos)
- Email: patelansh6989@gmail.com

---

## 🙏 Acknowledgments

- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation library
- [html2canvas](https://github.com/niklasvh/html2canvas) - Screenshot library
- [Font Awesome](https://fontawesome.com/) - Icon library
- Educational institutions for feedback and testing

---

## 📞 Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/ansh-patel-repos/eduschedule/issues)
- Email: patelansh6989@gmail.com

---

## ⭐ Star History

If you find this project useful, please consider giving it a star ⭐

---

**Made with ❤️ for educational institutions worldwide**

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Active Development
```

***

## 📋 **Summary**

### **You need to create these 2 files:**

1. **`.gitignore`** - Prevents unwanted files from being uploaded
2. **`README.md`** - Professional project documentation

### **Where to create them:**

Both files should be created in your **root folder** (same level as `index.html`):

```
ATG USING HTML,CSS,JS/
├── .gitignore          ← CREATE THIS
├── README.md           ← CREATE THIS
├── index.html
├── about.html
├── ...
```

### **Next Steps:**

After creating these files:

```bash
# Navigate to project folder
cd "C:\path\to\your\ATG USING HTML,CSS,JS"

# Initialize Git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Automated Timetable Generator v1.0"

# Create repo on GitHub, then push
git remote add origin https://github.com/ansh-patel-repos/eduschedule.git
git branch -M main
git push -u origin main
```

***

**Ready to upload?** Just copy-paste these two files and you're all set! 🚀
