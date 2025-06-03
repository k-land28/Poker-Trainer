console.log("main.js loaded!");

import { showPreflopTrainer } from './modes/preflop-trainer/preflop-trainer.js';
import { showRangeViewer } from './modes/range-chart/range-chart.js';
import { showHeadsUpMode } from './modes/headsup/headsup.js';
import { getText, toggleLanguage, getCurrentLanguage } from './lang.js';

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
  function updateSideMenuTexts() {
    document.getElementById("menuMain").textContent = getText("menuMain");
    document.getElementById("menuPreflop").textContent = getText("preflopTrainer");
    document.getElementById("menuRange").textContent = getText("rangeChart");
    document.getElementById("menuHeadsup").textContent = getText("headsUp");
    langButton.textContent = getText("langToggleButton");
  }

  // 言語ボタンの初期化と更新
  function updateLangButton() {
    const lang = getCurrentLanguage();
    // ボタンのテキストはupdateSideMenuTextsで更新するのでここでは何もしなくてOK
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
    showMainMenu();
  });

  // メインメニューを表示する関数
  function showMainMenu() {
    modeTitle.textContent = getText("mainMenuTitle");

    mainContent.innerHTML = `
      <button class="mainMenu-button" id="startPrefloptrainer">${getText("preflopTrainer")}</button>
      <button class="mainMenu-button" id="startrangeChart">${getText("rangeChart")}</button>
      <button class="mainMenu-button" id="startHeadsup">${getText("headsUp")}</button>
    `;

    document.getElementById("startPrefloptrainer").addEventListener("click", () => {
      closeMenu();
      showPreflopTrainer(showMainMenu);
    });

    document.getElementById("startrangeChart").addEventListener("click", () => {
      closeMenu();
      showRangeViewer(showMainMenu);
    });

    document.getElementById("startHeadsup").addEventListener("click", () => {
      closeMenu();
      showHeadsUpMode(showMainMenu);
    });
  }

  // サイドメニューのナビゲーション
  document.getElementById("menuMain").addEventListener("click", () => {
    closeMenu();
    showMainMenu();
  });

  document.getElementById("menuPreflop").addEventListener("click", () => {
    closeMenu();
    showPreflopTrainer(showMainMenu);
  });

  document.getElementById("menuRange").addEventListener("click", () => {
    closeMenu();
    showRangeViewer(showMainMenu);
  });

  document.getElementById("menuHeadsup").addEventListener("click", () => {
    closeMenu();
    showHeadsUpMode(showMainMenu);
  });

  // 初期表示
  updateSideMenuTexts();
  showMainMenu();
});