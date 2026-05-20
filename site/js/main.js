/* ============================================================
   LITTLEFIELD MANOR — Main JavaScript
   GSAP + ScrollTrigger animations, nav, mobile menu
   ============================================================ */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/* ---------- NAVIGATION ---------- */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

// Subtle depth on scroll (stays green — see CSS)
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}, { passive: true });

// Mobile menu toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    });
});

/* ---------- SCROLL REVEAL ANIMATIONS ---------- */
gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
});

gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
});

gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
});

gsap.utils.toArray('.reveal-scale').forEach(el => {
    gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
});

gsap.utils.toArray('.stagger-children').forEach(parent => {
    const children = parent.querySelectorAll(':scope > *');
    gsap.from(children, {
        opacity: 0,
        y: 24,
        duration: 0.65,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: parent, start: 'top 85%', once: true }
    });
});

/* ---------- HERO ENTRANCE ---------- */
const heroEyebrow = document.querySelector('.hero-eyebrow-wrap');
if (heroEyebrow) {
    const tl = gsap.timeline({ delay: 0.25 });
    tl.from('.hero-eyebrow-wrap', { opacity: 0, y: 18, duration: 0.7, ease: 'power2.out' })
      .from('.hero-title-top',    { opacity: 0, y: 36, duration: 0.85, ease: 'power2.out' }, '-=0.4')
      .from('.hero-title-bottom', { opacity: 0, y: 36, duration: 0.85, ease: 'power2.out' }, '-=0.65')
      .from('.hero-bottom-wrap',  { opacity: 0, y: 22, duration: 0.7,  ease: 'power2.out' }, '-=0.4');
}

/* ---------- STATS COUNT-UP ---------- */
const statNumbers = document.querySelectorAll('.stat-number');
if (statNumbers.length) {
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    statNumbers.forEach(el => {
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return; // skip stars / non-numeric

        const suffix = raw.replace(/[0-9.]/g, ''); // e.g. "+" or ""
        let triggered = false;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !triggered) {
                triggered = true;
                observer.disconnect();
                let startTime = null;
                const duration = 1500;

                const step = timestamp => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const eased = easeOutQuart(progress);
                    el.textContent = Math.floor(eased * num) + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.5 });

        observer.observe(el);
    });
}

/* ---------- TRUST BAR ITEMS ---------- */
const trustItems = document.querySelectorAll('.trust-item');
if (trustItems.length) {
    gsap.from(trustItems, {
        opacity: 0, y: 12, duration: 0.5, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.trust-bar', start: 'top 90%', once: true }
    });
}

/* ---------- PRICE ROWS ---------- */
const priceRows = document.querySelectorAll('.price-row');
if (priceRows.length) {
    gsap.from(priceRows, {
        opacity: 0, x: -20, duration: 0.5, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.price-table', start: 'top 85%', once: true }
    });
}

