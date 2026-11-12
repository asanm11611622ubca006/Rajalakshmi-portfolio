/* ============================================================
   RAJALAKSHMI R — PORTFOLIO INTERACTIVITY & GSAP MOTION
   Follows motion.csv principles: compositor-only, quickTo hover,
   ScrollTrigger reveals, & prefers-reduced-motion support.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ==================== 1. MOBILE NAV & SCROLL PROGRESS ====================
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const progressBar = document.getElementById('scrollProgressBar');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('is-open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!progressBar) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    },
    { passive: true }
  );

  // ==================== 2. LIGHT-THEME NEURAL CANVAS ====================
  const canvas = document.getElementById('bgCanvas');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (canvas && !reducedMotionQuery.matches) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animFrameId = null;

    const nodeCount = Math.min(54, Math.floor(width / 28));
    const palette = ['rgba(129, 140, 248, 0.6)', 'rgba(45, 212, 191, 0.55)', 'rgba(192, 132, 252, 0.5)'];
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.2 + 1.5,
      color: palette[i % palette.length],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 155) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - dist / 155) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else {
        draw();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);
  }

  // ==================== 3. GSAP & SCROLLTRIGGER MOTION ====================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Hero Stagger Entrance
      gsap.from('.hero-anim', {
        opacity: 0,
        y: 26,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform',
      });

      // Parallax Background Blobs (Subtle continuous scroll depth)
      gsap.utils.toArray('.parallax-layer').forEach((layer, idx) => {
        gsap.to(layer, {
          yPercent: (idx + 1) * -12,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        });
      });

      // Helper: reliable IntersectionObserver runner so no section ever gets stuck hidden
      const onEnter = (selector, callback, threshold = 0.12) => {
        const els = document.querySelectorAll(selector);
        if (!els.length) return;
        const obs = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              callback(entry.target);
              observer.unobserve(entry.target);
            });
          },
          { threshold, rootMargin: '0px 0px -30px 0px' }
        );
        els.forEach((el) => obs.observe(el));
      };

      // PAGE 1 (#hero): Continuous Scroll Parallax on Portrait Stage
      gsap.to('.portrait-stage', {
        y: -36,
        scale: 0.96,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      });

      // PAGE 2 (#about): Opposing Horizontal Split Slide + Timeline Pop
      onEnter('#about', (sec) => {
        const header = sec.querySelector('.section-header');
        const aboutCard = sec.querySelector('.about-card');
        const eduCard = sec.querySelector('.edu-card');
        const timelineItems = sec.querySelectorAll('.timeline__item');

        if (header) {
          gsap.fromTo(header, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
        if (aboutCard) {
          gsap.fromTo(aboutCard, { opacity: 0, x: -65 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' });
        }
        if (eduCard) {
          gsap.fromTo(eduCard, { opacity: 0, x: 65 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' });
        }
        if (timelineItems.length) {
          gsap.fromTo(
            timelineItems,
            { opacity: 0, x: 25, scale: 0.92 },
            { opacity: 1, x: 0, scale: 1, duration: 0.5, stagger: 0.14, delay: 0.2, ease: 'back.out(1.4)', clearProps: 'transform,opacity' }
          );
        }
      });

      // PAGE 3 (#skills): 3D Perspective Flip-In + Animated Skill Bars
      onEnter('#skills', (sec) => {
        const header = sec.querySelector('.section-header');
        const filters = sec.querySelector('.skill-filters');
        const cards = sec.querySelectorAll('.skill-card');
        const fills = sec.querySelectorAll('.skill-meter__fill');

        if (header) {
          gsap.fromTo(header, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
        if (filters) {
          gsap.fromTo(filters, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.1, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
        if (cards.length) {
          gsap.fromTo(
            cards,
            { opacity: 0, rotateX: -28, y: 36, transformPerspective: 900 },
            { opacity: 1, rotateX: 0, y: 0, duration: 0.65, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity' }
          );
        }
        if (fills.length) {
          gsap.fromTo(
            fills,
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 1.0, stagger: 0.08, delay: 0.25, ease: 'power2.out', clearProps: 'transform' }
          );
        }
      });

      // PAGE 4 (#experience): Kinetic Skewed Rise + Cascading Bullet Points
      onEnter('#experience', (sec) => {
        const header = sec.querySelector('.section-header');
        const cards = sec.querySelectorAll('.exp-card');
        const bullets = sec.querySelectorAll('.exp-list li');

        if (header) {
          gsap.fromTo(header, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
        if (cards.length) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 48, skewY: 3 },
            { opacity: 1, y: 0, skewY: 0, duration: 0.7, stagger: 0.18, ease: 'power3.out', clearProps: 'transform,opacity' }
          );
        }
        if (bullets.length) {
          gsap.fromTo(
            bullets,
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, delay: 0.3, ease: 'power2.out', clearProps: 'transform,opacity' }
          );
        }
      });

      // PAGE 5 (#projects): Alternating Tilt Elastic Pop-In
      onEnter('#projects', (sec) => {
        const header = sec.querySelector('.section-header');
        const cards = sec.querySelectorAll('.project-card');

        if (header) {
          gsap.fromTo(header, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
        cards.forEach((card, i) => {
          const tilt = i % 2 === 0 ? -3 : 3;
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.88, rotate: tilt, y: 40 },
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              y: 0,
              duration: 0.7,
              delay: i * 0.12,
              ease: 'back.out(1.45)',
              clearProps: 'transform,opacity',
            }
          );
        });
      });

      // PAGE 6A (#certificates): 3D Fan-Out Deck Cascade + Honor Banner Rise
      onEnter('#certificates', (sec) => {
        const header = sec.querySelector('.section-header');
        const certs = sec.querySelectorAll('.cert-card');
        const banner = sec.querySelector('.honor-banner');

        if (header) {
          gsap.fromTo(header, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
        if (certs.length) {
          gsap.fromTo(
            certs,
            { opacity: 0, rotateY: 22, y: 36, scale: 0.94, transformPerspective: 1000 },
            { opacity: 1, rotateY: 0, y: 0, scale: 1, duration: 0.75, stagger: 0.14, ease: 'power3.out', clearProps: 'transform,opacity' }
          );
        }
        if (banner) {
          gsap.fromTo(banner, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
      });

      // PAGE 6B (#contact): Iris Scale-Up Reveal + Staggered Contact Rows
      onEnter('#contact', (sec) => {
        const box = sec.querySelector('.contact-box');
        const items = sec.querySelectorAll('.contact-item');

        if (box) {
          gsap.fromTo(box, { opacity: 0, scale: 0.93, y: 36 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity' });
        }
        if (items.length) {
          gsap.fromTo(
            items,
            { opacity: 0, x: -24 },
            { opacity: 1, x: 0, duration: 0.45, stagger: 0.1, delay: 0.25, ease: 'power2.out', clearProps: 'transform,opacity' }
          );
        }
      });

      // Animated Stat Counters
      const counterObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const numEl = entry.target;
            const target = Number(numEl.dataset.target || 0);
            const counter = { val: 0 };
            gsap.to(counter, {
              val: target,
              duration: 1.3,
              ease: 'power2.out',
              onUpdate: () => {
                numEl.textContent = Math.round(counter.val);
              },
            });
            obs.unobserve(numEl);
          });
        },
        { threshold: 0.2 }
      );

      document.querySelectorAll('.stat-number').forEach((numEl) => {
        counterObserver.observe(numEl);
      });

      // Magnetic Buttons (clamped pull)
      document.querySelectorAll('.magnetic').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });

        const onMove = (e) => {
          const rect = btn.getBoundingClientRect();
          const dx = (e.clientX - rect.left - rect.width / 2) * 0.22;
          const dy = (e.clientY - rect.top - rect.height / 2) * 0.22;
          xTo(dx);
          yTo(dy);
        };

        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        btn.addEventListener('pointermove', onMove);
        btn.addEventListener('pointerleave', onLeave);
      });

      // 3D Hover Lift for Cards (avoids quickTo 'scale' warning)
      document.querySelectorAll('.tilt-card').forEach((card) => {
        card.addEventListener('pointerenter', () => {
          gsap.to(card, {
            y: -6,
            scale: 1.015,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
        card.addEventListener('pointerleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      });
    });

    // Reduced-motion fallback: ensure stat numbers render immediately
    mm.add('(prefers-reduced-motion: reduce)', () => {
      document.querySelectorAll('.stat-number').forEach((numEl) => {
        numEl.textContent = numEl.dataset.target || '0';
      });
    });
  }

  // ==================== 4. SKILL CATEGORY FILTER ====================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('#skillsGrid .skill-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      skillCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
      });

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });

  // ==================== 5. PROJECT DETAIL MODAL ====================
  const projectData = {
    jewellery: {
      tag: 'Full-Stack E-Commerce',
      title: 'Jewellery E-Commerce & Management System',
      desc: 'A full-stack retail e-commerce platform tailored for jewellery businesses, combining real-time bullion pricing with streamlined inventory and checkout operations.',
      highlights: [
        'Engineered a dynamic pricing system driven by live gold/silver rates, making charges, and GST.',
        'Designed secure RESTful APIs using Python and FastAPI for backend data handling.',
        'Built an Admin Portal featuring real-time audit logs and inventory management.',
        'Integrated a frictionless "Buy on WhatsApp" checkout flow for direct customer orders.',
      ],
      tech: ['Python', 'FastAPI', 'React', 'REST APIs', 'Dynamic Pricing'],
    },
    powerbi: {
      tag: 'LLM-Powered Analytics',
      title: 'AI Power BI Dashboard Generator',
      desc: 'An intelligent analytics web application that transforms uploaded CSV and Excel datasets into executive-ready KPI dashboards automatically.',
      highlights: [
        'Built a FastAPI + Pandas data-processing pipeline integrated with the Gemini 2.5 API.',
        'Automated KPI discovery, chart recommendations, and natural-language data insights.',
        'Developed a responsive, interactive React + Recharts frontend.',
        'Deployed across AWS Amplify & EC2 for scalable cloud access.',
      ],
      tech: ['Gemini 2.5 API', 'FastAPI', 'Pandas', 'React', 'Recharts', 'AWS Amplify & EC2'],
    },
    agent: {
      tag: 'Voice • Vision • RAG',
      title: 'Multi-Modal AI Desktop Agent',
      desc: 'An autonomous desktop AI assistant capable of listening, seeing the screen, and retrieving contextual knowledge to automate desktop workflows.',
      highlights: [
        'Built core backend orchestration using FastAPI and ChromaDB for vector storage & RAG retrieval.',
        'Integrated OpenAI Whisper for accurate multilingual voice command recognition.',
        'Leveraged Gemini Vision API for real-time screen analysis and context-aware actions.',
      ],
      tech: ['FastAPI', 'ChromaDB', 'RAG', 'Whisper', 'Gemini Vision API'],
    },
    automl: {
      tag: 'Automated Machine Learning',
      title: 'AutoML Full-Stack Platform',
      desc: 'An end-to-end no-code machine learning platform that automates dataset profiling, model selection, training, and evaluation.',
      highlights: [
        'Implemented automated problem-type detection (Classification / Regression) using Python & FastAPI.',
        'Engineered parallel training across 35+ ML algorithms to identify the top-performing model.',
        'Generated interactive evaluation metrics and visualizations including confusion matrices and feature importance.',
      ],
      tech: ['Python', 'FastAPI', 'React', 'Scikit-Learn', '35+ ML Algorithms'],
    },
  };

  const modal = document.getElementById('projectModal');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalHighlights = document.getElementById('modalHighlights');
  const modalTech = document.getElementById('modalTech');

  const openModal = (key) => {
    const data = projectData[key];
    if (!data || !modal) return;
    modalTag.textContent = data.tag;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;
    modalHighlights.innerHTML = data.highlights.map((item) => `<li>${item}</li>`).join('');
    modalTech.innerHTML = data.tech.map((t) => `<span class="tag">${t}</span>`).join('');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.project));
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  // ==================== 6. CERTIFICATE LIGHTBOX ====================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.cert-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (!lightbox || !lightboxImg || !lightboxTitle) return;
      lightboxImg.src = card.dataset.lightboxSrc || '';
      lightboxTitle.textContent = card.dataset.lightboxTitle || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('[data-close-lightbox]').forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeLightbox();
    }
  });

  // ==================== 7. COPY BUTTONS, TOAST & MAILTO FORM ====================
  const toast = document.getElementById('toast');
  let toastTimer;

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        showToast(`Copied: ${value}`);
      } catch {
        showToast(`Value: ${value}`);
      }
    });
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value.trim();
      const email = document.getElementById('senderEmail').value.trim();
      const message = document.getElementById('senderMessage').value.trim();

      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      window.location.href = `mailto:rajisoftwareprofessional@gmail.com?subject=${subject}&body=${body}`;
      showToast('Opening your email app...');
      contactForm.reset();
    });
  }
});
