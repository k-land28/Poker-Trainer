import { getText } from '../../lang.js';

export async function showPreflopTrainer() {
  // UI構築
  document.getElementById("modeTitle").textContent = getText("preflopTrainer");

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <div id="tabs">
      <button class="tab-button active" data-mode="openraise">Open Raise</button>
      <button class="tab-button" data-mode="vs_open">VS Open</button>
      <button class="tab-button" data-mode="vs_3bet">VS 3Bet</button>
      <button class="tab-button" data-mode="bbdefense">BB Defense</button>
    </div>
    <div id="table" class="table"></div>
    <p id="situationText"></p>
    <p id="handText"></p>
    <div id="actionButtons"></div>
    <p id="resultText"></p>
    <button id="nextButton">NEXT</button>
  `;

  // 状態変数
  const positions = ['EP', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  let currentMode = 'openraise';
  let currentQuestion = null;

  let allOpenraiseHandsList = [];
  let allVsOpenHandsList = [];
  let allVs3BetHandsList = [];
  let allBbdefenseHandsList = [];

  const situationText = document.getElementById('situationText');
  const handText = document.getElementById('handText');
  const actionButtons = document.getElementById('actionButtons');
  const resultText = document.getElementById('resultText');
  const nextButton = document.getElementById('nextButton');
  const table = document.getElementById('table');

  // === JSONロード用の汎用関数 ===
  async function loadRange(file, builder) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return builder(json);
    } catch (e) {
      console.error(`${file} の読み込みに失敗しました:`, e);
      return [];
    }
  }

  // === 各レンジデータの整形関数 ===
  function buildOpenraiseHandsList(data) {
    const list = [];
    for (const pos in data) {
      if (pos === 'BB') continue;
      const hands = data[pos].hands;
      for (const hand in hands) {
        list.push({ position: pos, hand, correct: hands[hand] });
      }
    }
    return list;
  }

  function buildVsOpenHandsList(data) {
    const list = [];
    for (const opener in data) {
      for (const hero in data[opener]) {
        const hands = data[opener][hero].hands;
        for (const hand in hands) {
          list.push({ opener, position: hero, hand, correct: hands[hand] });
        }
      }
    }
    return list;
  }

  function buildVs3BetHandsList(data) {
    const list = [];
    for (const opener in data) {
      for (const threeBetter in data[opener]) {
        const hands = data[opener][threeBetter].hands;
        for (const hand in hands) {
          list.push({ opener, threeBetter, hand, correct: hands[hand] });
        }
      }
    }
    return list;
  }

  function buildBbdefenseHandsList(data) {
    const list = [];
    for (const opener in data) {
      for (const size in data[opener]) {
        const hands = data[opener][size].hands;
        for (const hand in hands) {
          list.push({ opener, size, hand, correct: hands[hand] });
        }
      }
    }
    return list;
  }

  // === 一括ロード関数 ===
  async function loadAllRanges() {
    [allOpenraiseHandsList, allVsOpenHandsList, allVs3BetHandsList, allBbdefenseHandsList] = await Promise.all([
      loadRange('././data/preflop-trainer/openraise.json', buildOpenraiseHandsList),
      loadRange('././data/preflop-trainer/vs_open.json', buildVsOpenHandsList),
      loadRange('././data/preflop-trainer/vs_3bet.json', buildVs3BetHandsList),
      loadRange('././data/preflop-trainer/bbdefense.json', buildBbdefenseHandsList)
    ]);
  }

  // === アクション対象外プレイヤー ===
  function getFoldingPlayers(mode, hero, villain = null) {
    const heroIndex = positions.indexOf(hero);
    const villainIndex = villain ? positions.indexOf(villain) : -1;
    return positions.filter((pos, i) => {
      if (pos === hero) return false;
      if (mode === 'openraise') return i < heroIndex;
      if (mode === 'vs_open') return i < heroIndex && pos !== villain;
      if (mode === 'vs_3bet' || mode === 'bbdefense') return pos !== hero && pos !== villain;
      return false;
    });
  }

  // === 盤面描画 ===
  function renderPositions(selected, enemy = null) {
    table.innerHTML = '';
    const W = table.clientWidth, H = table.clientHeight;
    const cx = W / 2, cy = H / 2, rx = W * 0.35, ry = H * 0.35;

    const folded = getFoldingPlayers(currentMode, selected, enemy);

    positions.forEach((pos, i) => {
      const deg = ((i - positions.indexOf(selected) + positions.length) % positions.length) * 60 + 90;
      const rad = deg * Math.PI / 180;
      const x = cx + rx * Math.cos(rad);
      const y = cy + ry * Math.sin(rad);

      const div = document.createElement('div');
      div.className = 'position';
      div.textContent = pos;
      div.style.left = `${x - 25}px`;
      div.style.top = `${y - 15}px`;
      if (pos === selected) div.classList.add('active-position');
      if (pos === enemy) div.classList.add('enemy-position');
      if (folded.includes(pos)) div.classList.add('folded-position');
      table.appendChild(div);
    });
  }

  // === 問題生成関数 ===
  function generateOpenraiseQuestion() {
    if (!allOpenraiseHandsList.length) return null;
    const q = allOpenraiseHandsList[Math.floor(Math.random() * allOpenraiseHandsList.length)];
    return {
      situation: `${q.position}からOpen Raiseしますか？`,
      correct: q.correct,
      choices: ['Raise', 'Fold'],
      position: q.position,
      hand: q.hand
    };
  }

  function generateVsOpenQuestion() {
    if (!allVsOpenHandsList.length) return null;
    const q = allVsOpenHandsList[Math.floor(Math.random() * allVsOpenHandsList.length)];
    return {
      situation: `${q.opener}がOpenしました。${q.position}のアクションは？`,
      correct: q.correct,
      choices: ['Call', 'Fold', '3Bet/Raise', '3Bet/Call', '3Bet/Fold'],
      position: q.position,
      opener: q.opener,
      hand: q.hand
    };
  }

  function generateVs3BetQuestion() {
    if (!allVs3BetHandsList.length) return null;
    const q = allVs3BetHandsList[Math.floor(Math.random() * allVs3BetHandsList.length)];
    return {
      situation: `${q.opener}のOpen Raiseに対し${q.threeBetter}が3Bet。${q.opener}のアクションは？`,
      correct: q.correct,
      choices: ['Call', 'Fold', '4Bet/Raise', '4Bet/Call', '4Bet/Fold'],
      position: q.opener,
      threeBetter: q.threeBetter,
      hand: q.hand
    };
  }

  function generateBbdefenseQuestion() {
    if (!allBbdefenseHandsList.length) return null;
    const q = allBbdefenseHandsList[Math.floor(Math.random() * allBbdefenseHandsList.length)];
    return {
      situation: `${q.opener}が${q.size}でOpen。BBのアクションは？`,
      correct: q.correct,
      choices: ['Call', 'Fold', '3Bet/Raise', '3Bet/Call', '3Bet/Fold'],
      position: 'BB',
      opener: q.opener,
      hand: q.hand
    };
  }

  // === 問題表示 ===
  async function displayQuestion() {
    let generator = null;

    if (currentMode === 'openraise') {
      generator = generateOpenraiseQuestion;
    } else if (currentMode === 'vs_open') {
      generator = generateVsOpenQuestion;
    } else if (currentMode === 'vs_3bet') {
      generator = generateVs3BetQuestion;
    } else if (currentMode === 'bbdefense') {
      generator = generateBbdefenseQuestion;
    }

    currentQuestion = generator();
    if (!currentQuestion) {
      situationText.textContent = "データが読み込まれていないか、問題がありません。";
      return;
    }

    situationText.innerHTML = currentQuestion.situation;
    handText.textContent = `ハンド: ${currentQuestion.hand}`;
    resultText.textContent = '';
    actionButtons.innerHTML = '';

    renderPositions(currentQuestion.position, currentQuestion.opener || currentQuestion.threeBetter);

    currentQuestion.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice;
      btn.classList.add(
        /fold/i.test(choice) ? 'fold' :
        /call/i.test(choice) ? 'call' : 'raise'
      );
      btn.addEventListener('click', () => {
        actionButtons.querySelectorAll('button').forEach(b => {
          if (b !== btn) {
            b.disabled = true;
            b.classList.add('disabled');
          }
        });
        btn.disabled = true;
        if (choice === currentQuestion.correct) {
          resultText.style.color = '#0faa00';
          resultText.textContent = '正解！🎉';
        } else {
          resultText.style.color = '#ff2200';
          resultText.textContent = `不正解。正解は「${currentQuestion.correct}」です。`;
        }
      });
      actionButtons.appendChild(btn);
    });

    const contentElements = [situationText, handText, actionButtons, nextButton];
    contentElements.forEach(el => {
      el.classList.remove('fade-slide-in');
      void el.offsetWidth;
      el.classList.add('fade-slide-in');
    });
  }

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      displayQuestion();
    });
  });

  nextButton.addEventListener('click', displayQuestion);

  await loadAllRanges();
  displayQuestion();
}
