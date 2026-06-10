# Peekdiff

macOS 向けのファイル／ディレクトリ比較ツール。2 つのフォルダまたはファイルを選択して差分を確認できます。

## 機能

- **フォルダ比較モード**：ディレクトリツリーを再帰的に比較（追加 / 削除 / 変更 / 同一）
- **ファイル比較モード**：2 つの単一ファイルを直接比較（全幅 Split Diff 表示）
- Finder からのドラッグ＆ドロップでパスを入力（ウィンドウ左右で自動振り分け）
- テキストファイルの左右 Split Diff 表示（行番号付き）
- バイナリファイルのサイズ・ハッシュ・更新日時表示
- ファイル名・ステータスによるフィルタ・検索（フォルダ比較時）
- SHA-256 ハッシュによる正確な差分判定

## 必要環境

| ツール | バージョン |
|--------|-----------|
| Rust | 1.77 以上 (`rustup` 推奨) |
| Node.js | 18 以上 |
| pnpm | 8 以上 (`npm install -g pnpm`) |
| Xcode Command Line Tools | `xcode-select --install` |

## 開発

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバー起動（Tauri ウィンドウが開きます）
pnpm tauri dev
```

## ビルド

```bash
# リリースビルド
pnpm tauri build
```

成功すると以下のパスに `.app` と `.dmg` が生成されます。

```
src-tauri/target/release/bundle/macos/Peekdiff.app
src-tauri/target/release/bundle/dmg/Peekdiff_0.1.0_aarch64.dmg
```

Finder で `Peekdiff.app` をダブルクリックして起動できます。

## アイコンの更新

Dock アイコンを更新するには再ビルドが必要です：

```bash
pnpm rebuild:icon
```

このコマンドは以下を自動で実行します：
1. `AppIcon.svg` からアイコン再生成（`pnpm tauri icon`）
2. リリースビルド（`pnpm tauri build`）
3. macOS アイコンキャッシュのクリア

その後 `src-tauri/target/release/bundle/macos/Peekdiff.app` を起動すると新しいアイコンが反映されます。

## 使い方

### フォルダ比較

1. ヘッダーの「フォルダ比較」タブを選択（デフォルト）
2. 左右のフォルダ入力欄に「選択」ボタンまたは Finder からドラッグ＆ドロップでフォルダを指定する
3. 「比較」ボタンを押す
4. 左ペインにファイルツリーが表示される
5. ファイルをクリックすると右ペインに差分詳細が表示される
6. 検索・フィルタで絞り込み可能

### ファイル比較

1. ヘッダーの「ファイル比較」タブを選択
2. 左右のファイル入力欄に「選択」ボタンまたは Finder からドラッグ＆ドロップでファイルを指定する
3. 「比較」ボタンを押す
4. 全幅で差分詳細が表示される

## ライセンス

MIT
