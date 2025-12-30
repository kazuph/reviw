# reviw Plugin for Claude Code

reviw CLI ツールを Claude Code と連携させるプラグインです。タスク管理、レビューワークフロー、報告書作成を効率化します。

## インストール

```bash
# Claude Code で実行
/plugin marketplace add kazuph/reviw
/plugin install reviw-plugin@reviw-marketplace
```

## 機能一覧

### Commands（スラッシュコマンド）

| コマンド | 説明 |
|---------|------|
| `/reviw:do <タスク説明>` | タスク開始 - worktree 作成、計画策定、Todo 登録 |
| `/reviw:done` | タスク完了チェック - エビデンス収集、reviw でレビュー開始 |

### Agents（サブエージェント）

| エージェント | 説明 |
|-------------|------|
| `report-builder` | レビューしてもらうための報告書・エビデンス整理専門 |
| `e2e-health-reviewer` | E2Eテストの健全性レビュー（goto制限、レコードアサーション、ハードコード検出） |

使用方法:
```
Task ツールで subagent_type: "report-builder" を指定
Task ツールで subagent_type: "e2e-health-reviewer" を指定
（/done時は両方を並列実行）
```

### Skills（自動参照スキル）

| スキル | 説明 |
|--------|------|
| `artifact-proof` | エビデンス収集（スクショ・動画・ログ）+ reviw でのレビューワークフロー |

### Hooks（自動フック）

| イベント | 動作 |
|---------|------|
| `PreToolUse` (git commit/push) | reviw でのレビュー完了確認リマインダー |
| `UserPromptSubmit` | **完了報告前チェックリスト**（AIへのカンペ） |

#### UserPromptSubmit hook の詳細

ユーザーがメッセージを送信した直後、AIが応答を生成する**前**に、以下のチェックリストがAIのコンテキストに追加されます（ユーザーには見えません）：

- 実装完了（1/3）: ビルド成功・型エラーなし
- 動作検証完了（2/3）: 開発サーバー起動・webapp-testing で検証
- レビュー完了（3/3）: エビデンス収集・/done 実行・reviw でレビュー・ユーザー承認

これにより、AIが「実装しました！」だけで完了報告することを防ぎ、reviw のワークフローに従うよう促します。

## ワークフロー

```
/reviw:do <タスク説明>
    ↓
worktree 作成 + 計画策定
    ↓
実装作業
    ↓
/reviw:done
    ↓
エビデンス収集 + 報告書作成
    ↓
npx reviw で報告書を開く（フォアグラウンド）
    ↓
ユーザーがコメント → Submit & Exit
    ↓
フィードバックを Todo に登録
    ↓
修正 → 再レビュー
    ↓
承認されたら完了
```

## 完了基準

| 段階 | 内容 |
|------|------|
| 1/3 | 実装完了 |
| 2/3 | ビルド・起動・動作検証完了 |
| 3/3 | reviw でレビュー → ユーザー承認 |

**実装完了だけでは 1/3。reviw でレビューを受けて初めて完了。**

## ディレクトリ構成

```
reviw-plugin/
├── .claude-plugin/
│   └── plugin.json          # プラグインマニフェスト
├── commands/
│   ├── do.md                # /reviw:do コマンド
│   └── done.md              # /reviw:done コマンド
├── agents/
│   └── report-builder.md    # 報告書作成エージェント
├── skills/
│   └── artifact-proof/
│       └── SKILL.md         # エビデンス収集 + reviw レビュースキル
├── hooks/
│   └── hooks.json           # 自動フック設定
└── README.md
```

## reviw の基本的な使い方

```bash
# Markdown を開く
npx reviw report.md

# CSV を開く
npx reviw data.csv

# git diff を開く
git diff HEAD | npx reviw

# 複数ファイル
npx reviw file1.md file2.csv
```

詳細は `reviw-master` スキルを参照してください。

## License

MIT
