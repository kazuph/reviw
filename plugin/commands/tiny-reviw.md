---
description: Lightweight review with screenshots only - no REPORT.md needed
allowed-tools: Bash, Read, Write, Glob, Grep, Task
---

# /reviw-plugin:tiny-reviw

<command-name>tiny-reviw</command-name>

報告書なしで、スクリーンショットと動画だけを確認する軽量レビューモードです。

## 用途

- ちょっとした修正の確認
- 細かいUI調整の確認
- REPORT.mdを作るほどではない軽微な変更

## プロジェクトタイプ検出

```bash
PROJECT_TYPE=$(grep -m1 '^Project-Type:' .artifacts/*/REPORT.md 2>/dev/null | awk '{print $2}')
if [ -z "$PROJECT_TYPE" ]; then
  if [ -f package.json ] && grep -qE '"(react|vue|svelte|next|nuxt|@angular/core|solid-js|astro)"' package.json 2>/dev/null; then
    PROJECT_TYPE="web"
  elif [ -f Podfile ] || [ -f pubspec.yaml ] || ([ -f app.json ] && grep -q '"expo"' app.json 2>/dev/null); then
    PROJECT_TYPE="mobile"
  elif [ -f go.mod ] || [ -f Cargo.toml ] || [ -f pyproject.toml ] || [ -f requirements.txt ]; then
    PROJECT_TYPE="backend"
  else
    PROJECT_TYPE="web"
  fi
fi
```

## 実行内容

### Web / Fullstack の場合

1. **webapp-testing skill でスクショ撮影**
   - 実装した画面をPlaywrightで開く
   - スクリーンショットを撮影
   - 必要に応じてGIF動画も撮影

2. **撮影したファイルを開く**
   ```bash
   open /path/to/screenshot.png
   open /path/to/recording.gif
   ```

### Backend の場合

1. **テストスイートを実行してエビデンス取得**
   - プロジェクトのテストフレームワークを実行（jest/vitest/pytest/go test/cargo test）
   - テスト結果の出力を `/tmp/tiny-reviw/test-output.txt` に保存
   - カバレッジサマリがあれば併せて保存

2. **テスト結果を開く**
   ```bash
   open /tmp/tiny-reviw/test-output.txt
   ```

### Mobile の場合

1. **Maestro MCP でスクショ撮影**
   - シミュレータ/デバイスが起動していることを確認
   - Maestro MCP の `take_screenshot` で現在の画面を撮影
   - 必要に応じて操作フローを実行してから撮影

2. **撮影したファイルを開く**
   ```bash
   open /path/to/screenshot.png
   ```

### 共通

3. **ユーザーに確認を求める**
   - 「この内容でOKですか？」と聞く

## 出力先

- `/tmp/tiny-reviw/` に一時保存
- REPORT.mdは作成しない
- .artifacts/への保存もしない

## 禁止事項

- ❌ REPORT.mdを作成する
- ❌ artifact-proof skillを使う
- ❌ 長い報告書を書く

## 完了条件

- スクショまたは動画がユーザーに表示されること
- ユーザーがOKと言うこと
