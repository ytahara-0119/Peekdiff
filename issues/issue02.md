# issue02

## Issue ID
issue02

## Title
型定義・モックデータ（types.ts / mockData.ts）

## Purpose
アプリ全体で使用するコアデータ型とモックデータを定義する。
以降の issue（issue03〜05）がこれをインポートして開発できる状態にする。

## Background
Figma Make の `types.ts` / `mockData.ts` がそのまま正となる。
モックデータを先行整備することで、Tauri IPC が未実装でもUIを動作させられる。

## Scope

- `src/app/types.ts` の作成（SPEC.md §3 のコアデータ型をそのまま実装）
- `src/app/utils/mockData.ts` の作成（十分なサンプルデータを含む）

## Out of Scope

- React コンポーネントの実装（issue03 以降）
- Tauri IPC（issue06）

## Editable Files

```
src/app/types.ts
src/app/utils/mockData.ts
```

## Do Not Edit

- `src/app/App.tsx`
- `src/app/components/`
- `src-tauri/`
- `SPEC.md`

## Dependencies

- issue01（環境構築が完了していること）

## Branch

`feature/issue02-types-mock`

## Implementation Notes

### types.ts に定義する型

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

### mockData.ts の要件

- 少なくとも2階層のディレクトリ構造を含む
- 全ステータス（added / deleted / modified / identical）のファイルを含む
- テキストファイル（`isText: true`, `leftContent` / `rightContent` 付き）を含む
- バイナリファイル（`isText: false`, `size` / `hash` 付き）を含む

## Acceptance Criteria

- [ ] `src/app/types.ts` が SPEC.md §3 の型定義と完全に一致する
- [ ] `mockFileTree` が全 CompareStatus を網羅している
- [ ] テキストファイルエントリに `leftContent` / `rightContent` が設定されている
- [ ] バイナリファイルエントリに `size` / `hash` / `modifiedDate` が設定されている
- [ ] TypeScript コンパイルエラーがない

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md と矛盾しない
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
