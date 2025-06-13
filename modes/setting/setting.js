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
    equity: loadSetting("setting-proEquity", false)
  };
  const isBundled = loadSetting("setting-isBundled", true); // ← バンドル購入済みかどうか

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

    createToggleGroup("📊 エクイティ分析Pro", "対戦手の分布と勝率推定", () => {
      proModes.equity = !proModes.equity;
      saveSetting("setting-proEquity", proModes.equity);
      updateStatus("proStatus-equity", proModes.equity ? 'ON' : 'OFF');
    }, "proStatus-equity", proModes.equity ? "ON" : "OFF"),

    createLockedGroup("🔒 トーナメントPro（未購入）", "自由なブラインド設定", () => {
      showStore();
    }),

    createToggleGroup("📦 購入履歴", "購入情報を復元、BUNDLEへのインビテーション", () => {
      showStore(); // 今後: 復元処理をここに実装
    }, "purchaseRestoreStatus", "")
  ], isBundled);

  // --- ストアボタン ---
  const storeButton = createSection("", [
    createButton("🛒 ストアを見る", showStore)
  ]);

  const modal = createModal();
  mainContent.append(basicSetting, proSetting, storeButton, modal);

  function showStore() {
    document.getElementById("storemodal-setting").classList.add("active");
  }

  function hideStore() {
    document.getElementById("storemodal-setting").classList.remove("active");
  }

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

  function createLockedGroup(title, subtitle, onClick) {
    const div = document.createElement("div");
    div.className = "toggle-setting locked";
    div.innerHTML = `
      <div>
        <div>${title}</div>
        <small>${subtitle}</small>
      </div>
    `;
    const btn = document.createElement("button-setting");
    btn.className = "button-setting";
    btn.textContent = "購入";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    div.appendChild(btn);
    return div;
  }

  function createButton(label, onClick) {
    const btn = document.createElement("button-setting");
    btn.className = "button-setting";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function createModal() {
    const modal = document.createElement("div");
    modal.className = "modal-setting";
    modal.id = "storemodal-setting";

    const content = document.createElement("div");
    content.className = "modal-setting-content";
    content.innerHTML = `
      <h3>ストア</h3>
      <p>ここでPro機能を購入できます。</p>
    `;
    const closeBtn = createButton("閉じる", hideStore);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    return modal;
  }

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