# Peekdiff

macOS 向けディレクトリ比較ツール。2 つのフォルダを選択して差分をツリー表示し、テキストファイルの Split Diff を確認できます。

## 機能

- フォルダツリーを再帰的に比較（追加 / 削除 / 変更 / 同一）
- ファイル名・ステータスによるフィルタ・検索
- テキストファイルの左右 Split Diff 表示（行番号付き）
- バイナリファイルのサイズ・ハッシュ・更新日時表示
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

## 使い方

1. 左右のフォルダ入力欄に「選択」ボタンでフォルダを指定する
2. 「比較」ボタンを押す
3. 左ペインにファイルツリーが表示される
4. ファイルをクリックすると右ペインに差分詳細が表示される
5. 検索・フィルタで絞り込み可能

## ライセンス

MIT
