// // <body>にクラスを付与してモードごとにCSSを管理
export function setBodyClass(mainMode) {
  document.body.classList.remove('mainMenu-body', 'preflop-body', 'range-body', 'quiz-body', 'timer-body', `setting-body`);
  if (mainMode === 'mainMenu') {
    document.body.classList.add('mainMenu-body');
  } else if (mainMode === 'preflop') {
    document.body.classList.add('preflop-body');
  } else if (mainMode === 'range') {
    document.body.classList.add('range-body');
  } else if (mainMode === 'quiz') {
    document.body.classList.add('quiz-body');
  } else if (mainMode === 'timer') {
    document.body.classList.add('timer-body');
  } else if (mainMode === 'setting') {
    document.body.classList.add('setting-body');
  }
}

export function getKeyFromText(text, translations, currentLang) {
  const langDict = translations[currentLang];
  if (!langDict) {
    console.error("Language not found in translations:", currentLang);
    return null;
  }

  for (const key in langDict) {
    const value = langDict[key];
    let translated;

    try {
      translated = (typeof value === 'function') ? value() : value;
    } catch (e) {
      continue; // 引数必要な関数はスキップ
    }

    if (translated === text) {
      return key;
    }
  }

  console.warn("No matching key found for text:", text);
  return null;
}