# issue23

## Issue ID
issue23

## Title
テキスト差分エンジンをRust（similar クレート）に移行

## Purpose
フロントエンドの5行先読みgreedy差分計算をRustバックエンドのMyers差分アルゴリズムに置き換え、
6行以上の挿入・削除や重複行を含むケースでも正確な差分表示を実現する。

## Background
現在の `generateDiffLines()`（FileDetailView.tsx）は5行先読みのgreedy法を使用しており、
以下のケースで誤検知が発生する：

- 6行以上のブロック挿入・削除（先読み窓を超えると後続行が全て「変更」として表示される）
- 同一文字列が複数出現する場合（greedy が偽マッチを掴む）

`similar` クレートはgitと同等のMyers差分アルゴリズムを実装しており、
ファイル全体を見渡して変更量が最小になる整列を保証する。

## Scope

- `Cargo.toml` に `similar = "2"` を追加
- `lib.rs` に `DiffLine` 構造体と `compute_diff` Tauriコマンドを追加
- `tauriApi.ts` に `computeDiff()` ラッパーを追加
- `FileDetailView.tsx` の `generateDiffLines()` を削除し、`compute_diff` IPC呼び出しに置き換え
- `SPEC.md` §6.1・§6.2 の差分アルゴリズム記述を更新（Supervisorが実施済み）

## Out of Scope

- インライン差分（行内の変更箇所ハイライト）
- コンテキスト行の折りたたみ表示
- diff オプション（空白無視等）
- `leftContent` / `rightContent` のIPC返却方式の変更

## Editable Files

```
src-tauri/Cargo.toml
src-tauri/src/lib.rs
src/app/utils/tauriApi.ts
src/app/components/FileDetailView.tsx
```

## Do Not Edit

- `src/app/types.ts`（DiffLine型は既存のまま使用）
- `src/app/App.tsx`
- `src/app/components/DirectoryTree.tsx`
- `src-tauri/tauri.conf.json`
- `SPEC.md`
- `CLAUDE.md`

## Dependencies

なし（main ブランチの最新状態で着手可）

## Branch

`feature/issue23-rust-myers-diff`

## Implementation Notes

### Rust側（lib.rs）

`similar` クレートの `TextDiff::from_lines` を使用する。

```rust
use similar::{ChangeTag, TextDiff};

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DiffLine {
    #[serde(rename = "type")]
    pub line_type: String, // "added" | "deleted" | "unchanged"
    pub left_line_number: Option<u32>,
    pub right_line_number: Option<u32>,
    pub content: String,
}

#[tauri::command]
async fn compute_diff(
    left_content: String,
    right_content: String,
) -> Result<Vec<DiffLine>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let diff = TextDiff::from_lines(&left_content, &right_content);
        let mut result = Vec::new();
        let mut left_num = 1u32;
        let mut right_num = 1u32;

        for change in diff.iter_all_changes() {
            match change.tag() {
                ChangeTag::Delete => {
                    result.push(DiffLine {
                        line_type: "deleted".to_string(),
                        left_line_number: Some(left_num),
                        right_line_number: None,
                        content: change.value().trim_end_matches('\n').to_string(),
                    });
                    left_num += 1;
                }
                ChangeTag::Insert => {
                    result.push(DiffLine {
                        line_type: "added".to_string(),
                        left_line_number: None,
                        right_line_number: Some(right_num),
                        content: change.value().trim_end_matches('\n').to_string(),
                    });
                    right_num += 1;
                }
                ChangeTag::Equal => {
                    result.push(DiffLine {
                        line_type: "unchanged".to_string(),
                        left_line_number: Some(left_num),
                        right_line_number: Some(right_num),
                        content: change.value().trim_end_matches('\n').to_string(),
                    });
                    left_num += 1;
                    right_num += 1;
                }
            }
        }
        Ok(result)
    })
    .await
    .map_err(|e| e.to_string())?
}
```

`invoke_handler!` への登録を忘れないこと：
```rust
.invoke_handler(tauri::generate_handler![
    compare_directories,
    open_folder_dialog,
    read_file_content,
    open_file_dialog,
    compare_files,
    compute_diff,   // ← 追加
])
```

### TS側（tauriApi.ts）

```ts
import { DiffLine } from '../types';

export async function computeDiff(
  leftContent: string,
  rightContent: string,
): Promise<DiffLine[]> {
  return invoke<DiffLine[]>('compute_diff', { leftContent, rightContent });
}
```

### TS側（FileDetailView.tsx）

- `generateDiffLines()` 関数を**丸ごと削除**する
- `TextDiffView` を以下のように書き換える：

```tsx
function TextDiffView({ file }: { file: FileNode }) {
  const [lines, setLines] = useState<DiffLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    computeDiff(file.leftContent ?? '', file.rightContent ?? '')
      .then(setLines)
      .finally(() => setLoading(false));
  }, [file.leftContent, file.rightContent]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        差分を計算中...
      </div>
    );
  }

  // 以降は既存の描画ロジックをそのまま使う（lines を使って表示）
}
```

### `similar` クレートのバージョン

`similar = "2"` を使用する（`features` 追加不要、デフォルトで Myers アルゴリズムが有効）。

## Acceptance Criteria

- [ ] `pnpm tauri dev` でビルドエラーが出ない
- [ ] ファイルを選択したとき「差分を計算中...」が一瞬表示される（IPC呼び出しの証拠）
- [ ] 6行以上のブロック挿入・削除が正しく表示される（unchanged行が崩れない）
- [ ] 同一文字列が複数出現するファイルで誤検知が出ない
- [ ] `generateDiffLines` 関数がソースコードから完全に削除されている
- [ ] `compute_diff` が `invoke_handler!` に登録されている

## Definition of Done

- [ ] 上記 Acceptance Criteria を全項目確認した
- [ ] SPEC.md と矛盾しない（§6.1・§6.2 と一致）
- [ ] 実装内容を簡潔に説明できる
- [ ] Pull Request を作成した
