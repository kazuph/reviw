---
description: タスク開始 - worktree作成、計画策定、reviwでのレビュー準備
argument-hint: <タスクの説明>
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite
---

# タスク開始コマンド

これからやりたいことの依頼を受け、作業環境をセットアップして計画を立てる。

## 重要：サブエージェント必須

**コンテキスト枯渇を防ぐため、以下の作業は必ずサブエージェント（Task ツール）で実行せよ：**

| 作業 | 理由 | サブエージェント |
|------|------|-----------------|
| webapp-testing | スクショ Read でコンテキスト爆発 | `subagent_type: "general-purpose"` |
| artifact-proof | 画像・動画処理で枯渇 | `subagent_type: "general-purpose"` |
| E2E テスト実行 | 長いログでコンテキスト消費 | `subagent_type: "general-purpose"` |

```
正しいやり方：
Task ツールで subagent を起動
→ サブエージェント内で webapp-testing 実行
→ サブエージェントが結果を要約して返す
→ メインスレッドのコンテキストは温存される
```

## 引数

$ARGUMENTS = これからやりたいことの依頼文、仕様説明など

## 実行手順

### 1. 作業環境のセットアップ

まず、現在のプロジェクトが git リポジトリであることを確認する。

```bash
# プロジェクトルートで実行
git rev-parse --show-toplevel
```

次に、タスク用の worktree を作成する。ブランチ名は依頼内容から適切な名前を自動生成する（例: `feature/add-login`, `fix/button-style`）。

```bash
# worktree を作成（--from-current で現在のブランチから分岐）
git gtr new <branch-name> --from-current

# worktree のパスを取得
WORKTREE_PATH="$(git gtr go <branch-name>)"

# worktree に移動
cd "$WORKTREE_PATH"
```

### 2. 成果物ディレクトリの準備

`.artifacts/<feature-name>/` ディレクトリを作成し、README.md を配置する。

```bash
mkdir -p .artifacts/<feature-name>
```

### 3. 計画の策定（README.md）

`.artifacts/<feature-name>/README.md` を作成し、以下のフォーマットで計画を書き出す：

```markdown
# <タスク名>

作成日: YYYY-MM-DD
ブランチ: <branch-name>
ステータス: 進行中

## 概要

<依頼内容の要約>

## PLAN

### TODO

- [ ] <具体的なタスク1>
- [ ] <具体的なタスク2>
- [ ] <具体的なタスク3>
- [ ] ビルド・型チェックの実行
- [ ] 開発サーバーの起動
- [ ] webapp-testing で動作確認
- [ ] artifact-proof でエビデンス収集
- [ ] /done で完了報告（reviw でレビュー）

### 完了条件

- [ ] 実装が完了していること
- [ ] ビルドが成功すること
- [ ] 動作確認が取れていること
- [ ] エビデンス（スクリーンショット/動画）が残っていること
- [ ] reviw でレビューを受けること

## 技術的なメモ

<実装中に気づいた点やメモを追記していく>

## エビデンス

<artifact-proof で収集したエビデンスへのリンクを追記していく>
```

### 4. TodoWrite への反映

上記の PLAN を TodoWrite ツールにも反映する。これにより進捗が可視化される。

### 5. 成果を意識した行動指針の確認

**重要な注意事項を表示：**

```
+---------------------------------------------------------------+
|  タスク開始                                                    |
+---------------------------------------------------------------+
|                                                               |
|  現在地: $WORKTREE_PATH                                       |
|  ブランチ: <branch-name>                                      |
|                                                               |
|  実装完了は作業の 1/3 に過ぎません                            |
|                                                               |
|  完了基準：                                                   |
|    1/3: 実装完了                                              |
|    2/3: ビルド・起動・動作確認完了                            |
|    3/3: reviw でレビュー → ユーザー承認                       |
|                                                               |
|  使用ツール：                                                 |
|    - reviw: ブラウザベースのレビューツール                    |
|    - webapp-testing: ブラウザ操作・動作確認                   |
|    - artifact-proof: エビデンス収集                           |
|                                                               |
|  作業完了時は /done を実行してレビューを開始                  |
|                                                               |
+---------------------------------------------------------------+
```

## 禁止事項

- 計画なしに実装を始めること
- worktree を作成せずにメインブランチで作業すること
- エビデンス収集を忘れること
- /done を実行せずに完了報告すること

## 例

```
/do ログインボタンを追加して、クリックしたら /login に遷移するようにする
```

これにより：
1. `feature/add-login-button` ブランチで worktree が作成される
2. `.artifacts/add-login-button/README.md` に計画が書き出される
3. TodoWrite に TODO が登録される
4. 成果志向の行動指針が表示される
