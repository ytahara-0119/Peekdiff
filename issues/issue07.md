# issue07

## Issue ID
issue07

## Title
.app パッケージ化・動作確認

## Purpose
Peekdiff を macOS 向け `.app` バンドルとしてビルドし、
配布・インストールできる状態にする。

## Background
SPEC.md §1.1 の「macOS向けデスクトップアプリ」としての完成形。
Tauri の `tauri build` コマンドで `.app` および `.dmg` を生成する。

## Scope

- `tauri.conf.json` のプロダクション設定
  - アプリ名: `Peekdiff`
  - バンドル ID: `com.peekdiff.app`
  - アイコン設定
  - ウィンドウサイズ（デフォルト: 1280 × 800）
- `pnpm tauri build` でビルドが通ること
- `.app` バンドルが `src-tauri/target/release/bundle/macos/` に生成されること
- アプリアイコンの設定（仮アイコンでよい）
- `README.md` にビルド手順・実行手順を記載する

## Out of Scope

- コード署名・公証（Notarization）
- App Store 配布
- 自動アップデート機能

## Editable Files

```
src-tauri/tauri.conf.json
src-tauri/icons/           # アイコンファイル一式
README.md
```

## Do Not Edit

- `src/app/`（コンポーネント実装は変更しない）
- `src-tauri/src/`（Rust 実装は変更しない）

## Dependencies

- issue06（Tauri IPC 連携が完了していること）

## Branch

`feature/issue07-packaging`

## Implementation Notes

### tauri.conf.json の最低限設定

```json
{
  "productName": "Peekdiff",
  "version": "0.1.0",
  "identifier": "com.peekdiff.app",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Peekdiff",
        "width": 1280,
        "height": 800,
        "resizable": true
      }
    ]
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": ["icons/icon.icns"]
  }
}
```

### アイコン

- `src-tauri/icons/` に `icon.icns`（macOS 用）を配置する
- Tauri CLI の `tauri icon` コマンドで PNG から自動生成できる
  ```
  pnpm tauri icon src-tauri/icons/icon.png
  ```

### README.md 記載内容

- プロジェクト概要
- 必要環境（Rust / Node / pnpm / Xcode Command Line Tools）
- 開発手順（`pnpm install` → `pnpm tauri dev`）
- ビルド手順（`pnpm tauri build`）

## Acceptance Criteria

- [ ] `pnpm tauri build` がエラーなく完了する
- [ ] `src-tauri/target/release/bundle/macos/Peekdiff.app` が生成される
- [ ] `.app` をダブルクリックでアプリが起動する
- [ ] アプリ起動後、フォルダ選択〜比較〜差分表示の一連操作が動作する
- [ ] `README.md` にビルド・実行手順が記載されている

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md §1.1 と矛盾しない
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
