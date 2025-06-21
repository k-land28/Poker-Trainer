// 完全独立・プリフロ風のPowerNoモード描画
import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

export function showPowerNoMode() {
  document.getElementById("modeTitle").textContent = getText("powerNo");
  setBodyClass('powerNo');

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <div id="powerno-tabs">
      <button class="powerno-tab-button active" data-mode="practice" disabled>${getText("practiceMode")}</button>
      <button class="powerno-tab-button" data-mode="chart">${getText("powerChart")}</button>
    </div>
    <div id="powerno-content"></div>
  `;

  const tabButtons = document.querySelectorAll('.powerno-tab-button');
  const content = document.getElementById('powerno-content');
  let lastPowernoTab = localStorage.getItem('lastPowernoTab') || 'practice';
  let currentTab = lastPowernoTab;

  tabButtons.forEach(button => {
    const tabMode = button.dataset.mode;
    if (tabMode === currentTab) {
      button.classList.add('active');
      button.disabled = true;
    } else {
      button.classList.remove('active');
      button.disabled = false;
    }

    button.addEventListener('click', () => {
      if (button.disabled) return;
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.disabled = false;
      });
      button.classList.add('active');
      button.disabled = true;
      currentTab = button.dataset.mode;
      localStorage.setItem('lastPowernoTab', currentTab);
      renderTabContent();
    });
  });

  renderTabContent();

  function renderTabContent() {
    if (currentTab === 'practice') {
      renderPracticeMode(content);
    } else if (currentTab === 'chart') {
      renderPowerChart(content);
    }
  }

  function renderPowerChart(container) {
    fetch('./data/powerno.json')
      .then(res => res.json())
      .then(data => {
        const ranks = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
        const grid = document.createElement('div');
        grid.className = 'powerno-grid';

        // 14×14マスにする（左上は空）
        for (let row = -1; row < 13; row++) {
          for (let col = -1; col < 13; col++) {
            const cell = document.createElement('div');
            cell.className = 'powerno-cell';

            if (row === -1 && col === -1) {
              // 左上の空セル
              cell.classList.add('label-cell');
              cell.innerText = '';
            } else if (row === -1) {
              // 上の列ラベル
              cell.classList.add('label-cell');
              cell.innerText = ranks[col];
            } else if (col === -1) {
              // 左の行ラベル
              cell.classList.add('label-cell');
              cell.innerText = ranks[row];
            } else {
              const i = row, j = col;
              let hand;
              if (i < j) hand = ranks[i] + ranks[j] + 's';
              else if (i > j) hand = ranks[j] + ranks[i] + 'o';
              else hand = ranks[i] + ranks[j];

              const value = data[hand] ?? '';
              cell.title = hand;

              if (value === '') {
                cell.classList.add('powerno-empty-cell');
              } else {
                cell.innerText = value;
                const power = value === '∞' ? 999 : parseFloat(value);
                cell.setAttribute('data-power', power);
                cell.style.setProperty('--p', Math.min(50, power));
              }
            }

            grid.appendChild(cell);
          }
        }

        // 表の中身差し替え
        container.innerHTML = '';
        container.appendChild(grid);

        // 🔽 ここに説明文を追加
        const explanation = document.createElement('p');
        explanation.className = 'powerno-chart-note';
        explanation.innerHTML = getText("powerno_chart_note");
        container.appendChild(explanation);
      });
  }

  function renderPracticeMode(container) {
    container.innerHTML = `
      <div id="powerno-question" class="powerno-question">
        <p id="powerno-info">SB/BB(Ante) 0.5/1(1)</p>
        <p id="powerno-situation"></p>
        <p id="powerno-stack"></p>
        <p id="powerno-hand"></p>
        <div id="powerno-actionButtons"></div>
        <p id="powerno-resultText"></p>
        <button id="powerno-nextButton">Next</button>
      </div>
    `;

    const tableDiv = document.getElementById('powerno-oval-table');
    const resultText = document.getElementById('powerno-resultText');
    const actionButtons = document.getElementById('powerno-actionButtons');
    const nextButton = document.getElementById('powerno-nextButton');

    let currentQuestion = null;
    let powerTable = {};

    fetch('./data/powerno.json')
      .then(res => res.json())
      .then(data => {
        powerTable = data;
        nextQuestion();
      });

    function nextQuestion() {
      currentQuestion = generatePowernoQuestion(powerTable);
      renderPowernoTable(document.getElementById('powerno-content'), currentQuestion);

    document.getElementById('powerno-situation').textContent =
      `${currentQuestion.yourPos} ${getText("powerno_questionPrefix")}`;
    document.getElementById('powerno-stack').textContent =
      `${getText("powerno_stackLabel")}${currentQuestion.stack}`;
    document.getElementById('powerno-hand').textContent =
      `${getText("powerno_handLabel")}${currentQuestion.hand}`;
      resultText.textContent = '';

      renderActionButtons();
    }

    function renderActionButtons() {
      actionButtons.innerHTML = '';
      ['Push', 'Fold'].forEach(label => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.classList.add('powerno-action-button');
        btn.classList.add(label.toLowerCase());
        btn.onclick = () => handleAnswer(label);
        actionButtons.appendChild(btn);
      });
    }

    function handleAnswer(answer) {
      const correct = (answer === currentQuestion.correctAction);
      resultText.textContent = correct
        ? getText("powerno_correct")
        : `${getText("powerno_wrong")}${currentQuestion.correctAction}`;
      actionButtons.querySelectorAll('button').forEach(btn => {
        if (btn.textContent !== answer) {
          btn.disabled = true;
          btn.classList.add('disabled');
        } else {
          btn.classList.add('active'); // 選ばれたボタンは明るいまま
        }
      });
    }
    nextButton.onclick = nextQuestion;
  }

  function generatePowernoQuestion(powerTable) {
    const allHands = Object.keys(powerTable);
    const positionsMap = {
      4: ['CO','BTN','SB','BB'],
      5: ['UTG','CO','BTN','SB','BB'],
      6: ['UTG','HJ','CO','BTN','SB','BB'],
      7: ['UTG','LJ','HJ','CO','BTN','SB','BB'],
      8: ['UTG','+1','LJ','HJ','CO','BTN','SB','BB'],
      9: ['UTG','+1','+2','LJ','HJ','CO','BTN','SB','BB'],
    };

    let hand = '', handPower = 0, requiredPower = 0, yourIndex = 0;
    let positions = [], stack = 0, mValue = 0, behindCount = 0;

    do {
      const playerCount = Math.floor(Math.random() * 6) + 4;
      positions = positionsMap[playerCount];
      yourIndex = Math.floor(Math.random() * (playerCount - 1)); // BBを除外
      const yourPos = positions[yourIndex];

      stack = Math.floor(Math.random() * 17) + 4;
      mValue = stack / 2.5;
      behindCount = playerCount - yourIndex - 1;

      hand = allHands[Math.floor(Math.random() * allHands.length)];
      requiredPower = behindCount * mValue;
      handPower = parseFloat(powerTable[hand] === '∞' ? 999 : powerTable[hand] ?? 0);
    } while (Math.abs(handPower - requiredPower) <= 1); // 1以下の差なら再生成

    const correctAction = handPower >= requiredPower ? 'Push' : 'Fold';

    // フォールド済みプレイヤー配列もここで生成して渡す（念のため）
    const foldedPlayers = positions.map((_, i) => i < yourIndex);

    return {
      hand,
      positions,
      yourIndex,
      yourPos: positions[yourIndex],
      stack,
      mValue,
      behindCount,
      requiredPower,
      handPower,
      correctAction,
      foldedPlayers
    };
  }

  function renderPowernoTable(container, q) {
    // 既存のテーブル削除（あれば）
    const old = document.getElementById('powerno-oval-table');
    if (old) old.remove();

    // テーブル枠の作成
    const tableDiv = document.createElement('div');
    tableDiv.id = 'powerno-oval-table';
    tableDiv.className = 'powerno-oval-table';
    container.prepend(tableDiv);

    const W = tableDiv.clientWidth;
    const H = tableDiv.clientHeight;
    const cx = W / 2, cy = H / 2;
    const rx = W * 0.35, ry = H * 0.35;

    q.positions.forEach((pos, i) => {
      const relIndex = (i - q.yourIndex + q.positions.length) % q.positions.length;
      const deg = 90 + relIndex * (360 / q.positions.length);
      const rad = deg * Math.PI / 180;
      const x = cx + rx * Math.cos(rad);
      const y = cy + ry * Math.sin(rad);

      const div = document.createElement('div');
      div.classList.add('powerno-position'); // 常につける

      // 自分の位置を強調
      if (i === q.yourIndex) {
        div.classList.add('powerno-active-position');
      }

      // フォールド済みプレイヤーはグレーアウト
      if (q.foldedPlayers[i]) {
        div.classList.add('folded'); // ← CSSは .powerno-position.folded に対応済み
      }

      div.textContent = pos;
      div.style.left = `${x - 25}px`;
      div.style.top = `${y - 15}px`;

      tableDiv.appendChild(div);
    });
  }
}