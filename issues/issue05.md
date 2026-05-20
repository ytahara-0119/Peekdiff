# issue05

## Issue ID
issue05

## Title
App 統合（ヘッダー・比較ボタン・検索・フィルタ・統計バッジ）

## Purpose
`DirectoryTree` と `FileDetailView` を `App.tsx` に統合し、
ヘッダー・フィルタ・検索・統計バッジ・比較ボタンを含む完全な UI を完成させる。

## Background
SPEC.md §5 の UI 設計を実装する最終統合 issue。
Figma Make の `App.tsx` が正となる。
この時点ではモックデータを使用し、Tauri IPC は使用しない。

## Scope

- `src/app/App.tsx` の実装
  - ヘッダー（フォルダパス入力 × 2、比較ボタン、プログレスバー）
  - 検索インプット（ファイル名フィルタ）
  - フィルタセレクト（all / added / deleted / modified / identical）
  - 統計バッジ（+N / -N / ~N / =N）
  - `DirectoryTree`（左ペイン、w-96）
  - `FileDetailView`（右ペイン、flex-1）
- フィルタ・検索ロジック `filterFileTree()` の実装
- 統計集計ロジック `getComparisonStats()` の実装
- 比較ボタンのプログレスアニメーション（モック: 100ms × 10 ステップ）

## Out of Scope

- Tauri IPC による実フォルダ走査（issue06）
- OSネイティブダイアログ（issue06）

## Editable Files

```
src/app/App.tsx
```

## Do Not Edit

- `src/app/types.ts`
- `src/app/utils/mockData.ts`
- `src/app/components/DirectoryTree.tsx`
- `src/app/components/FileDetailView.tsx`

## Dependencies

- issue03（DirectoryTree）
- issue04（FileDetailView）

## Branch

`feature/issue05-app-integration`

## Implementation Notes

### レイアウト

```
h-screen flex flex-col
├── header（border-b, bg-white/80, backdrop-blur-lg）
│   ├── フォルダ入力行（flex items-center gap-4）
│   │   ├── 左フォルダ入力（from-purple-50 to-pink-50）
│   │   ├── 右フォルダ入力（from-blue-50 to-cyan-50）
│   │   └── 比較ボタン（from-purple-500 to-pink-500）
│   ├── プログレスバー（比較中のみ表示）
│   ├── 検索 + フィルタ行
│   └── 統計バッジ行
└── flex-1 flex gap-1（メインコンテンツ）
    ├── DirectoryTree（w-96, bg-white/70, backdrop-blur-lg）
    └── FileDetailView（flex-1, bg-white/50, backdrop-blur-lg）
```

### 状態管理

```ts
const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
const [filterStatus, setFilterStatus] = useState<CompareStatus | 'all'>('all');
const [searchQuery, setSearchQuery] = useState('');
const [isComparing, setIsComparing] = useState(false);
const [progress, setProgress] = useState(0);
```

### 統計バッジ色

| バッジ | グラデーション |
|--------|--------------|
| +（追加） | from-green-500 to-emerald-500 |
| -（削除） | from-red-500 to-rose-500 |
| ~（変更） | from-yellow-500 to-amber-500 |
| =（同一） | from-gray-400 to-gray-500 |

## Acceptance Criteria

- [ ] アプリが起動してモックデータのツリーが表示される
- [ ] フィルタセレクトでツリーが絞り込まれる
- [ ] 検索インプットでファイル名絞り込みが動作する
- [ ] ファイルをクリックすると右ペインに詳細が表示される
- [ ] 統計バッジに正しい件数が表示される
- [ ] 比較ボタンを押すとプログレスバーが動作する
- [ ] TypeScript コンパイルエラーがない

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md §4・§5 と矛盾しない
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
