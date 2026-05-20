# issue12: Finderドラッグ&ドロップでフォルダ入力

## 背景

現在はフォルダの指定が「選択」ボタン（ダイアログ）またはパスの手入力のみ。
Finderからフォルダをドラッグして左右の入力欄にドロップできると UX が向上する。

## 技術方針

Tauri v2 の `@tauri-apps/api/webviewWindow` を使い、`onFileDropEvent` でドロップを検知する。
どちら側（左/右）にドロップされたかは HTML の `onDragEnter` / `onDragLeave` で追跡する。

### 実装フロー

```
Finder からフォルダをドラッグ
  → FolderInput の div に onDragOver → ハイライト表示（isDragging state）
  → FolderInput の div に onDragLeave → ハイライト解除
  → Tauri の tauri://file-drop イベント発火
  → ドロップされたパス（ディレクトリのみ）を対象の入力欄に反映
  → ハイライト解除
```

### Tauri file-drop capability

`src-tauri/capabilities/default.json` に以下を追加：
```json
"core:window:allow-start-dragging"
```
（Tauri v2 ではデフォルト capability 内の `core:default` にfile-drop受信は含まれる）

実際には `onFileDropEvent` はWebviewWindow に対して呼ぶ：
```typescript
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
const win = getCurrentWebviewWindow();
win.onFileDropEvent((event) => { ... });
```

## 変更対象ファイル

- `src/app/App.tsx`

## 実装内容

1. `App.tsx` に `useRef` で「現在ホバー中のサイド（'left' | 'right' | null）」を管理
2. `FolderInput` コンポーネントに以下のpropsを追加：
   - `isDragOver: boolean` — ドラッグ中のハイライト表示
   - `onDragEnter: () => void`
   - `onDragLeave: () => void`
3. `useEffect` で `getCurrentWebviewWindow().onFileDropEvent()` を購読：
   - `event.payload.type === 'hover'` → dragOver状態を更新
   - `event.payload.type === 'drop'` → ホバー中のサイドに最初のディレクトリパスをセット
   - `event.payload.type === 'cancel'` → 状態リセット
4. `FolderInput` の外枠に `ring-2 ring-purple-400` 等でドラッグ中ハイライト

## 完了条件

- [ ] Finder から左側入力欄にフォルダをドロップするとそのパスがセットされる
- [ ] Finder から右側入力欄にフォルダをドロップするとそのパスがセットされる
- [ ] ドラッグ中は対象の入力欄がハイライト表示される
- [ ] ファイル（フォルダでない）をドロップしても何も起きない（無視）
- [ ] `pnpm exec tsc --noEmit` がエラーなし
- [ ] PR 作成済み
