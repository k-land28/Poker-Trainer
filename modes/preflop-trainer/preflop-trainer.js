//preflop-trainer.js
import { setBodyClass, getKeyFromText } from '../../utils/ui.js';
import { getText, getCurrentLanguage, translations } from '../../lang.js';

export async function showPreflopMode() {
  // === UI構築（タイトル・DOM配置）===
  document.getElementById("modeTitle").textContent = getText("preflopTrainer");
  setBodyClass('preflop');
  // Proモード（プリフロップ）設定読み込み
function loadSetting(key, defaultValue) {
  const value = localStorage.getItem(key);
  return value !== null ? JSON.parse(value) : defaultValue;
}
const isProModePreflopTrainer = loadSetting("setting-proPreflop", false);

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <div id="preflop-tabs">
      <button class="preflop-tab-button active" data-mode="openraise">Open Raise</button>
      <button class="preflop-tab-button" data-mode="vs_open">VS Open</button>
      <button class="preflop-tab-button" data-mode="vs_3bet">VS 3Bet</button>
      <button class="preflop-tab-button" data-mode="headsUp">Heads Up</button>
    </div>
    <div id="table" class="table"></div>
    <p id="situationText"></p>
    <p id="handText"></p>
    <div id="actionButtons"></div>
    <p id="resultText"></p>
    <button id="nextButton">Next</button>
  `;

  const positions = ['EP', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  let subMode = localStorage.getItem("preflop-subMode") || 'openraise';
  let currentQuestion = null;

  // 全モードのハンドリスト（読み込み時に初期化）
  let allOpenraiseHandsList = [];
  let allVsOpenHandsList = [];
  let allVs3BetHandsList = [];
  let allHeadsUpHandsList = [];

  // 各種DOM要素参照
  const situationText = document.getElementById('situationText');
  const handText = document.getElementById('handText');
  const actionButtons = document.getElementById('actionButtons');
  const resultText = document.getElementById('resultText');
  const nextButton = document.getElementById('nextButton');
  const table = document.getElementById('table');

  // === レンジJSON読み込み（共通関数） ===
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

  // === 各モードのデータ構築関数 ===
  function buildOpenraiseHandsList(data) {
    const list = [];
    for (const pos in data) {
      if (pos === 'BB') continue; // BBはOpenできないので除外
      for (const hand in data[pos].hands) {
        list.push({ position: pos, hand, correct: data[pos].hands[hand] });
      }
    }
    return list;
  }

  function buildVsOpenHandsList(data) {
    const list = [];
    for (const opener in data) {
      for (const hero in data[opener]) {
        for (const hand in data[opener][hero].hands) {
          list.push({
            opener,
            position: hero,
            hand,
            correct: data[opener][hero].hands[hand]
          });
        }
      }
    }
    return list;
  }

  function buildVs3BetHandsList(data) {
    const list = [];
    for (const opener in data) {
      for (const threeBetter in data[opener]) {
        for (const hand in data[opener][threeBetter].hands) {
          list.push({
            opener,
            threeBetter,
            hand,
            correct: data[opener][threeBetter].hands[hand]
          });
        }
      }
    }
    return list;
  }

  function buildHeadsUpHandsList(data) {
    const list = [];
    for (const hero in data) {
      for (const hand in data[hero].hands) {
        list.push({ hero, hand, correct: data[hero].hands[hand] });
      }
    }
    return list;
  }

  // === 一括で全レンジ読み込み ===
  async function loadAllRanges() {
    [
      allOpenraiseHandsList,
      allVsOpenHandsList,
      allVs3BetHandsList,
      allHeadsUpHandsList
    ] = await Promise.all([
      loadRange('././data/preflop-trainer/openraise.json', buildOpenraiseHandsList),
      loadRange('././data/preflop-trainer/vs_open.json', buildVsOpenHandsList),
      loadRange('././data/preflop-trainer/vs_3bet.json', buildVs3BetHandsList),
      loadRange('././data/preflop-trainer/headsup.json', buildHeadsUpHandsList)
    ]);
  }

  // === 現在のモード・状況に応じて、Foldしたプレイヤーを返す ===
  function getFoldingPlayers(mode, hero, villain = null) {
    const heroIndex = positions.indexOf(hero);
    const villainIndex = villain ? positions.indexOf(villain) : -1;
    return positions.filter((pos, i) => {
      if (pos === hero) return false;
      if (mode === 'openraise') return i < heroIndex;
      if (mode === 'vs_open') return i < heroIndex && pos !== villain;
      if (mode === 'vs_3bet') return pos !== hero && pos !== villain;
      return false;
    });
  }

  // === 盤面描画関数 ===
  function renderPositions(selected, enemy = null) {
    table.innerHTML = '';

    const W = table.clientWidth, H = table.clientHeight;
    const cx = W / 2, cy = H / 2;
    const rx = W * 0.35, ry = H * 0.35;

    if (subMode === 'headsUp') {
      // ヘッズアップはBTNとBBのみを対象
      const myPos = selected;
      const oppPos = myPos === 'BTN' ? 'BB' : 'BTN';

      [{ pos: myPos, deg: 90 }, { pos: oppPos, deg: 270 }].forEach(({ pos, deg }) => {
        const rad = deg * Math.PI / 180;
        const x = cx + rx * Math.cos(rad);
        const y = cy + ry * Math.sin(rad);

        const div = document.createElement('div');
        div.className = 'position';
        div.textContent = pos;
        div.style.left = `${x - 25}px`;
        div.style.top = `${y - 15}px`;
        if (pos === myPos) div.classList.add('active-position');
        else div.classList.add('enemy-position');
        table.appendChild(div);
      });
    } else {
      const folded = getFoldingPlayers(subMode, selected, enemy);

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
  }

  // === モードごとの問題生成 ===
  function generateOpenraiseQuestion() {
    const q = allOpenraiseHandsList[Math.floor(Math.random() * allOpenraiseHandsList.length)];
    return q && {
      situation: getText("openraiseSituation", q.position),
      correct: q.correct,
      choices: [
        getText("Raise"),
        getText("Fold")
      ],
      position: q.position,
      hand: q.hand
    };
  }

function generateVsOpenQuestion() {
  const q = allVsOpenHandsList[Math.floor(Math.random() * allVsOpenHandsList.length)];
  if (!q) return null;

  let choices;
  if (isProModePreflopTrainer) {
    // ProモードON：詳細アクション
    choices = [
      getText("3Bet/Raise"),
      getText("3Bet/Call"),
      getText("3Bet/Fold"),
      getText("Call"),
      getText("Fold")
    ];
  } else {
    // ProモードOFF：Raise系をひとまとめにする
    choices = [
      getText("Raise"),
      getText("Call"),
      getText("Fold")
    ];
  }

  return {
    situation: getText("vsOpenSituation", q.opener, q.position),
    correct: q.correct,
    choices,
    position: q.position,
    opener: q.opener,
    hand: q.hand
  };
}

function generateVs3BetQuestion() {
  const q = allVs3BetHandsList[Math.floor(Math.random() * allVs3BetHandsList.length)];
  if (!q) return null;

  let choices;
  if (isProModePreflopTrainer) {
    choices = [
      getText("4Bet/ALLIN"),
      getText("4Bet/Fold"),
      getText("Call"),
      getText("Fold")
    ];
  } else {
    choices = [
      getText("Raise"),
      getText("Call"),
      getText("Fold")
    ];
  }

  return {
    situation: getText("vs3betSituation", q.opener, q.threeBetter),
    correct: q.correct,
    choices,
    position: q.opener,
    threeBetter: q.threeBetter,
    hand: q.hand
  };
}

function generateHeadsUpQuestion() {
  const q = allHeadsUpHandsList[Math.floor(Math.random() * allHeadsUpHandsList.length)];
  if (!q) return null;

  const isBTN = q.hero === 'BTN';

  let choices;
  if (isProModePreflopTrainer) {
    choices = isBTN
      ? [getText("Raise/4Bet"), getText("Raise/Call"), getText("Raise/Fold"), getText("Fold")]
      : [getText("3Bet/ALLIN"), getText("3Bet/Call"), getText("3Bet/Fold"), getText("Call"), getText("Fold")];
  } else {
    choices = [getText("Raise"), getText("Call"), getText("Fold")];
  }

  return {
    situation: isBTN
      ? getText("headsupSituation_btn")
      : getText("headsupSituation_bb"),
    correct: q.correct,
    choices,
    position: q.hero,
    hand: q.hand
  };
}

  // === 問題表示 ===
  async function displayQuestion() {
    const generatorMap = {
      openraise: generateOpenraiseQuestion,
      vs_open: generateVsOpenQuestion,
      vs_3bet: generateVs3BetQuestion,
      headsUp: generateHeadsUpQuestion
    };

    currentQuestion = generatorMap[subMode]();
    if (!currentQuestion) {
      situationText.textContent = "データが読み込まれていないか、問題がありません。";
      return;
    }

    situationText.innerHTML = currentQuestion.situation;
    handText.textContent = `${getText("handLabel")}: ${currentQuestion.hand}`;
    resultText.textContent = '';
    actionButtons.innerHTML = '';

    renderPositions(currentQuestion.position, currentQuestion.opener || currentQuestion.threeBetter);

    currentQuestion.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice;
      btn.classList.add('action-button');

      // アクションごとに色分け
      const internalIdMap = {
        [getText("Raise")]: 'raise',
        [getText("3Bet/Raise")]: 'raise',
        [getText("3Bet/Call")]: 'raise',
        [getText("3Bet/Fold")]: 'raise',
        [getText("4Bet/ALLIN")]: 'raise',
        [getText("4Bet/Fold")]: 'raise',
        [getText("Raise/4Bet")]: 'raise',
        [getText("Raise/Call")]: 'raise',
        [getText("Raise/Fold")]: 'raise',
        [getText("3Bet/ALLIN")]: 'raise',
        [getText("3Bet/Call")]: 'raise',
        [getText("3Bet/Fold")]: 'raise',
        [getText("Call")]: 'call',
        [getText("Fold")]: 'fold',
      };

      const className = internalIdMap[choice];
      if (className) {
        btn.classList.add(className);
      }

btn.addEventListener('click', () => {
  actionButtons.querySelectorAll('button').forEach(b => {
    if (b !== btn) {
      b.disabled = true;
      b.classList.add('disabled');
    }
  });

  const lang = getCurrentLanguage();
  btn.disabled = true;
  const selectedText = btn.textContent;
  const selectedKey = getKeyFromText(selectedText, translations, lang);

  // === 正解判定（Proモードによって変える）===
  const isCorrect = isProModePreflopTrainer
    ? selectedKey === currentQuestion.correct // Proモード → 完全一致
    : normalize(selectedKey) === normalize(currentQuestion.correct); // 通常 → Raise系を統一判定

  resultText.style.color = isCorrect ? '#0faa00' : '#ff2200';
  resultText.textContent = isCorrect
    ? getText("correctText")
    : getText("incorrectText", getText(currentQuestion.correct));
});
      actionButtons.appendChild(btn);
   });

    // アニメーション
    [situationText, handText, actionButtons, nextButton].forEach(el => {
      el.classList.remove('fade-slide-in');
      void el.offsetWidth;
      el.classList.add('fade-slide-in');
    });
  }

  // === タブ切り替えイベント登録 ===
  document.querySelectorAll('.preflop-tab-button').forEach(btn => {
    const isActive = btn.dataset.mode === subMode;
    if (isActive) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  document.querySelectorAll('.preflop-tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return; // すでに選択中のタブなら何もしない

      document.querySelectorAll('.preflop-tab-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      subMode = btn.dataset.mode;
      localStorage.setItem("preflop-subMode", subMode);
      displayQuestion();
    });
  });

  nextButton.addEventListener('click', displayQuestion);

  // 最初に全データ読み込み＆初回表示
  await loadAllRanges();
  displayQuestion();

  // === ProモードOFF時の簡略化比較用 ===
  function normalize(key) {
    if (!key) return key;
    if (key.startsWith("Raise") || key.startsWith("3Bet") || key.startsWith("4Bet")) {
      return "Raise";
    }
    return key;
  }
}