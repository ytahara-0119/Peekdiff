# docs/workflow.md

## Issue 一覧と状態

| Issue | タイトル | 依存 | 並列グループ | 状態 |
|-------|---------|------|------------|------|
| issue01 | 環境構築（Vite + React + TS + Tailwind + shadcn/ui + Tauri） | なし | Group 1 | 未着手 |
| issue02 | 型定義・モックデータ（types.ts / mockData.ts） | issue01 | Group 2 | 未着手 |
| issue03 | DirectoryTree コンポーネント | issue02 | Group 3 | 未着手 |
| issue04 | FileDetailView コンポーネント（TextDiffView + BinaryFileView） | issue02 | Group 3 | 未着手 |
| issue05 | App 統合（ヘッダー・比較ボタン・検索・フィルタ・統計バッジ） | issue03, issue04 | Group 4 | 未着手 |
| issue06 | Tauri IPC 連携（実フォルダ走査・差分計算・モック差し替え） | issue05 | Group 5 | 未着手 |
| issue07 | .app パッケージ化・動作確認 | issue06 | Group 6 | 未着手 |

---

## 並列実行グループ

```
Group 1: issue01  （環境構築）
    ↓
Group 2: issue02  （型定義・モックデータ）
    ↓
Group 3: issue03 ┐
         issue04 ┘ 並列実行可（Editable Files が重複しない）
    ↓
Group 4: issue05  （App 統合）
    ↓
Group 5: issue06  （Tauri IPC 連携）
    ↓
Group 6: issue07  （パッケージ化・動作確認）
```

---

## 依存関係

```
issue01
  └── issue02
        ├── issue03 ──┐
        └── issue04 ──┤
                      └── issue05
                            └── issue06
                                  └── issue07
```

---

## 基本フロー

1. 人間が Supervisor に指示する
2. Supervisor が issue を作成する
3. issue ごとに branch を定義する
4. Implementer が実装する（ブランチは必ず最新 main から作成）
5. 実装完了後に Pull Request を作成する
6. 人間が PR をレビュー・マージする
7. main を最新に更新してから次の issue に進む
8. 完了後、人間確認で停止

---

## ブランチ命名

| Issue | ブランチ名 |
|-------|-----------|
| issue01 | feature/issue01-env-setup |
| issue02 | feature/issue02-types-mock |
| issue03 | feature/issue03-directory-tree |
| issue04 | feature/issue04-file-detail-view |
| issue05 | feature/issue05-app-integration |
| issue06 | feature/issue06-tauri-ipc |
| issue07 | feature/issue07-packaging |

---

## PR 作成ルール

- issue 実装完了後に必ず `gh pr create` で PR を作成する
- base ブランチは常に `main`
- PR タイトルは `feat(issueXX): <タイトル>` 形式
- **PR 作成前に Acceptance Criteria / Definition of Done の全項目を確認する**
- 未完了項目がある場合は PR を作成しない
- 次の issue に着手する前に依存 issue の PR が main にマージ済みであること
- **ブランチは必ず最新 main から作成する**（古い main を起点にすると、前 issue の修正が含まれず再バグが発生する）

---

## issue 分割ルール

- 1 issue = 1責務
- 原則 1〜3 ファイルのみ変更
- 横断変更は禁止

---

## 競合回避ルール

- 同一ファイルを複数 issue で編集しない
- 共通変更は最後にまとめる
- **やむを得ず同一ファイルを複数 issue で触る場合は、1 本マージ完了 → 最新 main から次ブランチ作成 の順序を厳守する**
  - 例：issue11/12/13 がすべて `App.tsx` を触った際、マージ順序のズレで import が消えホットフィックス（issue14）が必要になった

---

## エージェント役割一覧

| 役割 | 定義ファイル | 責務 |
|------|------------|------|
| Supervisor | [`agents/supervisor.md`](../agents/supervisor.md) | issue 分割・依存整理・Implementer 起動・人間確認 |
| Implementer | [`agents/implementer.md`](../agents/implementer.md) | 指定 issue の実装・PR 作成 |

---

## 人間の役割

- issue 完了時の確認のみ行う
- 設計の方向修正を行う
- バグ・仕様ズレの最終判断を行う

---

## プラットフォーム固有 API の取り扱い

Tauri / OS 固有の API を使う issue では、実装前に以下を確認する：

- **座標系**: イベントの `position.x` が物理ピクセル（PhysicalPosition）か論理ピクセル（CSS px）か
  - 例：Tauri v2 の `onDragDropEvent` の `position.x` は論理ピクセル。`* devicePixelRatio` は不要（issue19 で判明）
- **イベント発火順序**: OS によって順序が異なる場合がある
  - 例：macOS では `leave` が `drop` より先に発火することがある（issue17/19 で判明）
- **HTML イベントの制限**: OS レベルのファイルドラッグは WebView の HTML drag イベント（`ondragenter` 等）が発火しない
  - 例：Finder → Tauri WebView の D&D は `onDragDropEvent` のみ使用可（issue15 で判明）
- 公式ドキュメント・GitHub Issues で既知の挙動を事前確認してから issue を設計する
