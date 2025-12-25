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
メインスレッドで webapp-testing を直接実行すると：
   → スクショを Read → コンテキスト枯渇 → compact 発動
   → /done の内容を忘れる → 「実装しました！」で報告
   → 差し戻し → 無限ループ
```

**正しいやり方：**
```
Task ツールで subagent を起動
→ サブエージェント内で webapp-testing 実行
→ サブエージェントが結果を要約して返す
→ メインスレッドのコンテキストは温存される
```

## 引数

$ARGUMENTS = これからやりたいことの依頼文、仕様説明など

## タスク再開の場合

**セッション起動時・compact 後は、新規作成前に既存 worktree を確認せよ。**

```bash
# 作業中の worktree を確認
git worktree list

# worktree に移動
cd .worktree/<機能名>

# 進捗を確認
cat .artifacts/<機能名>/REPORT.md
```

**REPORT.md の TODO を確認し、未完了項目から作業を再開せよ。**

### 報告書の場所

```
.worktree/<機能名>/.artifacts/<機能名>/REPORT.md
```

※ `<機能名>` = ブランチ名から prefix を除いた部分（例: `feature/auth` → `auth`）

## 実行手順（新規タスクの場合）

### 1. 作業環境のセットアップ

まず、現在のプロジェクトが git リポジトリであることを確認する。

```bash
# プロジェクトルートで実行
git rev-parse --show-toplevel
```

次に、タスク用の worktree を作成する。ブランチ名は依頼内容から適切な名前を自動生成する。

### worktree の命名規則

| 種別 | ブランチ名 | 例 |
|------|-----------|-----|
| 新機能 | `feature/<機能名>` | `feature/auth`, `feature/events` |
| バグ修正 | `fix/<内容>` | `fix/login-error`, `fix/validation` |
| リファクタ | `refactor/<対象>` | `refactor/api-client` |
| ドキュメント | `docs/<対象>` | `docs/readme` |

```bash
# worktree を作成（--from-current で現在のブランチから分岐）
git gtr new <branch-name> --from-current

# worktree のパスを取得
WORKTREE_PATH="$(git gtr go <branch-name>)"

# worktree に移動
cd "$WORKTREE_PATH"
```

### 2. .gitignore の設定

**重要：** `.worktree` と `.artifacts` をコミット対象から除外する。

```bash
# プロジェクトルートの .gitignore に追記（存在しない場合のみ）
if ! grep -q "^\.worktree$" .gitignore 2>/dev/null; then
  echo ".worktree" >> .gitignore
fi
if ! grep -q "^\.artifacts$" .gitignore 2>/dev/null; then
  echo ".artifacts" >> .gitignore
fi
```

**理由：**
- `.worktree/` - 作業用ディレクトリはローカル専用
- `.artifacts/` - エビデンス（スクショ・動画）はリポジトリを肥大化させるため除外

### 3. 成果物ディレクトリの準備

worktree 内に `.artifacts/<機能名>/` ディレクトリを作成する。

**ディレクトリ構成：**
```
.worktree/<機能名>/
└── .artifacts/
    └── <機能名>/
        ├── REPORT.md     # 計画・進捗・エビデンスリンク
        ├── images/       # スクリーンショット
        └── videos/       # 動画ファイル
```

```bash
mkdir -p .artifacts/<機能名>/{images,videos}
```

### 4. 計画の策定（REPORT.md）

`.artifacts/<機能名>/REPORT.md` を作成し、以下のフォーマットで計画を書き出す：

```markdown
# <タスク名>

作成日: YYYY-MM-DD
ブランチ: <branch-name>
ステータス: 進行中

## 概要

<依頼内容の要約>

## 進捗

| 日付 | 内容 | 状態 |
|------|------|------|
| YYYY-MM-DD | 計画策定 | 完了 |
| YYYY-MM-DD | API実装 | 進行中 |

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

## テスト結果

### 単体テスト
- `tests/unit/xxx.test.ts`: PASS/FAIL

### 結合テスト
- `tests/integration/xxx.test.ts`: PASS/FAIL

### E2Eテスト
- `tests/e2e/xxx.spec.ts`: PASS/FAIL

## 技術的なメモ

<実装中に気づいた点やメモを追記していく>

## エビデンス

<artifact-proof で収集したエビデンスへのリンクを追記していく>
```

### 5. TodoWrite への反映

上記の PLAN を TodoWrite ツールにも反映する。これにより進捗が可視化される。

### 6. サブエージェントによる並列実装

**計画策定後、実装は必ずサブエージェント（Task ツール）で実行する。**

メインスレッドはディレクター役に徹し、以下のフローで進める：

```
┌─────────────────────────────────────────────────────────────┐
│  メインスレッド（ディレクター）                              │
│                                                             │
│  1. プラン策定完了                                          │
│  2. タスクを依存関係で分類                                  │
│     ├─ 独立タスク → 並列でサブエージェント起動             │
│     └─ 依存タスク → 前段完了後に起動                       │
│  3. 各サブエージェントの結果を統合                          │
│  4. 次のフェーズへ進む                                      │
└─────────────────────────────────────────────────────────────┘
```

**並列実行の例：**

```
# 独立した3つのコンポーネント実装を並列で起動
Task(subagent_type="webapp-master", prompt="HeaderComponent を実装...")
Task(subagent_type="webapp-master", prompt="SidebarComponent を実装...")
Task(subagent_type="webapp-master", prompt="FooterComponent を実装...")
```

**サブエージェントの選択基準：**

| タスク種別 | subagent_type | 備考 |
|-----------|---------------|------|
| Web UI 実装 | `webapp-master` | フロントエンド全般 |
| Expo/RN 実装 | `expo-app-maker` | モバイルアプリ |
| コード調査 | `Explore` | 既存コードの理解 |
| 設計レビュー | `Plan` | アーキテクチャ検討 |
| 動作確認 | `general-purpose` + webapp-testing skill | 検証フェーズ |
| エビデンス収集 | `general-purpose` + artifact-proof skill | 完了報告準備 |

### 7. 成果を意識した行動指針の確認

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

- **main ブランチでの直接作業を禁止** - 必ず worktree を作成してから作業を開始すること
- 計画なしに実装を始めること
- worktree を作成せずにメインブランチで作業すること
- エビデンス収集を忘れること
- /done を実行せずに完了報告すること
- メインスレッドで直接コードを書くこと（コンテキスト枯渇の原因）
- サブエージェントを起動せず「実装します」と宣言だけすること
- 並列可能なタスクを順次実行すること（効率低下）

## PR 作成フロー（参考）

PR の作成先（develop / main）はプロジェクトの CLAUDE.md に従う。

```bash
# 1. worktree で作業完了後
cd .worktree/<機能名>

# 2. コミット（/done 実行後）
git add .
git commit -m "feat: <内容>"

# 3. プッシュ
git push -u origin <branch-name>

# 4. PR 作成（プロジェクト設定に従う）
gh pr create --base <target-branch> --head <branch-name>

# 5. マージ後、worktree 削除
cd ../..
git worktree remove .worktree/<機能名>
```

**注意**: main への直接 PR 作成は AI 禁止のプロジェクトもある。プロジェクトの CLAUDE.md を確認すること。

## 例

```
/do ログインボタンを追加して、クリックしたら /login に遷移するようにする
```

これにより：
1. `feature/add-login-button` ブランチで worktree が作成される
2. `.worktree/add-login-button/.artifacts/add-login-button/REPORT.md` に計画が書き出される
3. TodoWrite に TODO が登録される
4. 成果志向の行動指針が表示される
