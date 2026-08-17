(function() {
  // ============================================
  // GET URL PARAMETERS
  // ============================================

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const refCode = params.get('ref'); // کد معرف
  const pkg = packages.find(p => p.id === id);
  const container = document.getElementById('package-details');
  const breadcrumbTitle = document.getElementById('breadcrumb-title');

  // ============================================
  // PACKAGE NOT FOUND
  // ============================================

  if (!pkg) {
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h2>❌ پکیج مورد نظر یافت نشد</h2>
          <p style="color: var(--text-light); margin: 16px 0;">
            متاسفانه این پکیج موجود نیست.
          </p>
          <a href="index.html#packages" class="btn btn-primary">بازگشت به پکیج‌ها</a>
        </div>
      `;
    }
    return;
  }

  // ============================================
  // UPDATE PAGE TITLE & BREADCRUMB
  // ============================================

  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = pkg.title;
  }
  document.title = `${pkg.title} | آکادمی ادمین`;

  // ============================================
  // RENDER PACKAGE DETAILS
  // ============================================

  function renderPackageDetails() {
    if (!container) return;

    container.innerHTML = `
      <div class="package-detail-grid">
        <!-- MAIN CONTENT -->
        <div class="package-detail-main">
          <!-- HEADER -->
          <div class="package-detail-head">
            <div class="package-detail-icon">${pkg.icon}</div>
            <div>
              <span class="badge-primary">${pkg.badge}</span>
              <h1>${pkg.title}</h1>
              <div class="package-meta">
                <span>📚 ${pkg.level}</span>
                <span>🎓 ${pkg.sessions} جلسه</span>
                <span>⏱️ ${pkg.duration}</span>
                <span>👥 ${formatNumber(pkg.students)} دانشجو</span>
              </div>
            </div>
          </div>

          <!-- DESCRIPTION -->
          <p class="package-detail-desc">${pkg.description}</p>

          <!-- LEARNINGS -->
          <div class="detail-section">
            <h2>📝 چه چیزهایی یاد می‌گیرید؟</h2>
            <ul class="learnings-list">
              ${pkg.learnings.map(l => `
                <li>✓ ${l}</li>
              `).join('')}
            </ul>
          </div>

          <!-- CHAPTERS -->
          <div class="detail-section">
            <h2>📚 سرفصل‌های دوره</h2>
            <div class="chapters-list">
              ${pkg.chapters.map((ch, idx) => `
                <div class="chapter-item">
                  <span>${idx + 1}. ${ch.title}</span>
                  <span style="color: var(--primary); font-weight: 600;">${ch.sessions} جلسه</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- AUDIENCE -->
          <div class="detail-section">
            <h2>🎯 این پکیج مناسب چه کسانی است؟</h2>
            <p>${pkg.audience}</p>
          </div>

          <!-- FAQ -->
          <div class="detail-section">
            <h2>❓ سوالات متداول</h2>
            <div class="faq-container">
              ${pkg.faqs.map((f, i) => `
                <div class="accordion-item">
                  <button class="accordion-header" type="button">
                    <span>${f.q}</span>
                    <span class="accordion-icon">▼</span>
                  </button>
                  <div class="accordion-content">${f.a}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- SIDEBAR -->
        <aside class="package-detail-sidebar">
          <!-- PRICE CARD -->
          <div class="price-card">
            <div class="price-row">
              ${pkg.oldPrice ? `
                <span class="old-price">${formatPrice(pkg.oldPrice)}</span>
              ` : ''}
              <span class="current-price price-large">${formatPrice(pkg.price)} تومان</span>
              ${pkg.discount ? `
                <span class="discount">${pkg.discount}٪</span>
              ` : ''}
            </div>
            <button id="buy-btn" class="btn btn-primary btn-block" style="margin-top: 12px;">
              🛒 خرید پکیج
            </button>
            <p class="price-note">✓ دسترسی فوری بعد از خرید</p>
          </div>

          <!-- REFERRAL INFO (if ref code exists) -->
          ${refCode ? `
            <div class="sidebar-info" style="background: var(--primary-50); border-color: var(--primary-100);">
              <h3 style="color: var(--primary-600);">🎁 کد معرفی‌کننده</h3>
              <p style="color: var(--primary-700); font-weight: 600;">
                این لینک از طریق معرفی‌کننده <strong>${refCode}</strong> دریافت شده است.
              </p>
            </div>
          ` : ''}

          <!-- COURSE INFO -->
          <div class="sidebar-info">
            <h3>📊 مشخصات دوره</h3>
            <ul>
              <li>📌 <strong>سطح:</strong> ${pkg.level}</li>
              <li>🎓 <strong>جلسات:</strong> ${pkg.sessions}</li>
              <li>⏱️ <strong>مدت:</strong> ${pkg.duration}</li>
              <li>🔄 <strong>آپدیت:</strong> ${pkg.updated}</li>
              <li>⭐ <strong>امتیاز:</strong> ${pkg.rating}/5.0</li>
              <li>👥 <strong>دانشجویان:</strong> ${formatNumber(pkg.students)}</li>
            </ul>
          </div>

          <!-- BENEFITS -->
          <div class="sidebar-info">
            <h3>✨ مزایا</h3>
            <ul>
              <li>✓ دسترسی مادام‌العمر</li>
              <li>✓ پشتیبانی ایمیل</li>
              <li>✓ منابع رایگان</li>
              <li>✓ گواهی تکمیل</li>
            </ul>
          </div>
        </aside>
      </div>
    `;

    // ============================================
    // SETUP EVENT LISTENERS
    // ============================================

    setupEventListeners();
  }

  function setupEventListeners() {
    // ============================================
    // BUY BUTTON
    // ============================================

    const buyBtn = document.getElementById('buy-btn');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        handleBuyClick();
      });
    }

    // ============================================
    // FAQ ACCORDION
    // ============================================

    const faqContainer = container.querySelector('.faq-container');
    if (faqContainer) {
      faqContainer.addEventListener('click', (e) => {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        const item = header.closest('.accordion-item');
        const isActive = item.classList.contains('active');

        // حذف active از بقیه items
        faqContainer.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('active');
        });

        // اگر قبلاً active نبود، دوباره active کنید
        if (!isActive) {
          item.classList.add('active');
          // scroll به این item
          header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  }

  // ============================================
  // BUY CLICK HANDLER
  // ============================================

  function handleBuyClick() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      // ریدایرکت به login
      showToast('برای خرید ابتدا وارد حساب خود شوید', 'warning');

      let redirectUrl = 'auth.html?redirect=' + encodeURIComponent(`package.html?id=${pkg.id}`);
      if (refCode) {
        redirectUrl += `&ref=${encodeURIComponent(refCode)}`;
      }

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1200);
    } else {
      // ثبت خرید
      handlePurchase(currentUser);
    }
  }

  // ============================================
  // PURCHASE HANDLER
  // ============================================

  function handlePurchase(user) {
    // ذخیره‌سازی معلومات خرید
    const purchase = {
      id: 'purchase_' + Date.now(),
      userId: user.id,
      packageId: pkg.id,
      packageTitle: pkg.title,
      price: pkg.price,
      referrerCode: refCode || null,
      purchaseDate: new Date().toISOString(),
      status: 'completed'
    };

    // می‌توان در real app این به backend برود
    console.log('Purchase:', purchase);

    // نمایش پیغام
    showToast('✓ درخواست خرید ثبت شد', 'success');

    // بعد از 1.5 ثانیه ریدایرکت
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  }

  // ============================================
  // SHARE FUNCTIONALITY
  // ============================================

  window.sharePackage = async function() {
    const shareUrl = window.location.href;
    const text = `${pkg.title} - ${formatPrice(pkg.price)} تومان`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: pkg.title,
          text: text,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(shareUrl).then(() => {
        showToast('لینک کپی شد');
      });
    }
  };

  // ============================================
  // INITIAL RENDER
  // ============================================

  renderPackageDetails();

  // ============================================
  // SCROLL TO TOP
  // ============================================

  window.scrollTo(0, 0);

})();
