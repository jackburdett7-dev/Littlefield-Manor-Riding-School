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

/* ---------- FULL GALLERY (3D tilt + lightbox) ----------
   Exposed as window.initLittlefieldGallery() so it can be (re)run after
   gallery.js injects photos from Supabase. Idempotent — safe to call again. */
window.initLittlefieldGallery = (function () {
    let lightbox, lbImg, lbCounter;
    let imgs = [];
    let currentIndex = 0;
    let wired = false;

    function showImage(index) {
        currentIndex = (index + imgs.length) % imgs.length;
        lbImg.style.opacity = '0';
        setTimeout(() => {
            lbImg.src = imgs[currentIndex].src;
            lbImg.alt = imgs[currentIndex].alt;
            lbImg.style.opacity = '1';
        }, 120);
        lbCounter.textContent = `${currentIndex + 1} / ${imgs.length}`;
    }

    function openLightbox(index) {
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (window.gsap) gsap.fromTo(lightbox, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' });
        showImage(index);
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        lbImg.src = '';
    }

    function buildLightbox() {
        lightbox = document.createElement('div');
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
        lbImg     = lightbox.querySelector('.lb-img');
        lbCounter = lightbox.querySelector('.lb-counter');
        const lbClose = lightbox.querySelector('.lb-close');
        const lbPrev  = lightbox.querySelector('.lb-prev');
        const lbNext  = lightbox.querySelector('.lb-next');

        lbBackdrop.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.92); cursor:pointer;';
        lbImg.style.cssText      = 'position:relative; z-index:1; max-width:88vw; max-height:86vh; object-fit:contain; border-radius:8px; transition:opacity 0.2s ease;';
        lbClose.style.cssText    = 'position:absolute; top:1.5rem; right:2rem; color:white; font-size:2.5rem; z-index:4; cursor:pointer; background:none; border:none; line-height:1; opacity:0.7; transition:opacity 0.2s;';
        lbClose.addEventListener('mouseover', () => lbClose.style.opacity = '1');
        lbClose.addEventListener('mouseout',  () => lbClose.style.opacity = '0.7');

        lbClose.addEventListener('click', closeLightbox);
        lbBackdrop.addEventListener('click', closeLightbox);
        lbPrev.addEventListener('click', () => showImage(currentIndex - 1));
        lbNext.addEventListener('click', () => showImage(currentIndex + 1));

        document.addEventListener('keydown', e => {
            if (!lightbox || lightbox.style.display !== 'flex') return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
            if (e.key === 'ArrowRight') showImage(currentIndex + 1);
        });

        wired = true;
    }

    return function initLittlefieldGallery() {
        const items = document.querySelectorAll('.gallery-full .gallery-item');
        if (!items.length) return;

        /* 3D tilt — desktop pointers only */
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            items.forEach(item => {
                if (item.dataset.tiltBound) return;
                const img = item.querySelector('img');
                if (!img) return;
                item.dataset.tiltBound = '1';
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

        /* Lightbox — rebuild the image list each call so it tracks injected photos */
        imgs = Array.from(document.querySelectorAll('.gallery-full .gallery-item img'));
        if (!imgs.length) return;
        if (!wired) buildLightbox();
        imgs.forEach((img, i) => {
            if (img.dataset.lbBound) return;
            img.dataset.lbBound = '1';
            img.addEventListener('click', () => openLightbox(i));
        });
    };
})();

/* Bind any statically-rendered gallery immediately (no-op elsewhere).
   On gallery.html, gallery.js calls this again after loading Supabase photos. */
window.initLittlefieldGallery();

/* ---------- STICKY MOBILE ACTION BAR ---------- */
(function () {
    if (document.querySelector('.mobile-action-bar')) return;
    var bar = document.createElement('div');
    bar.className = 'mobile-action-bar';
    bar.setAttribute('aria-label', 'Quick contact');
    bar.innerHTML =
        '<a href="tel:07973302316" class="mab-btn">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.49 2 2 0 0 1 3.57 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.09-1.09a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
            'Call' +
        '</a>' +
        '<a href="https://wa.me/447973302316" target="_blank" rel="noopener" class="mab-btn mab-wa">' +
            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>' +
            'WhatsApp' +
        '</a>' +
        '<a href="contact.html" class="mab-btn mab-book">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
            'Book a Lesson' +
        '</a>';
    document.body.appendChild(bar);
}());

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

/* ---------- PREFERS REDUCED MOTION ---------- */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(10);
    ScrollTrigger.getAll().forEach(st => st.kill());
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
    });
}
