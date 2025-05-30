import { switchMode, preloadAllRanges } from './modes/preflop-trainer/preflop-trainer.js';

window.addEventListener('load', async () => {
  await preloadAllRanges();
  switchMode(subMode);
});

function switchMainMode(mainMode) {
  if (mainMode === 'preflop') {
    loadScript('./modes/preflop/preflop.js', () => {
      preloadPreflopRanges().then(() => {
        switchSubMode('openraise'); // デフォルトでopenraise表示
      });
    });
  } else if (mainMode === 'handrange') {
    loadScript('./modes/handrange/handrange.js');
  } else if (mainMode === 'headsup') {
    loadScript('./modes/headsup/headsup.js');
  }
}

function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  document.body.appendChild(script);
}

window.addEventListener('load', () => {
  switchMainMode('preflop'); // 初期モードをプリフロップに設定
});