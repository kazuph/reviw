---
name: delete-worktree
description: マージ済みworktreeを安全に削除する。git/PRのマージ状態を確認してから削除。「/delete-worktree」「worktree消して」「掃除して」で発動。
argument-hint: <branch name or "all" for cleanup>
user_invocable: true
---

# Worktree安全削除フロー

マージ済みのworktreeを安全に削除する。
git的にマージ済み + PR的にもマージ済みであることを確認してから削除する。

## 引数

$ARGUMENTS = 削除対象のブランチ名、または `all`（一括クリーンアップ）

## ⚠️ git wt の注意

- `git wt list` は禁止（"list" というworktreeが作成されてしまう）
- worktree一覧は `git wt`（引数なし）を使う
- または `git worktree list` を使う

## フロー

### 1. worktree一覧の確認

```bash
# 引数なしで一覧表示
git wt
```

### 2. 削除対象の特定

**引数あり（単一削除）**: $ARGUMENTS で指定されたブランチを対象とする

**引数が "all"（一括クリーンアップ）**: 全worktreeを走査し、マージ済みのものを検出

```bash
# 各worktreeのブランチについてマージ状態を確認
for branch in $(git worktree list --porcelain | grep 'branch refs/heads/' | sed 's|branch refs/heads/||'); do
  # デフォルトブランチ（main/master）はスキップ
  DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||')
  [ "$branch" = "$DEFAULT_BRANCH" ] && continue

  echo "--- $branch ---"

  # gitマージ状態
  if git branch --merged "$DEFAULT_BRANCH" | grep -q "$branch"; then
    echo "  git: merged"
  else
    echo "  git: NOT merged"
  fi

  # PRマージ状態
  gh pr list --head "$branch" --state merged --json number,title --jq '.[] | "  PR #\(.number): \(.title) (merged)"'
  gh pr list --head "$branch" --state open --json number,title --jq '.[] | "  PR #\(.number): \(.title) (OPEN)"'
done
```

### 3. 安全チェック（各ブランチごと）

以下の全てを確認:

| チェック項目 | コマンド | 合格条件 |
|-------------|---------|---------|
| gitマージ済み | `git branch --merged <default>` | ブランチが含まれる |
| PRマージ済み | `gh pr list --head <branch> --state merged` | 結果が1件以上 |
| 未コミット変更なし | `git -C .worktree/<branch> status --porcelain` | 出力が空 |

**PRが存在しない場合**: 警告を表示し、ユーザーに確認する

```
Question: "ブランチ <branch> にはPRがありません。削除してよいですか？"
Header: "確認"
Options:
  1. "削除する" - worktreeとブランチを削除
  2. "スキップ" - このブランチは残す
```

**gitで未マージの場合**: `git wt -d` が自動で失敗するので安全。強制削除が必要なら:

```
Question: "ブランチ <branch> はデフォルトブランチにマージされていません。強制削除しますか？"
Header: "未マージ"
Options:
  1. "強制削除 (-D)" - git wt -D で強制削除
  2. "スキップ" - このブランチは残す
```

### 4. 削除実行

```bash
# worktree + ローカルブランチ削除（マージ済みのみ）
git wt -d <branch>

# 強制削除が必要な場合
git wt -D <branch>
```

### 5. リモートブランチ削除（確認付き）

```
Question: "リモートブランチ origin/<branch> も削除しますか？"
Header: "リモート"
Options:
  1. "削除する (Recommended)" - git push origin --delete <branch>
  2. "残す" - リモートブランチは残す
```

```bash
git push origin --delete <branch>
```

### 6. 完了報告

```
| ブランチ | worktree | ローカル | リモート | PR |
|---------|----------|---------|---------|-----|
| feature/xxx | 削除済み | 削除済み | 削除済み | #123 (merged) |
| fix/yyy | 削除済み | 削除済み | スキップ | なし |
```

## "all" モードの追加ルール

- デフォルトブランチ（main/master）のworktreeは絶対に削除しない
- マージ済みのブランチだけを削除候補として提示する
- 未マージのブランチは一覧に表示するが、デフォルトではスキップ
- 最終確認: AskUserQuestion で削除対象一覧を見せてから実行

## 禁止事項

- ユーザー確認なしでの削除
- デフォルトブランチの削除
- 未コミット変更があるworktreeの削除（警告必須）
- `git wt list` の使用（"list" worktreeが作られる）
