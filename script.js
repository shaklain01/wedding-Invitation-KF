/* ==========================================================================
   KARINA & FAIZAN — WEDDING INVITATION SCRIPT
   ========================================================================== */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // MOBILE PERF: single source of truth for "is this a phone/small touch
  // device" — used to scale back the petal canvas, swap the scrubbed 3D
  // scroll-zoom for a cheap fade, etc. Matches the CSS breakpoints used
  // elsewhere in style.css (max-width: 640px, pointer: coarse) so JS and
  // CSS agree on what counts as "mobile". Desktop behaviour is untouched.
  var isMobile = window.matchMedia(
    "(max-width: 640px), (pointer: coarse)",
  ).matches;

  /* ------------------------------------------------------------------------
     CONFIG — edit here to update details later
     ------------------------------------------------------------------------ */
  var CONFIG = {
    countdownTarget: "2026-11-12T23:00:00+05:30", // Nikah date/time, IST
    mapsUrl: "https://maps.app.goo.gl/nqMJGFaBrrSn5Zwg6", // Add a Google Maps URL here when available, e.g. "https://maps.google.com/?q=..."
  };

  /* ------------------------------------------------------------------------
     OPENING SEQUENCE
     ------------------------------------------------------------------------ */
  var body = document.body;
  var opening = document.getElementById("opening");
  var enterBtn = document.getElementById("enterBtn");
  var doors = document.getElementById("revealDoors");
  var doorLeft = doors.querySelector(".reveal-door--left");
  var doorRight = doors.querySelector(".reveal-door--right");
  var mainSite = document.getElementById("main-site");

  body.classList.add("lock-scroll");
  mainSite.style.visibility = "hidden";
  opening.classList.add("is-active"); // starts the opening reveal animations

  function enterCelebration() {
    enterBtn.disabled = true;
    opening.classList.add("is-hidden");

    // Prepare doors + main site behind the curtain
    mainSite.style.visibility = "visible";
    window.scrollTo(0, 0);

    setTimeout(
      function () {
        doorLeft.classList.add("is-open");
        doorRight.classList.add("is-open");
        var shimmer = document.getElementById("doorShimmer");
        if (shimmer && !prefersReduced) shimmer.classList.add("is-flashing");

        // Trigger the hero background fade-in now (not on page load), so it's
        // actually visible to the person instead of finishing behind the
        // opening screen before they ever see it.
        var heroBg = document.querySelector(".hero__bg");
        if (heroBg) heroBg.classList.add("is-in");
      },
      prefersReduced ? 0 : 250,
    );

    setTimeout(
      function () {
        body.classList.remove("lock-scroll");
        doors.style.display = "none";
        initHeroLetterReveal();
        initScrollAnimations();
        init3DTilt();
        initHeroParallax();
      },
      prefersReduced ? 200 : 1500,
    );
  }

  enterBtn.addEventListener("click", enterCelebration);

  /* ------------------------------------------------------------------------
     FLOATING NAV
     ------------------------------------------------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var navList = document.getElementById("navList");

  navToggle.addEventListener("click", function () {
    var isOpen = navList.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.querySelectorAll("[data-nav]").forEach(function (link) {
    link.addEventListener("click", function () {
      navList.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", function (e) {
    if (!document.getElementById("floatnav").contains(e.target)) {
      navList.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ------------------------------------------------------------------------
     3D TILT + GLARE (desktop pointer only, respects reduced motion)
     ------------------------------------------------------------------------ */
  function init3DTilt() {
    if (prefersReduced || window.matchMedia("(pointer: coarse)").matches)
      return;

    var cards = document.querySelectorAll(
      ".timeline__card, .couple__card, .venue__card",
    );

    cards.forEach(function (card) {
      card.classList.add("tilt-card");

      var glare = document.createElement("div");
      glare.className = "tilt-glare";
      card.appendChild(glare);

      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width; // 0 -> 1
        var y = (e.clientY - rect.top) / rect.height; // 0 -> 1
        var maxTilt = 18;
        var rotY = (x - 0.5) * maxTilt;
        var rotX = (0.5 - y) * maxTilt;

        card.style.transform =
          "perspective(900px) scale3d(1.04,1.04,1.04) rotateX(" +
          rotX +
          "deg) rotateY(" +
          rotY +
          "deg) translateZ(20px)";

        glare.style.opacity = "0.55";
        glare.style.background =
          "radial-gradient(circle at " +
          x * 100 +
          "% " +
          y * 100 +
          "%, rgba(255,255,255,0.65), transparent 55%)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform =
          "perspective(900px) scale3d(1,1,1) rotateX(0) rotateY(0) translateZ(0)";
        glare.style.opacity = "0";
      });
    });
  }

  /* ------------------------------------------------------------------------
     HERO MOUSE PARALLAX (layered depth illusion)
     ------------------------------------------------------------------------ */
  function initHeroParallax() {
    var hero = document.getElementById("hero");
    if (
      !hero ||
      prefersReduced ||
      window.matchMedia("(pointer: coarse)").matches
    )
      return;

    var glow = hero.querySelector(".hero__glow");
    if (glow) glow.classList.add("js-parallax");
    var names = hero.querySelector(".hero__names");
    var message = hero.querySelector(".hero__message");

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 -> 0.5
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      if (glow)
        glow.style.transform =
          "translate(" + (-50 + x * 12) + "%, " + y * 10 + "%)";
      if (names)
        names.style.transform =
          "translate3d(" + x * 14 + "px, " + y * 10 + "px, 40px)";
      if (message)
        message.style.transform =
          "translate3d(" + x * 7 + "px, " + y * 5 + "px, 20px)";
    });

    hero.addEventListener("mouseleave", function () {
      if (glow) glow.style.transform = "";
      if (names) names.style.transform = "";
      if (message) message.style.transform = "";
    });
  }

  /* ------------------------------------------------------------------------
     HERO NAME LETTER REVEAL
     ------------------------------------------------------------------------ */
  function initHeroLetterReveal() {
    var names = document.querySelectorAll(".hero__name");
    names.forEach(function (nameEl) {
      var text = nameEl.textContent;
      nameEl.textContent = "";
      nameEl.setAttribute("aria-label", text);
      text.split("").forEach(function (ch, idx) {
        var span = document.createElement("span");
        span.className = "letter-in";
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.animationDelay = prefersReduced ? "0s" : idx * 0.035 + "s";
        span.setAttribute("aria-hidden", "true");
        nameEl.appendChild(span);
      });
    });
  }

  /* ------------------------------------------------------------------------
     SCROLL REVEAL ANIMATIONS (GSAP ScrollTrigger, with IO fallback)
     ------------------------------------------------------------------------ */
  function initScrollAnimations() {
    var revealEls = document.querySelectorAll(".reveal-up");
    var zoomEls = document.querySelectorAll(".zoom-in");

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      revealEls.forEach(function (el) {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: prefersReduced ? 0.01 : 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      // Scroll-scrubbed 3D zoom: cards/headings grow from small+distant to
      // full size, tied directly to scroll position (reverses on scroll up)
      zoomEls.forEach(function (el) {
        if (prefersReduced) {
          gsap.set(el, { opacity: 1, scale: 1, y: 0, z: 0 });
          return;
        }

        // MOBILE PERF: the scrubbed perspective/scale/translateZ zoom below
        // recalculates a 3D transform on every scroll tick, which is heavy
        // on mobile GPUs/CPUs. On phones and touch devices, swap it for a
        // one-shot, lightweight fade + small translateY that plays once
        // (no scrub), so it never taxes the scroll thread. Explicitly
        // pinning scale/z to 1/0 also cancels out the perspective 3D base
        // state that .zoom-in sets in CSS. Desktop keeps the original
        // scrub-driven 3D zoom, completely unchanged.
        if (isMobile) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24, scale: 1, z: 0 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              z: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                toggleActions: "play none none none",
              },
            },
          );
          return;
        }

        gsap.fromTo(
          el,
          {
            opacity: 0,
            scale: 0.62,
            y: 70,
            z: -160,
            transformPerspective: 800,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            z: 0,
            transformPerspective: 800,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              end: "top 45%",
              scrub: 0.4,
            },
          },
        );
      });

      // Timeline fill progress — animates transform:scaleY (compositor-only)
      // instead of the CSS `height` property, so the browser never has to
      // recalculate layout on every scroll tick. Same visual result, far
      // cheaper on both desktop and mobile.
      var timelineWrap = document.getElementById("timelineWrap");
      var timelineFill = document.getElementById("timelineFill");
      if (timelineWrap && timelineFill) {
        gsap.to(timelineFill, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineWrap,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        });
      }
    } else {
      // Fallback: IntersectionObserver (no scrub support, simple fade/scale in)
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
      zoomEls.forEach(function (el) {
        io.observe(el);
      });
    }

    // Section-title underline draw — independent of the above, so it never
    // conflicts with GSAP's scrub-driven inline transforms
    var underlineIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("underline-on");
            underlineIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    document.querySelectorAll(".section-title").forEach(function (el) {
      underlineIO.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     COUNTDOWN
     ------------------------------------------------------------------------ */
  function initCountdown() {
    var grid = document.getElementById("countdownGrid");
    var doneEl = document.getElementById("countdownDone");
    if (!grid) return;

    var target = new Date(CONFIG.countdownTarget).getTime();
    var elDays = document.getElementById("cd-days");
    var elHours = document.getElementById("cd-hours");
    var elMinutes = document.getElementById("cd-minutes");
    var elSeconds = document.getElementById("cd-seconds");

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function setDigit(el, value) {
      if (el.textContent === value) return;
      el.textContent = value;
      if (prefersReduced) return;
      el.classList.remove("is-flipping");
      // Force reflow so the animation can restart
      void el.offsetWidth;
      el.classList.add("is-flipping");
    }

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

      setDigit(elDays, pad(days));
      setDigit(elHours, pad(hours));
      setDigit(elMinutes, pad(minutes));
      setDigit(elSeconds, pad(seconds));
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------------
     MAP LINK (config-driven, no fake coordinates)
     ------------------------------------------------------------------------ */
  function initMapLink() {
    var link = document.getElementById("mapLink");
    var text = document.getElementById("mapLinkText");
    if (!link) return;

    if (CONFIG.mapsUrl) {
      link.href = CONFIG.mapsUrl;
      text.textContent = "View on Google Maps";
    } else {
      link.removeAttribute("href");
      link.style.cursor = "default";
      link.addEventListener("click", function (e) {
        e.preventDefault();
      });
    }
  }

  /* ------------------------------------------------------------------------
     PETAL RAIN — realistic falling flower petals across the whole page.
     Each petal is a tapered, curved almond shape (drawn with bezier curves,
     not a plain ellipse). On desktop it's additionally shaded with a soft
     gradient + a faint centre vein and a light drop-shadow for depth, with
     two visual depth layers (near/far) for parallax.

     MOBILE PERF:
     - Far fewer petals (6–8 vs 24).
     - No shadowBlur/shadowOffset (forces an expensive blur pass per shape
       per frame) and no ctx.filter blur (frequently falls back to a slow
       software path on mobile browsers) — mobile petals are drawn as a
       single flat/solid fill instead.
     - Per-petal gradients are created ONCE at spawn time and cached on the
       petal object, never recreated inside the per-frame draw loop — this
       benefits desktop too, since createLinearGradient() is real work.
     - Canvas backing resolution is capped at 1x DPR on mobile (vs up to 2x)
       to cut raw pixel fill-rate, the single biggest canvas cost on phones.
     - The rAF loop is fully paused via the Page Visibility API whenever the
       tab/app is backgrounded, and resumed on return, so it never burns
       battery/CPU while the person isn't looking at the page.
     Disabled entirely under prefers-reduced-motion. Canvas is
     position:fixed + pointer-events:none (see CSS), so none of this ever
     affects scroll/layout.
     ------------------------------------------------------------------------ */
  function initPetalRain() {
    var canvas = document.getElementById("particle-canvas");
    if (!canvas || prefersReduced) return;
    var ctx = canvas.getContext("2d");
    var petals = [];
    var count = isMobile ? 7 : 24;
    // warm blush / cream / champagne tones, each as [light, mid, dark] for shading
    var palettes = [
      ["#fbe6d8", "#eec3ab", "#cf9a7c"], // blush pink
      ["#fbeee0", "#f0d9bd", "#cdaa7d"], // cream-gold
      ["#f8ece3", "#e7c9b6", "#b98f6f"], // dusty rose-beige
      ["#f4e2c8", "#e0bd7a", "#a3854f"], // gold accent (matches --gold)
    ];
    var w, h, dpr;
    var rafId = null;

    function resize() {
      dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Gradient is built once per petal (local coordinates are always the
    // same relative span since we translate/rotate before drawing), so this
    // never runs inside the animation loop.
    function makeGradient(palette, size) {
      var grad = ctx.createLinearGradient(0, -size, 0, size);
      grad.addColorStop(0, palette[0]);
      grad.addColorStop(0.55, palette[1]);
      grad.addColorStop(1, palette[2]);
      return grad;
    }

    function makePetal(startAbove) {
      var layer = Math.random() < 0.5 ? "near" : "far";
      var isNear = layer === "near";
      var palette = palettes[Math.floor(Math.random() * palettes.length)];
      var size = isNear
        ? Math.random() * 6 + 10 // 10 - 16 px (foreground, bigger)
        : Math.random() * 4 + 5; // 5 - 9 px (background, smaller)
      return {
        x: Math.random() * w,
        y: startAbove ? -30 - Math.random() * h * 0.4 : Math.random() * h,
        size: size,
        fallSpeed: isNear
          ? Math.random() * 0.5 + 0.55
          : Math.random() * 0.3 + 0.25,
        swayAmp: Math.random() * 26 + 10,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.01 + 0.006,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        tumble: Math.random() * Math.PI * 2, // simulates tumbling end-over-end
        tumbleSpeed: Math.random() * 0.05 + 0.02,
        palette: palette,
        // On mobile we skip the gradient entirely and just fill with the
        // mid tone — one solid fillStyle, no gradient object at all.
        grad: isMobile ? null : makeGradient(palette, size),
        alpha: isNear
          ? Math.random() * 0.22 + 0.55
          : Math.random() * 0.18 + 0.22,
        layer: layer,
      };
    }
    for (var i = 0; i < count; i++) petals.push(makePetal(false));

    // Draw one tapered, curved petal shape (almond-ish with a pinched base)
    // pointing "up" before rotation is applied, centred on origin.
    function drawPetalShape(ctx2, size) {
      var len = size * 1.9;
      var wide = size * 1.05;
      ctx2.beginPath();
      ctx2.moveTo(0, -len * 0.55); // tip
      ctx2.bezierCurveTo(
        wide * 0.9,
        -len * 0.25,
        wide * 0.75,
        len * 0.32,
        0,
        len * 0.5,
      ); // right edge down to base
      ctx2.bezierCurveTo(
        -wide * 0.75,
        len * 0.32,
        -wide * 0.9,
        -len * 0.25,
        0,
        -len * 0.55,
      ); // left edge back to tip
      ctx2.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // background (far) layer first, then near layer, for correct depth stacking
      ["far", "near"].forEach(function (layerName) {
        petals.forEach(function (p) {
          if (p.layer !== layerName) return;

          // tumble squashes the petal's apparent width to fake end-over-end rotation
          var squash = Math.max(0.18, Math.abs(Math.cos(p.tumble)));

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(squash, 1);

          drawPetalShape(ctx, p.size);

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.grad || p.palette[1];

          if (!isMobile) {
            ctx.shadowColor = "rgba(74, 14, 24, 0.18)";
            ctx.shadowBlur = p.layer === "near" ? 5 : 2;
            ctx.shadowOffsetY = 1.5;
          }
          ctx.fill();

          // faint centre vein for texture — desktop only, one extra stroke
          // per petal per frame that mobile skips entirely.
          if (!isMobile) {
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalAlpha = p.alpha * 0.5;
            ctx.strokeStyle = p.palette[2];
            ctx.lineWidth = Math.max(0.4, p.size * 0.045);
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 1.0);
            ctx.lineTo(0, p.size * 0.85);
            ctx.stroke();
          }

          ctx.restore();

          // -- advance motion --
          p.y += p.fallSpeed;
          p.swayPhase += p.swaySpeed;
          p.x += Math.sin(p.swayPhase) * (p.swayAmp * 0.018);
          p.rotation += p.rotationSpeed;
          p.tumble += p.tumbleSpeed;

          if (p.y > h + 30) {
            var fresh = makePetal(true);
            Object.assign(p, fresh);
          }
        });
      });

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    // Pause the render loop entirely when the tab/app is backgrounded
    // (switched app, screen locked, minimised) so it costs nothing while
    // nobody can see it, and pick back up cleanly when it returns.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (rafId === null) {
        rafId = requestAnimationFrame(draw);
      }
    });
  }

  /* ------------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initCountdown();
    initMapLink();
    initPetalRain();

    // In case JS runs after user already scrolled past opening (edge case)
    if (prefersReduced) {
      document.querySelectorAll(".reveal-up").forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    }
  });
})();
