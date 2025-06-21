import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

export function showHowtoMode() {
  // タイトルを更新
  document.getElementById("modeTitle").textContent = getText("howTo");
  setBodyClass('howto');

  // メイン表示を更新（戻るボタンは削除）
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <p>【プリフロップトレーナー】
    <br>設定からProモードをONにすると、Raise後に相手からリレイズを返された時のアクションまで判定するようになります。
    <p>【レンジ表】
    <br>レンジ表に基づいてプリフロップトレーナーの正誤判定がなされます。
    <br>編集できるようにする予定です。</p>
    <p>【パワーナンバー】
    <br>パワーナンバー表の確認と、実際のシチュエーションでのアクション判断をテストできます。</p>
    <p>【クイズ】
    <br>実装中です。出題内容によってジャンル分けするか検討中です。PROモードでは制限時間内に正答数を競うゲームを実装予定です。</p>
    <p>【タイマー】
    <br>横画面表示に対応予定。シートオープンやリエントリーボタンを押すことで、Avg Stackが更新されます。
    <br>設定からSEのONOFFを切り替えられますが、PWAアプリ状態ではブラウザ制限により鳴りません。リリースをお待ちください。</p>
    <p>【使い方】
    <br>この画面のことです。ご覧の通り未実装です。</p>
    <p>【設定】
    <br>プリフロップトレーナーの<br>PROモード切替のみ利用できます。</p>
    <p>👇開発者の備忘録👇</p>
    <p>【実装予定項目】
    <br>・Tipsモード</p>
    <p>【修正予定・確認されているバグ】
    <br>・プリフロップトレーナーで、選択肢が2行に収まるようにボタンのサイズ調整
    <br>・xxxx
    <br>・xxxx</p>
  `;
}