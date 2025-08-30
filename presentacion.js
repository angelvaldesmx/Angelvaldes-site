// -----------------------------
// MAIN INIT
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode(); // <-- NUEVO: inicializa modo oscuro/claro
    initSkillsTabs();
    initPortfolioMixitup();
    initPortfolioFilters();
    initPortfolioPopup();
    initServicesModals();
    initSwiperTestimonials();
    initInputAnimations();
    initScrollActiveLinks();
    initSidebarToggle();
});

// -----------------------------
// DARK/LIGHT MODE
// -----------------------------
function initDarkMode() {
    const hour = new Date().getHours();
    const savedTheme = localStorage.getItem('theme');

    // Aplicar tema guardado en localStorage, si existe
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else if (savedTheme === 'dark') {
        document.body.classList.remove('light-mode');
    } else {
        // Tema automático según hora
        if (hour >= 6 && hour < 18) {
            document.body.classList.add('light-mode');
        }
    }

    // Botón toggle si existe en HTML
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', mode);
        });
    }
}

// -----------------------------
// Skills Tabs Toggle
// -----------------------------
function initSkillsTabs() {
    const tabs = document.querySelectorAll('[data-target]');
    const tabContents = document.querySelectorAll('[data-content]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.querySelector(tab.dataset.target);

            tabContents.forEach(tc => tc.classList.remove('skills-active'));
            if (target) target.classList.add('skills-active');

            tabs.forEach(t => t.classList.remove('skills-active'));
            tab.classList.add('skills-active');
        });
    });
}

// -----------------------------
// MixItUp Sorting for Portfolio
// -----------------------------
function initPortfolioMixitup() {
    if (typeof mixitup !== 'undefined') {
        mixitup('.work-container', {
            selectors: { target: '.work-card' },
            animation: { duration: 300 }
        });
    }
}

// -----------------------------
// Active Link in Portfolio Filters
// -----------------------------
function initPortfolioFilters() {
    const linkWork = document.querySelectorAll('.work-item');
    linkWork.forEach(l => {
        l.addEventListener('click', function() {
            linkWork.forEach(item => item.classList.remove('active-work'));
            this.classList.add('active-work');
        });
    });
}

// -----------------------------
// Portfolio Popup
// -----------------------------
function initPortfolioPopup() {
    const portfolioPopup = document.querySelector('.portfolio-popup');
    const portfolioClose = document.querySelector('.portfolio-popup-close');

    document.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('work-button')) {
            togglePortfolioPopup();
            setPortfolioDetails(e.target.closest('.work-card'));
        }
    });

    function togglePortfolioPopup() {
        if (portfolioPopup) portfolioPopup.classList.toggle('open');
    }

    if (portfolioClose) portfolioClose.addEventListener('click', togglePortfolioPopup);

    if (portfolioPopup) {
        portfolioPopup.addEventListener('click', (e) => {
            if (e.target === portfolioPopup) togglePortfolioPopup();
        });
    }

    function setPortfolioDetails(item) {
        if (!item || !portfolioPopup) return;
        const thumbnail = portfolioPopup.querySelector('.pp-thumbnail img');
        const subtitle = portfolioPopup.querySelector('.portfolio-popup-subtitle span');
        const body = portfolioPopup.querySelector('.portfolio-popup-body');

        if (thumbnail && subtitle && body) {
            const img = item.querySelector('.work-img');
            const title = item.querySelector('.work-title');
            const details = item.querySelector('.portfolio-item-details');

            if (img) thumbnail.src = img.src;
            if (title) subtitle.innerHTML = title.innerHTML;
            if (details) body.innerHTML = details.innerHTML;
        }
    }
}

// -----------------------------
// Services Modal Popup
// -----------------------------
function initServicesModals() {
    const modalViews = document.querySelectorAll('.services-modal');
    const modalBtns = document.querySelectorAll('.services-button');
    const modalCloses = document.querySelectorAll('.services-modal-close');

    modalBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            if (modalViews[i]) modalViews[i].classList.add('active-modal');
        });
    });

    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            modalViews.forEach(modal => modal.classList.remove('active-modal'));
        });
    });

    modalViews.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active-modal');
        });
    });
}

// -----------------------------
// Swiper Testimonials
// -----------------------------
function initSwiperTestimonials() {
    if (typeof Swiper !== 'undefined') {
        new Swiper(".mySwiper", {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            grabCursor: true,
            pagination: { el: ".swiper-pagination", clickable: true },
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            },
        });
    }
}

// -----------------------------
// Input Focus Animation
// -----------------------------
function initInputAnimations() {
    const inputs = document.querySelectorAll('.input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => input.parentNode.classList.add('focus'));
        input.addEventListener('blur', () => {
            if (input.value === '') input.parentNode.classList.remove('focus');
        });
    });
}

// -----------------------------
// Scroll Section Active Link
// -----------------------------function initScrollActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        // ===== Nav auto-ocultable =====
        if (scrollY <= 0) {
            header.style.top = '0';
        } else if (scrollY > lastScroll) {
            // Scroll hacia abajo → ocultar nav
            header.style.top = '-100px'; // ajusta según la altura del nav
        } else {
            // Scroll hacia arriba → mostrar nav
            header.style.top = '0';
        }
        lastScroll = scrollY;

        // ===== Active link según sección =====
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            const sectionId = current.getAttribute('id');

            const link = document.querySelector('.nav-links a[href*="' + sectionId + '"]');

            if (link) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    link.classList.add('active-link');
                } else {
                    link.classList.remove('active-link');
                }
            }
        });
    });
}

// Llamada inicial
initScrollActiveLinks();
// -----------------------------
// Sidebar Toggle (Nav Sandwich)
// -----------------------------
function initSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const openBtn = document.querySelector('.nav-toggle');
    const closeBtn = document.getElementById('nav-close');
    const sidebarLinks = sidebar ? sidebar.querySelectorAll('.sidebar-links a') : [];
    let backdrop = null;

    const open = () => {
        if (!sidebar) return;
        sidebar.classList.add('show-sidebar');
        document.body.classList.add('no-scroll');
        createBackdrop();
    };

    const close = () => {
        if (!sidebar) return;
        sidebar.classList.remove('show-sidebar');
        document.body.classList.remove('no-scroll');
        removeBackdrop();
    };

    const createBackdrop = () => {
        if (backdrop) return;
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', close);
    };

    const removeBackdrop = () => {
        if (backdrop) {
            backdrop.removeEventListener('click', close);
            backdrop.remove();
            backdrop = null;
        }
    };

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);

    sidebarLinks.forEach(a => a.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) close();
    });
}