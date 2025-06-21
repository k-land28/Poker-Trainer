import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

// グローバルでタイマー状態を保持
window.timerState = window.timerState || {
  currentLevel: 0,
  remaining: 0,
  isPaused: true,
  timerInterval: null,
  config: null,
  isBreak: false,
  lastUpdateTimestamp: null,
  playersTotal: 0,       // 👈 これ追加（最大人数）
  playersCurrent: 0,
  seatOpenCount: 0,
  rebuyCount: 0,
};

export function showTimerMode() {
  document.getElementById("modeTitle").textContent = getText("timer");
  setBodyClass('timer');

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <h1 id="timer-title">ななちゃんCUP - Level <span id="timer-level"></span></h1>
    <div id="timer-timer"></div>
    <div class="timer-info">
      <div>Blinds: <span id="timer-blinds"></span></div>
      <div>Next: <span id="timer-next"></span></div>
      <div>Break: <span id="timer-break"></span></div>
      <div id="timer-avestack"></div>
      <div id="timer-players"></div>
      <div id="timer-rebuy"></div>
    </div>
    <div class="timer-controls">
      <button id="timer-pause-btn">▶ Start</button>
      <button id="timer-skip-btn">⏭ Skip Level</button>
      <button id="timer-seatopen-btn">🪑 シートオープン</button>
      <button id="timer-rebuy-btn">🔁 リエントリー</button> 
      <button id="timer-reset-btn">↻ Reset</button>
      <button id="timer-config-btn">🛠️ 設定</button>
    </div>
  `;

  const state = window.timerState;

  // ▼ 追加：SE読み込み
  const seWarn30 = new Audio('../../data/sounds/warn30.mp3');
  const seLevelUp = new Audio('../../data/sounds/levelup.mp3');
  const seBreak = new Audio('../../data/sounds/break.mp3');
  let hasPlayedWarn30 = false; // 30秒前サウンド重複防止

  // ▼ 追加：SE再生関数（ON設定なら再生）
  function playSE(key, audio) {
    if (loadSetting(`setting-se-${key}`, true)) {
      audio.play().catch(err => {
  console.warn("Audio play error:", err);
});
    }
  }

  function updateTimeFromElapsed() {
    if (!state.lastUpdateTimestamp || state.isPaused) return;
    const elapsed = Math.floor((Date.now() - state.lastUpdateTimestamp) / 1000);
    state.remaining = Math.max(0, state.remaining - elapsed);
    state.lastUpdateTimestamp = Date.now();
  }

  function initTimer() {
    updateTimeFromElapsed();
    loadLevel(state.currentLevel, false);
    updateDisplay();
    updateButton();
  }

  function loadSetting(key, defaultValue) {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return defaultValue;
      return JSON.parse(val);
    } catch {
      return defaultValue;
    }
  }

  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 保存失敗しても無視
    }
  }

  if (!state.config) {
    fetch('././data/timer/timer_config.json')
      .then(res => res.json())
      .then(data => {
        state.config = data;
        state.initialStack = data.initialStack ?? null;
        const h1 = document.getElementById("timer-title");
        if (h1 && data.title) {
          h1.childNodes[0].nodeValue = data.title + ' - Level ';
        }
        initTimer();
      })
      .catch(err => {
        console.error('タイマー設定の読み込みに失敗しました:', err);
        alert('タイマー設定の読み込みに失敗しました。');
      });
  } else {
    initTimer();
  }

  function loadLevel(index, forceReset = false) {
    const level = state.config.levels[index];
    const next = state.config.levels[index + 1] || { sb: '-', bb: '-', ante: '-' };

    if (!level) {
      console.warn('指定レベルが存在しません:', index);
      return;
    }

    document.getElementById('timer-level').textContent = level.level ?? (index + 1);
    document.getElementById('timer-blinds').textContent = `${level.sb} / ${level.bb} / ${level.ante}`;
    document.getElementById('timer-next').textContent = `${next.sb} / ${next.bb} / ${next.ante}`;

    // Break表示の更新
    if (state.config.breaks && state.config.breaks.length > 0) {
      // 現在レベルより後の break を探す
      const nextBreak = state.config.breaks.find(b => b.afterLevel > level.level);
      if (nextBreak) {
        document.getElementById('timer-break').textContent = `After Level ${nextBreak.afterLevel}`;
      } else {
        document.getElementById('timer-break').textContent = '-';
      }
    } else {
      document.getElementById('timer-break').textContent = '-';
    }

    if (forceReset || state.remaining <= 0) {
      state.remaining = level.duration;
      state.lastUpdateTimestamp = null;
    }

    state.isBreak = false;
  }

  function updateDisplay() {
    state.playersCurrent = state.playersTotal - state.seatOpenCount + state.rebuyCount;

    const mins = String(Math.floor(state.remaining / 60)).padStart(2, '0');
    const secs = String(state.remaining % 60).padStart(2, '0');
    document.getElementById('timer-timer').textContent = `${mins}:${secs}`;

    // 👇 Avg Stack 表示
    const aveStackEl = document.getElementById('timer-avestack');
    if (aveStackEl && state.initialStack && state.playersCurrent > 0) {
      const totalChips = state.initialStack * (state.playersTotal + state.rebuyCount);
      const aveStack = Math.floor(totalChips / state.playersCurrent);
      aveStackEl.textContent = `Avg Stack: ${aveStack.toLocaleString()}`;
    }

    // 👇 Players 表示
    const playersEl = document.getElementById('timer-players');
    if (playersEl) {
      playersEl.textContent = `Players: ${state.playersCurrent} / ${state.playersTotal}`;
    }

    // 👇 Rebuy 表示
    const rebuyEl = document.getElementById('timer-rebuy');
    if (rebuyEl) {
      rebuyEl.textContent = `Rebuy: ${state.rebuyCount}`;
    }

    // 👇 プレイヤー数が0なら関連UIを非表示にする
    const shouldHide = state.playersTotal === 0;
    const hideTargets = [
      document.getElementById('timer-avestack'),
      document.getElementById('timer-players'),
      document.getElementById('timer-rebuy'),
      document.getElementById('timer-seatopen-btn'),
      document.getElementById('timer-rebuy-btn')
    ];

    hideTargets.forEach(el => {
      if (el) el.style.display = shouldHide ? 'none' : '';
    });

    updateSeatOpenButton();
    updateRebuyButton();
  }

  function updateButton() {
    const btn = document.getElementById('timer-pause-btn');
    btn.textContent = state.timerInterval
      ? (state.isPaused ? '▶ Resume' : '⏸ Pause')
      : '▶ Start';
  }

  function updateSeatOpenButton() {
    const seatOpenBtn = document.getElementById("timer-seatopen-btn");
    seatOpenBtn.disabled = state.playersCurrent <= 1;
  }

  function updateRebuyButton() {
    const rebuyBtn = document.getElementById("timer-rebuy-btn");
    rebuyBtn.disabled = state.playersCurrent >= state.playersTotal;
  }

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.isPaused = false;

    state.timerInterval = setInterval(() => {
      if (!state.isPaused) {
        state.remaining--;

        if (state.remaining === 30 && !hasPlayedWarn30) {
          playSE("warn30", seWarn30);
          hasPlayedWarn30 = true;
        }

        if (state.remaining < 0) {
          skipLevel();
        } else {
          updateDisplay();
        }
      }
    }, 1000);

    hasPlayedWarn30 = false;
    updateButton(); 
  }

  function togglePause() {
    if (state.timerInterval === null) {
      startTimer();
    } else {
      state.isPaused = !state.isPaused;
      if (!state.isPaused) {
        state.lastUpdateTimestamp = Date.now();
      }
      updateButton();
    }
  }

  function resetTimer() {
    // ① 確認モーダルの表示
    const overlay = document.createElement("div");
    overlay.className = "timer-reset-overlay";

    const dialog = document.createElement("div");
    dialog.className = "timer-reset-dialog";
    dialog.innerHTML = `
      <p>リセットしますか？</p>
      <div class="timer-reset-buttons">
        <button id="timer-reset-yes">Yes</button>
        <button id="timer-reset-no">No</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // ② No: モーダルを閉じるだけ
    document.getElementById("timer-reset-no").addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    // ③ Yes: 初期化処理
    document.getElementById("timer-reset-yes").addEventListener("click", () => {
      // 状態初期化
      state.currentLevel = 0;
      state.playersTotal = 0;
      state.seatOpenCount = 0;
      state.rebuyCount = 0;
      state.playersCurrent = 0;
      state.isPaused = true;
      state.remaining = state.config.levels[0].duration;
      state.lastUpdateTimestamp = null;

      // タイマー停止
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }

      // レベル1にリセット
      loadLevel(0, true);

      // 表示の更新
      updateDisplay();
      updateButton();

      // モーダルを閉じる
      document.body.removeChild(overlay);
    });
  }

  function skipLevel() {
    // ブレイク中ならブレイク解除して次レベル開始
    if (state.isBreak) {
      state.isBreak = false;

      // 🔔 レベルアップSE（ブレイク明け）
      playSE("levelup", seLevelUp);

      loadLevel(state.currentLevel, true);
      updateDisplay();
      if (!state.isPaused) {
        startTimer();
      } else {
        updateButton();
      }
      return;
    }

    const justFinishedLevel = state.config.levels[state.currentLevel];
    const breakInfo = state.config.breaks?.find(b => b.afterLevel === justFinishedLevel.level);

    state.currentLevel++;
    if (state.currentLevel >= state.config.levels.length) {
      alert("Tournament complete!");
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      state.remaining = 0;
      updateDisplay();
      updateButton();
      return;
    }

    if (breakInfo) {
      state.isBreak = true;
      state.remaining = breakInfo.duration;

      // 🔔 ブレイク突入SE
      playSE("break", seBreak);

      // ブレイク中表示に切り替え
      document.getElementById('timer-level').textContent = "Break Time";
      document.getElementById('timer-blinds').textContent = "-";

      // ブレイク明けの次レベルを表示
      const upcomingLevel = state.config.levels[state.currentLevel];
      if (upcomingLevel) {
        document.getElementById('timer-next').textContent = `${upcomingLevel.sb} / ${upcomingLevel.bb} / ${upcomingLevel.ante}`;
      } else {
        document.getElementById('timer-next').textContent = "-";
      }

      updateDisplay();
      if (!state.isPaused) {
        startTimer();
      } else {
        updateButton();
      }
      return;
    }

    // 🔔 レベルアップSE
    playSE("levelup", seLevelUp);

    // 通常のレベル読み込みと開始
    loadLevel(state.currentLevel, true);
    updateDisplay();
    if (!state.isPaused) {
      startTimer();
    } else {
      updateButton();
    }
  }

  //modal画面
  function showGameSettingModal() {
    let existing = document.getElementById("gameSettingModal");
    if (existing) {
      existing.classList.add("active");
      return;
    }

    const seSettings = {
      levelup: { value: loadSetting("setting-se-levelup", true), label: "レベルアップ" },
      warn30: { value: loadSetting("setting-se-warn30", true), label: "残り30秒" },
      break: { value: loadSetting("setting-se-break", true), label: "休憩" }
    };

    const currentStructure = loadSetting("setting-structure", "structure1");

    // プレイ人数設定（保存・読み込みキーは"playerCountOptions"に仮定）
    let playerCountOptions = [
      { value: 0, label: "-" },   // 表示しない意味
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
      { value: 8, label: "8" },
      { value: 9, label: "9" },
      { value: 10, label: "10+" } // 10人以上
    ];
    let selectedPlayerCount = Number(loadSetting("playerCountOptions", 0));

    const overlay = document.createElement("div");
    overlay.id = "gameSettingModal";
    overlay.className = "modal-overlay";

    const content = document.createElement("div");
    content.className = "modal-content";

    const title = document.createElement("h3");
    title.textContent = "🎛 ゲーム設定";
    title.style.marginBottom = "1em";
    content.appendChild(title);

    // --- SE設定 ---
    const seSection = document.createElement("div");
    seSection.innerHTML = `<strong>🔈 SE設定</strong>`;
    seSection.style.marginBottom = "1em";

    Object.entries(seSettings).forEach(([key, setting]) => {
      const btn = document.createElement("div");
      btn.className = "timer-modal-setting";
      btn.textContent = `${setting.label} : ${setting.value ? 'ON' : 'OFF'}`;
      btn.style.cursor = "pointer";
      btn.style.margin = "6px 0";
      btn.addEventListener("click", () => {
        setting.value = !setting.value;
        saveSetting(`setting-se-${key}`, setting.value);
        btn.textContent = `${setting.label} : ${setting.value ? 'ON' : 'OFF'}`;
      });
      seSection.appendChild(btn);
    });
    content.appendChild(seSection);

    // --- ストラクチャー ---
    const structureSection = document.createElement("div");
    structureSection.innerHTML = `<strong>📊 ストラクチャー</strong>`;
    structureSection.style.marginBottom = "1em";

    const structures = ["structure1", "structure2", "structure3"];
    structures.forEach((id) => {
      const btn = document.createElement("div");
      btn.className = "timer-modal-setting";
      btn.textContent = `▶ ${id}`;
      btn.style.cursor = "pointer";
      btn.style.margin = "6px 0";
      if (id === currentStructure) {
        btn.style.fontWeight = "bold";
      }
      btn.addEventListener("click", () => {
        saveSetting("setting-structure", id);
        overlay.querySelectorAll(".timer-modal-setting").forEach(el => el.style.fontWeight = "normal");
        btn.style.fontWeight = "bold";
        console.log("構造読み込み:", id);
      });
      structureSection.appendChild(btn);
    });
    content.appendChild(structureSection);

    // --- プレイ人数 ---
    const playerCountSection = document.createElement("div");
    playerCountSection.style.marginBottom = "1em";
    const playerCountTitle = document.createElement("strong");
    playerCountTitle.textContent = "👥 プレイ人数";
    playerCountSection.appendChild(playerCountTitle);

    const playerCountButtonsWrapper = document.createElement("div");
    playerCountButtonsWrapper.style.marginTop = "6px";
    playerCountButtonsWrapper.style.display = "flex";
    playerCountButtonsWrapper.style.gap = "6px";
    playerCountButtonsWrapper.style.flexWrap = "wrap"; // 幅狭い時も崩れにくく

    // playerCountOptions.forEachの中で作るボタン部分
    playerCountOptions.forEach(({ value, label }) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = "timer-modal-players-btn";
      if (value === selectedPlayerCount) {
        btn.classList.add("selected");

      }
      btn.addEventListener("click", () => {
        selectedPlayerCount = value;
        saveSetting("playerCountOptions", Number(value));

        playerCountButtonsWrapper.querySelectorAll("button").forEach(b => {
          b.classList.remove("selected");
        });
        btn.classList.add("selected");
        if (value === 0 || value === 10) {
            state.playersTotal = 0; // 無効値は0に
          } else {
            state.playersTotal = value;
          }
          updateDisplay(); // 表示を更新
      });
      playerCountButtonsWrapper.appendChild(btn);
    });

    playerCountSection.appendChild(playerCountButtonsWrapper);
    content.appendChild(playerCountSection);

    // --- 閉じるボタン ---
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "閉じる";
    closeBtn.className = "timer-modal-close-btn";
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
      setTimeout(() => overlay.remove(), 300);
    });
    content.appendChild(closeBtn);

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // モーダル外クリックで閉じる処理
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
      }
    });
  }

  document.getElementById("timer-pause-btn").addEventListener("click", togglePause);
  document.getElementById("timer-reset-btn").addEventListener("click", resetTimer);
  document.getElementById("timer-skip-btn").addEventListener("click", skipLevel);
  document.getElementById("timer-seatopen-btn").addEventListener("click", () => {
    if (state.playersCurrent > 1) {
      state.seatOpenCount++;
      updateDisplay();
    }
  });
  document.getElementById("timer-rebuy-btn").addEventListener("click", () => {
    if (state.playersCurrent < state.playersTotal) {
      state.rebuyCount++;
      updateDisplay();
    }
  });
  document.getElementById("timer-config-btn").addEventListener("click", showGameSettingModal);
}
