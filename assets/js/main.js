/* =============================================
   main.js — 99tool.in global script
   ============================================= */

/* ---- 1. Load header & footer via fetch ---- */
async function loadComponent(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Component not found');
    el.innerHTML = await res.text();
    if (id === 'site-header') initHeader();
    markActiveNav();
  } catch (e) {
    console.warn(`Component load failed (${path}):`, e.message);
  }
}

/* ---- 2. Header & Navigation Initialization ---- */
function initHeader() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.getElementById('nav-overlay');
  const closeBtn = document.getElementById('mobile-drawer-close');

  if (!toggle || !navLinks) return;

  function openDrawer() {
    if (navLinks) navLinks.classList.add('open');
    if (toggle) toggle.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (navLinks) navLinks.classList.remove('open');
    if (toggle) toggle.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 1. Mobile Drawer Toggle & Overlay Listeners
  toggle.onclick = (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (overlay) overlay.onclick = closeDrawer;

  const navAnchors = navLinks.querySelectorAll('a:not([data-lang])');
  navAnchors.forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 860) closeDrawer();
    });
  });

  // 2. Mobile Sub-menu Toggle (Dropdown) — Support multiple dropdowns
  const triggers = document.querySelectorAll('.nav-item-dropdown .dropdown-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        e.stopPropagation();
        
        triggers.forEach(t => {
          if (t !== trigger) t.parentElement.classList.remove('active');
        });

        trigger.parentElement.classList.toggle('active');
      }
    });
  });

  // 3. Resolve Paths based on page depth
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  const rootIdx = parts.findIndex(p => p === '99tool.in');
  let base = '';
  
  if (window.location.protocol === 'file:' && rootIdx !== -1) {
    base = parts.slice(0, rootIdx + 1).join('/');
    base = '/' + base;
  } else {
    const depth = parts.length;
    base = depth > 1 ? '../'.repeat(depth - 1).slice(0, -1) : '.';
  }

  // Fix all relative links in header
  const logo = document.getElementById('logo-link');
  if (logo) logo.href = base + '/index.html';

  const navMap = {
    'nav-home': '/index.html',
    'nav-pdf': '/index.html#pdf',
    'nav-image': '/index.html#image',
    'nav-testers': '/index.html#network',
    'nav-calculators': '/index.html#health',
    'nav-physics': '/index.html#physics',
    'nav-math': '/index.html#math',
    'nav-about': '/about.html',
    'nav-contact': '/contact.html'
  };

  Object.entries(navMap).forEach(([id, href]) => {
    const el = document.getElementById(id);
    if (el) el.href = base + href;
  });

  const dropLinks = document.querySelectorAll('.dropdown-menu a');
  dropLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/')) {
      link.href = base + href;
    }
  });

  // 4. Highlight Active Link
  markActiveNav();

  // 5. Language Selector Dropdown Setup
  const currentLang = (window.i18n && window.i18n.getLanguage) ? window.i18n.getLanguage() : (function() {
    const p = window.location.pathname.split('/').filter(Boolean);
    const validLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'tr', 'nl', 'pl', 'sv', 'vi', 'th', 'id', 'fa', 'uk'];
    return (p.length > 0 && validLangs.includes(p[0])) ? p[0] : 'en';
  })();
  
  const langConfig = {
    'en': { name: 'English', flag: 'USA.png' },
    'es': { name: 'Español', flag: 'Spain.png' },
    'fr': { name: 'Français', flag: 'France.png' },
    'de': { name: 'Deutsch', flag: 'Germany.png' },
    'it': { name: 'Italiano', flag: 'Italy.png' },
    'pt': { name: 'Português', flag: 'Portugal.png' },
    'ru': { name: 'Русский', flag: 'Russia.png' },
    'ja': { name: '日本語', flag: 'Japan.png' },
    'zh': { name: '中文', flag: 'China.png' },
    'ko': { name: '한국어', flag: 'South Korea.png' },
    'ar': { name: 'العربية', flag: 'Saudi Arabia.png' },
    'hi': { name: 'हिन्दी', flag: 'India.png' },
    'tr': { name: 'Türkçe', flag: 'Turkey.png' },
    'nl': { name: 'Nederlands', flag: 'Netherlands.png' },
    'pl': { name: 'Polski', flag: 'Poland.png' },
    'sv': { name: 'Swedish', flag: 'Philippines.png' },
    'vi': { name: 'Tiếng Việt', flag: 'Vietnam.png' },
    'th': { name: 'ไทย', flag: 'Thailand.png' },
    'id': { name: 'Bahasa Indonesia', flag: 'Indonesia.png' },
    'fa': { name: 'فارسی', flag: 'Pakistan.png' },
    'uk': { name: 'Українська', flag: 'Bangladesh.png' }
  };

  const currConfig = langConfig[currentLang] || langConfig['en'];
  const flagImgEl = document.getElementById('current-lang-flag');
  const langNameEl = document.getElementById('current-lang-name');
  
  if (flagImgEl) {
    flagImgEl.src = base + '/flags-images/' + currConfig.flag;
    flagImgEl.style.cssText = "width:20px !important; height:14px !important; min-width:20px !important; min-height:14px !important; max-width:20px !important; max-height:14px !important; object-fit:cover !important; display:inline-block !important; vertical-align:middle !important; flex-shrink:0 !important; margin:0 4px 0 0 !important;";
  }
  if (langNameEl) langNameEl.textContent = currConfig.name;

  const langOptions = document.querySelectorAll('.lang-dropdown-menu a[data-lang]');
  langOptions.forEach(opt => {
    opt.style.cssText = "display:flex !important; flex-direction:row !important; align-items:center !important; justify-content:flex-start !important; gap:10px !important; white-space:nowrap !important; padding:8px 12px !important;";
    const lCode = opt.getAttribute('data-lang');
    const cfg = langConfig[lCode];
    if (cfg) {
      const img = opt.querySelector('img');
      if (img) {
        img.src = base + '/flags-images/' + cfg.flag;
        img.style.cssText = "width:20px !important; height:14px !important; min-width:20px !important; min-height:14px !important; max-width:20px !important; max-height:14px !important; object-fit:cover !important; display:inline-block !important; vertical-align:middle !important; flex-shrink:0 !important; margin:0 !important;";
      }
    }
    if (lCode === currentLang) {
      opt.classList.add('active');
    }

    opt.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = lCode;

      // 1. Save selected language to localStorage & cookies
      try {
        localStorage.setItem('selected_lang', targetLang);
      } catch (err) {}

      document.cookie = `googtrans=/en/${targetLang}; path=/;`;
      if (window.location.hostname) {
        document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname};`;
      }

      // 2. Set i18n instance language if present
      if (window.i18n && typeof window.i18n.setLanguage === 'function') {
        window.i18n.setLanguage(targetLang);
      }

      // 3. Construct target URL with subpath + query parameter for universal compatibility
      const currentPath = window.location.pathname;
      const validLangs = Object.keys(langConfig);
      const pathParts = currentPath.split('/').filter(Boolean);
      
      let newPath = '';
      if (pathParts.length > 0 && validLangs.includes(pathParts[0])) {
        pathParts[0] = targetLang;
        newPath = '/' + pathParts.join('/');
      } else if (currentPath === '/' || currentPath.endsWith('index.html')) {
        newPath = '/' + targetLang + '/index.html';
      } else {
        newPath = '/' + targetLang + currentPath;
      }
      
      const newUrl = newPath + '?lang=' + targetLang + window.location.hash;
      window.location.href = newUrl;
    });
  });
}

function markActiveNav() {
  const links = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname.replace(/\/$/, '');
  const currentHash = window.location.hash;
  
  links.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    
    try {
      // Handle file protocol or relative paths safely
      const linkParsed = link.href.split('#')[0].replace(/\/$/, '');
      const linkHash = link.hash;

      if (link.href.includes(currentPath) || currentPath.includes(linkParsed)) {
        if (linkHash) {
          if (linkHash === currentHash) link.classList.add('active');
        } else if (!currentHash) {
          link.classList.add('active');
        }
      }
    } catch(e) {}
  });
}

/* ---- 4. FAQ Accordion ---- */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---- 5. Tool search (home page) ---- */
function initSearch() {
  const input = document.getElementById('tool-search');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.tool-card');
    const blocks = document.querySelectorAll('.category-block');

    cards.forEach(card => {
      const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      card.style.display = (name.includes(q) || desc.includes(q) || q === '') ? '' : 'none';
    });

    // Hide empty categories
    blocks.forEach(block => {
      const visible = [...block.querySelectorAll('.tool-card')].some(c => c.style.display !== 'none');
      block.style.display = visible ? '' : 'none';
    });

    // No results
    const noResults = document.getElementById('no-results');
    if (noResults) {
      const anyVisible = [...cards].some(c => c.style.display !== 'none');
      noResults.style.display = anyVisible ? 'none' : 'block';
    }
  });
}

/* ---- 6. Copy to clipboard helper ---- */
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.color = '#4caf50';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.color = '';
      }, 1800);
    }
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

/* ---- 7. Utility: resolve component path relative to current page ---- */
function getComponentPath(filename) {
  // Calculate path depth from current location
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const rootPath = window.location.protocol + '//' + window.location.host;

  // For file:// protocol (local development)
  if (window.location.protocol === 'file:') {
    const parts = window.location.pathname.split('/');
    // Find index of '99tool.in' folder
    const rootIdx = parts.findIndex(p => p === '99tool.in');
    if (rootIdx !== -1) {
      return parts.slice(0, rootIdx + 1).join('/') + '/components/' + filename;
    }
  }
  // For http/https
  const prefix = '../'.repeat(Math.max(0, depth - 1));
  return prefix + 'components/' + filename;
}

/* ---- 8. Cookie Consent Banner ---- */
function initCookieBanner() {
  const consent = localStorage.getItem('99tool_cookie_consent');
  if (!consent) {
    // Generate relative path to privacy.html
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    let privacyPath = 'privacy.html';
    
    // Check if in a subfolder (like /tools/category/)
    if (window.location.protocol === 'file:') {
       const parts = window.location.pathname.split('/');
       const rootIdx = parts.findIndex(p => p === '99tool.in');
       if (rootIdx !== -1) {
         privacyPath = parts.slice(0, rootIdx + 1).join('/') + '/privacy.html';
       }
    } else {
       privacyPath = '../'.repeat(Math.max(0, depth - 1)) + 'privacy.html';
    }

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <p>We use cookies to improve your experience and show personalized ads. By using 99tool.in, you agree to our <a href="${privacyPath}">Privacy Policy</a>.</p>
      <div class="cookie-btns">
        <button class="btn btn-secondary btn-sm" id="decline-cookies">Decline</button>
        <button class="btn btn-primary btn-sm" id="accept-cookies">Accept</button>
      </div>
    `;
    document.body.appendChild(banner);
    
    // Show with slight delay
    setTimeout(() => banner.classList.add('show'), 1200);

    document.getElementById('accept-cookies').addEventListener('click', () => {
      localStorage.setItem('99tool_cookie_consent', 'accepted');
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 600);
    });

    document.getElementById('decline-cookies').addEventListener('click', () => {
      localStorage.setItem('99tool_cookie_consent', 'declined');
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 600);
    });
  }
}

