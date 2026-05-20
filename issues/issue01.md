# issue01

## Issue ID
issue01

## Title
環境構築（Vite + React + TypeScript + Tailwind + shadcn/ui + Tauri）

## Purpose
Peekdiff の開発・ビルド・実行環境を整備する。

## Background
Figma Make のプロトタイプ（React + Vite + Tailwind + shadcn/ui）をベースに、
Tauri でラップした macOS デスクトップアプリとして動作させるための土台を作る。

## Scope

- `package.json` / `pnpm-workspace.yaml` の作成
- `vite.config.ts` の設定（@vitejs/plugin-react）
- `tsconfig.json` / `tsconfig.node.json` の設定
- Tailwind CSS v4 の設定（`@tailwindcss/vite` プラグイン使用）
- shadcn/ui の初期セットアップ（`components.json`）
- Tauri の初期セットアップ（`src-tauri/` ディレクトリ・`tauri.conf.json`）
- `src/` ディレクトリ構成の作成
- `pnpm dev` で Vite 開発サーバーが起動すること
- `pnpm tauri dev` で Tauri ウィンドウが起動すること（最低限の空画面でよい）

## Out of Scope

- React コンポーネントの実装（issue02 以降）
- Tauri IPC コマンドの実装（issue06）

## Editable Files

```
package.json
pnpm-workspace.yaml
vite.config.ts
tsconfig.json
tsconfig.node.json
postcss.config.mjs          # 必要な場合のみ
components.json             # shadcn/ui
tailwind.config.ts          # 必要な場合のみ
src/styles/globals.css
src/styles/tailwind.css
src/main.tsx
src/App.tsx                 # 空の骨格のみ
index.html
src-tauri/tauri.conf.json
src-tauri/Cargo.toml
src-tauri/src/main.rs
```

## Do Not Edit

- `issues/`
- `docs/`
- `SPEC.md`
- `CLAUDE.md`

## Dependencies

なし

## Branch

`feature/issue01-env-setup`

## Implementation Notes

- pnpm を使用する（npm / yarn は使わない）
- Tailwind は v4 系（`@tailwindcss/vite` プラグイン方式）を使用する
- React は 18.x を使用する
- Tauri は v2 系を使用する
- `src/app/` 以下にアプリコードを配置する規則に従う
- shadcn/ui の theme は `default_shadcn_theme.css` を参考にする

## Acceptance Criteria

- [ ] `pnpm install` がエラーなく完了する
- [ ] `pnpm dev` で `http://localhost:5173` にアクセスできる（空画面でよい）
- [ ] `pnpm tauri dev` で Tauri ウィンドウが起動する（空画面でよい）
- [ ] `pnpm build` でビルドエラーが出ない
- [ ] TypeScript の strict モードが有効になっている

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md の技術スタックと矛盾しない
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
