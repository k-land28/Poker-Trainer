// // <body>にクラスを付与してモードごとにCSSを管理
export function setBodyClass(mode) {
  document.body.classList.remove('preflop-body', 'range-body', 'pt-body', 'hud-body');
  if (mode === 'timer') {
    document.body.classList.add('pt-body');
  } else if (mode === 'preflop') {
    document.body.classList.add('preflop-body');
  } else if (mode === 'hud') {
    document.body.classList.add('hud-body');
  }
}