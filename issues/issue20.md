# issue20: リファクタリング（不要ファイル・dead code・未使用依存の削除）

## 調査結果

### 不要ファイル

| ファイル | 理由 |
|---------|------|
| `src/app/components/AppIcon.tsx` | どこからも import されていない（Dock アイコン生成用 SVG は `src-tauri/icons/AppIcon.svg` に分離済み） |
| `src/app/utils/mockData.ts` | どこからも import されていない（開発初期のモックデータ、実装完了後も残存） |
| `CLAUDE_README.md` | エージェント開発フレームワークのテンプレート説明。プロジェクト固有の内容なし（`README.md` が正式ドキュメント） |

### Dead Code

| ファイル | 箇所 | 理由 |
|---------|------|------|
| `src/app/utils/tauriApi.ts:12-14` | `readFileContent()` | export されているが、どこからも呼ばれていない |

### 未使用 npm パッケージ（package.json dependencies）

| パッケージ | 理由 |
|-----------|------|
| `@radix-ui/react-select` | どのファイルでも import なし |
| `@radix-ui/react-slot` | どのファイルでも import なし |
| `class-variance-authority` | どのファイルでも import なし |
| `tailwind-merge` | どのファイルでも import なし（`cn()` ユーティリティも不使用） |

## 変更対象ファイル

- `src/app/components/AppIcon.tsx`（削除）
- `src/app/utils/mockData.ts`（削除）
- `CLAUDE_README.md`（削除）
- `src/app/utils/tauriApi.ts`（`readFileContent` 関数を削除）
- `package.json`（未使用 4 パッケージを dependencies から削除）

## 完了条件

- [ ] 上記ファイルが削除・修正されている
- [ ] `pnpm install` で lockfile が更新される
- [ ] アプリのビルドが通る（`pnpm tauri build` または `pnpm tauri dev`）
- [ ] PR 作成済み