/* ---- 9. Global Drag-and-Drop Prevention ---- */
function initGlobalDragDrop() {
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  }, false);

  window.addEventListener('drop', (e) => {
    e.preventDefault();
  }, false);
}

/**
 * Helper to recursively read all files from dropped items (including folders)
 * @param {DataTransfer} dataTransfer
 * @returns {Promise<File[]>}
 */
async function getFilesFromDroppedItems(dataTransfer) {
  const files = [];
  const items = dataTransfer.items;
  
  if (!items) {
    if (dataTransfer.files) {
      return Array.from(dataTransfer.files);
    }
    return [];
  }

  const traverseEntry = (entry) => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          files.push(file);
          resolve();
        }, () => resolve());
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const readAllEntries = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve();
            } else {
              const promises = entries.map(childEntry => traverseEntry(childEntry));
              await Promise.all(promises);
              readAllEntries(); // Read next batch (handles browser limits)
            }
          }, () => resolve());
        };
        readAllEntries();
      } else {
        resolve();
      }
    });
  };

  const promises = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        promises.push(traverseEntry(entry));
      } else {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
  }

  await Promise.all(promises);
  return files;
}

/**
 * Standardized Drag & Drop Initialization for Tools
 * @param {string} id - The ID of the drop zone element
 * @param {function} callback - Function(files) to handle the drop
 */
