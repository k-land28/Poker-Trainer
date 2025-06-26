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
    
    <!-- ✏️ 編集用モーダル -->
    <div id="range-edit-modal" class="range-edit-modal hidden">
      <div class="range-edit-modal-content">
        <h2 id="range-edit-hand">AA</h2>
        <div class="range-edit-actions">
          <button class="range-edit-action" data-action="Raise">Raise</button>
          <button class="range-edit-action" data-action="Call">Call</button>
          <button class="range-edit-action" data-action="Fold">Fold</button>
        </div>
        <button class="range-edit-close">×</button>
      </div>
    </div>

    <!-- 🔁 リセット確認モーダル -->
    <div id="range-confirm-reset-modal" class="range-edit-modal hidden">
      <div class="range-edit-modal-content">
        <p id="range-reset-message">このレンジ表をプリセット状態に戻してもいいですか？</p>
        <div class="range-edit-actions">
          <button id="range-reset-confirm" class="range-edit-action">はい</button>
          <button id="range-reset-cancel" class="range-edit-action">いいえ</button>
        </div>
      </div>
    </div>

    <!-- 🔔 編集中確認モーダル -->
    <div id="range-confirm-exit-modal" class="range-edit-modal hidden">
      <div class="range-edit-modal-content">
        <p>保存せずに編集中の内容を破棄してもよいですか？</p>
        <div class="range-edit-actions">
          <button id="range-exit-confirm" class="range-edit-action">はい</button>
          <button id="range-exit-cancel" class="range-edit-action">いいえ</button>
        </div>
      </div>
    </div>
  `;

  let editToggleBtn;
  let isEditMode = false; // 編集モードかどうかを管理
  let originalRangeData = null;

  function isRangeDataChanged() {
    return JSON.stringify(rangeData) !== JSON.stringify(originalRangeData);
  }

  function setEditIconToSVG() {
    editToggleBtn.innerHTML = `
      <svg class="w-5 h-5 inline-block" width="20" height="20">
        <use href="../data/icons-sprite.svg#icon-edit-doc" />
      </svg>
    `;
  }

  function exitEditMode() {
    isEditMode = false;
    toggleEditButtons(false);
    setEditIconToSVG();
    editToggleBtn.classList.remove('active');
    editToggleBtn.disabled = false; // ✅ 有効化
    originalRangeData = null;
  }

  function isRangeDataChanged() {
    return JSON.stringify(rangeData) !== JSON.stringify(originalRangeData);
  }

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
  
  const resetBtn = document.createElement('button');
  resetBtn.className = 'range-reset-button hidden';
  resetBtn.textContent = 'リセット';
  resetBtn.onclick = () => {
    showConfirmResetModal(() => {
      resetEditedRangeData();
      exitEditMode();
      renderRangeGrid(); // ← 忘れず再描画
    });
  };

  const saveBtn = document.createElement('button');
  saveBtn.className = 'range-save-button hidden';
  saveBtn.textContent = '保存';
  saveBtn.onclick = () => {
    saveEditedRangeData();        // ローカルに保存
    exitEditMode();               // ← これだけに
    renderRangeGrid();            // 再描画
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'range-cancel-button hidden';
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.onclick = () => {
    if (isRangeDataChanged()) {
      showConfirmExitModal(() => {
        currentPosition = localStorage.getItem('lastRangePosition') || getPositionsForTab(currentTab)[0];
        renderPositionButtons();
      });
    } else {
      exitEditMode(); // ← 編集モード終了
      renderPositionButtons(); // ← 再描画だけでOK
    }
  };

  editToggleBtn = document.createElement('button');
  editToggleBtn.className = 'range-edit-toggle-button';
  setEditIconToSVG();
  editToggleBtn.onclick = () => {
    isEditMode = !isEditMode;

    if (isEditMode) {
      // 🎯 現在の rangeData を deep copy して originalRangeData に保存
      originalRangeData = JSON.parse(JSON.stringify(rangeData));
    }

    setEditIconToSVG();
    editToggleBtn.classList.toggle('active', isEditMode);
    toggleEditButtons(isEditMode);
    renderRangeGrid();
  };

  function toggleEditButtons(show) {
    saveBtn.classList.toggle('hidden', !show);
    resetBtn.classList.toggle('hidden', !show);
    cancelBtn.classList.toggle('hidden', !show);
    editToggleBtn.classList.toggle('active', show);
  }
  
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'range-edit-button-group';
  buttonGroup.appendChild(saveBtn);
  buttonGroup.appendChild(resetBtn);
  buttonGroup.appendChild(cancelBtn);
  mainContent.appendChild(buttonGroup);

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
      if (isEditMode && isRangeDataChanged()) {
        // 編集中かつ変更アリ → 警告出す
        showConfirmExitModal(() => {
          isEditMode = false;
          toggleEditButtons(false);
          setEditIconToSVG();
          editToggleBtn.classList.remove('active');
          handleTabSwitch(button); // 切り替え実行
        });
        return;
      }

      // 編集モード中だが変更なし → 警告なしで解除＆切り替え
      if (isEditMode) {
        isEditMode = false;
        toggleEditButtons(false);
        setEditIconToSVG();
        editToggleBtn.classList.remove('active');
      }

      handleTabSwitch(button); // 普通に切り替え
    });
  });

  function getPositionsForTab(tab) {
    if (tab === 'headsUp') return ['BTN', 'BB'];
    return ['EP', 'MP', 'CO', 'BTN', 'SB'];
  }

  function getCustomRangeStorageKey() {
    if (currentTab === 'vs_open' || currentTab === 'vs_3bet') {
      return `customRangeData_${currentTab}_${currentYouPos}_${currentEnemyPos}`;
    } else {
      return `customRangeData_${currentTab}_${currentPosition}`;
    }
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

      if (isEditMode) {
        showConfirmExitModal(() => {
          menu.classList.toggle('hidden');

          // ✅ 「開いたら登録」
          if (!menu.classList.contains('hidden')) {
            document.addEventListener('click', handleOutsideClick);
          } else {
            document.removeEventListener('click', handleOutsideClick); // ← これも必要！
          }
        });
        return;
      }

      // 🔥 他のドロップダウン閉じる
      document.querySelectorAll('.range-dropdown-menu').forEach(el => {
        if (el !== menu) el.classList.add('hidden');
      });

      menu.classList.toggle('hidden');

      // ✅ 「開いたら登録」
      if (!menu.classList.contains('hidden')) {
        document.addEventListener('click', handleOutsideClick);
      } else {
        document.removeEventListener('click', handleOutsideClick); // ← これ忘れてると閉じなくなることがある
      }
    };

    return wrapper;
  }

  function renderPositionSelectorsVsMode() {
    const allPositions = ['EP', 'MP', 'CO', 'BTN', 'SB', 'BB'];
    const youChanged = lastYouPos !== currentYouPos;
    lastYouPos = currentYouPos;

    // You候補
    let youOptions;
    if (currentTab === 'vs_open') {
      youOptions = allPositions.filter(pos => pos !== 'EP');
    } else if (currentTab === 'vs_3bet') {
      youOptions = allPositions.filter(pos => pos !== 'BB');
    } else {
      youOptions = allPositions;
    }

    if (!youOptions.includes(currentYouPos)) {
      currentYouPos = youOptions[0];
    }

    const youIndex = allPositions.indexOf(currentYouPos);

    // Enemy候補
    let validEnemyPositions = [];
    if (currentTab === 'vs_open') {
      validEnemyPositions = allPositions.slice(0, youIndex);
    } else if (currentTab === 'vs_3bet') {
      validEnemyPositions = allPositions.slice(youIndex + 1).filter(pos => pos !== 'EP');
    }

    if (youChanged && !validEnemyPositions.includes(currentEnemyPos)) {
      const fallbackCandidate = currentTab === 'vs_open'
        ? allPositions[youIndex - 1]
        : allPositions[youIndex + 1];

      currentEnemyPos = validEnemyPositions.includes(fallbackCandidate)
        ? fallbackCandidate
        : validEnemyPositions[0] || null;
    }

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

      const fallbackCandidate = currentTab === 'vs_open'
        ? allPositions[youIndex - 1]
        : allPositions[youIndex + 1];

      if (!validEnemyPositions.includes(currentEnemyPos)) {
        currentEnemyPos = validEnemyPositions.includes(fallbackCandidate)
          ? fallbackCandidate
          : validEnemyPositions[0] || null;
      }

      if (currentTab === 'vs_open') {
        localStorage.setItem('lastRangeEnemyPos_vsOpen', currentEnemyPos);
      } else if (currentTab === 'vs_3bet') {
        localStorage.setItem('lastRangeEnemyPos_vs3bet', currentEnemyPos);
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

    // ✏️ 編集ボタン（← ここで editToggleBtn を再利用）
    editToggleBtn = document.createElement('button');
    editToggleBtn.className = 'range-edit-toggle-button';
    setEditIconToSVG();
    if (isEditMode) editToggleBtn.classList.add('active');

    editToggleBtn.onclick = () => {
      if (isEditMode) return; // ← 追加：編集中なら何もしない
      isEditMode = true;
      originalRangeData = JSON.parse(JSON.stringify(rangeData));
      setEditIconToSVG();
      editToggleBtn.classList.add('active');
      editToggleBtn.disabled = true; // ✅ 無効化
      toggleEditButtons(true);
      renderRangeGrid();
    };
    if (isEditMode) {
      editToggleBtn.disabled = true;
      editToggleBtn.classList.add('disabled');
    } else {
      editToggleBtn.disabled = false;
      editToggleBtn.classList.remove('disabled');
    }
    rangePositionSelector.appendChild(editToggleBtn);
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
        if (isEditMode) {
          showConfirmExitModal(() => {
            currentPosition = pos;
            localStorage.setItem('lastRangePosition', currentPosition);
            renderPositionButtons();
          });
          return;
        }

        currentPosition = pos;
        localStorage.setItem('lastRangePosition', currentPosition);
        renderPositionButtons();
        renderRangeGrid();
      };
      rangePositionSelector.appendChild(btn);
      rangePositionSelector.appendChild(editToggleBtn);
    });
  }

  function renderRangeGrid() {
    if (isEditMode) {
      // 🔧 編集モード中は保存済データを再読み込みしない（仮の rangeData を使う）
      let data;
      if (currentTab === 'vs_open') {
        const vsData = rangeData[currentEnemyPos]?.[currentYouPos];
        if (!vsData) return;
        data = vsData.hands || {};
      } else if (currentTab === 'vs_3bet') {
        const vsData = rangeData[currentYouPos]?.[currentEnemyPos];
        if (!vsData) return;
        data = vsData.hands || {};
      } else {
        const posData = rangeData[currentPosition];
        if (!posData) return;
        data = posData.hands || {};
      }

      renderRange(data);
    } else {
      // 通常時はローカル保存も反映
      const key = getCustomRangeStorageKey();
      loadRangeDataByKey(key).then(() => {
        let data;
        if (currentTab === 'vs_open') {
          const vsData = rangeData[currentEnemyPos]?.[currentYouPos];
          if (!vsData) return;
          data = vsData.hands || {};
        } else if (currentTab === 'vs_3bet') {
          const vsData = rangeData[currentYouPos]?.[currentEnemyPos];
          if (!vsData) return;
          data = vsData.hands || {};
        } else {
          const posData = rangeData[currentPosition];
          if (!posData) return;
          data = posData.hands || {};
        }

        renderRange(data);
      });
    }
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

      // 👇 編集モード時にモーダル開く
      cell.onclick = () => {
        if (isEditMode) {
          showRangeEditModal(hand, action);
        }
      };
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

  function handleOutsideClick(e) {
    if (!e.target.closest('.range-dropdown-wrapper')) {
      document.querySelectorAll('.range-dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
      });
      document.removeEventListener('click', handleOutsideClick);
    }
  }

  function loadRangeDataByKey(key) {
    return new Promise(async (resolve, reject) => {
      try {
        const customData = localStorage.getItem(key);
        if (customData) {
          rangeData = JSON.parse(customData);
        } else {
          const response = await fetch(`././data/preflop-trainer/${currentTab.toLowerCase()}.json`);
          if (!response.ok) throw new Error(`Failed to load ${currentTab}.json`);
          rangeData = await response.json();
        }
        resolve();
      } catch (error) {
        console.error("Error loading range data:", error);
        reject(error);
      }
    });
  }

  function showRangeEditModal(hand, currentAction) {
    const modal = document.getElementById('range-edit-modal');
    const handTitle = document.getElementById('range-edit-hand');
    const actionsContainer = modal.querySelector('.range-edit-actions');

    handTitle.textContent = hand;

    // 💥 一度中身をリセット
    actionsContainer.innerHTML = '';

    // 📍 現在のマップキーを決定
    const mapKey = currentTab === 'headsUp'
      ? (currentPosition === 'BTN' ? 'headsUp_BTN' : 'headsUp_BB')
      : currentTab;

    const colorMap = actionColorMaps[mapKey] || {};

    // 🎯 ボタンを動的に生成
    Object.keys(colorMap).forEach(action => {
    const btn = document.createElement('button');
    const colorClass = colorMap[action] || 'range-fold';

    // 色取得のための一時要素を作成して参照
    const temp = document.createElement('div');
    temp.className = `range-cell ${colorClass}`;
    document.body.appendChild(temp);
    const bgColor = getComputedStyle(temp).backgroundColor;
    const textColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    // ボタンに色を適用
    btn.className = `range-edit-action`;
    btn.style.backgroundColor = bgColor;
    btn.style.color = textColor;

    btn.textContent = action;

      btn.onclick = () => {
        if (currentTab === 'vs_open') {
          const target = rangeData[currentEnemyPos][currentYouPos].hands;
          if (action === 'Fold') {
            delete target[hand];
          } else {
            target[hand] = action;
          }
        } else if (currentTab === 'vs_3bet') {
          const target = rangeData[currentYouPos][currentEnemyPos].hands;
          if (action === 'Fold') {
            delete target[hand];
          } else {
            target[hand] = action;
          }
        } else {
          const target = rangeData[currentPosition].hands;
          if (action === 'Fold') {
            delete target[hand];
          } else {
            target[hand] = action;
          }
        }

        modal.classList.add('hidden');
        renderRangeGrid(); // 再描画
      };

      actionsContainer.appendChild(btn);
    });

    // ✖️ 閉じるボタンの処理
    document.querySelector('.range-edit-close').onclick = () => {
      modal.classList.add('hidden');
    };

    modal.classList.remove('hidden');
  }

  function saveEditedRangeData() {
    const key = getCustomRangeStorageKey();
    localStorage.setItem(key, JSON.stringify(rangeData));
  }

  function resetEditedRangeData() {
    const key = getCustomRangeStorageKey();
    localStorage.removeItem(key);
    loadRangeDataByKey(getCustomRangeStorageKey()).then(() => {
      renderPositionButtons();
      renderRangeGrid();
    });
  }

  function handleTabSwitch(button) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentTab = button.dataset.mode;
    localStorage.setItem('lastRangeTab', currentTab);

    currentPosition = getPositionsForTab(currentTab)[0];
    localStorage.setItem('lastRangePosition', currentPosition);

    if (currentTab === 'vs_open') {
      currentYouPos = localStorage.getItem('lastRangeYouPos_vsOpen') || 'BB';
      currentEnemyPos = localStorage.getItem('lastRangeEnemyPos_vsOpen') || 'BTN';
    } else if (currentTab === 'vs_3bet') {
      currentYouPos = localStorage.getItem('lastRangeYouPos_vs3bet') || 'BTN';
      currentEnemyPos = localStorage.getItem('lastRangeEnemyPos_vs3bet') || 'BB';
    }

    if (currentTab === 'vs_open') {
      localStorage.setItem('lastRangeYouPos_vsOpen', currentYouPos);
      localStorage.setItem('lastRangeEnemyPos_vsOpen', currentEnemyPos);
    } else if (currentTab === 'vs_3bet') {
      localStorage.setItem('lastRangeYouPos_vs3bet', currentYouPos);
      localStorage.setItem('lastRangeEnemyPos_vs3bet', currentEnemyPos);
    }

    renderPositionButtons();
    const key = getCustomRangeStorageKey();
    loadRangeDataByKey(key).then(() => {
      renderRangeGrid();
    });

    const resetBtn = document.getElementById('range-reset-button');
    if (resetBtn) {
      resetBtn.onclick = () => {
        const keyPrefix = `customRangeData_${currentTab}_${currentPosition}`;
        const key = (currentTab === 'vs_open' || currentTab === 'vs_3bet')
          ? `${keyPrefix}_${currentYouPos}_${currentEnemyPos}`
          : keyPrefix;

        localStorage.removeItem(key);
        loadRangeDataByKey(getCustomRangeStorageKey()).then(() => {
          renderPositionButtons();
          renderRangeGrid();
        });
      };
    }
  }

  function showConfirmResetModal(onConfirm) {
    const modal = document.getElementById('range-confirm-reset-modal');
    const message = document.getElementById('range-reset-message');
    message.textContent = getText('confirmResetRange');

    modal.classList.remove('hidden');

    const confirmBtn = document.getElementById('range-reset-confirm');
    const cancelBtn = document.getElementById('range-reset-cancel');

    confirmBtn.textContent = getText('yes');
    cancelBtn.textContent = getText('no');

    // ⭐ イベントリスナーの上書き防止
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;

    confirmBtn.onclick = () => {
      modal.classList.add('hidden');
      onConfirm();
    };

    cancelBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  }

  function showConfirmExitModal(onConfirm) {
    const modal = document.getElementById('range-confirm-exit-modal');
    modal.classList.remove('hidden');

    const confirmBtn = document.getElementById('range-exit-confirm');
    const cancelBtn = document.getElementById('range-exit-cancel');

    confirmBtn.onclick = () => {
      if (originalRangeData) {
        rangeData = JSON.parse(JSON.stringify(originalRangeData));
      }
      exitEditMode();              // ✅ 編集モード終了
      renderRangeGrid();
      modal.classList.add('hidden'); // ✅ モーダルを閉じる
      onConfirm();                   // ✅ タブ遷移など実行
    };

    cancelBtn.onclick = () => {
      modal.classList.add('hidden'); // ✅ モーダルを閉じるだけ！
    };
  }

  loadRangeDataByKey(getCustomRangeStorageKey()).then(() => {
    renderPositionButtons();
    renderRangeGrid();
  });
}