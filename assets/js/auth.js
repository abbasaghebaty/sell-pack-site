(function() {
  // ============================================
  // TAB SWITCHING
  // ============================================

  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // حذف active class از همه tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // نمایش/پنهان کردن forms
      if (tab.dataset.tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
      }
    });
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function getRedirect() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || 'dashboard.html';
  }

  function getRefCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || null;
  }

  // ============================================
  // LOGIN FORM
  // ============================================

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Validation
    if (!identifier || !password) {
      showToast('لطفا همه فیلدها را پر کنید', 'error');
      return;
    }

    // Check if it's phone or email
    const isPhone = validatePhone(identifier);
    const isEmail = validateEmail(identifier);

    if (!isPhone && !isEmail) {
      showToast('شماره موبایل یا ایمیل معتبر نیست', 'error');
      return;
    }

    if (!validatePassword(password)) {
      showToast('رمز عبور حداقل 6 کاراکتر باید باشد', 'error');
      return;
    }

    // محاکاتی برای لاگین
    const user = {
      id: 'user_' + Date.now(),
      name: 'کاربر',
      phone: isPhone ? identifier : '',
      email: isEmail ? identifier : '',
      loggedInAt: new Date().toISOString()
    };

    // ذخیره‌سازی امن
    if (setCurrentUser(user)) {
      showToast('ورود موفقیت‌آمیز بود');

      setTimeout(() => {
        window.location.href = getRedirect();
      }, 800);
    } else {
      showToast('خطایی در ورود رخ داد', 'error');
    }
  });

  // ============================================
  // REGISTER FORM
  // ============================================

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const refInput = document.getElementById('reg-ref').value.trim();

    // ============================================
    // VALIDATION CHECKS
    // ============================================

    // بررسی فیلدهای الزامی
    if (!name || !mobile || !password) {
      showToast('لطفا فیلدهای الزامی (نام، موبایل، رمز عبور) را پر کنید', 'error');
      return;
    }

    // بررسی نام
    if (!validateName(name)) {
      showToast('نام حداقل 3 کاراکتر باید باشد', 'error');
      return;
    }

    // بررسی موبایل
    if (!validatePhone(mobile)) {
      showToast('شماره موبایل معتبر نیست. مثال: 09xxxxxxxxx', 'error');
      return;
    }

    // بررسی ایمیل (اختیاری)
    if (email && !validateEmail(email)) {
      showToast('ایمیل معتبر نیست', 'error');
      return;
    }

    // بررسی رمز عبور
    if (!validatePassword(password)) {
      showToast('رمز عبور حداقل 6 کاراکتر باید باشد', 'error');
      return;
    }

    // ============================================
    // CREATE USER OBJECT
    // ============================================

    const user = {
      id: 'user_' + Date.now(),
      name,
      phone: mobile,
      email: email || null,
      referralCode: refInput || null,
      createdAt: new Date().toISOString()
    };

    // ============================================
    // REFERRAL CODE HANDLING
    // ============================================

    const refCode = getRefCode(); // کد معرف از URL
    const refNote = document.getElementById('ref-note');

    if (refCode) {
      // کد معرف از URL
      user.referredBy = refCode;
      if (refNote) {
        refNote.textContent = `ثبت‌نام شما با کد معرف ${refCode} ثبت شد. از این بابت سپاسگزاریم!`;
        refNote.style.display = 'block';
        refNote.style.color = 'var(--success)';
      }
      showToast('ثبت‌نام با کد معرف موفقیت‌آمیز بود', 'success');
    } else if (refInput) {
      // کد معرف دستی
      if (refNote) {
        refNote.textContent = `درخواست ثبت‌نام با کد معرف ${refInput} ثبت شد.`;
        refNote.style.display = 'block';
        refNote.style.color = 'var(--warning)';
      }
      showToast('ثبت‌نام موفقیت‌آمیز بود');
    } else {
      showToast('ثبت‌نام موفقیت‌آمیز بود');
    }

    // ============================================
    // SAVE USER DATA
    // ============================================

    if (setCurrentUser(user)) {
      // پاک کردن فرم
      registerForm.reset();
      if (refNote) refNote.style.display = 'none';

      setTimeout(() => {
        window.location.href = getRedirect();
      }, 1200);
    } else {
      showToast('خطایی در ثبت‌نام رخ داد. لطفا دوباره سعی کنید', 'error');
    }
  });

  // ============================================
  // REFERRAL CODE INPUT HANDLER
  // ============================================

  const refInput = document.getElementById('reg-ref');
  if (refInput) {
    refInput.addEventListener('input', (e) => {
      // فقط حروف بزرگ و اعداد
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });

    // اگر کد معرف از URL موجود بود، آن را نمایش دهید
    const urlRef = getRefCode();
    if (urlRef) {
      refInput.value = urlRef;
      refInput.disabled = true;
      const refNote = document.getElementById('ref-note');
      if (refNote) {
        refNote.textContent = `کد معرف: ${urlRef}`;
        refNote.style.display = 'block';
      }
    }
  }

  // ============================================
  // FORM FOCUS HANDLERS
  // ============================================

  // Focus/Blur effects برای UX بهتر
  const inputs = document.querySelectorAll('.form-control');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.opacity = '1';
    });

    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.style.opacity = '0.8';
      }
    });
  });

})();
