# issue17: D&D で右側フォルダパスが入力されない問題を修正

## 背景

PR #15 で実装した Tauri `onDragDropEvent` による D&D は、左側には反映されるが
**右側には反映されない**ことがある。

## 根本原因

`drop` イベントハンドラが `dragSideRef.current`（`enter`/`over` で設定）に依存している。
macOS では `leave` イベントが `drop` より先に発火するケースがあり、その場合
`leave` ハンドラが `dragSideRef.current = null` にリセットするため、
`drop` 時には `null` となり左右どちらにも入力されない。

```
イベント順（macOS で起こりうる）:
  over (side='right') → leave (ref=null) → drop (ref=null → どちらにも入らない)
```

## 修正内容

`drop` ハンドラ内でも `event.payload.position.x` から左右を直接判定する。
`dragSideRef` は視覚フィードバック（`isDragOver` の状態）専用とする。

### 変更前

```typescript
} else if (type === 'drop') {
  if (event.payload.paths.length > 0) {
    const path = event.payload.paths[0];
    if (dragSideRef.current === 'left') setLeftPath(path);
    else if (dragSideRef.current === 'right') setRightPath(path);
  }
  setDragOverSide(null);
  dragSideRef.current = null;
}
```

### 変更後

```typescript
} else if (type === 'drop') {
  if (event.payload.paths.length > 0) {
    const path = event.payload.paths[0];
    const midX = (window.innerWidth / 2) * window.devicePixelRatio;
    const side: 'left' | 'right' = event.payload.position.x < midX ? 'left' : 'right';
    if (side === 'left') setLeftPath(path);
    else setRightPath(path);
  }
  setDragOverSide(null);
  dragSideRef.current = null;
}
```

## 変更対象ファイル

- `src/app/App.tsx`（`drop` ハンドラのみ変更）

## 完了条件

- [ ] Finder からフォルダを右側入力欄にドロップするとパスが入力される
- [ ] 左側も引き続き動作する
- [ ] PR 作成済み
