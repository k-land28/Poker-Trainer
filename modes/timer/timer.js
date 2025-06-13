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
};

export function showTimerMode() {
  document.getElementById("modeTitle").textContent = getText("timer");
  setBodyClass('timer');

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <h1 id="timer-title">ななちゃんCUP - Level <span id="timer-level">1</span></h1>
    <div id="timer-timer">00:00</div>
    <div class="timer-info">
      <div>Blinds: <span id="timer-blinds"></span></div>
      <div>Next: <span id="timer-next"></span></div>
      <div>Break: <span id="timer-break"></span></div>
      <div id="timer-stack">Avg Stack: 1,500</div>
      <div id="timer-players">Players: 2 / 2</div>
    </div>
    <div class="timer-controls">
      <button id="timer-pause-btn">▶ Start</button>
      <button id="timer-reset-btn">🔁 Reset</button>
      <button id="timer-skip-btn">⏭ Skip Level</button>
      <button id="timer-config-btn">⚙️ 設定</button>
    </div>
  `;

  const state = window.timerState;

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

  if (!state.config) {
    fetch('././data/timer/timer_config.json')
      .then(res => res.json())
      .then(data => {
        state.config = data;
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

    if (state.config.breaks && state.config.breaks.length > 0) {
      document.getElementById('timer-break').textContent = `After Level ${state.config.breaks[0].afterLevel}`;
    } else {
      document.getElementById('timer-break').textContent = '-';
    }

    document.getElementById('timer-stack').style.display = state.config.settings?.showAvgStack ? 'block' : 'none';
    document.getElementById('timer-players').style.display = state.config.settings?.showPlayerCount ? 'block' : 'none';

    if (forceReset || state.remaining <= 0) {
      state.remaining = level.duration;
      state.lastUpdateTimestamp = null;
    }

    state.isBreak = false;
  }

  function updateDisplay() {
    const mins = String(Math.floor(state.remaining / 60)).padStart(2, '0');
    const secs = String(state.remaining % 60).padStart(2, '0');
    document.getElementById('timer-timer').textContent = `${mins}:${secs}`;
  }

  function updateButton() {
    const btn = document.getElementById('timer-pause-btn');
    btn.textContent = state.timerInterval
      ? (state.isPaused ? '▶ Resume' : '⏸ Pause')
      : '▶ Start';
  }

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.isPaused = false;

    state.timerInterval = setInterval(() => {
      if (!state.isPaused) {
        state.remaining--;
        if (state.remaining < 0) {
          skipLevel();
        } else {
          updateDisplay();
        }
      }
    }, 1000);

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
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.isPaused = true;
    state.remaining = 0;
    state.lastUpdateTimestamp = null;
    loadLevel(state.currentLevel, true);
    updateDisplay();
    updateButton();
  }

function skipLevel() {
  // ブレイク中ならブレイク解除して次レベル開始
  if (state.isBreak) {
    state.isBreak = false;
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

  // 通常のレベル読み込みと開始
  loadLevel(state.currentLevel, true);
  updateDisplay();
  if (!state.isPaused) {
    startTimer();
  } else {
    updateButton();
  }
}

  document.getElementById("timer-pause-btn").addEventListener("click", togglePause);
  document.getElementById("timer-reset-btn").addEventListener("click", resetTimer);
  document.getElementById("timer-skip-btn").addEventListener("click", skipLevel);
  document.getElementById("timer-config-btn").addEventListener("click", () => {
    alert("設定画面へ移動（仮）");
  });
}