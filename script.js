/* =============================================================
   LegacySync — script.js
   Connects every button & link on the page:
   1. Smooth-scroll for all anchor (#) links
   2. Navbar scroll effect + mobile hamburger menu
   3. Booking modal (open / close / form validation / success)
   4. Service pre-selection when coming from a pricing card
   5. Footer info modals (Privacy, Terms, Contact)
============================================================= */

(function () {
  'use strict';

  /* ── 1. SMOOTH SCROLL ───────────────────────────────────────
     Every <a href="#section"> scrolls smoothly and offsets
     for the fixed 64-px navbar.
  ─────────────────────────────────────────────────────────── */
  const NAVBAR_HEIGHT = 64;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // Plain "#" with no target — let modal handlers deal with it
      if (href === '#' || href === '#booking') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile menu if open
      closeMobileMenu();
    });
  });


  /* ── 2. NAVBAR ──────────────────────────────────────────────
     a) Add shadow when user scrolls down
     b) Hamburger toggles mobile dropdown
  ─────────────────────────────────────────────────────────── */
  const navbar       = document.getElementById('navbar');
  const mobileMenu   = document.getElementById('mobileMenu');
  const menuBtn      = document.getElementById('mobileMenuBtn');
  const iconOpen     = document.getElementById('menuIconOpen');
  const iconClose    = document.getElementById('menuIconClose');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Hamburger toggle
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    iconOpen.style.display  = isOpen ? 'none'  : '';
    iconClose.style.display = isOpen ? ''      : 'none';
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    iconOpen.style.display  = '';
    iconClose.style.display = 'none';
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  // Mobile nav links close the menu then scroll
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });


  /* ── 3. BOOKING MODAL ───────────────────────────────────────
     Triggered by every element with class .open-modal
     data-service attribute pre-selects the service dropdown.
  ─────────────────────────────────────────────────────────── */
  const modalOverlay  = document.getElementById('modalOverlay');
  const modalClose    = document.getElementById('modalClose');
  const bookingForm   = document.getElementById('bookingForm');
  const modalSuccess  = document.getElementById('modalSuccess');
  const successClose  = document.getElementById('modalSuccessClose');
  const serviceSelect = document.getElementById('service');

  // Open helpers
  function openBookingModal(preService) {
    // Reset to form state (hide success)
    modalSuccess.classList.remove('show');
    bookingForm.style.display = '';

    // Pre-select service if provided
    if (preService && serviceSelect) {
      serviceSelect.value = preService;
    }

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the first input for accessibility
    setTimeout(() => {
      const first = bookingForm.querySelector('input, select, textarea');
      if (first) first.focus();
    }, 260);
  }

  function closeBookingModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Wire every .open-modal trigger
  document.querySelectorAll('.open-modal').forEach(trigger => {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      const svc = this.dataset.service || '';
      openBookingModal(svc);
      closeMobileMenu();
    });
  });

  // Close on X button
  modalClose.addEventListener('click', closeBookingModal);

  // Close when clicking the dark overlay (outside the modal box)
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === this) closeBookingModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modalOverlay.classList.contains('active')) closeBookingModal();
      if (infoOverlay.classList.contains('active'))  closeInfoModal();
    }
  });

  // Success-state close
  successClose.addEventListener('click', () => {
    closeBookingModal();
    // Reset form for next open
    bookingForm.reset();
    clearAllErrors();
  });


  /* ── 4. FORM VALIDATION & SUBMIT ────────────────────────────
     Client-side validation with inline error messages.
     On success shows a confirmation state inside the modal.
  ─────────────────────────────────────────────────────────── */
  const fields = {
    fullName : { el: document.getElementById('fullName'), err: document.getElementById('fullNameError') },
    phone    : { el: document.getElementById('phone'),    err: document.getElementById('phoneError')    },
    email    : { el: document.getElementById('email'),    err: document.getElementById('emailError')    },
    city     : { el: document.getElementById('city'),     err: document.getElementById('cityError')     },
    service  : { el: document.getElementById('service'),  err: document.getElementById('serviceError')  },
  };

  function setError(field, msg) {
    field.el.classList.add('invalid');
    field.err.textContent = msg;
  }
  function clearError(field) {
    field.el.classList.remove('invalid');
    field.err.textContent = '';
  }
  function clearAllErrors() {
    Object.values(fields).forEach(clearError);
  }

  // Live clear on input/change
  Object.values(fields).forEach(f => {
    f.el.addEventListener('input',  () => clearError(f));
    f.el.addEventListener('change', () => clearError(f));
  });

  function validateForm() {
    let valid = true;

    // Full Name
    if (!fields.fullName.el.value.trim()) {
      setError(fields.fullName, 'Please enter your full name.');
      valid = false;
    }

    // Phone — simple: must be at least 10 digits
    const phoneVal = fields.phone.el.value.replace(/\D/g, '');
    if (!phoneVal || phoneVal.length < 10) {
      setError(fields.phone, 'Please enter a valid phone number.');
      valid = false;
    }

    // Email
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(fields.email.el.value.trim())) {
      setError(fields.email, 'Please enter a valid email address.');
      valid = false;
    }

    // City
    if (!fields.city.el.value) {
      setError(fields.city, 'Please select your city.');
      valid = false;
    }

    // Service
    if (!fields.service.el.value) {
      setError(fields.service, 'Please select a service.');
      valid = false;
    }

    return valid;
  }

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    // Simulate async submission (replace with real API call)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Confirm My Free Session`;

      // Show success state
      bookingForm.style.display = 'none';
      modalSuccess.classList.add('show');
      bookingForm.reset();
      clearAllErrors();
    }, 1200);
  });


  /* ── 5. FOOTER INFO MODALS ──────────────────────────────────
     Privacy Policy / Terms of Service / Contact
     Opens a lightweight modal with static content.
  ─────────────────────────────────────────────────────────── */
  const infoOverlay = document.getElementById('infoOverlay');
  const infoClose   = document.getElementById('infoClose');
  const infoTitle   = document.getElementById('infoTitle');
  const infoBody    = document.getElementById('infoBody');

  const INFO_CONTENT = {
    privacy: {
      title: 'Privacy Policy',
      html: `
        <p><strong>Last updated: March 2026</strong></p>
        <p>LegacySync is committed to protecting your privacy. We collect only the information you voluntarily provide when booking a consultation (name, phone, email, and city). This information is used solely to schedule and deliver our services.</p>
        <p><strong>What we do not collect:</strong> We never collect, store, or transmit your financial credentials, passwords, or sensitive account details. Our Zero-Knowledge model means your data never leaves your devices.</p>
        <p><strong>Data sharing:</strong> We do not sell, rent, or share your personal information with third parties except as required by law.</p>
        <p><strong>Data retention:</strong> Consultation booking details are retained only for the duration of the engagement and deleted upon your request.</p>
        <p>For questions, contact us at <a href="mailto:privacy@legacysync.in">privacy@legacysync.in</a>.</p>
      `
    },
    terms: {
      title: 'Terms of Service',
      html: `
        <p><strong>Last updated: March 2026</strong></p>
        <p>By using LegacySync's services you agree to these terms. Our services are advisory in nature — we provide guidance on digital estate planning and do not hold, manage, or control any of your financial assets.</p>
        <p><strong>No financial advice:</strong> Content on this site is for informational purposes and does not constitute financial, legal, or investment advice. Please consult a qualified professional for personalised advice.</p>
        <p><strong>Fees:</strong> Service fees are as displayed. The free 15-minute check carries no obligation to purchase paid services.</p>
        <p><strong>Limitation of liability:</strong> LegacySync's liability is limited to the amount paid for the service. We are not responsible for losses arising from incomplete implementation of our recommendations.</p>
        <p>For questions, contact us at <a href="mailto:legal@legacysync.in">legal@legacysync.in</a>.</p>
      `
    },
    contact: {
      title: 'Contact Us',
      html: `
        <p>We'd love to hear from you. Reach us through any of the channels below:</p>
        <p><strong>Email:</strong> <a href="mailto:hello@legacysync.in">hello@legacysync.in</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/919876543210" target="_blank" rel="noopener">+91 98765 43210</a></p>
        <p><strong>Availability:</strong> Monday – Saturday, 9 AM – 7 PM IST</p>
        <p><strong>Languages:</strong> Hindi &amp; English</p>
        <p>Alternatively, book your free 15-minute Digital Health Check directly from the website and we'll reach out to you within 2 hours.</p>
      `
    }
  };

  function openInfoModal(key) {
    const content = INFO_CONTENT[key];
    if (!content) return;
    infoTitle.textContent = content.title;
    infoBody.innerHTML    = content.html;
    infoOverlay.classList.add('active');
    infoOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeInfoModal() {
    infoOverlay.classList.remove('active');
    infoOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.footer-modal-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openInfoModal(this.dataset.modal);
    });
  });

  infoClose.addEventListener('click', closeInfoModal);
  infoOverlay.addEventListener('click', function (e) {
    if (e.target === this) closeInfoModal();
  });

})();
