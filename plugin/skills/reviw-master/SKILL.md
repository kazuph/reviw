---
name: reviw-master
description: reviw CLI ツールの全機能を熟知し、適切な使い方を自動提案するスキル。ファイルレビュー、diff 確認、報告書作成時に使用。
allowed-tools: Bash, Read, Glob
---

# reviw Master Skill

reviw は CSV/TSV/Markdown/Diff/テキストファイルをブラウザでレビューし、コメントを YAML 形式で出力する CLI ツールです。

## インストール

```bash
# グローバルインストール
npm install -g reviw

# または npx で直接実行
npx reviw <file>
```

## 基本的な使い方

### ファイルを開く

```bash
# 単一ファイル
npx reviw report.md
npx reviw data.csv
npx reviw changes.diff

# 複数ファイル（連続ポート番号で起動）
npx reviw file1.csv file2.md file3.tsv
```

### 標準入力から

```bash
# git diff を直接レビュー
git diff HEAD | npx reviw

# git diff（ステージング）
git diff --staged | npx reviw

# 特定コミット間の差分
git diff abc123..def456 | npx reviw
```

### 引数なし（自動 git diff）

```bash
# 引数なしで実行すると自動で git diff HEAD を実行
npx reviw
```

## オプション

| オプション | 説明 | 例 |
|-----------|------|-----|
| `--port` | ポート番号指定 | `npx reviw file.md --port 5000` |
| `--encoding` | 文字エンコーディング | `npx reviw file.csv --encoding shift_jis` |
| `--no-open` | ブラウザ自動起動を無効化 | `npx reviw file.md --no-open` |
| `--help` | ヘルプ表示 | `npx reviw --help` |
| `--version` | バージョン表示 | `npx reviw --version` |

## ファイル形式別の機能

### CSV/TSV

- 固定ヘッダー（スクロールしてもヘッダーが見える）
- 列の固定（左側の列をピン留め）
- フィルタリング機能
- 列幅調整
- セルクリックでコメント追加

### Markdown

- サイドバイサイドプレビュー（ソース | レンダリング）
- スクロール同期
- プレビューからクリックでコメント追加
- Mermaid 図の自動レンダリング
- 画像・動画のフルスクリーン表示

### Diff/Patch

- GitHub 風の diff ビュー
- シンタックスハイライト
- 大きなファイル（500行以上）の折りたたみ
- 行ごとのコメント追加

### Text

- 行番号表示
- 行クリックでコメント追加

## UI 機能

### テーマ切替
- ライト/ダークモード切り替え可能

### コメント機能
- セル/行をクリックしてコメント追加
- ドラッグで複数行選択してコメント
- Cmd/Ctrl + Enter で送信モーダル表示

### コメント永続化
- localStorage に自動保存
- ページリロード時に復元モーダル表示

## ワークフロー

### 基本フロー

1. `npx reviw <file>` でブラウザが開く
2. ファイル内容を確認
3. 気になる箇所をクリックしてコメント追加
4. 「Submit & Exit」をクリック
5. YAML 形式でコメントが標準出力に出力
6. サーバーが自動終了

### レビューサイクル

```
実装完了
    ↓
npx reviw で報告書を開く（フォアグラウンド）
    ↓
ユーザーがコメント追加 → Submit & Exit
    ↓
YAML フィードバックを受け取る
    ↓
フィードバックを Todo に登録
    ↓
修正実装
    ↓
再度 npx reviw でレビュー
    ↓
承認されるまで繰り返し
```

## 出力形式（YAML）

```yaml
file: report.md
comments:
  - line: 15
    content: "この部分の説明を追加してください"
  - line: 23
    content: "エラーハンドリングが必要です"
  - lines: [30, 31, 32]
    content: "このロジックを関数に切り出してください"
```

## 重要な注意事項

### フォアグラウンド起動必須

Claude Code でレビューサイクルを回す場合、**必ずフォアグラウンドで起動**すること：

```bash
# 正しい（フォアグラウンド）
npx reviw report.md

# 間違い（バックグラウンドだとフィードバックを受け取れない）
npx reviw report.md &
```

### 動画は先に開く

エビデンス動画がある場合は、reviw 起動前に開いておく：

```bash
open .artifacts/<feature>/demo.mp4
npx reviw .artifacts/<feature>/README.md
```

### 複数ファイルの同時レビュー

```bash
# 複数ファイルを同時に開く
npx reviw README.md CHANGELOG.md data.csv
```

各ファイルは連続ポート番号で起動され、ブラウザは0.5秒間隔でスタガー起動される。

## トラブルシューティング

### ポートが使用中

```bash
# 別のポートを指定
npx reviw file.md --port 5001
```

### 文字化け

```bash
# エンコーディングを明示的に指定
npx reviw file.csv --encoding shift_jis
npx reviw file.csv --encoding euc-jp
```

### ブラウザが開かない

```bash
# 手動でブラウザを開く
npx reviw file.md --no-open
# 表示される URL を手動でブラウザに入力
```

## ベストプラクティス

1. **報告書は Markdown で作成** - reviw の Markdown ビューが最も見やすい
2. **スクリーンショットは相対パスで参照** - `![image](./screenshot.png)`
3. **大きな diff は分割** - 500行以上は自動折りたたみされるが、分割した方がレビューしやすい
4. **コメントは具体的に** - 「ここを直して」より「この部分に〇〇の処理を追加してください」
5. **フィードバックは即座に Todo に登録** - 忘れないうちに詳細を記録
