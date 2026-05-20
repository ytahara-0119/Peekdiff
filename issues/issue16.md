# issue16: macOS Dock アイコンを新デザインに更新

## 背景

`src-tauri/icons/icon.icns` は issue08 で月と星の SVG から正しく再生成済み（180598 bytes）。
しかし Dock に表示されるアイコンは `.app` バンドルに埋め込まれるため、
**`pnpm tauri build` で再ビルドしないと Dock に反映されない**。

また macOS はアプリアイコンをキャッシュするため、新しい `.app` に差し替えても
旧アイコンが表示され続けることがある。

## 実装内容

### 1. スクリプトを追加してビルド + キャッシュクリアを一発で実行できるようにする

`scripts/rebuild-icon.sh` を作成：

```bash
#!/usr/bin/env bash
set -e

echo "==> Regenerating icons from AppIcon.svg..."
pnpm tauri icon src-tauri/icons/AppIcon.svg

echo "==> Building release app..."
pnpm tauri build

echo "==> Clearing macOS icon cache..."
sudo rm -rf /Library/Caches/com.apple.iconservices.store
sudo killall Dock

echo "==> Done! Launch src-tauri/target/release/bundle/macos/Peekdiff.app"
```

### 2. package.json に npm script を追加

```json
"scripts": {
  "rebuild:icon": "bash scripts/rebuild-icon.sh"
}
```

### 3. README.md にアイコン更新手順を追記

```markdown
## アイコンの更新

アイコンを変更した場合は以下を実行：

\`\`\`bash
pnpm rebuild:icon
\`\`\`
```

## 変更対象ファイル

- `scripts/rebuild-icon.sh`（新規）
- `package.json`
- `README.md`

## 完了条件

- [ ] `pnpm tauri build` が成功する
- [ ] `src-tauri/target/release/bundle/macos/Peekdiff.app` を起動すると Dock に月と星のアイコンが表示される
- [ ] `scripts/rebuild-icon.sh` が存在し実行権限がある
- [ ] PR 作成済み
