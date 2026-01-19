// ===================
// THEME TOGGLE
// ===================
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return prefersDarkScheme.matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = themeToggle.querySelector('.icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

applyTheme(getThemePreference());

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});

prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});

// ===================
// HEADER SCROLL EFFECT
// ===================
const header = document.querySelector('.main-header');

function handleScroll() {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Only apply scroll effect on pages with hero (homepage)
if (header && !header.classList.contains('scrolled')) {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load
}

// ===================
// SMOOTH SCROLL
// ===================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================
// FADE IN ON SCROLL
// ===================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for fade-in animation
document.querySelectorAll('.trip-card, .day-card, .highlight-card, .stat-card, .category-section').forEach(el => {
    el.classList.add('fade-in-element');
    fadeInObserver.observe(el);
});

// Add CSS for fade-in animation
const fadeInStyles = document.createElement('style');
fadeInStyles.textContent = `
    .fade-in-element {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-in-element.visible {
        opacity: 1;
        transform: translateY(0);
    }
    .trip-card.fade-in-element { transition-delay: 0.1s; }
    .trip-card.fade-in-element:nth-child(2) { transition-delay: 0.2s; }
    .trip-card.fade-in-element:nth-child(3) { transition-delay: 0.3s; }
    .trip-card.fade-in-element:nth-child(4) { transition-delay: 0.4s; }
`;
document.head.appendChild(fadeInStyles);

// ===================
// PHOTO GALLERY LIGHTBOX
// ===================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const galleryItems = document.querySelectorAll('.gallery-item');

let currentImageIndex = 0;
let galleryImages = [];

function initGallery() {
    if (!lightbox || galleryItems.length === 0) return;

    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            galleryImages.push({
                src: img.src,
                caption: item.dataset.caption || '',
                index: index
            });
        }
    });

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) {
                openLightbox(index);
            }
        });
    });

    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
    if (nextBtn) nextBtn.addEventListener('click', showNextImage);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        switch (e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowLeft': showPrevImage(); break;
            case 'ArrowRight': showNextImage(); break;
        }
    });
}

function openLightbox(index) {
    const imageData = galleryImages.find(img => img.index === index);
    if (!imageData) return;

    currentImageIndex = galleryImages.indexOf(imageData);
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function updateLightboxImage() {
    if (galleryImages.length === 0) return;
    const imageData = galleryImages[currentImageIndex];
    lightboxImg.src = imageData.src;
    lightboxImg.alt = imageData.caption;
    lightboxCaption.textContent = imageData.caption;
}

function showPrevImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

function showNextImage() {
    if (galleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

// Touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) showNextImage();
        else showPrevImage();
    }
}

initGallery();

// ===================
// PARALLAX EFFECT (subtle)
// ===================
const heroBackground = document.querySelector('.hero-background');
const quoteBackground = document.querySelector('.quote-background');

if (heroBackground || quoteBackground) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        if (heroBackground) {
            heroBackground.style.transform = `scale(1.1) translateY(${scrolled * 0.3}px)`;
        }

        if (quoteBackground && scrolled > quoteBackground.offsetTop - window.innerHeight) {
            const relativeScroll = scrolled - (quoteBackground.offsetTop - window.innerHeight);
            quoteBackground.style.transform = `translateY(${relativeScroll * 0.2}px)`;
        }
    });
}
