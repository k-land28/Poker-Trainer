export function showHeadsUpMode() {
  // タイトルを更新
  document.getElementById("modeTitle").textContent = "ヘッズアップ";

  // メイン表示を更新（戻るボタンは削除）
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <p>ここがヘッズアップの画面だよ！ななちゃんの要望で作ります！</p>
  `;
}
