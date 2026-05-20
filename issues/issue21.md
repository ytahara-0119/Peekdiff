# issue21: ウィンドウリサイズ時のレイアウト崩れを修正

## 問題

ウィンドウを小さくリサイズすると UI が崩れる。

## 根本原因

### 1. `tauri.conf.json` に `minWidth` / `minHeight` が未設定

最小ウィンドウサイズの制約がないため、ウィンドウを任意のサイズに縮小できる。

### 2. 左ペインが `w-96 flex-shrink-0`（384px 固定）

`flex-shrink-0` のためウィンドウ幅が 384px を下回っても縮まない。
ウィンドウ幅 < ~450px になると右ペインが消える / レイアウトが破綻する。

## 修正内容

### `tauri.conf.json`

`minWidth: 800, minHeight: 600` を追加。

```json
{
  "title": "Peekdiff",
  "width": 1280,
  "height": 800,
  "minWidth": 800,
  "minHeight": 600,
  "resizable": true
}
```

800px にする理由：
- 左ペイン（384px）+ gap（4px）+ 右ペイン最低幅（~400px）= ~790px
- 800px あれば全要素が余裕を持って収まる

### `App.tsx` 左ペイン

`overflow-hidden` を追加し、テキストオーバーフローによる横はみ出しを防ぐ。

```tsx
// 変更前
className="w-96 flex-shrink-0 ... overflow-y-auto ..."
// 変更後
className="w-96 flex-shrink-0 ... overflow-y-auto overflow-x-hidden ..."
```

## 変更対象ファイル

- `src-tauri/tauri.conf.json`
- `src/app/App.tsx`（左ペインの overflow 指定）

## 完了条件

- [ ] ウィンドウを 800px 以下に縮小できない
- [ ] 800px 幅でも左右ペインが正しく表示される
- [ ] 最大化・縮小・ドラッグリサイズが正常に動作する
- [ ] PR 作成済み
