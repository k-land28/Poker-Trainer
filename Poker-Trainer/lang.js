// lang.js
import { translations } from './translations.js';

let currentLanguage = 'ja'; // デフォルトを日本語に

/**
 * 指定されたキーの翻訳テキストを取得する
 * @param {string} key - translations.js に登録されている翻訳キー
 * @returns {string} 翻訳されたテキスト
 */
export function getText(key) {
  const langData = translations[currentLanguage];
  return langData && langData[key] ? langData[key] : `[${key}]`;
}

/**
 * 現在の言語を取得する
 * @returns {'ja' | 'en'} 現在の言語コード
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 言語を切り替える
 * 'ja' → 'en'、'en' → 'ja'
 */
export function toggleLanguage() {
  currentLanguage = currentLanguage === 'ja' ? 'en' : 'ja';
}