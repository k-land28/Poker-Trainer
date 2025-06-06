// import { setBodyClass } from '././main.js';

export function showTimerMode() {
  // タイトルを更新
  document.getElementById("modeTitle").textContent = "ポーカータイマー";

  // setBodyClass('timer');

  // メイン表示を更新
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <h1 id="pt-title">ななちゃんCUP - Level <span id="pt-level">1</span></h1>
    <div id="pt-timer">10:00</div>
    <div class="pt-info">
      <div>Blinds: <span id="pt-blinds">100 / 200 / 0</span></div>
      <div>Next: <span id="pt-next">200 / 400 / 50</span></div>
      <div>Break: <span id="pt-break">After Level 3</span></div>
      <div id="pt-stack">Avg Stack: 25,500</div>
      <div id="pt-players">Players: 12 / 20</div>
    </div>
    <div class="pt-controls">
      <button id="pt-pause-btn">▶ Pause</button>
      <button id="pt-reset-btn">🔁 Reset</button>
      <button id="pt-skip-btn">⏭ Skip Level</button>
    </div>
  `;
  //↓仮おき。あとで消す。
  document.body.classList.add('pt-body');


  let timerConfig;
  let currentLevel = 0;
  let remaining = 0;
  let isPaused = false;
  let timerInterval;

  fetch('././data/timer/timer_config.json')
    .then(res => res.json())
    .then(data => {
      timerConfig = data;
      loadLevel(currentLevel);
      updateDisplay();
      startTimer();
    });

  function loadLevel(index) {
    const level = timerConfig.levels[index];
    const next = timerConfig.levels[index + 1] || { sb: '-', bb: '-', ante: '-' };
    document.getElementById('pt-level').textContent = level.level;
    document.getElementById('pt-blinds').textContent = `${level.sb} / ${level.bb} / ${level.ante}`;
    document.getElementById('pt-next').textContent = `${next.sb} / ${next.bb} / ${next.ante}`;
    document.getElementById('pt-break').textContent = `After Level ${timerConfig.breaks[0].afterLevel}`;
    document.getElementById('pt-stack').style.display = timerConfig.settings.showAvgStack ? 'block' : 'none';
    document.getElementById('pt-players').style.display = timerConfig.settings.showPlayerCount ? 'block' : 'none';
    remaining = level.duration;
  }

  function updateDisplay() {
    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');
    document.getElementById('pt-timer').textContent = `${mins}:${secs}`;
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      if (!isPaused) {
        remaining--;
        if (remaining < 0) {
          skipLevel();
        } else {
          updateDisplay();
        }
      }
    }, 1000);
  }

  function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pt-pause-btn').textContent = isPaused ? '▶ Resume' : '⏸ Pause';
  }

  function resetTimer() {
    clearInterval(timerInterval);
    loadLevel(currentLevel);
    updateDisplay();
    startTimer();
  }

  function skipLevel() {
    currentLevel++;
    if (currentLevel >= timerConfig.levels.length) {
      alert("Tournament complete!");
      clearInterval(timerInterval);
      return;
    }
    loadLevel(currentLevel);
    updateDisplay();
  }

  // ✅ ボタンにイベントを紐づけ
  document.getElementById("pt-pause-btn").addEventListener("click", togglePause);
  document.getElementById("pt-reset-btn").addEventListener("click", resetTimer);
  document.getElementById("pt-skip-btn").addEventListener("click", skipLevel);
}