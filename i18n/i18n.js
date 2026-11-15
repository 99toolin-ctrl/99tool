/**
 * 99tool.in i18n Framework
 * Handles multilingual content loading, language detection, and translation
 */

(function () {
  'use strict';

  // Detect language from URL path, query param, or localStorage
  function detectLanguage() {
    const validLanguages = [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko',
      'ar', 'hi', 'tr', 'nl', 'pl', 'sv', 'vi', 'th', 'id', 'fa', 'uk'
    ];
    
    // 1. Check URL path prefix (e.g. /es/ or /es/index.html)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && validLanguages.includes(pathParts[0])) {
      return pathParts[0];
    }

    // 2. Check query parameter ?lang=es
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam && validLanguages.includes(langParam)) {
        return langParam;
      }
    } catch (e) {}

    // 3. Check localStorage
    try {
      const savedLang = localStorage.getItem('selected_lang');
      if (savedLang && validLanguages.includes(savedLang)) {
        return savedLang;
      }
    } catch (e) {}

    return 'en';
  }

  // Initialize i18n object
  const i18n = {
    currentLanguage: detectLanguage(),
    translations: {},
    outputStrings: {},
    pluralRules: null,
    formatHelpers: null,
    
    /**
     * Initialize i18n framework
     */
    async init() {
      try {
        await this.loadTranslations(this.currentLanguage);
        await this.loadOutputStrings();
        await this.loadPluralRules();
        await this.loadFormatHelpers();
        
        console.log(`[i18n] Initialized for language: ${this.currentLanguage}`);
        
        document.dispatchEvent(new CustomEvent('i18n:ready', {
          detail: { language: this.currentLanguage }
        }));
        
      } catch (error) {
        console.error('[i18n] Initialization failed:', error);
        this.currentLanguage = 'en';
      }
    },
    
    /**
     * Load translation JSON file for a language
     */
    async loadTranslations(langCode) {
      const cacheKey = `i18n_translations_${langCode}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.expiry && parsed.expiry > Date.now()) {
            this.translations = parsed.data;
            console.log(`[i18n] Loaded ${langCode} translations from cache`);
            return;
          }
        } catch (e) {
          console.warn('[i18n] Cache parse error, fetching fresh');
          localStorage.removeItem(cacheKey);
        }
      }
      
      const response = await fetch(`/i18n/${langCode}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load i18n/${langCode}.json: ${response.status}`);
      }
      
      this.translations = await response.json();
      
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      const cacheData = JSON.stringify({
        data: this.translations,
        expiry: expiryTime
      });
      localStorage.setItem(cacheKey, cacheData);
      
      console.log(`[i18n] Loaded ${langCode} translations from server`);
    },
    
    /**
     * Load output localization strings
     */
    async loadOutputStrings() {
      const cacheKey = 'i18n_output_strings';
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.expiry && parsed.expiry > Date.now()) {
            this.outputStrings = parsed.data;
            console.log('[i18n] Loaded output strings from cache');
            return;
          }
        } catch (e) {
          console.warn('[i18n] Cache parse error, fetching fresh');
          localStorage.removeItem(cacheKey);
        }
      }
      
      const response = await fetch('/i18n/output-strings.json');
      if (!response.ok) {
        throw new Error(`Failed to load output-strings.json: ${response.status}`);
      }
      
      this.outputStrings = await response.json();
      
      const expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
      const cacheData = JSON.stringify({
        data: this.outputStrings,
        expiry: expiryTime
      });
      localStorage.setItem(cacheKey, cacheData);
      
      console.log('[i18n] Loaded output strings from server');
    },
    
    /**
     * Load pluralization rules
     */
    async loadPluralRules() {
      if (window.pluralizationRules) {
        this.pluralRules = window.pluralizationRules;
        console.log('[i18n] Pluralization rules loaded');
      } else {
        console.warn('[i18n] Pluralization rules not available');
      }
    },
    
    /**
     * Load format helpers
     */
    async loadFormatHelpers() {
      if (window.formatHelpers) {
        this.formatHelpers = window.formatHelpers;
        console.log('[i18n] Format helpers loaded');
      } else {
        console.warn('[i18n] Format helpers not available');
      }
    },
    
    /**
     * Main translation function
     */
    translate(key, defaultValue = null) {
      const parts = key.split('.');
      let current = this.translations;
      
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return defaultValue;
        }
      }
      
      return (current !== undefined && current !== null) ? current : defaultValue;
    },
    
    /**
     * Translate with variable substitution
     */
    translateWithVars(key, variables = {}) {
      let string = this.translate(key);
      if (typeof string !== 'string') return key;
      
      Object.entries(variables).forEach(([varName, value]) => {
        const placeholder = `{${varName}}`;
        string = string.replace(new RegExp(placeholder, 'g'), value);
      });
      
      return string;
    },
    
    /**
     * Format a number according to current language conventions
     */
    formatNumber(number, decimals = 2) {
      if (!this.formatHelpers) {
        return Number(number).toFixed(decimals);
      }
      return this.formatHelpers.formatNumber(number, decimals, this.currentLanguage);
    },
    
    /**
     * Format a date according to current language conventions
     */
    formatDate(date, format = null) {
      if (!this.formatHelpers) {
        return (date instanceof Date ? date : new Date(date)).toLocaleDateString();
      }
      return this.formatHelpers.formatDate(date, format, this.currentLanguage);
    },
    
    /**
     * Format currency according to current language conventions
     */
    formatCurrency(amount, currencyCode = null) {
      if (!this.formatHelpers) {
        return Number(amount).toFixed(2);
      }
      return this.formatHelpers.formatCurrency(amount, currencyCode, this.currentLanguage);
    },
    
    /**
     * Get correct plural form for a count
     */
    getPluralForm(count, baseKey) {
      if (!this.pluralRules) {
        return count === 1 ? baseKey : baseKey + 's';
      }
      
      const pluralizeFn = this.pluralRules[this.currentLanguage] || this.pluralRules['en'];
      const formIndex = pluralizeFn(count);
      
      const forms = this.outputStrings.common_units?.time?.[`${baseKey}_forms`];
      if (forms && forms[formIndex]) {
        return forms[formIndex];
      }
      
      return count === 1 ? baseKey : baseKey + 's';
    },
    
    /**
     * Get localized unit name
     */
    getUnit(unitType, count = 1) {
      const unitKey = count === 1 ? `${unitType}_singular` : `${unitType}_plural`;
      const unitNames = this.outputStrings.common_units;
      
      if (unitNames) {
        for (const category in unitNames) {
          if (unitNames[category][unitKey]) {
            return unitNames[category][unitKey][this.currentLanguage] || unitNames[category][unitKey]['en'];
          }
        }
      }
      
      return unitType;
    },
    
    /**
     * Get current language code
     */
    getLanguage() {
      return this.currentLanguage;
    },
    
    /**
     * Change language
     */
    setLanguage(langCode) {
      if (langCode !== this.currentLanguage) {
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace(`/${this.currentLanguage}/`, `/${langCode}/`);
        window.location.href = newPath;
      }
    }
  };
  
  // Expose i18n globally
  window.i18n = i18n;
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.i18n.init();
    });
  } else {
    window.i18n.init();
  }
})();
