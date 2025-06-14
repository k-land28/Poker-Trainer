import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

export function showRangeMode() {
  // タイトル
  document.getElementById("modeTitle").textContent = getText("rangeChart");
  setBodyClass('range');

  // メイン表示を更新（戻るボタンは削除）
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <p>レンジを表示する画面です！</p>
    <div id="range-tabs">
      <button class="range-tab-button active" data-mode="openraise">Open Raise</button>
      <button class="range-tab-button" data-mode="vs_open">VS Open</button>
      <button class="range-tab-button" data-mode="vs_3bet">VS 3Bet</button>
      <button class="range-tab-button" data-mode="headsUp">Heads Up</button>
    </div>
  `;
}