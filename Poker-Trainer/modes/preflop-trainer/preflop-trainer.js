
'use strict';

const positions = ['EP', 'MP', 'CO', 'BTN', 'SB', 'BB'];

let openraiseRangeData = null;
let allOpenraiseHandsList = null;

let vsOpenRangeData = null;
let allVsOpenHandsList = null;

let vs3BetRangeData = null;
let allVs3BetHandsList = null;

let bbdefenseRangeData = null;
let allBbdefenseHandsList = null;

async function preloadPreflopRanges() {
  await Promise.all([
    loadOpenraiseRange(),
    loadVsOpenRange(),
    loadVs3BetRange(),
    loadBbdefenseRange()
  ]);
}

function switchSubMode(subMode) {
  if (subMode === 'openraise') {
    showOpenraiseUI();
  } else if (subMode === 'vs_open') {
    showVsOpenUI();
  } else if (subMode === 'vs_3bet') {
    showVs3BetUI();
  } else if (subMode === 'bb_defense') {
    showBbDefenseUI();
  }
}

// openraise
async function loadOpenraiseRange() {
  try {
    const res = await fetch('data/preflop-trainer/openraise.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    openraiseRangeData = await res.json();
    allOpenraiseHandsList = buildOpenraiseHandsList(openraiseRangeData);
  } catch (e) {
    console.error('openraise.jsonの読み込みに失敗しました:', e);
  }
}

function buildOpenraiseHandsList(rangeData) {
  const list = [];
  for (const pos in rangeData) {
    if (pos === 'BB') continue;
    const hands = rangeData[pos].hands;
    for (const hand in hands) {
      list.push({
        position: pos,
        hand: hand,
        correct: hands[hand]
      });
    }
  }
  return list;
}

// vs_open
async function loadVsOpenRange() {
  try {
    const res = await fetch('data/preflop-trainer/openraise.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    vsOpenRangeData = await res.json();
    allVsOpenHandsList = buildVsOpenHandsList(vsOpenRangeData);
  } catch (e) {
    console.error('vs_open.jsonの読み込みに失敗しました:', e);
  }
}

function buildVsOpenHandsList(rangeData) {
  const list = [];
  for (const opener in rangeData) {
    for (const hero in rangeData[opener]) {
      const hands = rangeData[opener][hero].hands;
      for (const hand in hands) {
        list.push({
          opener: opener,
          position: hero,
          hand: hand,
          correct: hands[hand]
        });
      }
    }
  }
  return list;
}

// vs_3bet
async function loadVs3BetRange() {
  try {
    const res = await fetch('data/preflop-trainer/vs_3bet.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    vs3BetRangeData = await res.json();
    allVs3BetHandsList = buildVs3BetHandsList(vs3BetRangeData);
  } catch (e) {
    console.error('vs_3bet.jsonの読み込みに失敗しました:', e);
  }
}

function buildVs3BetHandsList(rangeData) {
  const list = [];
  for (const opener in rangeData) {
    for (const threeBetter in rangeData[opener]) {
      const hands = rangeData[opener][threeBetter].hands;
      for (const hand in hands) {
        list.push({
          opener: opener,
          threeBetter: threeBetter,
          hand: hand,
          correct: hands[hand]
        });
      }
    }
  }
  return list;
}

// BBdefense
async function loadBbdefenseRange() {
  try {
    const res = await fetch('data/preflop-trainer/bbdefense.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    bbdefenseRangeData = await res.json();
    allBbdefenseHandsList = buildBbdefenseHandsList(bbdefenseRangeData);
  } catch (e) {
    console.error('bbdefense.jsonの読み込みに失敗しました:', e);
  }
}

function buildBbdefenseHandsList(rangeData) {
  const list = [];
  for (const opener in rangeData) {
    for (const size in rangeData[opener]) {
      const hands = rangeData[opener][size].hands;
      for (const hand in hands) {
        list.push({
          opener: opener,
          size: size,
          hand: hand,
          correct: hands[hand]
        });
      }
    }
  }
  return list;
}

function generateOpenraiseQuestion() {
  if (!allOpenraiseHandsList || allOpenraiseHandsList.length === 0) {
    return {
      situation: 'openraise.jsonのデータが読み込まれていません、または問題がありません。',
      correct: null,
      choices: [],
      position: null,
      hand: null,
      stage: 'openraise'
    };
  }

  const item = allOpenraiseHandsList[Math.floor(Math.random() * allOpenraiseHandsList.length)];

  return {
    situation: `${item.position}からOpen Raiseしますか？`,
    correct: item.correct,
    choices: ['Raise', 'Fold'],
    position: item.position,
    hand: item.hand,
    stage: 'openraise'
  };
}

function generateVsOpenQuestion() {
  if (!allVsOpenHandsList || allVsOpenHandsList.length === 0) {
    return {
      situation: 'vs_open.jsonのデータが読み込まれていません、または問題がありません。',
      correct: null,
      choices: [],
      position: null,
      hand: null,
      stage: 'vs_open'
    };
  }

  const item = allVsOpenHandsList[Math.floor(Math.random() * allVsOpenHandsList.length)];

  return {
    situation: `${item.opener}がOpenRaiseしました。${item.position}のアクションは？`,
    correct: item.correct,
    choices: [
      'Call',
      'Fold',
      '3Bet / Fold 4Bet',
      '3Bet / Call 4Bet',
      '3Bet / Raise 4Bet'
    ],
    position: item.position,
    opener:item.opener,
    hand: item.hand,
    stage: 'vs_open'
  };
}

function generateVs3BetQuestion() {
  if (!allVs3BetHandsList || allVs3BetHandsList.length === 0) {
    return {
      situation: 'vs_3bet.jsonのデータが読み込まれていません、または問題がありません。',
      correct: null,
      choices: [],
      position: null,
      hand: null,
      stage: 'vs_3bet'
    };
  }

  const item = allVs3BetHandsList[Math.floor(Math.random() * allVs3BetHandsList.length)];

  return {
    situation: `${item.opener}からOpenRaiseすると、${item.threeBetter}が3Betしました。アクションは？`,
    correct: item.correct,
    choices: [
      'Call',
      'Fold',
      '3Bet / Fold 4Bet',
      '3Bet / Call 4Bet',
      '3Bet / Raise 4Bet'
    ],
    position: item.opener,
    threeBetter:item.threeBetter,
    hand: item.hand,
    stage: 'vs_3bet'
  };
}

function generateBbdefenseQuestion() {
  if (!allBbdefenseHandsList || allBbdefenseHandsList.length === 0) {
    return {
      situation: 'bbdefense.jsonのデータが読み込まれていません、または問題がありません。',
      correct: null,
      choices: [],
      position: null,
      hand: null,
      stage: 'bbdefense'
    };
  }

  const item = allBbdefenseHandsList[Math.floor(Math.random() * allBbdefenseHandsList.length)];

  return {
    situation: `${item.opener}が${item.size}のOpenRaiseをしました。BBのアクションは？`,
    correct: item.correct,
    choices: [
      'Call',
      'Fold',
      '3Bet / Fold 4Bet',
      '3Bet / Call 4Bet',
      '3Bet / Raise 4Bet'
    ],
    position: 'BB',
    opener:item.opener,
    hand: item.hand,
    stage: 'bbdefense'
  };
}

let subMode = 'openraise';
let currentQuestion = null;

const situationText = document.getElementById('situationText');
const handText = document.getElementById('handText');
const actionButtons = document.getElementById('actionButtons');
const resultText = document.getElementById('resultText');
const nextButton = document.getElementById('nextButton');
const tabs = document.querySelectorAll('.tab-button');
const table = document.getElementById('table');

function renderPositions(selectedPosition, enemyPosition = null) {
  table.innerHTML = '';

  const W = table.clientWidth;
  const H = table.clientHeight;

  const cx = W / 2;
  const cy = H / 2;

  const rx = W / 2 * 0.75;
  const ry = H / 2 * 0.75;

  const selfIndex = positions.indexOf(selectedPosition);
  if (selfIndex < 0) {
    console.warn('renderPositions: selectedPositionが不正です。', selectedPosition);
  }

  positions.forEach((pos, i) => {
    const relativeIndex = (i - selfIndex + positions.length) % positions.length;
    const deg = relativeIndex * (360 / positions.length) + 90;
    const rad = deg * Math.PI / 180;

    const x = cx + rx * Math.cos(rad);
    const y = cy + ry * Math.sin(rad);

    const div = document.createElement('div');
    div.className = 'position';
    div.textContent = pos;

    div.style.left = `${x - 25}px`;
    div.style.top = `${y - 15}px`;

    if (pos === selectedPosition) {
      div.classList.add('active-position');
    }
       
    if (pos === enemyPosition) {
      div.classList.add('enemy-position');
    }

    table.appendChild(div);
  });
}

async function displayQuestion() {
  if (subMode === 'openraise') {
    if (!openraiseRangeData) {
      await loadOpenraiseRange();
    }
    currentQuestion = generateOpenraiseQuestion();
  } else if (subMode === 'vs_open') {
    if (!vsOpenRangeData) {
      await loadVsOpenRange();
    }
    currentQuestion = generateVsOpenQuestion();
  } else if (subMode === 'vs_3bet') {
    if (!vs3BetRangeData) {
      await loadVs3BetRange();
    }
    currentQuestion = generateVs3BetQuestion();
  } else if (subMode === 'bbdefense') {
    if (!bbdefenseRangeData) {
      await loadBbdefenseRange();
    }
    currentQuestion = generateBbdefenseQuestion();
  } else {
    currentQuestion = generateRandomQuestion(subMode);
  }

  const q = currentQuestion;
  situationText.textContent = q.situation;
  handText.textContent = `あなたのハンド: ${q.hand}`;
  handText.style.fontSize = '24px';
  handText.style.fontWeight = 'bold';
  resultText.textContent = '';
  actionButtons.innerHTML = '';

  const contentElements = [situationText, handText, actionButtons];
  contentElements.forEach(el => {
  el.classList.remove('fade-slide-in'); // 前のを一旦消す
  void el.offsetWidth; // 再描画トリガー
  el.classList.add('fade-slide-in');
});
  
 renderPositions(q.position, q.opener || q.threeBetter || null);

  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    if (/fold/i.test(choice)) {
      btn.classList.add('fold');
    } else if (/call/i.test(choice)) {
      btn.classList.add('call');
    } else {
      btn.classList.add('raise');
    }
    btn.addEventListener('click', () => {
      if (actionButtons.querySelector('.disabled')) return;
      if (choice === q.correct) {
        resultText.style.color = '#0faa00';
        resultText.textContent = '正解！🎉';
      } else {
        resultText.style.color = '#ff2200';
        resultText.textContent = `不正解。正解は「${q.correct}」です。`;
      }
      actionButtons.querySelectorAll('button').forEach(b => b.classList.add('disabled'));
    });
    actionButtons.appendChild(btn);
  });
}

function switchMode(newMode) {
  subMode = newMode;
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === newMode));
  displayQuestion();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.dataset.mode !== subMode) {
      switchMode(tab.dataset.mode);
    }
  });
});

nextButton.addEventListener('click', displayQuestion);

window.addEventListener('load', () => {
  const splash = document.getElementById('splashScreen');
  setTimeout(() => {
    splash.classList.add('hidden');
    switchMode(subMode); // ←通常の表示処理を始める
  }, 1200); // 1.2秒くらい表示
});