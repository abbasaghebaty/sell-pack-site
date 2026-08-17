(function() {
  // ============================================
  // CHECK IF USER IS LOGGED IN
  // ============================================

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('لطفا ابتدا وارد شوید', 'error');
    setTimeout(() => {
      window.location.href = 'auth.html?redirect=dashboard.html';
    }, 1000);
  }

  // ============================================
  // REFERRAL CODE SETUP
  // ============================================

  let refCode = safeGetItem('refCode');
  if (!refCode) {
    refCode = generateReferralCode();
    safeSetItem('refCode', refCode);
  }

  const refCodeDisplay = document.getElementById('ref-code-display');
  if (refCodeDisplay) {
    refCodeDisplay.textContent = refCode;
  }

  // ============================================
  // STATS DISPLAY
  // ============================================

  function updateStats() {
    const stats = {
      balance: document.getElementById('stat-balance'),
      totalIncome: document.getElementById('stat-total-income'),
      sales: document.getElementById('stat-sales'),
      clicks: document.getElementById('stat-clicks'),
      referrals: document.getElementById('stat-referrals'),
      month: document.getElementById('stat-month')
    };

    if (stats.balance) stats.balance.textContent = formatPrice(dashboardData.balance) + ' تومان';
    if (stats.totalIncome) stats.totalIncome.textContent = formatPrice(dashboardData.totalIncome) + ' تومان';
    if (stats.sales) stats.sales.textContent = formatNumber(dashboardData.sales);
    if (stats.clicks) stats.clicks.textContent = formatNumber(dashboardData.clicks);
    if (stats.referrals) stats.referrals.textContent = formatNumber(dashboardData.referrals);
    if (stats.month) stats.month.textContent = formatPrice(dashboardData.monthCommission) + ' تومان';
  }

  updateStats();

  // ============================================
  // CHART RENDERING (Responsive)
  // ============================================

  function renderChart() {
    const chartContainer = document.getElementById('chart');
    if (!chartContainer) return;

    const max = Math.max(...dashboardData.chart);
    const isMobile = window.innerWidth < 768;

    chartContainer.innerHTML = dashboardData.chart.map((value, index) => {
      const height = Math.round((value / max) * 100);

      // فرمت مناسب برای موبایل
      let displayValue;
      if (isMobile) {
        // نمایش کوتاه‌شده برای موبایل
        displayValue = value >= 1000000 ?
          formatPrice(Math.floor(value / 100000)) + 'صدهزار' :
          formatPrice(value).substring(0, 6);
      } else {
        displayValue = formatPrice(value);
      }

      return `
        <div class="chart-bar-wrapper">
          <div class="chart-bar" style="height:${Math.max(height, 15)}%; min-height: 15px;"
               title="${formatPrice(value)} تومان">
            <span style="font-size: ${isMobile ? '0.65rem' : '0.75rem'};
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;">
              ${displayValue}
            </span>
          </div>
          <div class="chart-label" style="font-size: ${isMobile ? '0.7rem' : '0.8rem'};">
            ${dashboardData.chartLabels[index]}
          </div>
        </div>
      `;
    }).join('');
  }

  renderChart();

  // Re-render chart on window resize
  window.addEventListener('resize', () => {
    renderChart();
  });

  // ============================================
  // REFERRAL LINKS RENDERING
  // ============================================

  function renderReferralLinks() {
    const linksContainer = document.getElementById('referral-links-container');
    if (!linksContainer) return;

    linksContainer.innerHTML = packages.map(pkg => {
      const url = buildPackageUrl(pkg.id, refCode);

      return `
        <div class="referral-item">
          <div>
            <strong>${pkg.title}</strong>
            <br>
            <small style="color: var(--text-light);">${formatPrice(pkg.price)} تومان</small>
          </div>
          <div class="referral-link" dir="ltr" title="${url}">
            ${url}
          </div>
          <button class="btn btn-primary btn-sm copy-link-btn"
                  data-url="${url}"
                  aria-label="کپی لینک">
            کپی
          </button>
        </div>
      `;
    }).join('');

    // Event delegation برای copy buttons
    linksContainer.addEventListener('click', async (e) => {
      const btn = e.target.closest('.copy-link-btn');
      if (!btn) return;

      const url = btn.dataset.url;
      const originalText = btn.textContent;

      try {
        const copied = await copyToClipboard(url);
        if (copied) {
          btn.textContent = '✓ کپی شد';
          showToast('لینک کپی شد');

          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        } else {
          showToast('خطا در کپی لینک', 'error');
        }
      } catch (err) {
        console.error('Copy error:', err);
        showToast('خطا در کپی لینک', 'error');
      }
    });
  }

  renderReferralLinks();

  // ============================================
  // PUBLIC LINK COPY
  // ============================================

  const copyRefLinkBtn = document.getElementById('copy-ref-link');
  if (copyRefLinkBtn) {
    copyRefLinkBtn.addEventListener('click', async () => {
      const publicUrl = buildPackageUrl('general', refCode);

      try {
        const copied = await copyToClipboard(publicUrl);
        if (copied) {
          showToast('لینک عمومی کپی شد');
        } else {
          showToast('خطا در کپی لینک', 'error');
        }
      } catch (err) {
        console.error('Copy error:', err);
        showToast('خطا در کپی لینک', 'error');
      }
    });
  }

  // ============================================
  // LOGOUT HANDLER
  // ============================================

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('آیا مطمئن هستید که می‌خواهید خروج کنید؟')) {
        logoutUser();
        showToast('از حساب خارج شدید');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      }
    });
  }

  // ============================================
  // PERIODIC DATA REFRESH
  // ============================================

  // تازه‌سازی داده‌ها هر 30 ثانیه (برای demo)
  setInterval(() => {
    // می‌توان API call قرار داد
    // updateStats();
    // renderChart();
  }, 30000);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + C برای کپی لینک معرفی
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      // فقط اگر کاربر روی input نباشد
      if (document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        // می‌توان یک shortcut اضافه کرد
      }
    }
  });

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  // اگر بخواهد کاربر آمار را export کند
  window.exportDashboardData = function() {
    const data = {
      date: new Date().toLocaleString('fa-IR'),
      user: currentUser.name,
      stats: dashboardData
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

})();
