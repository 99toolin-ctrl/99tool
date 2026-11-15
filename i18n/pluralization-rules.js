/**
 * Pluralization Rules for 99tool.in i18n
 * 
 * Each language has a function that takes a count and returns a form index (0, 1, or 2)
 * This determines which plural form to use.
 */

const pluralizationRules = {
  // English: 2 forms (singular, plural)
  en: (n) => n === 1 ? 0 : 1,
  
  // Spanish: 2 forms (singular, plural)
  es: (n) => n === 1 ? 0 : 1,
  
  // French: 2 forms (singular, plural)
  fr: (n) => n <= 1 ? 0 : 1,
  
  // German: 2 forms (singular, plural)
  de: (n) => n === 1 ? 0 : 1,
  
  // Italian: 2 forms (singular, plural)
  it: (n) => n === 1 ? 0 : 1,
  
  // Portuguese: 2 forms (singular, plural)
  pt: (n) => n === 1 ? 0 : 1,
  
  // Russian: 3 forms (nominative singular, genitive singular, genitive plural)
  ru: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 0;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1;
    return 2;
  },
  
  // Japanese: 1 form
  ja: () => 0,
  
  // Chinese: 1 form
  zh: () => 0,
  
  // Korean: 1 form
  ko: () => 0,
  
  // Arabic: 2 forms (simplified)
  ar: (n) => n === 1 ? 0 : 1,
  
  // Hindi: 2 forms
  hi: (n) => n === 1 ? 0 : 1,
  
  // Turkish: 1 form
  tr: () => 0,
  
  // Dutch: 2 forms
  nl: (n) => n === 1 ? 0 : 1,
  
  // Polish: 3 forms
  pl: (n) => {
    if (n === 1) return 0;
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1;
    return 2;
  },
  
  // Swedish: 2 forms
  sv: (n) => n === 1 ? 0 : 1,
  
  // Vietnamese: 1 form
  vi: () => 0,
  
  // Thai: 1 form
  th: () => 0,
  
  // Indonesian: 1 form
  id: () => 0,
  
  // Farsi: 2 forms
  fa: (n) => n === 1 ? 0 : 1,
  
  // Ukrainian: 3 forms
  uk: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 0;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1;
    return 2;
  }
};

// Expose globally for i18n.js
window.pluralizationRules = pluralizationRules;
