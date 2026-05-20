# issue11: ヘッダーアイコンをFigma Makeデザインに合わせる

## 背景

Figma Makeのデザインでは、ヘッダーのアイコンウィジェットは
**lucide-react の Moon + Star アイコン** をグラデーション背景のrounded-xlボックスに入れたデザイン。

現在の実装はPR #8で追加した `<AppIcon size={40} />` カスタムSVGを使用しており、デザインと異なる。

### Figma Makeのヘッダーデザイン

```jsx
<div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
  <Moon className="w-5 h-5 text-yellow-200 absolute" />
  <Star className="w-3 h-3 text-yellow-300 absolute top-1 right-1 animate-pulse" />
</div>
```

`<AppIcon />` コンポーネント（カスタムSVG）はDockアイコン生成用として維持し、ヘッダーUIだけ変更する。

## 変更対象ファイル

- `src/app/App.tsx` のみ

## 実装内容

1. `App.tsx` の import に `Moon`, `Star` を追加（lucide-react）
2. ヘッダーの `<div className="w-10 h-10 flex-shrink-0"><AppIcon size={40} /></div>` を
   Figma Makeのウィジェット実装に置き換える

## 完了条件

- [ ] ヘッダーに Moon + Star の lucide アイコンがグラデーション背景ボックスで表示される
- [ ] `pnpm exec tsc --noEmit` がエラーなし
- [ ] PR 作成済み
