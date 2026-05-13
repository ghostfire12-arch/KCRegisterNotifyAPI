/* =============================================
   KC Votes — app.js
   ============================================= */

(function () {
  'use strict';

  /* ── Sticky Nav ── */
  const nav = document.getElementById('nav');
  const updateNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── Mobile Nav Toggle ── */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('mobile-open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile nav on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && navLinks.classList.contains('mobile-open')) {
      navLinks.classList.remove('mobile-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Stats Counter Animation ── */
  const formatNumber = (n) => {
    if (n >= 1000) return n.toLocaleString('en-US');
    return n.toString();
  };

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.stat__num[data-target]').forEach(el => {
    statsObserver.observe(el);
  });

  /* ── FAQ Accordion ── */
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);

      // Collapse all others
      document.querySelectorAll('.faq__q').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherId = other.getAttribute('aria-controls');
          document.getElementById(otherId)?.classList.remove('open');
        }
      });

      // Toggle this one
      btn.setAttribute('aria-expanded', !expanded);
      answer?.classList.toggle('open', !expanded);
    });
  });

  /* ── Scroll-triggered Fade-in ── */
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  const fadeTargets = document.querySelectorAll(
    '.step:not(.step--connector), .card, .timeline__item, .resource-card, .stat'
  );
  fadeTargets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.45s ease ${i * 60}ms, transform 0.45s ease ${i * 60}ms`;
    fadeObserver.observe(el);
  });

  /* ── Notification Form ── */
  const form = document.getElementById('notifyForm');
  const successEl = document.getElementById('notifySuccess');

  if (!form || !successEl) return;

  const nameInput  = document.getElementById('notifyName');
  const emailInput = document.getElementById('notifyEmail');
  const zipInput   = document.getElementById('notifyZip');
  const nameError  = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const zipError   = document.getElementById('zipError');

  const setError = (input, errorEl, msg) => {
    errorEl.textContent = msg;
    input.classList.toggle('error', !!msg);
    input.setAttribute('aria-invalid', !!msg);
  };

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validateZip   = (v) => !v || /^\d{5}$/.test(v);

  const validate = () => {
    let valid = true;

    if (!nameInput.value.trim()) {
      setError(nameInput, nameError, 'Please enter your full name.');
      valid = false;
    } else {
      setError(nameInput, nameError, '');
    }

    if (!emailInput.value.trim()) {
      setError(emailInput, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    } else {
      setError(emailInput, emailError, '');
    }

    if (!validateZip(zipInput.value.trim())) {
      setError(zipInput, zipError, 'ZIP code must be 5 digits.');
      valid = false;
    } else {
      setError(zipInput, zipError, '');
    }

    return valid;
  };

  // Validate on blur for better UX
  [nameInput, emailInput, zipInput].forEach(input => {
    input.addEventListener('blur', validate);
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validate();
    });
  });

  // Only allow digits in ZIP
  zipInput.addEventListener('input', () => {
    zipInput.value = zipInput.value.replace(/\D/g, '').slice(0, 5);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing you up…';

    // Simulate API call (replace with real KCRegisterNotifyAPI endpoint)
    await new Promise(r => setTimeout(r, 1200));

    form.hidden = true;
    successEl.hidden = false;
    successEl.focus();
  });

})();
