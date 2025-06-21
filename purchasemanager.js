// 仮のユーザー状態（本番では保存や読み込みに変える）
const userState = {
  purchasedItemIds: ['preflop'], // ユーザーが買った機能のID
  hasBundleAccess: false,        // 一括購入済みかどうか
  totalSpent: 200,               // 合計金額（仮）
};

// 特定の機能が使えるか判定する関数
export function isFeatureUnlocked(featureId) {
  if (userState.hasBundleAccess) return true;
  return userState.purchasedItemIds.includes(featureId);
}

// ユーザーの状態を取得（他のJSから使う用）
export function getUserState() {
  return userState;
}

// 仮の購入処理（ボタンで使う用）
export function mockPurchase(featureId, price) {
  if (!userState.purchasedItemIds.includes(featureId)) {
    userState.purchasedItemIds.push(featureId);
    userState.totalSpent += price;
    // ここで自動昇格チェック
    if (userState.totalSpent >= 800) {
      userState.hasBundleAccess = true;
    }
  }
}