function setupDragDrop(id, callback) {
  const zone = document.getElementById(id);
  if (!zone) return;

  // Disable pointer events on all children to prevent dragleave flickering when hovering over text/icons
  const style = document.createElement('style');
  style.innerHTML = `#${id} * { pointer-events: none; }`;
  document.head.appendChild(style);

  // Support both 'drag-over' and 'dragover' classes
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    zone.classList.remove('dragover');
    
    try {
      const files = await getFilesFromDroppedItems(e.dataTransfer);
      if (files.length > 0) {
        callback(files);
      }
    } catch (err) {
      console.error('Error reading dropped files:', err);
    }
  });
}

/* ---- 9. Auto-init on DOMContentLoaded ---- */
document.addEventListener('DOMContentLoaded', () => {
  const headerPath = getComponentPath('header.html');
  const footerPath = getComponentPath('footer.html');

  loadComponent('site-header', headerPath);
  loadComponent('site-footer', footerPath);

  initFAQ();
  initSearch();
  initCookieBanner();
  initViewMore();
  initGlobalDragDrop();
});

// VIEW MORE TOGGLE
function initViewMore() {
  const buttons = document.querySelectorAll('.view-more-btn');
  buttons.forEach(btn => {
    const category = btn.closest('.category-block');
    const grid = category.querySelector('.tools-grid');
    const toolCount = grid.querySelectorAll('.tool-card').length;

    // Hide button if 4 or fewer tools
    if (toolCount <= 4) {
      btn.parentElement.style.display = 'none';
      grid.classList.remove('collapsed');
      return;
    }

    btn.addEventListener('click', () => {
      const isCollapsed = grid.classList.toggle('collapsed');
      
      const catName = btn.getAttribute('data-category');
      const formattedName = catName.charAt(0).toUpperCase() + catName.slice(1);
      
      btn.textContent = isCollapsed 
        ? `View More ${formattedName} Tools` 
        : `View Less ${formattedName} Tools`;
      
      if (isCollapsed) {
        category.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ---- Global Event Listener for Language Selector ---- */
document.addEventListener('click', function(e) {
  const langLink = e.target.closest('[data-lang]');
  if (!langLink) return;

  e.preventDefault();
  e.stopPropagation();

  const targetLang = langLink.getAttribute('data-lang');
  if (!targetLang) return;

  try {
    localStorage.setItem('selected_lang', targetLang);
  } catch (err) {}

  document.cookie = `googtrans=/en/${targetLang}; path=/;`;
  if (window.location.hostname) {
    document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname};`;
  }

  if (window.i18n && typeof window.i18n.setLanguage === 'function') {
    window.i18n.setLanguage(targetLang);
  }

  const currentPath = window.location.pathname;
  const validLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'tr', 'nl', 'pl', 'sv', 'vi', 'th', 'id', 'fa', 'uk'];
  const pathParts = currentPath.split('/').filter(Boolean);

  let newPath = '';
  if (pathParts.length > 0 && validLangs.includes(pathParts[0])) {
    pathParts[0] = targetLang;
    newPath = '/' + pathParts.join('/');
  } else if (currentPath === '/' || currentPath.endsWith('index.html')) {
    newPath = '/' + targetLang + '/index.html';
  } else {
    newPath = '/' + targetLang + currentPath;
  }

  const cleanHash = window.location.hash.startsWith('#') ? window.location.hash : '';
  window.location.href = newPath + '?lang=' + targetLang + cleanHash;
});

/* ---- Global Mobile Drawer Toggle & Overlay Delegate ---- */
document.addEventListener('click', function(e) {
  const toggleBtn = e.target.closest('.nav-toggle');
  if (toggleBtn) {
    e.preventDefault();
    e.stopPropagation();
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.getElementById('nav-overlay');
    
    if (navLinks) {
      const isOpen = navLinks.classList.toggle('open');
      toggleBtn.classList.toggle('active', isOpen);
      if (overlay) overlay.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return;
  }

  const closeBtn = e.target.closest('#mobile-drawer-close, .nav-overlay');
  if (closeBtn) {
    const navLinks = document.querySelector('.nav-links');
    const toggleBtn = document.querySelector('.nav-toggle');
    const overlay = document.getElementById('nav-overlay');
    
    if (navLinks) navLinks.classList.remove('open');
    if (toggleBtn) toggleBtn.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
});
