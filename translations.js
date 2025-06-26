//translations.js
export const translations = {
  ja: {
    mainMenuTitle: "ポーカートレーナー",
    preflopTrainer: "プリフロップトレーナー",
    rangeChart: "レンジ表",
    powerNo: "パワーナンバー",
    quiz: "クイズ",
    timer: "タイマー",
    howTo: "使い方",
    setting: "設定",
    menuMain: "メインメニュー",
    langToggleButton: "English",

    yes: "はい",
    no: "いいえ",

    //Preflop-Trainer
    correctText: () => "正解！🎉",
    incorrectText: (answer) => `不正解。正解は「${answer}」です。`,
    handLabel: "ハンド",
    headsUpBtnActionBTN: "BTNのアクションは？",
    headsUpBtnActionBB: "BTNがRaiseしました。BBのアクションは？",
    openraiseSituation: (position) => `${position}からOpen Raiseしますか？`,
    vsOpenSituation: (opener, position) => `${opener}がOpenしました。${position}のアクションは？`,
    vs3betSituation: (opener, threeBetter) => `${opener}のOpen Raiseに対し${threeBetter}が3Bet。${opener}のアクションは？`,
    headsupSituation_btn: () => `BTNのアクションは？`,
    headsupSituation_bb: () => `BTNがレイズしました。BBのアクションは？`,
    Raise: () => 'レイズ',
    Call: () => 'コール',
    Fold: () => 'フォールド',
    "3Bet/Raise": () => '3Bet/レイズ',
    "3Bet/Call": () => '3Bet/コール',
    "3Bet/Fold": () => '3Bet/フォールド',
    "4Bet/ALLIN": () => '4Bet/オールイン',
    "4Bet/Fold": () => '4Bet/フォールド',
    "Raise/4Bet": () => 'Raise/4Bet',
    "Raise/Call": () => 'Raise/コール',
    "Raise/Fold": () => 'Raise/フォールド',
    "3Bet/ALLIN": () => '3Bet/オールイン',
    "3Bet/Call": () => '3Bet/コール',
    "3Bet/Fold": () => '3Bet/フォールド',   

    //range-chart
    confirmResetRange: "このレンジ表をプリセット状態に戻してもいいですか？",

    //Powerno
    "practiceMode": () => 'Push or Fold',
    "powerChart": () => 'パワーナンバー表',
    practiceMode: "実戦モード",
    powerChart: "パワーナンバー表",
    powerno_questionPrefix: "のアクションは？",
    powerno_stackLabel: "スタック：",
    powerno_handLabel: "ハンド：",
    powerno_correct: "✅ 正解！",
    powerno_wrong: "❌ 不正解！正解は ",
    "powerno_chart_note": () => 
    "M値 = <span class='fraction'><span class='numerator'>スタック</span><span class='denominator'>SB + BB + Ante</span></span><br>必要パワー = M値 × 後ろの人数<br>ハンドのパワーが必要パワーを超えていれば Push が正当化されます。"  },



  en: {
    mainMenuTitle: "Poker Trainer",
    preflopTrainer: "Preflop Trainer",
    rangeChart: "Range Chart",
    powerNo: "Power Number",
    quiz: "Quiz",
    timer: "Timer",
    howTo: "How To",
    setting: "Setting",
    menuMain: "Main Menu",
    langToggleButton: "Japanese",

    yes: "Yes",
    no: "No",

    //Preflop-Trainer
    correctText: "Correct! 🎉",
    incorrectText: (answer) => `Incorrect. The correct answer is "${answer}".`,
    handLabel: "Hand",
    headsUpBtnActionBTN: "What should BTN do?",
    headsUpBtnActionBB: "BTN raised. What should BB do?",
    openraiseSituation: (position) => `Open Raise from ${position}?`,
    vsOpenSituation: (opener, position) => `${opener} opened. What should ${position} do?`,
    vs3betSituation: (opener, threeBetter) => `${opener} opened and ${threeBetter} 3Bet. What should ${opener} do?`,
    headsupSituation_btn: () => `What is BTN's action?`,
    headsupSituation_bb: () => `BTN raised. What is BB's action?`,
    Raise: () => 'Raise',
    Call: () => 'Call',
    Fold: () => 'Fold',
    "3Bet/Raise": () => '3Bet/Raise',
    "3Bet/Call": () => '3Bet/Call',
    "3Bet/Fold": () => '3Bet/Fold',
    "4Bet/ALLIN": () => '4Bet/ALLIN',
    "4Bet/Fold": () => '4Bet/Fold',
    "Raise/4Bet": () => 'Raise/4Bet',
    "Raise/Call": () => 'Raise/Call',
    "Raise/Fold": () => 'Raise/Fold',
    "3Bet/ALLIN": () => '3Bet/ALLIN',
    "3Bet/Call": () => '3Bet/Call',
    "3Bet/Fold": () => '3Bet/Fold',
    
    //range-chart
    confirmResetRange: "Are you sure you want to reset this range to the default preset?",

    //Powerno
    "practiceMode": () => 'Push or Fold',
    "powerChart": () => 'パワーナンバー表',
    practiceMode: "Practice",
    powerChart: "Chart",
    powerno_questionPrefix: "'s action?",
    powerno_stackLabel: "Stack: ",
    powerno_handLabel: "Hand: ",
    powerno_correct: "✅ Correct!",
    powerno_wrong: "❌ Wrong! Correct: ",
    "powerno_chart_note": () => 
    "M = <span class='fraction'><span class='numerator'>Stack</span><span class='denominator'>SB + BB + Ante</span></span><br>Required Power = M × Number of players behind<br>If your hand's power exceeds the required power, pushing is justified."  } 
}