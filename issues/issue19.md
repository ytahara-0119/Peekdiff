# issue19: D&D で常に左側フォルダパスが更新される問題を修正

## 背景

右側フォルダパスにドラッグ＆ドロップしても、左側フォルダパスが変更されてしまう。

## 根本原因

`midX` の計算に `* window.devicePixelRatio` を掛けているが、
`event.payload.position.x` は**論理ピクセル（CSS px）**で返るため座標空間が不一致になっている。

### 問題のある計算（現状）

```typescript
const midX = (window.innerWidth / 2) * window.devicePixelRatio;
// macOS Retina (DPR=2, innerWidth=800) の場合:
//   midX = 400 * 2 = 800
//   position.x の範囲: 0〜800 (論理px)
//   右側 position.x = 400〜800 → すべて < 800 → 'left' 判定 ← バグ
```

## 修正内容

`* window.devicePixelRatio` を削除し、論理ピクセルで統一する。

また `drop` イベントも `dragSideRef` 依存から `position.x` 直接参照に変更する
（PR #17 の改善も含む）。

### 変更後

```typescript
if (type === 'enter' || type === 'over') {
  const midX = window.innerWidth / 2;  // devicePixelRatio を削除
  const side: 'left' | 'right' = event.payload.position.x < midX ? 'left' : 'right';
  dragSideRef.current = side;
  setDragOverSide(side);
} else if (type === 'drop') {
  if (event.payload.paths.length > 0) {
    const path = event.payload.paths[0];
    const midX = window.innerWidth / 2;  // drop でも直接判定
    const side: 'left' | 'right' = event.payload.position.x < midX ? 'left' : 'right';
    if (side === 'left') setLeftPath(path);
    else setRightPath(path);
  }
  setDragOverSide(null);
  dragSideRef.current = null;
}
```

## 変更対象ファイル

- `src/app/App.tsx`（D&D ハンドラの midX 計算のみ）

## 関連

- PR #17（issue17）: 同 midX バグを含む。本 issue のマージ後に PR #17 はクローズ

## 完了条件

- [ ] 右側にドロップすると右側フォルダパスに入力される
- [ ] 左側にドロップすると左側フォルダパスに入力される
- [ ] PR #17 をクローズ
- [ ] PR 作成済み
