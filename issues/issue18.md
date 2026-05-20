# issue18: ヘッダーアイコンデザインを Dock アイコン SVG に反映

## 背景

アプリ内ヘッダーには lucide-react の `Moon` + `Star` をグラデーション背景に重ねたアイコンが表示されているが、
Dock アイコンの元 SVG（`src-tauri/icons/AppIcon.svg`）は別デザインになっている。

## 目的

`src-tauri/icons/AppIcon.svg` をヘッダーアイコンと同じデザインに更新する。

## ヘッダーアイコンの仕様（App.tsx:196-199）

```tsx
<div className="relative w-10 h-10 rounded-xl
  bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 ...">
  <Moon className="w-5 h-5 text-yellow-200 absolute" />
  <Star className="w-3 h-3 text-yellow-300 absolute top-1 right-1" />
</div>
```

| 要素 | Tailwind | カラー | サイズ・位置 |
|------|----------|--------|-------------|
| 背景 | rounded-xl, gradient br | #4F46E5 → #9333EA → #DB2777 | 40×40 |
| Moon | w-5 h-5, centered | #FDE68A (yellow-200) | 20×20 |
| Star | w-3 h-3, top-1 right-1 | #FCD34D (yellow-300) | 12×12, 右上 |

## SVG 設計（512×512、スケール係数 12.8）

- 背景: rx="115"（rounded-xl ≈ 12px × 12.8）の角丸矩形
- Moon: 中央配置 256×256（lucide Moon パス）
- Star: 右上配置 140×140（lucide Star ポリゴン）

## 変更対象ファイル

- `src-tauri/icons/AppIcon.svg`（更新）

## 完了条件

- [ ] `src-tauri/icons/AppIcon.svg` がヘッダーアイコンと同じデザイン
- [ ] `pnpm rebuild:icon` 実行後に Dock アイコンが更新される
- [ ] PR 作成済み
