# issue15: D&D でフォルダパスが入力されない不具合修正

## 原因

現在の実装は HTML の `onDragEnter`/`onDragLeave` で左右どちらの入力欄にホバーしているか追跡しているが、
**macOS Finder → Tauri WebView へのファイルドラッグでは HTML drag イベントが発火しない**。

そのため `dragSideRef.current` は常に `null` のまま `drop` が発生し、左右どちらの入力欄にもパスがセットされない。

## 修正方針

Tauri の `onDragDropEvent` は `enter` / `over` / `drop` / `leave` の全タイプで **ウィンドウ内のカーソル座標 (`position.x`)** を提供する。

この `position.x` とウィンドウ中央 (`window.innerWidth / 2 * devicePixelRatio`) を比較して左右を判定する。HTML drag イベントへの依存を完全に除去する。

### 修正後のロジック

```typescript
getCurrentWebview().onDragDropEvent((event) => {
  const { type } = event.payload;

  if (type === 'enter' || type === 'over') {
    const midX = (window.innerWidth / 2) * window.devicePixelRatio;
    const side = event.payload.position.x < midX ? 'left' : 'right';
    dragSideRef.current = side;
    setDragOverSide(side);
  } else if (type === 'drop' && event.payload.paths.length > 0) {
    const path = event.payload.paths[0];
    if (dragSideRef.current === 'left') setLeftPath(path);
    else if (dragSideRef.current === 'right') setRightPath(path);
    setDragOverSide(null);
    dragSideRef.current = null;
  } else if (type === 'leave') {
    setDragOverSide(null);
    dragSideRef.current = null;
  }
});
```

### 合わせて削除するもの

- `FolderInput` の `onDragEnter` / `onDragLeave` props（HTML drag イベント依存）
- `makeDragHandlers` 関数
- `FolderInput` から `onDragEnter?` / `onDragLeave?` props の型・実装を削除
- `onDragOver={(e) => e.preventDefault()}` も不要のため削除

視覚フィードバック（`isDragOver` によるハイライト）は Tauri イベント経由で `dragOverSide` を更新するため引き続き動作する。

## 変更対象ファイル

- `src/app/App.tsx`

## 完了条件

- [ ] Finder からフォルダを左側入力欄エリア（ウィンドウ左半分）にドロップ → 左パスがセット
- [ ] Finder からフォルダを右側入力欄エリア（ウィンドウ右半分）にドロップ → 右パスがセット
- [ ] ドラッグ中はホバー中の入力欄がハイライト表示される
- [ ] ドラッグキャンセル（Esc）でハイライト解除される
- [ ] `pnpm exec tsc --noEmit` エラーなし
- [ ] PR 作成済み
