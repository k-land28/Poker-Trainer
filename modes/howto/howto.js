import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

export function showHowtoMode() {
  // タイトルを更新
  document.getElementById("modeTitle").textContent = getText("howTo");
  setBodyClass('howto');

  // メイン表示を更新（戻るボタンは削除）
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <p>このアプリの使い方説明画面です。（未実装）</p>
    <p>開発者の備忘録</p>
    <p>【プリフロップトレーナー】
    <br>3Bet/XXや4Bet/XXは、3Betや4Bet後に相手からレイズを返された時のアクションまで検討して回答するボタンです。
    <br>OpenRaise/VS Openモードは利用できます。
    <br>VS3Bet、HeadsUpモードはまだレンジを書き込んでいないため、正誤判定が正しく行われません。</p>
    <p>【レンジ表】
    <br>未実装です。プリセットのレンジ表を確認でき、編集もできます。
    <br>自分だけのレンジ表を作り、プリフロップトレーナーで問題として出せるようにする予定です。</p>
    <p>【クイズ】
    <br>実装中です。出題内容によってジャンル分けするか検討中です。PROモードでは制限時間内に正答数を競うゲームを実装予定です。</p>
    <p>【タイマー】
    <br>実装中です。横画面表示に対応予定。PROモードではAve.スタックや残り人数の表示、ストラクチャーを複数作成できる予定です。</p>
    <p>【使い方】
    <br>未実装です。チュートリアルやPROモードの説明などを実装予定です。</p>
    <p>【設定】
    <br>未実装です。ダミーを表示しています。</p>
    <p>【実装予定項目】
    <br>・xxxx</p>
    <p>【修正予定・確認されているバグ】
    <br>・プリフロップトレーナーで、選択肢が2行に収まるようにボタンのサイズ調整</p>
  `;
}