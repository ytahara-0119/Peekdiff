# issue06

## Issue ID
issue06

## Title
Tauri IPC 連携（実フォルダ走査・差分計算・モック差し替え）

## Purpose
モックデータを実際のファイルシステム操作に差し替え、
リアルなディレクトリ比較を動作させる。

## Background
SPEC.md §4.1・§6.1 の Tauri バックエンド要件を実装する。
フロントエンドは `invoke()` 呼び出しのみに変更し、
比較ロジックは Rust（Tauri コマンド）側に集約する。

## Scope

### Rust 側（src-tauri/src/）

- `compare_directories(left: String, right: String) -> Result<Vec<FileNode>>` コマンドの実装
  - 段階比較アルゴリズム（SPEC.md §6.1 参照）
    1. パス存在比較
    2. サイズ比較
    3. mtime 比較
    4. ハッシュ比較（SHA-256、必要時のみ）
    5. テキスト判定後 diff 生成
  - アクセス不可ファイルはスキップしてログ出力
- `open_folder_dialog() -> Result<Option<String>>` コマンドの実装
  - OS ネイティブフォルダ選択ダイアログ
- `read_file_content(path: String) -> Result<String>` コマンドの実装
  - テキストファイルの内容取得

### フロントエンド側（src/app/）

- `src/app/utils/tauriApi.ts` の作成
  - `compareDirectories(left: string, right: string): Promise<FileNode[]>`
  - `openFolderDialog(): Promise<string | null>`
  - `readFileContent(path: string): Promise<string>`
- `src/app/App.tsx` の更新
  - 比較ボタン押下時: `compareDirectories` を `invoke` で呼び出す
  - フォルダ入力横に「選択」ボタンを追加し `openFolderDialog` を呼び出す
  - モックデータからのデータ取得をなくす

## Out of Scope

- 構文ハイライト
- .app パッケージ化（issue07）

## Editable Files

```
src-tauri/src/main.rs
src-tauri/src/lib.rs          # 必要に応じてモジュール分割
src-tauri/Cargo.toml
src/app/utils/tauriApi.ts
src/app/App.tsx
```

## Do Not Edit

- `src/app/types.ts`
- `src/app/components/DirectoryTree.tsx`
- `src/app/components/FileDetailView.tsx`
- `src/app/utils/mockData.ts`（削除しない、テスト用に残す）

## Dependencies

- issue05（App 統合が完了していること）

## Branch

`feature/issue06-tauri-ipc`

## Implementation Notes

### FileNode の Rust 表現

Rust 側で `FileNode` 相当の構造体を定義し、serde で JSON シリアライズする。

```rust
#[derive(Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub r#type: String,   // "file" | "directory"
    pub status: String,   // "added" | "deleted" | "modified" | "identical"
    pub children: Option<Vec<FileNode>>,
    pub size: Option<u64>,
    pub modified_date: Option<String>,
    pub hash: Option<String>,
    pub is_text: Option<bool>,
    pub left_content: Option<String>,
    pub right_content: Option<String>,
}
```

### ハッシュ

- `sha2` クレートを使用（SHA-256）
- 大容量ファイルはストリーム読み込み（1MB チャンク）

### テキスト判定

- 拡張子ベースで判定（.txt / .ts / .tsx / .js / .jsx / .md / .json / .css / .html 等）
- バイナリと判定した場合は `left_content` / `right_content` を省略

### Tauri Permissions

- `tauri.conf.json` に `fs:read-all`、`dialog:open` のパーミッションを追加

## Acceptance Criteria

- [ ] フォルダ選択ボタンでOSダイアログが開く
- [ ] 左右フォルダを選択して「比較」を押すと実際のツリーが表示される
- [ ] 追加・削除・変更・同一が正しく判定される
- [ ] アクセス不可ファイルがあってもクラッシュしない
- [ ] テキストファイルの Split Diff が表示される
- [ ] バイナリファイルのサイズ・ハッシュが表示される
- [ ] TypeScript / Rust コンパイルエラーがない

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md §4.1・§6.1 と矛盾しない
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
