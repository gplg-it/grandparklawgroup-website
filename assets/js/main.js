/**
 * Grand Park Law Group - Main JavaScript
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // LOADING SCREEN
    // ============================================
    function initLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1200);
        });
    }

    // ============================================
    // LAZY VIDEO LOADING
    // ============================================
    function initLazyVideo() {
        const video = document.getElementById('heroVideo');
        if (!video) return;

        const source = video.querySelector('source[data-src]');
        if (!source) return;

        // Set the actual video source
        source.src = source.getAttribute('data-src');
        video.load();

        // When video is ready to play, show it
        video.addEventListener('canplay', () => {
            video.classList.add('loaded');
        });

        // Fallback if video fails to load
        video.addEventListener('error', () => {
            console.log('Video failed to load, showing poster');
        });
    }

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    function initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    function initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const menuOverlay = document.getElementById('menuOverlay');
        
        if (!menuToggle || !menuOverlay) return;

        const menuLinks = menuOverlay.querySelectorAll('.menu-nav-link');
        const backdrop = menuOverlay.querySelector('.menu-backdrop');

        // Toggle menu
        menuToggle.addEventListener('click', () => {
            const isActive = menuOverlay.classList.contains('active');
            
            menuToggle.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = isActive ? '' : 'hidden';
        });

        // Close on backdrop click
        if (backdrop) {
            backdrop.addEventListener('click', closeMenu);
        }

        // Close on link click
        menuLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                closeMenu();
            }
        });

        function closeMenu() {
            menuToggle.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        
        if (!revealElements.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    function initBackToTop() {
        const button = document.getElementById('backToTop');
        if (!button) return;

        const showThreshold = 500;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > showThreshold) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        }, { passive: true });

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // PARALLAX EFFECT ON HERO
    // ============================================
    function initParallax() {
        const hero = document.querySelector('.hero-content');
        if (!hero) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                hero.style.transform = `translateY(${scrolled * 0.3}px)`;
                hero.style.opacity = 1 - (scrolled / window.innerHeight);
            }
        }, { passive: true });
    }

    // ============================================
    // FORM VALIDATION
    // ============================================
    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    // Remove previous error state
                    field.classList.remove('error');
                    
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                    }
                    
                    // Email validation
                    if (field.type === 'email' && field.value) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(field.value)) {
                            isValid = false;
                            field.classList.add('error');
                        }
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                }
            });
        });
    }

    // ============================================
    // UPDATE COPYRIGHT YEAR
    // ============================================
    function updateYear() {
        const yearElements = document.querySelectorAll('[data-year]');
        const currentYear = new Date().getFullYear();
        
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }

    // ============================================
    // FILTER FUNCTIONALITY (for Insights, Professionals)
    // ============================================
    function initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                const container = btn.closest('.section').querySelector('[data-filterable]');
                
                if (!container) return;

                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter items
                const items = container.querySelectorAll('[data-filter-item]');
                items.forEach(item => {
                    if (filter === 'all' || item.dataset.filterItem === filter) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ============================================
    // INITIALIZE ALL MODULES
    // ============================================
    function init() {
        initLoader();
        initLazyVideo();
        initHeaderScroll();
        initMobileMenu();
        initScrollReveal();
        initSmoothScroll();
        initBackToTop();
        initParallax();
        initFormValidation();
        initFilters();
        updateYear();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
