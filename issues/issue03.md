# issue03

## Issue ID
issue03

## Title
DirectoryTree コンポーネント

## Purpose
ファイル差分ツリーを表示する `DirectoryTree` コンポーネントを実装する。

## Background
SPEC.md §4.3 の「差分ツリー表示」要件を満たすコンポーネント。
Figma Make の `DirectoryTree.tsx` が UI の正となる。

## Scope

- `src/app/components/DirectoryTree.tsx` の実装
- ツリー形式表示（ディレクトリ再帰・インデント）
- ステータス別カラー表示（左ボーダー + 背景グラデーション）
- ディレクトリのクリックで開閉
- ファイルクリックで選択（`onSelectFile` コールバック）
- 選択ファイルのハイライト表示

## Out of Scope

- `App.tsx` への組み込み（issue05）
- フィルタ・検索ロジック（issue05）
- Tauri IPC（issue06）

## Editable Files

```
src/app/components/DirectoryTree.tsx
```

## Do Not Edit

- `src/app/types.ts`
- `src/app/utils/mockData.ts`
- `src/app/components/FileDetailView.tsx`
- `src/app/App.tsx`

## Dependencies

- issue01（環境構築）
- issue02（型定義・モックデータ）

## Branch

`feature/issue03-directory-tree`

## Implementation Notes

### ステータス別スタイル

| Status | スタイル |
|--------|---------|
| `added` | 緑背景グラデーション + 左ボーダー緑 |
| `deleted` | 赤背景グラデーション + 左ボーダー赤 |
| `modified` | 黄背景グラデーション + 左ボーダー黄 |
| `identical` | 透明 + ホバー時うっすら紫 |

### 選択状態
- 選択中ファイルは `bg-gradient-to-r from-purple-200 to-pink-200` + `border-l-4 border-purple-600`

### アイコン
- ディレクトリ開: `FolderOpen`（lucide-react）
- ディレクトリ閉: `Folder`
- ファイル: `File`
- 開閉矢印: `ChevronRight`（開時は 90° 回転、framer-motion で）

### Props

```ts
interface DirectoryTreeProps {
  nodes: FileNode[];
  onSelectFile: (file: FileNode) => void;
  selectedFile: FileNode | null;
}
```

## Acceptance Criteria

- [ ] ツリーが階層インデント付きで表示される
- [ ] ディレクトリをクリックすると開閉する
- [ ] ファイルをクリックすると `onSelectFile` が呼ばれる
- [ ] ステータス別カラーが正しく表示される
- [ ] 選択ファイルがハイライトされる
- [ ] TypeScript コンパイルエラーがない

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md §4.3 と矛盾しない
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
