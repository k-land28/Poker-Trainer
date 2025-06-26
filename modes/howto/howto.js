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
    <br>レンジ表に基づいてプリフロップトレーナーの正誤判定がなされます。</p>
    <p>【パワーナンバー】
    <br>パワーナンバー表の確認と、実際のシチュエーションでのアクション判断をテストできます。</p>
    <p>【クイズ】
    <br>実装中です。出題内容によってジャンル分けするか検討中です。PROモードでは制限時間内に正答数を競うゲームを実装予定です。</p>
    <p>【タイマー】
    <br>シートオープンやリエントリーボタンを押すことで、Avg Stackが更新されます。
    <br>設定からSEのONOFFを切替可能</p>
    <p>【使い方】
    <br>この画面のことです。ご覧の通り未実装です😭</p>
    <p>【設定】
    <br>プリフロップトレーナーの<br>PROモード切替のみ利用できます。</p>
    <p>👇開発者の備忘録👇</p>
    <p>【実装予定項目】
    <br>・Tipsモード
    <br>・タイマー横画面表示
    <br>・レンジ表を編集することで仮想VPIPを算出し、GTOとの差を表示</p>
    <p>【修正予定・確認されているバグ】
    <br>・プリフロップトレーナーで、選択肢が2行に収まるようにボタンのサイズ調整
    <br>・アプリ化時、timer.jsのbasePathの構文を削除して、$basePathを相対パス(..)に置換</p>
  `;
}