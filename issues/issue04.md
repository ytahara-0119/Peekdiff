# issue04

## Issue ID
issue04

## Title
FileDetailView コンポーネント（TextDiffView + BinaryFileView）

## Purpose
選択されたファイルの差分詳細を表示する `FileDetailView` コンポーネントを実装する。

## Background
SPEC.md §4.4 の「詳細ビュー」要件を満たすコンポーネント。
Figma Make の `FileDetailView.tsx` が UI の正となる。

## Scope

- `src/app/components/FileDetailView.tsx` の実装
  - `TextDiffView`：左右 Split Diff（行番号付き）
  - `BinaryFileView`：サイズ・ハッシュ・更新日時の情報カード
- 差分計算ロジック `generateDiffLines()` の実装

## Out of Scope

- `App.tsx` への組み込み（issue05）
- Tauri IPC による実ファイル内容取得（issue06）

## Editable Files

```
src/app/components/FileDetailView.tsx
```

## Do Not Edit

- `src/app/types.ts`
- `src/app/utils/mockData.ts`
- `src/app/components/DirectoryTree.tsx`
- `src/app/App.tsx`

## Dependencies

- issue01（環境構築）
- issue02（型定義・モックデータ）

## Branch

`feature/issue04-file-detail-view`

## Implementation Notes

### TextDiffView

- 左右 2 カラムのグリッドレイアウト（`grid grid-cols-2 divide-x`）
- 左カラムヘッダー: 紫グラデーション「左側」
- 右カラムヘッダー: ピンクグラデーション「右側」
- 行スタイル:
  - 削除行（左のみ）: 赤背景
  - 追加行（右のみ）: 緑背景
  - 変更なし: 透明（ホバーで薄グレー）
- 行番号は `min-w-[3rem]` で右揃え表示
- フォント: `font-mono text-xs`

### BinaryFileView

- 3 カラムカード（ファイルサイズ / ハッシュ値 / 更新日時）
- アイコン: `HardDrive` / `Hash` / `Calendar`（lucide-react）
- バイナリ非対応のお知らせバナー

### generateDiffLines アルゴリズム

- 行単位での最長共通部分列（簡易版: 5行先読みマッチ）
- 出力: `DiffLine[]`（type: 'added' | 'deleted' | 'unchanged'）

### Props

```ts
interface FileDetailViewProps {
  file: FileNode | null;
}
```

## Acceptance Criteria

- [ ] `file === null` または `type === 'directory'` のとき「ファイルを選択してください」が表示される
- [ ] `isText === true` のファイルで TextDiffView が表示される
- [ ] `isText === false` のファイルで BinaryFileView が表示される
- [ ] 追加行が緑・削除行が赤で正しくハイライトされる
- [ ] 行番号が正しく表示される
- [ ] バイナリファイルのサイズ・ハッシュ・日時が表示される
- [ ] TypeScript コンパイルエラーがない

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md §4.4 と矛盾しない
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
