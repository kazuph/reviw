---
description: Lightweight end-to-end task command - AskUserQ deep-dive, git wt worktree, t-wada TDD, screenshots and verification
argument-hint: <task description or spec>
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite, Task, AskUserQuestion
---

# /reviw-plugin:tiny-done

<command-name>tiny-done</command-name>

小さなタスクをサクッと完了させる軽量タスクコマンド。
要件深掘り → worktree作成 → TDD実装 → スクショ確認まで一気通貫。

## doとの違い

| | do | tiny-done |
|---|---|---|
| worktree | git wtで作る | git wtで作る |
| REPORT.md | 作る | 作らない |
| Codebase Exploration | 2-3 explorer agents | なし（必要なら自分で調べる） |
| Architecture提案 | 3案比較 | なし |
| 要件深掘り | 3ラウンドの詳細インタビュー | AskUserQ 1-2問でサクッと |
| TDD | あり | あり（これは省略しない） |
| 完了 | npx reviwフルレビュー | スクショ撮影→ユーザー確認 |
| 向いてるタスク | 大きな機能開発 | 小さな修正・追加 |

## Arguments

$ARGUMENTS = やってほしいこと、仕様の説明

---

## Phase 1: 要件深掘り（AskUserQuestion）

**ユーザーの要求を勝手に解釈しない。1-2問で核心を確認する。**

AskUserQuestionで以下を確認:

1. **ゴールと成功基準**: 何ができたら完了？どう確認する？
2. **エッジケース**: 想定外の入力や状態はどう扱う？

**1-2問で十分。3ラウンドのインタビューは不要。**
曖昧さが残る場合のみ追加質問する。

---

## Phase 2: Worktree作成

```bash
# git-wtが必要
git wt --version || echo "ERROR: git-wt required. Install: brew install k1LoW/tap/git-wt"

# worktree作成
git wt <branch-name>

# 移動
cd .worktree/<branch-name>
```

### ブランチ命名規則

| Type | Branch Name | Example |
|------|-----------|---------|
| New feature | `feature/<name>` | `feature/login-button` |
| Bug fix | `fix/<name>` | `fix/validation-error` |
| Refactoring | `refactor/<name>` | `refactor/api-client` |

---

## Phase 3: t-wada TDD実装

**テスト駆動開発のサイクルを厳守する。実装してからテストを書くのは禁止。**

### プロジェクトタイプ検出

```bash
PROJECT_TYPE="unknown"
if [ -f package.json ] && grep -qE '"(react|vue|svelte|next|nuxt|@angular/core|solid-js|astro)"' package.json 2>/dev/null; then
  PROJECT_TYPE="web"
elif [ -f Podfile ] || [ -f pubspec.yaml ] || ([ -f app.json ] && grep -q '"expo"' app.json 2>/dev/null); then
  PROJECT_TYPE="mobile"
elif [ -f go.mod ] || [ -f Cargo.toml ] || [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  PROJECT_TYPE="backend"
elif [ -f package.json ] && grep -qE '"(express|fastify|koa|hapi|@nestjs/core|hono)"' package.json 2>/dev/null; then
  PROJECT_TYPE="backend"
else
  PROJECT_TYPE="web"
fi
echo "Project type: $PROJECT_TYPE"
```

### TDDサイクル

```
RED:    期待する動作をテストに書く → 実行 → FAIL（赤）を確認
GREEN:  最小限の実装でテストをPASS（緑）にする
Refactor: テストが通ったままリファクタリング
```

### テスト種別（プロジェクトタイプ別）

| Project Type | Test Framework | Test Location |
|-------------|---------------|---------------|
| web | Playwright (E2E) | `e2e/features/<feature>/` |
| backend | vitest/jest/pytest/go test/cargo test | `tests/` or framework default |
| mobile | Maestro E2E flow | `.maestro/` |

### 実装はサブエージェントで

**コンテキスト保護のため、実装はTask toolでサブエージェントに委譲する。**

サブエージェントには以下を明示的に指示する:
- t-wada TDDサイクル厳守（テスト先行）
- Mock / Stub 禁止（DI経由のエミュレータのみ許可）
- curl / 手動APIコール禁止（テストフレームワークを使う）

### 絶対禁止

- Mock / Stub（DI経由のローカルエミュレータのみ許可）
- curl / 手動APIコール（テストフレームワークを使う）
- 実装後テスト（テストを先に書く）
- 証拠なし完了報告

---

## Phase 4: スクショ確認

**実装+テスト完了後、スクショを撮影してユーザーに確認する。**

### Web / Fullstack の場合

1. **webapp-testing skill でスクショ撮影**
   - 実装した画面をPlaywrightで開く
   - スクリーンショットを撮影
   - 必要に応じてGIF動画も撮影

2. **撮影したファイルを開く**
   ```bash
   open /path/to/screenshot.png
   ```

### Backend の場合

1. **テストスイートを実行してエビデンス取得**
   - プロジェクトのテストフレームワークを実行
   - テスト結果の出力を `/tmp/tiny-done/test-output.txt` に保存

2. **テスト結果を開く**
   ```bash
   open /tmp/tiny-done/test-output.txt
   ```

### Mobile の場合

1. **Maestro MCP でスクショ撮影**
   - シミュレータ/デバイスが起動していることを確認
   - Maestro MCP の `take_screenshot` で現在の画面を撮影

2. **撮影したファイルを開く**
   ```bash
   open /path/to/screenshot.png
   ```

### 共通

3. **AskUserQuestionでユーザーに確認を求める**
   - 「この内容でOKですか？」

---

## NGフィードバック時のループ

ユーザーがOKと言わなかった場合:

```
Phase 4 → ユーザー「NG: ○○を直して」
  ↓
修正実装（TDDサイクル維持）
  ↓
再度Phase 4（スクショ撮影→ユーザー確認）
  ↓
ユーザーがOKと言うまでループ
```

- ユーザーのフィードバックは原文のままTodoListに登録
- 修正後は必ずテストを再実行してからスクショ撮影

---

## セッション復帰

中断後にセッションを再開した場合:

```bash
# worktreeの確認
git wt
# worktreeに移動
cd .worktree/<branch-name>
# TodoListで進捗確認 → 未完了タスクから再開
```

---

## 出力先

- `/tmp/tiny-done/` に一時保存
- REPORT.mdは作成しない
- .artifacts/への保存もしない
- npx reviwは起動しない

## 禁止事項

- REPORT.mdを作成する
- artifact-proof skillを使う
- npx reviwを起動する
- 3ラウンドのインタビューをする（1-2問で済ませる）
- テストを書かずに実装する
- スクショ確認をスキップする

## 完了条件

1. AskUserQで要件が明確になっている
2. worktreeが作成されている
3. TDDでテストが通っている
4. スクショ/テスト結果がユーザーに表示されている
5. ユーザーがOKと言っている
