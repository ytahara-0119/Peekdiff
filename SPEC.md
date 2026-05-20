# SPEC.md
Peekdiff (macOS / Tauri + React + TypeScript + Tailwind)

---

# 1. プロジェクト概要

## 1.1 目的

macOS向けに、WinMergeのようなシンプルで直感的な「ディレクトリ比較ツール」を提供する。

本アプリは以下を重視する：

- 学習コストが低い
- 差分が一目で分かる
- 大規模フォルダでもフリーズしない

## 1.2 技術スタック

| レイヤー | 技術 |
|---------|------|
| デスクトップシェル | Tauri (Rust) |
| UI フレームワーク | React 18 + TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| UIコンポーネント | shadcn/ui |
| アニメーション | framer-motion (motion/react) |
| アイコン | lucide-react |
| パッケージ管理 | pnpm |

---

# 2. 設計原則

## 2.1 シンプル第一

- UIは明確な階層構造
- 機能はMVPから段階的に拡張
- 過剰設計をしない

## 2.2 責務分離

| 層 | 役割 |
|----|------|
| UI層（React） | 表示・操作 |
| IPC層（Tauri invoke） | フロントエンド ↔ バックエンド通信 |
| 比較エンジン（Rust/Tauri） | ファイルシステム走査・差分計算 |
| 状態管理（React useState） | フィルタ・選択状態 |

## 2.3 モックファースト

- Figma Make で定義したモックデータ（mockData.ts）でUIを先行開発する
- Tauri IPC は後続 issue で差し替える

---

# 3. コアデータ型

```ts
export type CompareStatus = 'added' | 'deleted' | 'modified' | 'identical';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  status: CompareStatus;
  children?: FileNode[];
  size?: number;
  modifiedDate?: string;
  hash?: string;
  isText?: boolean;
  leftContent?: string;
  rightContent?: string;
}

export interface DiffLine {
  type: 'added' | 'deleted' | 'unchanged';
  leftLineNumber?: number;
  rightLineNumber?: number;
  content: string;
}
```

---

# 4. MVP機能要件

## 4.1 フォルダ選択

- 左右2ペインでフォルダA / フォルダBのパスを入力
- Tauri IPC 経由でOSネイティブダイアログを呼び出す

## 4.2 ディレクトリ比較

比較ステータス分類：

| ステータス | 意味 | 色 |
|-----------|------|----|
| `added` | Bにのみ存在 | 緑 |
| `deleted` | Aにのみ存在 | 赤 |
| `modified` | 両方存在するが内容が異なる | 黄 |
| `identical` | 完全一致 | グレー |

## 4.3 差分ツリー表示（DirectoryTree）

- ツリー形式でファイル・ディレクトリを表示
- ステータス別カラー表示（左ボーダー + 背景グラデーション）
- ディレクトリはクリックで開閉
- 選択ファイルはハイライト表示

## 4.4 詳細ビュー（FileDetailView）

### テキストファイル（TextDiffView）

- 左右2カラムのSplit diff表示
- 行番号表示
- 追加行：緑背景、削除行：赤背景、変更なし：透明

### バイナリファイル（BinaryFileView）

- ファイルサイズ（KB）
- ハッシュ値（SHA-256）
- 最終更新日時

## 4.5 フィルタ機能

- すべて / 追加 / 削除 / 変更 / 同一 をセレクトで切り替え

## 4.6 検索

- ファイル名部分一致でツリーをリアルタイムフィルタ

## 4.7 比較実行

- 「比較」ボタンで再スキャン
- スキャン中はボタン無効化 + プログレスバー表示
- 完了後に統計バッジを更新

## 4.8 統計バッジ

ヘッダーに常時表示：

- `+N`（追加数）
- `-N`（削除数）
- `~N`（変更数）
- `=N`（同一数）

---

# 5. UI設計

## 5.1 レイアウト構成

```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────┐  │
│  │ 📁 左フォルダパス │ │ 📁 右フォルダパス │ │ 比較 │  │
│  └─────────────────┘ └─────────────────┘ └──────┘  │
│  [プログレスバー（比較中のみ）]                         │
│  ┌──────────────────────┐ ┌──────────────────────┐  │
│  │ 🔍 検索               │ │ 🔽 フィルタ            │  │
│  └──────────────────────┘ └──────────────────────┘  │
│  [+N] [-N] [~N] [=N]  ← 統計バッジ                  │
├────────────────────────┬────────────────────────────┤
│ DirectoryTree (w-96)   │ FileDetailView (flex-1)    │
│  ツリー形式             │  Split Diff / Binary Info  │
├────────────────────────┴────────────────────────────┤
│（ステータスバー 省略可）                               │
└─────────────────────────────────────────────────────┘
```

## 5.2 デザイン方針

- カラーテーマ：パープル〜ピンク〜ブルーのグラデーション
- 背景：`bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50`
- ヘッダー：`bg-white/80 backdrop-blur-lg`
- ステータス色は Tailwind で統一（追加=green, 削除=red, 変更=yellow, 同一=gray）
- アニメーション：framer-motion で最小限（フェードイン・ホバースケール）

## 5.3 コンポーネント構成

```
App
├── Header
│   ├── FolderInput × 2
│   ├── CompareButton
│   ├── ProgressBar（条件付き）
│   ├── SearchInput
│   ├── FilterSelect
│   └── StatsBadges
├── DirectoryTree
│   └── TreeNode（再帰）
└── FileDetailView
    ├── TextDiffView
    └── BinaryFileView
```

---

# 6. 非機能要件

## 6.1 パフォーマンス

- 比較はTauriバックエンド（Rust）で実行し、UIをブロックしない
- 段階比較アルゴリズム：
  1. パス存在比較
  2. サイズ比較
  3. mtime比較
  4. ハッシュ比較（必要な場合のみ）
  5. テキスト判定後diff生成
- ハッシュ：SHA-256、大容量ファイルはストリーム処理

## 6.2 macOS最適化

- Retina対応
- Tauri標準ウィンドウ

## 6.3 安定性

- エラー時はクラッシュしない
- アクセス不可ファイルはスキップしてログ表示
