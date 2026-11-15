/**
 * 99tool.in Multilingual DOM Translator & Auto-Translation Engine
 * Translates header, footer, page headings, meta title, meta description, data-i18n attributes, and full body content across all 21 languages.
 */

(function () {
  'use strict';

  const validLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar', 'hi', 'tr', 'nl', 'pl', 'sv', 'vi', 'th', 'id', 'fa', 'uk'];

  function detectLanguage() {
    // 1. Check URL path prefix (e.g. /es/ or /es/index.html)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && validLangs.includes(pathParts[0])) {
      return pathParts[0];
    }

    // 2. Check query parameter ?lang=es
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && validLangs.includes(langParam)) {
        return langParam;
      }
    } catch (e) {}

    // 3. Check localStorage
    try {
      const savedLang = localStorage.getItem('selected_lang');
      if (savedLang && validLangs.includes(savedLang)) {
        return savedLang;
      }
    } catch (e) {}

    // 4. Check googtrans cookie
    try {
      const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
      if (match && validLangs.includes(match[1])) {
        return match[1];
      }
    } catch (e) {}

    return 'en';
  }

  const currentLang = detectLanguage();

  const uiTranslations = {
    'tr': {
      'Home': 'Ana Sayfa', 'PDF Tools': 'PDF Araçları', 'Image Tools': 'Görsel Araçları', 'Global Testers': 'Test Araçları', 'Calculators': 'Hesaplayıcılar', 'Tools': 'Tüm Araçlar', 'About': 'Hakkımızda', 'Contact': 'İletişim',
      'TOOLS': 'ARAÇLAR', 'MORE TOOLS': 'DİĞER ARAÇLAR', 'COMPANY': 'ŞİRKET', 'Privacy Policy': 'Gizlilik Politikası', 'Disclaimer': 'Sorumluluk Reddi',
      'Free online tools for everyone — fast, private, and no install required.': 'Herkes için ücretsiz çevrimiçi araçlar — hızlı, özel ve kurulum gerektirmez.',
      'All rights reserved.': 'Tüm hakları saklıdır.', 'Made with ❤️ for the web': 'Web için ❤️ ile yapılmıştır',
      'Frequently Asked Questions': 'Sıkça Sorulan Sorular', 'Drag & drop your PDF or': 'PDF\'inizi sürükleyip bırakın veya', 'browse files': 'dosyalara göz atın'
    },
    'es': {
      'Home': 'Inicio', 'PDF Tools': 'Herramientas PDF', 'Image Tools': 'Herramientas de Imagen', 'Global Testers': 'Probadores Globales', 'Calculators': 'Calculadoras', 'Tools': 'Herramientas', 'About': 'Acerca de', 'Contact': 'Contacto',
      'TOOLS': 'HERRAMIENTAS', 'MORE TOOLS': 'MÁS HERRAMIENTAS', 'COMPANY': 'EMPRESA', 'Privacy Policy': 'Política de Privacidad', 'Disclaimer': 'Aviso Legal',
      'Free online tools for everyone — fast, private, and no install required.': 'Herramientas gratuitas en línea para todos: rápidas, privadas y sin instalación.',
      'All rights reserved.': 'Todos los derechos reservados.', 'Made with ❤️ para la web': 'Hecho con ❤️ para la web',
      'Frequently Asked Questions': 'Preguntas Frecuentes', 'Drag & drop your PDF or': 'Arrastra y suelta tu PDF o', 'browse files': 'buscar archivos'
    },
    'fr': {
      'Home': 'Accueil', 'PDF Tools': 'Outils PDF', 'Image Tools': 'Outils Image', 'Global Testers': 'Testeurs Globaux', 'Calculators': 'Calculateurs', 'Tools': 'Outils', 'About': 'À propos', 'Contact': 'Contact',
      'TOOLS': 'OUTILS', 'MORE TOOLS': 'PLUS D\'OUTILS', 'COMPANY': 'SOCIÉTÉ', 'Privacy Policy': 'Politique de Confidentialité', 'Disclaimer': 'Mentions Légales',
      'Free online tools for everyone — fast, private, and no install required.': 'Outils en ligne gratuits pour tous — rapides, privés et sans installation.',
      'All rights reserved.': 'Tous droits réservés.', 'Made with ❤️ for the web': 'Fait avec ❤️ pour le web',
      'Frequently Asked Questions': 'Foire Aux Questions', 'Drag & drop your PDF or': 'Glissez-déposez votre PDF ou', 'browse files': 'parcourir les fichiers'
    },
    'de': {
      'Home': 'Startseite', 'PDF Tools': 'PDF-Werkzeuge', 'Image Tools': 'Bild-Werkzeuge', 'Global Testers': 'Globale Tester', 'Calculators': 'Rechner', 'Tools': 'Werkzeuge', 'About': 'Über uns', 'Contact': 'Kontakt',
      'TOOLS': 'WERKZEUGE', 'MORE TOOLS': 'WEITERE WERKZEUGE', 'COMPANY': 'UNTERNEHMEN', 'Privacy Policy': 'Datenschutz-Bestimmungen', 'Disclaimer': 'Haftungsausschluss',
      'Free online tools for everyone — fast, private, and no install required.': 'Kostenlose Online-Werkzeuge für alle – schnell, privat und ohne Installation.',
      'All rights reserved.': 'Alle Rechte vorbehalten.', 'Made with ❤️ for the web': 'Mit ❤️ für das Web gemacht',
      'Frequently Asked Questions': 'Häufig gestellte Fragen', 'Drag & drop your PDF or': 'PDF hierher ziehen oder', 'browse files': 'Dateien durchsuchen'
    },
    'hi': {
      'Home': 'मुख्य पृष्ठ', 'PDF Tools': 'पीडीएफ टूल्स', 'Image Tools': 'इमेज टूल्स', 'Global Testers': 'ग्लोबल टेस्टर्स', 'Calculators': 'कैलकुलेटर', 'Tools': 'टूल्स', 'About': 'हमारे बारे में', 'Contact': 'संपर्क करें',
      'TOOLS': 'टूल्स', 'MORE TOOLS': 'अन्य टूल्स', 'COMPANY': 'कंपनी', 'Privacy Policy': 'गोपनीयता नीति', 'Disclaimer': 'अस्वीकरण',
      'Free online tools for everyone — fast, private, and no install required.': 'सभी के लिए मुफ्त ऑनलाइन टूल्स — तेज़, निजी और बिना इंस्टॉल के।',
      'All rights reserved.': 'सर्वाधिकार सुरक्षित।', 'Made with ❤️ for the web': 'वेब के लिए ❤️ से बनाया गया',
      'Frequently Asked Questions': 'अक्सर पूछे जाने वाले प्रश्न'
    },
    'ar': {
      'Home': 'الرئيسية', 'PDF Tools': 'أدوات PDF', 'Image Tools': 'أدوات الصور', 'Global Testers': 'أدوات الاختبار', 'Calculators': 'الحاسبات', 'Tools': 'الأدوات', 'About': 'من نحن', 'Contact': 'اتصل بنا',
      'TOOLS': 'الأدوات', 'MORE TOOLS': 'المزيد من الأدوات', 'COMPANY': 'الشركة', 'Privacy Policy': 'سياسة الخصوصية', 'Disclaimer': 'إخلاء المسؤولية',
      'Free online tools for everyone — fast, private, and no install required.': 'أدوات مجانية عبر الإنترنت للجميع — سريعة وخاصة وبدون تثبيت.',
      'All rights reserved.': 'جميع الحقوق محفوظة.', 'Made with ❤️ for the web': 'صنع بـ ❤️ للويب',
      'Frequently Asked Questions': 'الأسئلة الشائعة'
    }
  };

  function updateMetaAndTitle() {
    const pathParts = window.location.pathname.split('/');
    const toolPath = pathParts[pathParts.length - 1];
    if (!toolPath) return;

    const toolId = toolPath.replace('.html', '').replace(/-/g, '_');
    
    let pageTitle = null;
    let metaDesc = null;

    if (window.i18n && typeof window.i18n.translate === 'function') {
      pageTitle = window.i18n.translate(`tools.${toolId}.page_title`);
      metaDesc = window.i18n.translate(`tools.${toolId}.meta_description`);
    }

    // Filter out raw key fallbacks (e.g. tools.pdf_to_image.page_title)
    if (pageTitle && pageTitle.startsWith('tools.')) pageTitle = null;
    if (metaDesc && metaDesc.startsWith('tools.')) metaDesc = null;

    // Fallback to h1 + brand name if pageTitle is not in JSON
    if (!pageTitle) {
      const h1 = document.querySelector('.tool-header h1, h1');
      if (h1 && h1.textContent.trim()) {
        const h1Text = h1.textContent.trim();
        pageTitle = `${h1Text} – 99tool.in`;
      }
    }

    // Fallback to subtitle if metaDesc is not in JSON
    if (!metaDesc) {
      const subtitle = document.querySelector('.tool-header p');
      if (subtitle && subtitle.textContent.trim()) {
        metaDesc = subtitle.textContent.trim();
      }
    }

    if (pageTitle) {
      document.title = pageTitle;
      const titleEl = document.getElementById('page-title');
      if (titleEl) titleEl.textContent = pageTitle;
    }

    if (metaDesc) {
      let metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) metaEl.setAttribute('content', metaDesc);
    }

    ['og:title', 'og:description'].forEach(property => {
      let ogEl = document.querySelector(`meta[property="${property}"]`);
      if (ogEl) {
        if (property === 'og:title' && pageTitle) ogEl.setAttribute('content', pageTitle);
        if (property === 'og:description' && metaDesc) ogEl.setAttribute('content', metaDesc);
      }
    });

    ['twitter:title', 'twitter:description'].forEach(name => {
      let twitterEl = document.querySelector(`meta[name="${name}"]`);
      if (twitterEl) {
        if (name === 'twitter:title' && pageTitle) twitterEl.setAttribute('content', pageTitle);
        if (name === 'twitter:description' && metaDesc) twitterEl.setAttribute('content', metaDesc);
      }
    });

    const schemaName = pageTitle;
    const schemaDesc = metaDesc;
    if (schemaName || schemaDesc) {
      const schemaEl = document.getElementById('schema-org-data') || document.querySelector('script[type="application/ld+json"]');
      if (schemaEl) {
        try {
          const schema = JSON.parse(schemaEl.textContent);
          if (schemaName) schema.name = schemaName;
          if (schemaDesc) schema.description = schemaDesc;
          schemaEl.textContent = JSON.stringify(schema, null, 2);
        } catch (e) {}
      }
    }
  }

  function translateDOM() {
    if (currentLang === 'en') {
      updateMetaAndTitle();
      return;
    }

    // Set HTML lang attribute and text direction for RTL languages
    document.documentElement.lang = currentLang;
    if (['ar', 'fa'].includes(currentLang)) {
      document.documentElement.dir = 'rtl';
    }

    const dict = uiTranslations[currentLang] || {};

    // 1. Translate elements with data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (window.i18n && typeof window.i18n.translate === 'function') {
        const translatedText = window.i18n.translate(key);
        if (translatedText && translatedText !== key && !translatedText.startsWith('tools.')) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.hasAttribute('placeholder')) el.placeholder = translatedText;
            else el.value = translatedText;
          } else {
            el.innerHTML = translatedText;
          }
        }
      }
    });

    // 2. Translate Header Navigation Links
    const navMap = {
      'nav-home': 'Home', 'nav-pdf': 'PDF Tools', 'nav-image': 'Image Tools',
      'nav-testers': 'Global Testers', 'nav-calculators': 'Calculators',
      'nav-physics': 'Tools', 'nav-math': 'Tools', 'nav-about': 'About', 'nav-contact': 'Contact'
    };

    Object.entries(navMap).forEach(([id, origText]) => {
      const el = document.getElementById(id);
      if (el && dict[origText]) {
        el.textContent = dict[origText];
      }
    });

    // 3. Update Meta Title & Description
    updateMetaAndTitle();

    // 4. Translate Footer and Common Static UI Elements
    const footerHeaders = document.querySelectorAll('.footer-col h4, .footer-col h3');
    footerHeaders.forEach(h => {
      const txt = h.textContent.trim();
      if (dict[txt]) h.textContent = dict[txt];
    });

    const footerLinks = document.querySelectorAll('.footer-col a, .footer-bottom a');
    footerLinks.forEach(a => {
      const txt = a.textContent.trim();
      if (dict[txt]) a.textContent = dict[txt];
    });

    const footerP = document.querySelector('.footer-col p');
    if (footerP) {
      const txt = footerP.textContent.trim();
      if (dict[txt]) footerP.textContent = dict[txt];
    }

    // 5. Client-Side Full Page Auto-Translation (Google Translate Silent Engine)
    if (currentLang !== 'en' && !window.googleTranslateLoaded) {
      window.googleTranslateLoaded = true;

      const domain = window.location.hostname;
      document.cookie = `googtrans=/en/${currentLang}; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/${currentLang}; path=/;`;

      if (!document.getElementById('google_translate_element')) {
        const gtDiv = document.createElement('div');
        gtDiv.id = 'google_translate_element';
        gtDiv.style.display = 'none';
        document.body.appendChild(gtDiv);
      }

      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: validLangs.join(','),
          autoDisplay: false
        }, 'google_translate_element');
      };

      const gtScript = document.createElement('script');
      gtScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      gtScript.async = true;
      document.head.appendChild(gtScript);
    }
  }

  // Run DOM translation & title update on DOM ready and i18n ready
  document.addEventListener('i18n:ready', translateDOM);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translateDOM);
  } else {
    setTimeout(translateDOM, 50);
  }
})();
