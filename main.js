//main.js
console.log("main.js loaded!");

import { showPreflopMode } from './modes/preflop-trainer/preflop-trainer.js';
import { showRangeMode } from './modes/range-chart/range-chart.js';
import { showPowerNoMode } from './modes/powerno/powerno.js';
import { showTimerMode } from './modes/timer/timer.js';
import { showQuizMode } from './modes/quiz/quiz.js';
import { showHowtoMode } from './modes/howto/howto.js';
import { showSettingMode } from './modes/setting/setting.js';
import { getText, toggleLanguage, getCurrentLanguage } from './lang.js';
import { setBodyClass } from './utils/ui.js';

let mainMode = 'main';

document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("mainContent");
  const sideMenu = document.getElementById("sideMenu");
  const hamburger = document.getElementById("hamburgerMenu");
  const overlay = document.getElementById("overlay");
  const modeTitle = document.getElementById("modeTitle");
  const langButton = document.getElementById("langToggleButton");

  if (!mainContent || !sideMenu || !hamburger || !overlay || !modeTitle || !langButton) {
    console.error("いずれかの要素が見つかりません。HTMLを確認してください。");
    return;
  }

  // メニューを開く処理
  function openMenu() {
    sideMenu.classList.add("open");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  // メニューを閉じる処理
  function closeMenu() {
    sideMenu.classList.remove("open");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  // サイドメニューのテキスト更新
  // 配列で処理分けしてHTMLを返す関数
  function renderTranslatedText(text) {
    if (Array.isArray(text)) {
      return text.map(line => `<div>${line}</div>`).join('');
    }
    return text;
  }

  function updateSideMenuTexts() {
    document.getElementById("menuMain").innerHTML = renderTranslatedText(getText("menuMain"));
    document.getElementById("menuPreflop").innerHTML = renderTranslatedText(getText("preflopTrainer"));
    document.getElementById("menuRange").innerHTML = renderTranslatedText(getText("rangeChart"));
    document.getElementById("menuPowerNo").innerHTML = renderTranslatedText(getText("powerNo"));
    document.getElementById("menuQuiz").innerHTML = renderTranslatedText(getText("quiz"));
    document.getElementById("menuTimer").innerHTML = renderTranslatedText(getText("timer"));
    document.getElementById("menuSetting").innerHTML = renderTranslatedText(getText("setting"));
    langButton.innerHTML = renderTranslatedText(getText("langToggleButton"));
  }



  // 初期化：ハンバーガーボタン
  hamburger.addEventListener("click", () => {
    if (sideMenu.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // オーバーレイクリックで閉じる
  overlay.addEventListener("click", closeMenu);

  // ESCキーで閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  // 言語切替イベント
  langButton.addEventListener("click", () => {
    toggleLanguage();
    console.log("Now lang is:", getCurrentLanguage());
    updateSideMenuTexts();
    closeMenu(); // ← 追加：言語ボタン押下時にメニューを閉じる
    updateCurrentViewTexts(); // ← 修正: 現在の表示モードを保ったまま再描画
  });

  // メインメニューを表示する関数
  function showMainMenu() {
    mainMode = 'main'; // ← 追加：モードを記録
    modeTitle.textContent = getText("mainMenuTitle");
    setBodyClass('mainMenu');

    mainContent.innerHTML = `
      <button class="mainMenu-button" id="startPrefloptrainer">${renderTranslatedText(getText("preflopTrainer"))}</button>
      <button class="mainMenu-button" id="startRangeChart">${renderTranslatedText(getText("rangeChart"))}</button>
      <button class="mainMenu-button" id="startPowerNo">${renderTranslatedText(getText("powerNo"))}</button>
      <button class="mainMenu-button" id="startQuiz">${renderTranslatedText(getText("quiz"))}</button>
      <button class="mainMenu-button" id="startTimer">${renderTranslatedText(getText("timer"))}</button>
      <button class="mainMenu-button" id="startHowto">${renderTranslatedText(getText("howTo"))}</button>
      <button class="mainMenu-button" id="startSetting">${renderTranslatedText(getText("setting"))}</button>
      <a class="mainMenu-button" role="button" href="mailto:50_soother.fault@icloud.com?subject=PokerTrainerアプリのFB&body=フィードバックのご協力ありがとうございます。以下にご意見をご記入ください。
        %0A%0A---%0Aアプリのバージョン ：0.1.0%0A使用環境（例: iPhone 14, Safari）： %0A開発者からの連絡 ：可 / 不可%0AFBの内容（欲しい機能や使い勝手の悪かった点など）: "
        >✉️フィードバック</a>
      <p>ver. 0.1.0</p>
      <footer class="fyrow-footer">© Fyrow Tech</footer>
    `;

    document.getElementById("startPrefloptrainer").addEventListener("click", () => {
      closeMenu();
      mainMode = 'preflop'; // ← モード記録
      showPreflopMode(showMainMenu);
    });

    document.getElementById("startRangeChart").addEventListener("click", () => {
      closeMenu();
      mainMode = 'range';
      showRangeMode(showMainMenu);
    });

    document.getElementById("startPowerNo").addEventListener("click", () => {
      closeMenu();
      mainMode = 'powerNo';
      showPowerNoMode(showMainMenu);
    });

    document.getElementById("startQuiz").addEventListener("click", () => {
      closeMenu();
      mainMode = 'quiz';
      showQuizMode(showMainMenu);
    });

    document.getElementById("startTimer").addEventListener("click", () => {
      closeMenu();
      mainMode = 'timer';
      showTimerMode(showMainMenu);
    });

    document.getElementById("startHowto").addEventListener("click", () => {
      closeMenu();
      mainMode = 'howto';
      showHowtoMode(showMainMenu);
    });

    document.getElementById("startSetting").addEventListener("click", () => {
      closeMenu();
      mainMode = 'setting';
      showSettingMode(showMainMenu);
    });
  }

  // 現在の表示モードを再描画する関数
  function updateCurrentViewTexts() {
    switch (mainMode) {
      case 'main':
        showMainMenu();
        break;
      case 'preflop':
        showPreflopMode(showMainMenu);
        break;
      case 'range':
        showRangeMode(showMainMenu);
        break;
      case 'powerNo':
        showPowerNoMode(showMainMenu);
        break;
      case 'quiz':
        showQuizMode(showMainMenu);
        break;
      case 'timer':
        showTimerMode(showMainMenu);
        break;
      case 'howto':
        showHowtoMode(showMainMenu);
        break;
      case 'setting':
        showSettingMode(showMainMenu);
        break;
      default:
        showMainMenu();
        break;
    }
  }

  // サイドメニューのナビゲーション
  document.getElementById("menuMain").addEventListener("click", () => {
    closeMenu();
    showMainMenu();
  });

  document.getElementById("menuPreflop").addEventListener("click", () => {
    closeMenu();
    mainMode = 'preflop';
    showPreflopMode(showMainMenu);
  });

  document.getElementById("menuPowerNo").addEventListener("click", () => {
    closeMenu();
    mainMode = 'powerNo';
    showPowerNoMode(showMainMenu);
  });

  document.getElementById("menuRange").addEventListener("click", () => {
    closeMenu();
    mainMode = 'range';
    showRangeMode(showMainMenu);
  });

  document.getElementById("menuQuiz").addEventListener("click", () => {
    closeMenu();
    mainMode = 'quiz';
    showQuizMode(showMainMenu);
  });

  document.getElementById("menuTimer").addEventListener("click", () => {
    closeMenu();
    mainMode = 'timer';
    showTimerMode(showMainMenu);
  });

  document.getElementById("menuSetting").addEventListener("click", () => {
    closeMenu();
    mainMode = 'setting';
    showSettingMode(showMainMenu);
  });

  // 初期表示
  updateSideMenuTexts();
  showMainMenu();
});