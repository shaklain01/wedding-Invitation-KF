/* ==========================================================================
   KARINA & FAIZAN — WEDDING INVITATION SCRIPT
   ========================================================================== */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     CONFIG — edit here to update details later
     ------------------------------------------------------------------------ */
  var CONFIG = {
    countdownTarget: '2026-11-12T23:00:00+05:30', // Nikah date/time, IST
    mapsUrl: 'https://www.google.com/maps/place/(%D9%85%D8%B3%D8%AC%D8%AF+%D8%B9%D9%85%D8%B1+)MASJID+E+UMAR%E2%80%AD/@24.0212127,85.3126037,3029m/data=!3m1!1e3!4m10!1m2!2m1!1sRomi+Hazaribagh+umar+masjid!3m6!1s0x39f49fac9cbed1af:0x213f8c53846a620c!8m2!3d24.0212476!4d85.3316749!15sChtSb21pIEhhemFyaWJhZ2ggdW1hciBtYXNqaWSSAQZtb3NxdWXgAQA!16s%2Fg%2F11mb_gmcc_?entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D' // Add a Google Maps URL here when available, e.g. "https://maps.google.com/?q=..."
  };

  /* ------------------------------------------------------------------------
     OPENING SEQUENCE
     ------------------------------------------------------------------------ */
  var body = document.body;
  var opening = document.getElementById('opening');
  var enterBtn = document.getElementById('enterBtn');
  var doors = document.getElementById('revealDoors');
  var doorLeft = doors.querySelector('.reveal-door--left');
  var doorRight = doors.querySelector('.reveal-door--right');
  var mainSite = document.getElementById('main-site');

  body.classList.add('lock-scroll');
  mainSite.style.visibility = 'hidden';
  opening.classList.add('is-active'); // starts the opening reveal animations

  function enterCelebration() {
    enterBtn.disabled = true;
    opening.classList.add('is-hidden');

    // Prepare doors + main site behind the curtain
    mainSite.style.visibility = 'visible';
    window.scrollTo(0, 0);

    setTimeout(function () {
      doorLeft.classList.add('is-open');
      doorRight.classList.add('is-open');
    }, prefersReduced ? 0 : 250);

    setTimeout(function () {
      body.classList.remove('lock-scroll');
      doors.style.display = 'none';
      initScrollAnimations();
    }, prefersReduced ? 200 : 1500);
  }

  enterBtn.addEventListener('click', enterCelebration);

  /* ------------------------------------------------------------------------
     FLOATING NAV
     ------------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var navList = document.getElementById('navList');

  navToggle.addEventListener('click', function () {
    var isOpen = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.querySelectorAll('[data-nav]').forEach(function (link) {
    link.addEventListener('click', function () {
      navList.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', function (e) {
    if (!document.getElementById('floatnav').contains(e.target)) {
      navList.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ------------------------------------------------------------------------
     SCROLL REVEAL ANIMATIONS (GSAP ScrollTrigger, with IO fallback)
     ------------------------------------------------------------------------ */
  function initScrollAnimations() {
    var revealEls = document.querySelectorAll('.reveal-up');

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      revealEls.forEach(function (el, i) {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: prefersReduced ? 0.01 : 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        });
      });

      // Timeline fill progress
      var timelineWrap = document.getElementById('timelineWrap');
      var timelineFill = document.getElementById('timelineFill');
      if (timelineWrap && timelineFill) {
        gsap.to(timelineFill, {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: timelineWrap,
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: 0.6
          }
        });
      }
    } else {
      // Fallback: IntersectionObserver
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------------------------
     COUNTDOWN
     ------------------------------------------------------------------------ */
  function initCountdown() {
    var grid = document.getElementById('countdownGrid');
    var doneEl = document.getElementById('countdownDone');
    if (!grid) return;

    var target = new Date(CONFIG.countdownTarget).getTime();
    var elDays = document.getElementById('cd-days');
    var elHours = document.getElementById('cd-hours');
    var elMinutes = document.getElementById('cd-minutes');
    var elSeconds = document.getElementById('cd-seconds');

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var now = Date.now();
      var diff = target - now;

      if (diff <= 0) {
        grid.hidden = true;
        doneEl.hidden = false;
        clearInterval(timer);
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var minutes = Math.floor((diff % 3600000) / 60000);
      var seconds = Math.floor((diff % 60000) / 1000);

      elDays.textContent = pad(days);
      elHours.textContent = pad(hours);
      elMinutes.textContent = pad(minutes);
      elSeconds.textContent = pad(seconds);
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------------
     MAP LINK (config-driven, no fake coordinates)
     ------------------------------------------------------------------------ */
  function initMapLink() {
    var link = document.getElementById('mapLink');
    var text = document.getElementById('mapLinkText');
    if (!link) return;

    if (CONFIG.mapsUrl) {
      link.href = CONFIG.mapsUrl;
      text.textContent = 'View on Google Maps';
    } else {
      link.removeAttribute('href');
      link.style.cursor = 'default';
      link.addEventListener('click', function (e) { e.preventDefault(); });
    }
  }

  /* ------------------------------------------------------------------------
     GOLD PARTICLES (lightweight canvas, disabled under reduced motion)
     ------------------------------------------------------------------------ */
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas || prefersReduced) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var count = window.innerWidth < 640 ? 22 : 40;
    var w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function makeParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.25 + 0.05,
        drift: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.1
      };
    }
    for (var i = 0; i < count; i++) particles.push(makeParticle());

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201, 163, 92, ' + p.alpha + ')';
        ctx.fill();

        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ------------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initMapLink();
    initParticles();

    // In case JS runs after user already scrolled past opening (edge case)
    if (prefersReduced) {
      document.querySelectorAll('.reveal-up').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  });
})();
