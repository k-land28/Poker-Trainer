export function showRangeViewer() {
  // タイトルを更新
  document.getElementById("modeTitle").textContent = "レンジ表";

  // メイン表示を更新（戻るボタンは削除）
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <p>レンジの画面だよ！</p>
  `;
}