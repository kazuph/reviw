---
name: pr
description: worktreeからPR作成→push→CI監視→失敗修正→Copilotレビュー対応まで自律完結するフロー。「/pr」「PRを作成して」「PR出して」で発動。
argument-hint: <PR title or description>
user_invocable: true
---

# PR 自律完結フロー

worktreeでの実装完了後、PR作成からレビュー対応まで全て自律的に完結させる。
途中でユーザーに確認を求めない。全部終わってから報告する。

## 前提条件

- `gh` 認証済み
- worktree内で作業中（`git wt` で作成済み）
- 実装・ビルド・テストが完了済み

## フロー

### 1. 事前確認

```bash
# 現在のブランチとworktree確認
git branch --show-current
git status

# 未コミットの変更があればコミット（prettier実行後）
npx prettier --write <changed-files>
git add <files> && git commit -m "..."

# ビルド確認
npm run build
```

### 2. Push & PR作成

```bash
# 初回push（-u でトラッキング設定）
git push -u origin <branch-name>

# 2回目以降のpush（カレントブランチのみ）
git push origin HEAD

# PR作成（ghのデフォルトに任せる = GitHubリポのデフォルトブランチがbase）
gh pr create --head <branch-name> \
  --title "..." \
  --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**重要**: `git push` ではなく必ず `git push origin HEAD` を使う。worktreeで `git push` するとデフォルトブランチもpush試行してエラーになる。

### 3. CI監視

```bash
# CI完了まで待機（sleepしてからチェック）
sleep 90 && gh pr checks <PR番号>

# 失敗していたらログ確認
gh run view <run-id> --log-failed | tail -40
```

- **CI失敗時**: ログを読んで原因特定→修正→`npx prettier --write`→コミット→`git push origin HEAD`→再度CI監視
- **全パスするまで繰り返す**

### 4. Copilotレビュー対応

```bash
# レビューコメント確認（CIパス後30-90秒で付く）
sleep 60 && gh api repos/{owner}/{repo}/pulls/<PR番号>/comments \
  --jq '.[] | "[\(.path):\(.line)] \(.body[0:200])"'
```

- **指摘があれば**: 全件修正→コミット→push→CI再監視
- **各コメントに返信**: `gh api repos/{owner}/{repo}/pulls/<PR番号>/comments/<id>/replies -f body="対応済み。"`
- **追加指摘がなくなるまで繰り返す**

### 5. ローカル検証（ブラウザ確認が必要な場合）

ローカルのdevサーバー（worktree内で `npm run dev`）でブラウザ確認。
Preview環境のデプロイを待つ必要はない。

### 6. 完了報告

全て終わったら以下を含めて報告:

```
PR #XX: <URL>

| 項目 | 状態 |
|------|------|
| CI | 全チェックパス |
| Copilotレビュー | N件対応済み / 追加指摘なし |
| テスト | N件パス |
| 検証 | ローカル/Preview で確認済み |
```

## 禁止事項

- 途中で「CIが通ったらやる？」「レビュー対応する？」と聞かない
- Preview環境のデプロイ待ちでブロックしない（ローカルで検証）
- `git push` を使わない（`git push origin HEAD` を使う）
- CI失敗を放置しない
- Copilotの指摘を無視しない

## ⚠️ git wt の注意

- `git wt list` は禁止（"list" というworktreeが作成されてしまう）
- worktree一覧は `git wt`（引数なし）を使う
- または `git worktree list` を使う
