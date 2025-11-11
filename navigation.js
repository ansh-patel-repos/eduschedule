// Navigation functionality
class Navigation {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.initializeEventListeners();
        this.setActiveLink();
    }

    initializeEventListeners() {
        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                this.closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Toggle aria-expanded for accessibility
        const isExpanded = this.navMenu.classList.contains('active');
        this.hamburger.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPage = link.getAttribute('href');
            
            if (linkPage === currentPage || 
                (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scroll for anchor links
    initializeSmoothScroll() {
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
    }

    // Add scroll effect to navbar
    initializeScrollEffect() {
        let lastScrollTop = 0;
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new Navigation();
    navigation.initializeSmoothScroll();
    navigation.initializeScrollEffect();
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .template-card, .value-card, .team-member');
    animateElements.forEach(el => observer.observe(el));
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .navbar {
        transition: transform 0.3s ease;
    }
    
    .loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);