/* =============================================
   KC Votes v2 — app.js
   ============================================= */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Reading Progress Bar
  ───────────────────────────────────────────── */
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ─────────────────────────────────────────────
     Theme (Dark / Light)
  ───────────────────────────────────────────── */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'kc-votes-theme';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  const savedTheme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ─────────────────────────────────────────────
     Sticky Nav + Active Section Highlight
  ───────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  const navAnchors = document.querySelectorAll('[data-nav]');
  const sections = [...navAnchors].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = `#${sec.id}`;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === current);
    });
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ─────────────────────────────────────────────
     Mobile Nav
  ───────────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    }
  });

  /* ─────────────────────────────────────────────
     Countdown Timer
  ───────────────────────────────────────────── */
  const cdDays  = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins  = document.getElementById('cdMins');
  const cdSecs  = document.getElementById('cdSecs');
  const DEADLINE = new Date('2026-07-07T00:00:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const diff = DEADLINE - Date.now();
    if (diff <= 0) {
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMins.textContent = '00';
      cdSecs.textContent = '00';
      return;
    }
    const days  = Math.floor(diff / 864e5);
    const hours = Math.floor((diff % 864e5) / 36e5);
    const mins  = Math.floor((diff % 36e5) / 6e4);
    const secs  = Math.floor((diff % 6e4) / 1e3);
    cdDays.textContent  = days;
    cdHours.textContent = pad(hours);
    cdMins.textContent  = pad(mins);
    cdSecs.textContent  = pad(secs);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ─────────────────────────────────────────────
     Stats Counter Animation
  ───────────────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ─────────────────────────────────────────────
     Reveal on Scroll (IntersectionObserver)
  ───────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Stagger siblings in a grid
      const siblings = [...(el.parentElement?.children || [])].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      setTimeout(() => el.classList.add('visible'), idx * 80);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat__num[data-target]').forEach(el => statObserver.observe(el));

  /* ─────────────────────────────────────────────
     Eligibility Quiz
  ───────────────────────────────────────────── */
  const quizResults = {
    eligible: {
      icon: '✓',
      cls: 'yes',
      title: "Great news — you're eligible!",
      body: "You meet all the requirements to register as a voter in Missouri. It only takes about 15 minutes online. Let's get you registered.",
      cta: { label: 'Register Now →', href: '#how-to-register' },
    },
    young: {
      icon: '📅',
      cls: 'yes',
      title: "Almost there — you can pre-register!",
      body: "Missouri allows you to register now as long as you'll be 18 by Election Day. Go ahead and register — your registration will become active on your 18th birthday.",
      cta: { label: 'Pre-Register Now →', href: 'https://s1.sos.mo.gov/elections/voterregistration' },
    },
    citizen: {
      icon: '!',
      cls: 'no',
      title: "U.S. citizenship is required.",
      body: "Only U.S. citizens can register to vote in federal and state elections. If you're on a path to citizenship, check back once you're naturalized — we'll be here.",
      cta: null,
    },
    resident: {
      icon: '!',
      cls: 'no',
      title: "Missouri residency is required.",
      body: "You must be a Missouri resident to vote in Missouri elections. If you're moving to Kansas City soon, register at your new address once you're established here.",
      cta: null,
    },
    age: {
      icon: '!',
      cls: 'no',
      title: "You'll need to wait a bit.",
      body: "Missouri requires you to be at least 17½ years old to register (turning 18 by Election Day). Check back as you get closer to that milestone!",
      cta: null,
    },
  };

  function showQuizResult(key) {
    const r = quizResults[key];
    const resultEl = document.getElementById('quizResult');
    resultEl.innerHTML = `
      <div class="quiz__result-icon quiz__result-icon--${r.cls}" aria-hidden="true">${r.icon}</div>
      <h3>${r.title}</h3>
      <p>${r.body}</p>
      ${r.cta ? `<a href="${r.cta.href}" class="btn btn--primary btn--sm">${r.cta.label}</a>` : ''}
      <button class="quiz__restart" id="quizRestart">Start over</button>
    `;
    document.querySelectorAll('.quiz__step').forEach(s => s.classList.add('hidden'));
    resultEl.classList.remove('hidden');
    document.getElementById('quizRestart').addEventListener('click', resetQuiz);
  }

  function resetQuiz() {
    document.querySelectorAll('.quiz__step').forEach(s => s.classList.remove('hidden'));
    document.querySelectorAll('.quiz__step').forEach((s, i) => {
      if (i > 0) s.classList.add('hidden');
    });
    document.getElementById('quizResult').classList.add('hidden');
  }

  document.getElementById('quiz').addEventListener('click', e => {
    const btn = e.target.closest('.quiz__btn');
    if (!btn) return;
    const next   = btn.dataset.next;
    const result = btn.dataset.result;
    if (result) {
      showQuizResult(result);
    } else if (next) {
      btn.closest('.quiz__step').classList.add('hidden');
      document.getElementById(`quizStep${next}`).classList.remove('hidden');
    }
  });

  /* ─────────────────────────────────────────────
     Registration Checklist (localStorage)
  ───────────────────────────────────────────── */
  const CHECKLIST_KEY = 'kc-votes-checklist';
  const checks = document.querySelectorAll('.checklist__check');
  const fillBar = document.getElementById('checklistFill');
  const pctEl   = document.getElementById('checklistPct');

  function loadChecklist() {
    const saved = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
    checks.forEach(cb => {
      if (saved[cb.dataset.id]) cb.checked = true;
    });
    updateChecklist();
  }

  function updateChecklist() {
    const total   = checks.length;
    const done    = [...checks].filter(c => c.checked).length;
    const pct     = Math.round((done / total) * 100);
    fillBar.style.width = `${pct}%`;
    pctEl.textContent = pct === 100 ? "All done — you're ready to vote! 🎉" : `${pct}% complete`;
    const state = {};
    checks.forEach(cb => { state[cb.dataset.id] = cb.checked; });
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
  }

  checks.forEach(cb => cb.addEventListener('change', updateChecklist));
  document.getElementById('checklistReset').addEventListener('click', () => {
    checks.forEach(cb => { cb.checked = false; });
    localStorage.removeItem(CHECKLIST_KEY);
    updateChecklist();
  });
  loadChecklist();

  /* ─────────────────────────────────────────────
     FAQ Accordion
  ───────────────────────────────────────────── */
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      // Collapse all
      document.querySelectorAll('.faq__q').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        document.getElementById(other.getAttribute('aria-controls'))?.classList.remove('open');
      });
      // Toggle this
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(answerId)?.classList.add('open');
      }
    });
  });

  /* ─────────────────────────────────────────────
     Confetti (CSS particles on form success)
  ───────────────────────────────────────────── */
  function launchConfetti(container) {
    const colors = ['#C8102E', '#FFB81C', '#fff', '#3B82F6', '#22C55E'];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      const size = 6 + Math.random() * 6;
      const x = Math.random() * 100;
      const delay = Math.random() * 0.6;
      const dur = 1.2 + Math.random() * 0.8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `
        position:absolute;
        left:${x}%;top:0;
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:${Math.random() > .5 ? '50%' : '2px'};
        animation: confettiFall ${dur}s ${delay}s ease-in forwards;
        opacity:0;
      `;
      container.appendChild(p);
    }

    if (!document.getElementById('confettiStyles')) {
      const style = document.createElement('style');
      style.id = 'confettiStyles';
      style.textContent = `
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity:1; }
          100% { transform: translateY(300px) rotate(720deg); opacity:0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ─────────────────────────────────────────────
     Notification Form
  ───────────────────────────────────────────── */
  const form       = document.getElementById('notifyForm');
  const successEl  = document.getElementById('notifySuccess');
  const confettiEl = document.getElementById('confettiCanvas');
  const submitBtn  = document.getElementById('submitBtn');

  const fName  = document.getElementById('fName');
  const fEmail = document.getElementById('fEmail');
  const fZip   = document.getElementById('fZip');
  const errName  = document.getElementById('fNameErr');
  const errEmail = document.getElementById('fEmailErr');
  const errZip   = document.getElementById('fZipErr');

  fZip.addEventListener('input', () => {
    fZip.value = fZip.value.replace(/\D/g, '').slice(0, 5);
  });

  function setErr(input, errEl, msg) {
    errEl.textContent = msg;
    input.classList.toggle('invalid', !!msg);
  }

  function validate() {
    let ok = true;
    if (!fName.value.trim()) {
      setErr(fName, errName, 'Please enter your full name.'); ok = false;
    } else setErr(fName, errName, '');

    if (!fEmail.value.trim()) {
      setErr(fEmail, errEmail, 'Please enter your email address.'); ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.value.trim())) {
      setErr(fEmail, errEmail, 'Please enter a valid email address.'); ok = false;
    } else setErr(fEmail, errEmail, '');

    if (fZip.value && !/^\d{5}$/.test(fZip.value)) {
      setErr(fZip, errZip, 'ZIP code must be 5 digits.'); ok = false;
    } else setErr(fZip, errZip, '');

    return ok;
  }

  [fName, fEmail, fZip].forEach(el => {
    el.addEventListener('blur', validate);
    el.addEventListener('input', () => { if (el.classList.contains('invalid')) validate(); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing you up…';
    await new Promise(r => setTimeout(r, 1000)); // simulate API
    form.hidden = true;
    successEl.hidden = false;
    launchConfetti(confettiEl);
    successEl.focus();
  });

  /* ─────────────────────────────────────────────
     Share Button
  ───────────────────────────────────────────── */
  const shareBtn  = document.getElementById('shareBtn');
  const shareToast = document.getElementById('shareToast');
  let toastTimer;

  function showToast(msg) {
    shareToast.textContent = msg;
    shareToast.removeAttribute('hidden');
    shareToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      shareToast.classList.remove('show');
      setTimeout(() => shareToast.setAttribute('hidden', ''), 400);
    }, 2500);
  }

  shareBtn.addEventListener('click', async () => {
    const data = {
      title: 'KC Votes — Kansas City Voter Registration Guide',
      text: 'Register to vote in Kansas City in minutes. Never miss a deadline.',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast('Link copied to clipboard!'))
        .catch(() => showToast('Copy failed — please share manually.'));
    }
  });

})();
