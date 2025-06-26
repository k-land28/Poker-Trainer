// lang.js
import { translations } from './translations.js';

let currentLanguage = 'ja'; // デフォルトを日本語に

export function getText(key, ...args) {
  const value = translations[currentLanguage]?.[key];
  if (typeof value === "function") {
    try {
      return value(...args); // 引数がある場合に展開して渡す
    } catch (e) {
      console.warn(`Error calling translation function for key "${key}"`, e);
      return `[${key}]`;
    }
  } else if (typeof value !== "undefined") {
    return value;
  } else {
    console.warn(`Missing translation for key: "${key}" in ${currentLanguage}`);
    return `[${key}]`;
  }
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function toggleLanguage() {
  currentLanguage = currentLanguage === 'ja' ? 'en' : 'ja';
}

export { translations };