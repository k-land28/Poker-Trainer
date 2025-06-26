import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

export function showSettingMode() {
  document.getElementById("modeTitle").textContent = getText("setting");
  setBodyClass('setting');

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = '';

  // 永続化読み込み
  const seOn = { value: loadSetting("setting-se", true) };
  const theme = { value: loadSetting("setting-theme", "Light") };
  const proModes = {
    preflop: loadSetting("setting-proPreflop", false),
    builder: loadSetting("setting-proBuilder", false),
    quiz: loadSetting("setting-proQuiz", false),
    equity: loadSetting("setting-proEquity", false)
  };
  const isBundled = loadSetting("setting-isBundled", true);

  // --- 基本設定 ---
  const basicSetting = createSection("基本設定", [
    createToggle("🔈 SE", () => {
      seOn.value = !seOn.value;
      saveSetting("setting-se", seOn.value);
      updateStatus("seStatus", seOn.value ? 'ON' : 'OFF');
    }, "seStatus", seOn.value ? "ON" : "OFF"),

    createToggle("🌞 テーマ", () => {
      theme.value = theme.value === 'Light' ? 'Dark' : 'Light';
      saveSetting("setting-theme", theme.value);
      updateStatus("themeStatus", theme.value);
    }, "themeStatus", theme.value),
  ]);

  // --- Proモード設定 ---
  const proSetting = createSection("💎 Proモード", [
    createToggleGroup("🎯 プリフロップトレーナーPro", "詳細な分析と範囲強化", () => {
      proModes.preflop = !proModes.preflop;
      saveSetting("setting-proPreflop", proModes.preflop);
      updateStatus("proStatus-preflop", proModes.preflop ? 'ON' : 'OFF');
    }, "proStatus-preflop", proModes.preflop ? "ON" : "OFF"),

    createToggleGroup("🧠 レンジ構築Pro", "自分だけのオリジナルレンジ構築", () => {
      proModes.builder = !proModes.builder;
      saveSetting("setting-proBuilder", proModes.builder);
      updateStatus("proStatus-Builder", proModes.builder ? 'ON' : 'OFF');
    }, "proStatus-Builder", proModes.builder ? "ON" : "OFF"),

    createToggleGroup("❓ クイズチャレンジモード", "MDFやオッズなど計算力を試す", () => {
      proModes.quiz = !proModes.quiz;
      saveSetting("setting-proQuiz", proModes.quiz);
      updateStatus("proStatus-Quiz", proModes.quiz ? 'ON' : 'OFF');
    }, "proStatus-Quiz", proModes.quiz ? "ON" : "OFF"),

    createToggleGroup("📊 エクイティ分析Pro", "対戦手の分布と勝率推定", () => {
      proModes.equity = !proModes.equity;
      saveSetting("setting-proEquity", proModes.equity);
      updateStatus("proStatus-equity", proModes.equity ? 'ON' : 'OFF');
    }, "proStatus-equity", proModes.equity ? "ON" : "OFF"),

    createLockedGroup("🔒 トーナメントPro（未購入）", "自由なブラインド設定"),

    createToggleGroup("📦 購入履歴", "購入情報を復元、BUNDLEへのインビテーション", () => {
      // ストア関連削除済み
    }, "purchaseRestoreStatus", "")
  ], isBundled);

  mainContent.append(basicSetting, proSetting, createPopup());

  function createSection(title, children, showBadge = false) {
    const div = document.createElement("div");
    div.className = "section-setting";
    if (title) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "section-setting-title";
      titleDiv.textContent = title;

      if (showBadge) {
        const badge = document.createElement("span");
        badge.className = "pro-badge";
        badge.textContent = "BUNDLE";
        titleDiv.appendChild(badge);
      }

      div.appendChild(titleDiv);
    }
    children.forEach(child => div.appendChild(child));
    return div;
  }

  function createToggle(label, onClick, statusId, initialStatus) {
    const div = document.createElement("div");
    div.className = "toggle-setting";
    div.addEventListener("click", onClick);
    div.innerHTML = `
      <span>${label}</span>
      <span id="${statusId}">${initialStatus}</span>
    `;
    return div;
  }

  function createToggleGroup(title, subtitle, onClick, statusId, initialStatus) {
    const div = document.createElement("div");
    div.className = "toggle-setting";
    div.addEventListener("click", onClick);
    div.innerHTML = `
      <div>
        <div>${title}</div>
        <small>${subtitle}</small>
      </div>
      <span id="${statusId}">${initialStatus}</span>
    `;
    return div;
  }

  function createLockedGroup(title, subtitle) {
    const div = document.createElement("div");
    div.className = "toggle-setting locked";
    div.innerHTML = `
      <div>
        <div>${title}</div>
        <small>${subtitle}</small>
      </div>
    `;
    div.addEventListener("click", () => {
      document.getElementById("purchasePopup").classList.add("active");
    });
    return div;
  }

  function createButton(label, onClick) {
    const btn = document.createElement("button-setting");
    btn.className = "button-setting";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function createPopup() {
    const popup = document.createElement("div");
    popup.id = "purchasePopup";
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.backgroundColor = "rgba(0,0,0,0.6)";
    popup.style.display = "flex";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.style.zIndex = "1000";
    popup.style.display = "none";
    popup.innerHTML = `
      <div style="background:#222; color:#fff; padding:20px; border-radius:12px; text-align:center; max-width:300px;">
        <p style="margin-bottom: 1em;">課金画面へ遷移（仮）</p>
        <button id="popupCloseBtn" style="padding:6px 12px; border:none; background:#444; color:#fff; border-radius:6px;">閉じる</button>
      </div>
    `;
    popup.querySelector("#popupCloseBtn").addEventListener("click", () => {
      popup.classList.remove("active");
    });
    return popup;
  }

  const style = document.createElement("style");
  style.textContent = `
    #purchasePopup.active {
      display: flex !important;
    }
  `;
  document.head.appendChild(style);

  function updateStatus(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function saveSetting(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadSetting(key, defaultValue) {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  }
}