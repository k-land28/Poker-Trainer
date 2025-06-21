import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

export function showRangeMode() {
  document.getElementById("modeTitle").textContent = getText("rangeChart");
  setBodyClass('range');

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <div id="range-tabs">
      <button class="range-tab-button active" data-mode="openraise">Open Raise</button>
      <button class="range-tab-button" data-mode="vs_open">VS Open</button>
      <button class="range-tab-button" data-mode="vs_3bet">VS 3Bet</button>
      <button class="range-tab-button" data-mode="headsUp">Heads Up</button>
    </div>
    <div class="range-position-selector" id="range-position-selector"></div>
    <div id="range-grid" class="range-grid"></div>
    <p id="range-legend"></p>
  `;

  // 💡 currentTab の定義はここで
  let currentTab = localStorage.getItem('lastRangeTab') || 'openraise';
  let currentPosition = localStorage.getItem('lastRangePosition') || 'EP';

  // 🎯 currentTab に応じて youPos / enemyPos を個別に読み込む
  let currentYouPos, currentEnemyPos;

  if (currentTab === 'vs_open') {
    currentYouPos = localStorage.getItem('lastRangeYouPos_vsOpen') || 'BB';
    currentEnemyPos = localStorage.getItem('lastRangeEnemyPos_vsOpen') || 'BTN';
  } else if (currentTab === 'vs_3bet') {
    currentYouPos = localStorage.getItem('lastRangeYouPos_vs3bet') || 'BTN';
    currentEnemyPos = localStorage.getItem('lastRangeEnemyPos_vs3bet') || 'BB';
  } else {
    currentYouPos = 'BB';  // デフォルト値（使われない）
    currentEnemyPos = 'BTN';
  }
  let lastYouPos = currentYouPos;
  let rangeData = {};

  const grid = document.getElementById('range-grid');
  const rangePositionSelector = document.getElementById('range-position-selector');
  const tabButtons = document.querySelectorAll('.range-tab-button');

  // 👇 ここで currentTab が使えるようになる
  tabButtons.forEach(button => {
    if (button.dataset.mode === currentTab) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  const actionColorMaps = {
    openraise: {
      'Raise': 'range-raise',
      'Fold': 'range-fold',
    },
    headsUp_BTN: {
      'Raise/4Bet': 'range-raise-4bet',
      'Raise/Call': 'range-raise-call',
      'Raise/Fold': 'range-raise-fold',
      'Fold': 'range-fold',
    },
    headsUp_BB: {
      '3Bet/ALLIN': 'range-3bet-allin',
      '3Bet/Call': 'range-3bet-call',
      '3Bet/Fold': 'range-3bet-fold',
      'Call': 'range-call',
      'Fold': 'range-fold',
    },
    vs_open: {
      '3Bet/Raise': 'range-3bet-raise',
      '3Bet/Call': 'range-3bet-call',
      '3Bet/Fold': 'range-3bet-fold',
      'Call': 'range-call',
      'Fold': 'range-fold',
    },
    vs_3bet: {
      '4Bet/ALLIN': 'range-4bet-allin',
      '4Bet/Fold': 'range-4bet-fold',
      'Call': 'range-call',
      'Fold': 'range-fold',
    },
  };

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      currentTab = button.dataset.mode;
      localStorage.setItem('lastRangeTab', currentTab);

      currentPosition = getPositionsForTab(currentTab)[0];
      localStorage.setItem('lastRangePosition', currentPosition);

      // 🧠 モード別に個別のキーを使って復元
      if (currentTab === 'vs_open') {
        currentYouPos = localStorage.getItem('lastRangeYouPos_vsOpen') || 'BB';
        currentEnemyPos = localStorage.getItem('lastRangeEnemyPos_vsOpen') || 'BTN';
      } else if (currentTab === 'vs_3bet') {
        currentYouPos = localStorage.getItem('lastRangeYouPos_vs3bet') || 'BTN';
        currentEnemyPos = localStorage.getItem('lastRangeEnemyPos_vs3bet') || 'BB';
      }

      // 保存も個別キーで
      if (currentTab === 'vs_open') {
        localStorage.setItem('lastRangeYouPos_vsOpen', currentYouPos);
        localStorage.setItem('lastRangeEnemyPos_vsOpen', currentEnemyPos);
      } else if (currentTab === 'vs_3bet') {
        localStorage.setItem('lastRangeYouPos_vs3bet', currentYouPos);
        localStorage.setItem('lastRangeEnemyPos_vs3bet', currentEnemyPos);
      }

      loadRangeData(currentTab);
    });
  });

  function getPositionsForTab(tab) {
    if (tab === 'headsUp') return ['BTN', 'BB'];
    return ['EP', 'MP', 'CO', 'BTN', 'SB'];
  }

  function generateAllHands() {
    const ranks = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
    const hands = [];
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 13; j++) {
        if (i < j) hands.push(ranks[i] + ranks[j] + 's');
        else if (i > j) hands.push(ranks[j] + ranks[i] + 'o');
        else hands.push(ranks[i] + ranks[j]);
      }
    }
    return hands;
  }

  function createDropdown(label, options, current, onSelect) {
    const wrapper = document.createElement('div');
    wrapper.className = 'range-dropdown-wrapper';

    const button = document.createElement('button');
    button.className = 'range-dropdown-button';
    button.textContent = `${label}: ${current}`;
    wrapper.appendChild(button);

    const menu = document.createElement('div');
    menu.className = 'range-dropdown-menu hidden';

    options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'range-dropdown-item';
      item.textContent = opt;
      item.onclick = () => {
        onSelect(opt);
        button.textContent = `${label}: ${opt}`;
        menu.classList.add('hidden');
        document.removeEventListener('click', handleOutsideClick);
      };
      menu.appendChild(item);
    });

    wrapper.appendChild(menu);

    button.onclick = (e) => {
      e.stopPropagation();

      // 🔥 他のドロップダウン閉じる
      document.querySelectorAll('.range-dropdown-menu').forEach(el => {
        if (el !== menu) el.classList.add('hidden');
      });

      menu.classList.toggle('hidden');

      if (!menu.classList.contains('hidden')) {
        document.addEventListener('click', handleOutsideClick);
      }
    };

    function handleOutsideClick(e) {
      if (!wrapper.contains(e.target)) {
        menu.classList.add('hidden');
        document.removeEventListener('click', handleOutsideClick);
      }
    }

    return wrapper;
  }

  function renderPositionSelectorsVsMode() {
    const allPositions = ['EP', 'MP', 'CO', 'BTN', 'SB', 'BB'];
    const youChanged = lastYouPos !== currentYouPos;
    lastYouPos = currentYouPos;

    // 🎯 モードに応じたYouポジション候補
    let youOptions;
    if (currentTab === 'vs_open') {
      youOptions = allPositions.filter(pos => pos !== 'EP');
    } else if (currentTab === 'vs_3bet') {
      youOptions = allPositions.filter(pos => pos !== 'BB'); // ✅ BB除外、SBは含める！
    } else {
      youOptions = allPositions;
    }

    if (!youOptions.includes(currentYouPos)) {
      currentYouPos = youOptions[0];
    }

    const youIndex = allPositions.indexOf(currentYouPos);

    // 🎯 モードに応じたEnemyポジション候補
    let validEnemyPositions = [];
    if (currentTab === 'vs_open') {
      validEnemyPositions = allPositions.slice(0, youIndex);
    } else if (currentTab === 'vs_3bet') {
      validEnemyPositions = allPositions
        .slice(youIndex + 1)
        .filter(pos => pos !== 'EP'); // ✅ EP除外
    }

    if (youChanged && !validEnemyPositions.includes(currentEnemyPos)) {
      const youIndex = allPositions.indexOf(currentYouPos);

      let fallbackCandidate = null;
      if (currentTab === 'vs_open') {
        fallbackCandidate = allPositions[youIndex - 1];
      } else if (currentTab === 'vs_3bet') {
        fallbackCandidate = allPositions[youIndex + 1];
      }

      currentEnemyPos = validEnemyPositions.includes(fallbackCandidate)
        ? fallbackCandidate
        : validEnemyPositions[0] || null;

    }

    // UI再描画
    rangePositionSelector.innerHTML = '';

    const youSelector = createDropdown('You', youOptions, currentYouPos, (selected) => {
      currentYouPos = selected;
      if (currentTab === 'vs_open') {
        localStorage.setItem('lastRangeYouPos_vsOpen', currentYouPos);
      } else if (currentTab === 'vs_3bet') {
        localStorage.setItem('lastRangeYouPos_vs3bet', currentYouPos);
      }

      const youIndex = allPositions.indexOf(currentYouPos);
      if (currentTab === 'vs_open') {
        validEnemyPositions = allPositions.slice(0, youIndex);
      } else if (currentTab === 'vs_3bet') {
        validEnemyPositions = allPositions.slice(youIndex + 1).filter(pos => pos !== 'EP');
      }

      if (!validEnemyPositions.includes(currentEnemyPos)) {
        const fallbackCandidate =
          currentTab === 'vs_open'
            ? allPositions[youIndex - 1]
            : allPositions[youIndex + 1];

        currentEnemyPos = validEnemyPositions.includes(fallbackCandidate)
          ? fallbackCandidate
          : validEnemyPositions[0] || null;

        // 👇 ここで保存処理追加
        if (currentTab === 'vs_open') {
          localStorage.setItem('lastRangeEnemyPos_vsOpen', currentEnemyPos);
        } else if (currentTab === 'vs_3bet') {
          localStorage.setItem('lastRangeEnemyPos_vs3bet', currentEnemyPos);
        }
      }

      renderPositionSelectorsVsMode();
      renderRangeGrid();
    });

    const enemySelector = createDropdown('Enemy', validEnemyPositions, currentEnemyPos, (selected) => {
      currentEnemyPos = selected;
      if (currentTab === 'vs_open') {
        localStorage.setItem('lastRangeEnemyPos_vsOpen', currentEnemyPos);
      } else if (currentTab === 'vs_3bet') {
        localStorage.setItem('lastRangeEnemyPos_vs3bet', currentEnemyPos);
      }
      renderRangeGrid();
    });

    rangePositionSelector.appendChild(youSelector);
    rangePositionSelector.appendChild(enemySelector);
  }

  function renderPositionButtons() {
    if (currentTab === 'vs_open' || currentTab === 'vs_3bet') {
      renderPositionSelectorsVsMode();
      return;
    }

    const positions = getPositionsForTab(currentTab);
    rangePositionSelector.innerHTML = '';
    positions.forEach(pos => {
      const btn = document.createElement('div');
      btn.className = 'range-position' + (pos === currentPosition ? ' active' : '');
      btn.innerText = pos;
      btn.onclick = () => {
        currentPosition = pos;
        localStorage.setItem('lastRangePosition', currentPosition); // ←追加
        renderPositionButtons();
        renderRangeGrid();
      };
      rangePositionSelector.appendChild(btn);
    });
  }

  function renderRangeGrid() {
    let data;
    if (currentTab === 'vs_open') {
      data = rangeData[currentEnemyPos]?.[currentYouPos]?.hands || {};
    } else if (currentTab === 'vs_3bet') {
      data = rangeData[currentYouPos]?.[currentEnemyPos]?.hands || {};
    } else if (currentTab === 'headsUp') {
      data = rangeData[currentPosition]?.hands || {};
    } else {
      data = rangeData[currentPosition]?.hands || {};
    }
    renderRange(data);
  }

  function renderRange(hands) {
    grid.innerHTML = '';
    const allHands = generateAllHands();

    const mapKey = currentTab === 'headsUp'
      ? (currentPosition === 'BTN' ? 'headsUp_BTN' : 'headsUp_BB')
      : currentTab;

    const colorMap = actionColorMaps[mapKey] || {};

    allHands.forEach(hand => {
      const action = hands[hand] || 'Fold';
      const cell = document.createElement('div');
      cell.className = 'range-cell';
      const colorClass = colorMap[action] || 'range-fold';
      cell.classList.add(colorClass);
      cell.innerText = hand;
      cell.title = action;
      grid.appendChild(cell);
    });

    renderLegend(); // 凡例を描画
  }

  function renderLegend() {
    const legend = document.getElementById('range-legend');
    legend.innerHTML = '';

    const mapKey = currentTab === 'headsUp'
      ? (currentPosition === 'BTN' ? 'headsUp_BTN' : 'headsUp_BB')
      : currentTab;

    const colorMap = actionColorMaps[mapKey] || {};
    const added = new Set();

    for (const [action, className] of Object.entries(colorMap)) {
      if (added.has(className)) continue;
      added.add(className);

      const item = document.createElement('span');
      item.className = 'range-legend-item';

      const colorBox = document.createElement('span');
      colorBox.className = 'range-legend-color ' + className;

      const label = document.createElement('span');
      label.className = 'range-legend-label';
      label.innerText = action;

      item.appendChild(colorBox);
      item.appendChild(label);
      legend.appendChild(item);
    }
  }

  async function loadRangeData(tabName) {
    try {
      const response = await fetch(`././data/preflop-trainer/${tabName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${tabName}.json`);
      }
      const data = await response.json();
      rangeData = data;

      renderPositionButtons();
      renderRangeGrid();
    } catch (error) {
      console.error("Error loading range data:", error);
    }
  }

  loadRangeData(currentTab);
}