# issue24

## Issue ID
issue24

## Title
アイコンのオプティカルサイズ調整（月・星グラフィックを約17%縮小）

## Purpose
macOS Dock上でChrome・VS Code・Figma等と並べたときに視覚的占有率が他アプリより高く見える問題を解消する。
実ピクセルサイズではなく、オプティカルサイズ（余白・視覚的重量）を基準に調整する。

## Background

現状（issue22後）の数値：
- Moon: 200×200 at (156, 156) → canvas比 200/512 ≈ 39%
- Star: 110×110 at (351, 51)

macOS標準アプリのアイコンは canvas の 60〜70% を視覚要素が占め、
残り 30〜40% を余白として確保するのが一般的。
現状の月はグラフィックの中でも支配的に見えるため、約17〜18% 縮小して余白を確保する。

## Scope

- `AppIcon.svg` の Moon サイズを 200×200 → 165×165 に縮小・再センタリング
- `AppIcon.svg` の Star サイズを 110×110 → 90×90 に縮小・位置調整
- 変更後に `pnpm rebuild:icon` を実行して PNG/ICNS を再生成

## Out of Scope

- グラデーション・色・角丸（rx）の変更
- アイコン形状（月・星のパス）の変更
- Dock アニメーション・サイズ設定

## Editable Files

```
src-tauri/icons/AppIcon.svg
```

## Do Not Edit

- 生成済み PNG/ICNS（`pnpm rebuild:icon` で自動上書きされる）
- `src-tauri/tauri.conf.json`
- SPEC.md / CLAUDE.md

## Dependencies

なし

## Branch

`fix/issue24-icon-optical-size`

## Implementation Notes

### 変更前後の数値

| 要素 | 変更前 size | 変更前 pos | 変更後 size | 変更後 pos | 縮小率 |
|------|------------|-----------|------------|-----------|-------|
| Moon | 200×200 | x=156, y=156 | 165×165 | x=174, y=174 | −17.5% |
| Star | 110×110 | x=351, y=51 | 90×90 | x=371, y=55 | −18.2% |

- Moon の再センタリング: (512 − 165) / 2 = 173.5 → **174**
- Star の右余白: 512 − 51 − 110 = 351（51px 余白）→ 512 − 51 − 90 = **371**（51px 余白維持）
- Star の上余白: 51 → 55（わずかに内側へ）

### stroke-width について

`viewBox="0 0 24 24"` 座標系で `stroke-width="1.5"` のため、
SVG 要素サイズに比例してピクセル幅も自動縮小される（変更不要）。

### 再ビルド手順

```bash
pnpm rebuild:icon
```

`sudo` を要求するため、ユーザーがターミナルで手動実行する。

## Acceptance Criteria

- [ ] Moon が 165×165 で canvas 中央に配置されている
- [ ] Star が 90×90 で右上に配置されている
- [ ] `pnpm tauri icon src-tauri/icons/AppIcon.svg` がエラーなく完了する
- [ ] Dock 上で Chrome・VS Code と並べて視覚サイズが同等に見える

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md と矛盾しない
- [ ] Pull Request を作成した
