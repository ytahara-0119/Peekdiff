# issue13: confetti アニメーションのバグ修正とFigma Make仕様への統一

## 背景

### バグ: confetti が発火しない

`handleCompare` の現在の実装は以下の問題がある：

```typescript
// try ブロック内
setProgress(100);       // progress=100, isComparing=true のまま

// finally の setTimeout(300ms後)
setIsComparing(false);  // } 同一 React バッチで更新されるため
setProgress(0);         // } progress===100 && !isComparing が同時に成立しない
```

`useEffect` の条件 `progress === 100 && !isComparing` が満たされる瞬間が存在せず、
confetti が一度も発火しない。

### Figma Make との差分

Figma Make の confetti パラメータ：
- 左右エミッター: `shapes: ['circle', 'square']`, `scalar: randomInRange(0.8, 1.2)` あり
- 中央バースト: `colors` に `'#FFB6C1'` を追加

現在の実装はこれらが欠けている。

## 修正方針

`finally` ブロックを分割し、`isComparing=false` にした後に `progress=0` を別タイマーでリセット：

```typescript
} finally {
  clearInterval(interval);
  setTimeout(() => {
    setIsComparing(false);  // ← この時点で progress は100のまま → confetti 発火
  }, 300);
  setTimeout(() => {
    setProgress(0);         // ← confetti 開始後にリセット
  }, 800);
}
```

これにより `isComparing=false, progress=100` の状態が生まれ useEffect が発火する。

## 変更対象ファイル

- `src/app/App.tsx` のみ

## 実装内容

1. `handleCompare` の `finally` ブロックを上記方針で修正
2. `triggerCelebration` の confetti パラメータを Figma Make 仕様に統一：
   - 左右エミッター: `shapes: ['circle', 'square']`, `scalar: rand(0.8, 1.2)` 追加
   - 中央バースト: colors に `'#FFB6C1'` 追加

## 完了条件

- [ ] 比較完了後に confetti アニメーションが実際に発火する
- [ ] confetti のパラメータが Figma Make 仕様と一致している
- [ ] `pnpm exec tsc --noEmit` がエラーなし
- [ ] PR 作成済み
