// ============================================
// SAFE STORAGE - برای جلوگیری از localStorage errors
// ============================================

function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    console.warn('localStorage is not available');
    return false;
  }
}

function safeGetItem(key) {
  try {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
  } catch(e) {
    console.error('Error reading from localStorage:', e);
  }
  return null;
}

function safeSetItem(key, value) {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
      return true;
    }
  } catch(e) {
    console.error('Error writing to localStorage:', e);
  }
  return false;
}

function safeRemoveItem(key) {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(key);
      return true;
    }
  } catch(e) {
    console.error('Error removing from localStorage:', e);
  }
  return false;
}

// ============================================
// FORMATTING FUNCTIONS
// ============================================

function formatPrice(price) {
  if (price === 0) return '۰';
  return price.toLocaleString('fa-IR');
}

function formatNumber(num) {
  return num.toLocaleString('fa-IR');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// CLIPBOARD OPERATIONS
// ============================================

async function copyToClipboard(text) {
  try {
    // Modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed:', err);
  }

  // Fallback for older browsers
  return new Promise((resolve) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);

    try {
      textarea.select();
      const successful = document.execCommand('copy');
      resolve(successful);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      resolve(false);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

// ============================================
// USER MANAGEMENT
// ============================================

function getCurrentUser() {
  const user = safeGetItem('currentUser');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
}

function setCurrentUser(user) {
  try {
    const userData = JSON.stringify(user);
    return safeSetItem('currentUser', userData);
  } catch (e) {
    console.error('Error saving user data:', e);
    return false;
  }
}

function logoutUser() {
  safeRemoveItem('currentUser');
  safeRemoveItem('refCode');
  safeRemoveItem('referrerCode');
}

// ============================================
// REFERRAL CODE GENERATION
// ============================================

function generateReferralCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================
// URL BUILDING
// ============================================

function buildPackageUrl(packageId, refCode = '') {
  try {
    // استفاده از location.origin و pathname برای دقت بیشتر
    const origin = window.location.origin;
    const pathname = window.location.pathname;

    // حذف نام فایل از آخر
    const pathWithoutFile = pathname.substring(0,
      pathname.lastIndexOf('/') + 1);

    let url = `${origin}${pathWithoutFile}package.html?id=${encodeURIComponent(packageId)}`;

    if (refCode) {
      url += '&ref=' + encodeURIComponent(refCode);
    }

    return url;
  } catch (e) {
    console.error('Error building package URL:', e);
    return '#error';
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validatePhone(phone) {
  // فرمت معتبر: 09xxxxxxxxx یا +989xxxxxxxxx
  const patterns = [
    /^09\d{9}$/, // 09xxxxxxxxx
    /^\+989\d{9}$/, // +989xxxxxxxxx
  ];
  return patterns.some(p => p.test(phone.trim()));
}

function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

function validatePassword(password) {
  return password.length >= 6; // حداقل 6 کاراکتر
}

function validateName(name) {
  return name.trim().length >= 3; // حداقل 3 کاراکتر
}

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

window.addEventListener('error', (event) => {
  console.error('Uncaught Error:', event.error);
  // فقط برای errors خطرناک
  if (event.error && event.error.message &&
      event.error.message.includes('localStorage')) {
    showToast('مشکلی در ذخیره‌سازی رخ داد', 'error');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  showToast('خطایی رخ داد. لطفا دوباره سعی کنید', 'error');
});

// ============================================
// UTILITY HELPERS
// ============================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
