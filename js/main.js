'use strict';

/**
 * NolTech - main.js
 * Scroll reveal, counter animation, and mobile nav.
 * No eval(), no innerHTML, no inline event handlers.
 * Safe for GitHub Pages (static, no server-side).
 */

// ─── Utility ────────────────────────────────────────────────────────────────

/** @param {string} sel @param {Document|Element} [root] */
const qs  = (sel, root = document) => root.querySelector(sel);
/** @param {string} sel @param {Document|Element} [root] */
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ─── Navigation ─────────────────────────────────────────────────────────────

const nav        = qs('.nav');
const menuToggle = qs('.menu-toggle');
const navLinks   = qs('.nav-links');

// Shrink/solidify nav on scroll
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

// Mobile menu open/close
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    // Prevent body scroll while menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when any nav link is clicked
  qsa('a', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuToggle.focus();
    }
  });
}

// ─── Smooth Scroll (internal anchors only) ──────────────────────────────────

qsa('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    // Only handle same-page hash links
    const hash   = anchor.getAttribute('href');
    const target = qs(hash);
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    // Update URL without triggering scroll
    history.pushState(null, '', hash);
  });
});

// ─── Scroll Reveal ──────────────────────────────────────────────────────────

/**
 * Fade + slide-up elements as they enter the viewport.
 * Uses IntersectionObserver, no layout thrash.
 */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
);

qsa('.reveal').forEach(el => revealObserver.observe(el));

// ─── Counter Animation ──────────────────────────────────────────────────────

/**
 * Ease-out cubic: starts fast, decelerates to final value.
 * @param {number} t - progress 0-1
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animate a [data-count] element from 0 to its target value.
 * @param {Element} el
 */
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;

  const duration = 1400; // ms
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Use textContent, never innerHTML, to prevent XSS
    el.textContent = Math.round(easeOutCubic(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Observe each counter element individually
const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

qsa('[data-count]').forEach(el => counterObserver.observe(el));

// ─── Active Nav Highlight ───────────────────────────────────────────────────

/**
 * Highlight the nav link matching the current section in view.
 */
const sections  = qsa('section[id], header[id]');
const navAnchors = qsa('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          const matches = a.getAttribute('href') === '#' + id;
          a.classList.toggle('active', matches);
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(sec => sectionObserver.observe(sec));

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

qsa('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer   = btn.nextElementSibling;
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    qsa('.faq-question').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      const otherAnswer = other.nextElementSibling;
      if (otherAnswer) otherAnswer.hidden = true;
    });

    // Toggle clicked
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
});
