(function() {
  // ============================================
  // RENDER PACKAGES
  // ============================================

  function renderPackages() {
    const packagesContainer = document.getElementById('packages-container');
    if (!packagesContainer) return;

    packagesContainer.innerHTML = packages.map(pkg => `
      <article class="package-card">
        <a href="package.html?id=${pkg.id}" class="package-card-image" aria-label="نمایش پکیج ${pkg.title}">
          ${pkg.icon}
        </a>
        <div class="package-card-body">
          <div class="package-badge">${pkg.badge || 'آموزش'}</div>

          <h3 class="package-title">
            <a href="package.html?id=${pkg.id}">${pkg.title}</a>
          </h3>

          <p class="package-desc">${pkg.shortDesc}</p>

          <div class="package-meta">
            <span>📚 ${pkg.level}</span>
            <span>🎓 ${pkg.sessions} جلسه</span>
          </div>

          <div class="price-row">
            ${pkg.oldPrice ? `
              <span class="old-price">${formatPrice(pkg.oldPrice)}</span>
            ` : ''}
            <span class="current-price">${formatPrice(pkg.price)} تومان</span>
            ${pkg.discount ? `
              <span class="discount">${pkg.discount}٪ تخفیف</span>
            ` : ''}
          </div>

          <a href="package.html?id=${pkg.id}" class="btn btn-primary btn-block mt-3">
            مشاهده جزئیات
          </a>
        </div>
      </article>
    `).join('');
  }

  // ============================================
  // RENDER FAQ
  // ============================================

  function renderFAQ() {
    const faqContainer = document.getElementById('faq-container');
    if (!faqContainer) return;

    faqContainer.innerHTML = faqs.map((item, index) => `
      <div class="accordion-item" data-index="${index}">
        <button class="accordion-header" type="button" aria-expanded="false">
          <span>${item.q}</span>
          <span class="accordion-icon" aria-hidden="true">▼</span>
        </button>
        <div class="accordion-content">${item.a}</div>
      </div>
    `).join('');

    // ============================================
    // FAQ ACCORDION EVENT HANDLING
    // ============================================

    setupAccordion(faqContainer);
  }

  // ============================================
  // ACCORDION SETUP (REUSABLE)
  // ============================================

  function setupAccordion(container) {
    if (!container) return;

    // Event delegation: فقط یک listener روی container
    container.addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;

      const item = header.closest('.accordion-item');
      if (!item) return;

      // Check if this item is already active
      const isActive = item.classList.contains('active');

      // Close all items in this container
      container.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
        const h = i.querySelector('.accordion-header');
        if (h) h.setAttribute('aria-expanded', 'false');
      });

      // Open clicked item (if it wasn't already open)
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');

        // Smooth scroll to item
        setTimeout(() => {
          header.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }, 50);
      }
    });

    // Keyboard support: Enter and Space (فقط اگر header فوکوس شود)
    container.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  // ============================================
  // INITIAL RENDER
  // ============================================

  renderPackages();
  renderFAQ();

  // ============================================
  // SMOOTH SCROLL LINKS
  // ============================================

  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // اگر یک anchor است
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });

          // Focus the target
          if (target.tabIndex === -1) {
            target.tabIndex = -1;
          }
          target.focus();
        }
      }
    });
  });

  // ============================================
  // INTERSECTION OBSERVER (Lazy Loading)
  // ============================================

  function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // اضافه کردن animation
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    // Observe all package cards
    document.querySelectorAll('.package-card').forEach(card => {
      observer.observe(card);
    });

    // Observe benefit cards
    document.querySelectorAll('.benefit-card').forEach(card => {
      observer.observe(card);
    });

    // Observe step cards
    document.querySelectorAll('.step-card').forEach(card => {
      observer.observe(card);
    });
  }

  if ('IntersectionObserver' in window) {
    setupIntersectionObserver();
  }

  // ============================================
  // SMOOTH ANIMATIONS (CSS)
  // ============================================

  // اضافه کردن animation برای cards
  const style = document.createElement('style');
  style.textContent = `
    .package-card,
    .benefit-card,
    .step-card {
      opacity: 0.8;
      transition: opacity 0.6s ease;
    }

    .package-card.visible,
    .benefit-card.visible,
    .step-card.visible {
      opacity: 1;
      animation: slideUp 0.6s ease forwards;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Mobile specific */
    @media (max-width: 768px) {
      .package-card,
      .benefit-card {
        animation-duration: 0.4s;
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // PRINT FUNCTIONALITY
  // ============================================

  window.printFAQ = function() {
    const faqHtml = document.getElementById('faq-container').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>سوالات متداول - آکادمی ادمین</title>
        <style>
          body {
            font-family: 'Vazirmatn', sans-serif;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
          }
          .accordion-item {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          .accordion-header span:first-child {
            font-weight: bold;
            display: block;
            margin-bottom: 8px;
          }
          .accordion-content {
            display: block !important;
            margin-left: 20px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <h1>سوالات متداول - آکادمی ادمین</h1>
        <div>${faqHtml}</div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // ============================================
  // ACCESSIBILITY IMPROVEMENTS
  // ============================================

  // اضافه کردن ARIA labels
  document.querySelectorAll('.package-card').forEach((card, index) => {
    card.setAttribute('aria-label', `پکیج ${index + 1}`);
  });

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================

  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) {
            console.warn('Slow operation:', entry.name, entry.duration);
          }
        }
      });
      observer.observe({ entryTypes: ['measure'] });
    } catch (e) {
      console.log('PerformanceObserver not supported');
    }
  }

})();