/* ---------- GALLERY 3D TILT ---------- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.gallery-full .gallery-item').forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;

        item.addEventListener('mousemove', e => {
            const r = item.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width  - 0.5;
            const y = (e.clientY - r.top)  / r.height - 0.5;
            item.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
            item.style.zIndex = '2';
            item.style.transition = 'transform 0.1s cubic-bezier(0.25, 0, 0, 1)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
            item.style.zIndex = '';
            item.style.transition = 'transform 0.4s cubic-bezier(0.25, 0, 0, 1)';
        });
    });
}

/* ---------- GALLERY LIGHTBOX (with prev/next) ---------- */
const galleryItems = document.querySelectorAll('.gallery-full .gallery-item img');
if (galleryItems.length) {
    let currentIndex = 0;
    const imgs = Array.from(galleryItems);

    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div class="lb-backdrop"></div>
        <span class="lb-counter"></span>
        <button class="lb-close" aria-label="Close">×</button>
        <button class="lb-nav lb-prev" aria-label="Previous">&#8592;</button>
        <img class="lb-img" src="" alt="">
        <button class="lb-nav lb-next" aria-label="Next">&#8594;</button>
    `;
    lightbox.style.cssText = 'display:none; position:fixed; inset:0; z-index:200; align-items:center; justify-content:center;';
    document.body.appendChild(lightbox);

    const lbBackdrop = lightbox.querySelector('.lb-backdrop');
    const lbImg      = lightbox.querySelector('.lb-img');
    const lbClose    = lightbox.querySelector('.lb-close');
    const lbPrev     = lightbox.querySelector('.lb-prev');
    const lbNext     = lightbox.querySelector('.lb-next');
    const lbCounter  = lightbox.querySelector('.lb-counter');

    lbBackdrop.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.92); cursor:pointer;';
    lbImg.style.cssText      = 'position:relative; z-index:1; max-width:88vw; max-height:86vh; object-fit:contain; border-radius:8px; transition:opacity 0.2s ease;';
    lbClose.style.cssText    = 'position:absolute; top:1.5rem; right:2rem; color:white; font-size:2.5rem; z-index:4; cursor:pointer; background:none; border:none; line-height:1; opacity:0.7; transition:opacity 0.2s;';
    lbClose.addEventListener('mouseover', () => lbClose.style.opacity = '1');
    lbClose.addEventListener('mouseout',  () => lbClose.style.opacity = '0.7');

    const showImage = index => {
        currentIndex = (index + imgs.length) % imgs.length;
        lbImg.style.opacity = '0';
        setTimeout(() => {
            lbImg.src = imgs[currentIndex].src;
            lbImg.alt = imgs[currentIndex].alt;
            lbImg.style.opacity = '1';
        }, 120);
        lbCounter.textContent = `${currentIndex + 1} / ${imgs.length}`;
    };

    const openLightbox = index => {
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' });
        showImage(index);
    };

    const closeLightbox = () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        lbImg.src = '';
    };

    imgs.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));

    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => showImage(currentIndex - 1));
    lbNext.addEventListener('click', () => showImage(currentIndex + 1));

    document.addEventListener('keydown', e => {
        if (lightbox.style.display !== 'flex') return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
}

/* ---------- HOMEPAGE GALLERY LIGHTBOX (preview grid) ---------- */
const previewImgs = document.querySelectorAll('.gallery-grid img');
if (previewImgs.length) {
    const lightboxP = document.createElement('div');
    lightboxP.innerHTML = `
        <div class="lb-backdrop"></div>
        <button class="lb-close" aria-label="Close">×</button>
        <img class="lb-img" src="" alt="">
    `;
    lightboxP.style.cssText = 'display:none; position:fixed; inset:0; z-index:200; align-items:center; justify-content:center;';
    document.body.appendChild(lightboxP);

    const pBackdrop = lightboxP.querySelector('.lb-backdrop');
    const pImg      = lightboxP.querySelector('.lb-img');
    const pClose    = lightboxP.querySelector('.lb-close');

    pBackdrop.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.92); cursor:pointer;';
    pImg.style.cssText      = 'position:relative; z-index:1; max-width:88vw; max-height:86vh; object-fit:contain; border-radius:8px;';
    pClose.style.cssText    = 'position:absolute; top:1.5rem; right:2rem; color:white; font-size:2.5rem; z-index:4; cursor:pointer; background:none; border:none; line-height:1; opacity:0.7;';

    previewImgs.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            pImg.src = img.src;
            lightboxP.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    [pClose, pBackdrop].forEach(el => el.addEventListener('click', () => {
        lightboxP.style.display = 'none';
        document.body.style.overflow = '';
    }));

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && lightboxP.style.display === 'flex') {
            lightboxP.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

/* ---------- CONTACT FORM ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        btn.textContent = 'Sent! Linda will be in touch soon.';
        btn.style.background = '#2a7c47';
        btn.disabled = true;
    });
}

/* ---------- PREFERS REDUCED MOTION ---------- */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(10);
    ScrollTrigger.getAll().forEach(st => st.kill());
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
    });
}
