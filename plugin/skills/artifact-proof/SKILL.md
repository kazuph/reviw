---
name: artifact-proof
description: Accumulate evidence (screenshots, videos, logs) under .artifacts/<feature>/ for visual regression and PR documentation workflow. [MANDATORY] Before saying "implementation complete", you MUST use this skill to collect evidence and present a report with proof. Completion reports without evidence are PROHIBITED.
allowed-tools:
  - Shell
---

# Artifact Proof

開発過程の証拠（スクショ・動画・ログ）を `.artifacts/<feature>/` に残し、PR本文へ転用するための運用フロー。  
ヒューマンインザループのビジュアルリグレッションを前提とし、コミット前・PR push前に必ずスクショを撮り直して確認する。

## トリガー
- PR用の作業証跡を求められたとき
- 画面改修でビジュアル差分チェックが必要なとき
- E2E/Playwright実行結果を残したいとき

## 事前原則
- `.artifacts/`（md）と `.artifacts/media/`（画像・動画）を使用し、リポジトリを汚さない。
- スクショは半自動ヒューマンインザループなビジュアルリグレッションとして扱う。修正を加えたら **コミット前・PR push前に全スクショを撮り直して差し替える**。人が目視で意図した変更か確認してからコミットする。
- ブラウザは原則Playwright同梱Chromiumを使う。Chrome系は最後の手段。
- 編集は `apply_patch` のみ。他人の変更を壊す操作（`git reset` 等）は禁止。

## ディレクトリと命名
- FEATURE を決めて以下を作成:
  - `.artifacts/<feature>/README.md`
  - `.artifacts/<feature>/images/`
  - `.artifacts/<feature>/videos/`
- 命名例: `20251130-login-before.png`, `20251130-login-after.png`, `20251130-login-run.webm`
- **動画ファイル（.webm, .mp4等）は必ずGit LFSで管理する**（後述）

## Artifactテンプレ（README.md）
```markdown
# <feature> / <ticket>

## Context
- 背景・依頼内容
- スコープ外

## What I did
- 作業ログ（時系列で短く）
- 実行コマンドは ```bash ``` ブロックで記録

## Evidence
- テスト: `npx playwright test --reporter=line ...`
- 画像: `![state](./images/20251130-login-after.png)`
- 動画: `./videos/20251130-login-run.webm`
- trace: `./images/trace.zip` など

上記のエビデンスは以下を実行することで再取得可能です。

```
pnpm run ...
pnpm run ...
pnpm run ...
```

## Next
- 残課題・要確認事項
```

## Playwrightで証跡を取る例（スクショ+動画）
```bash
FEATURE=${FEATURE:-feature}
mkdir -p .artifacts/$FEATURE/{images,videos}
node -e "const { chromium } = require('playwright');
(async () => {
  const feature = process.env.FEATURE || 'feature';
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: `.artifacts/${feature}/videos` } });
  const page = await context.newPage();
  await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
  // TODO: シナリオ操作をここに記述
  const stamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
  await page.screenshot({ path: `.artifacts/${feature}/images/${stamp}-step.png`, fullPage: true });
  await browser.close();
})();" \
FEATURE=$FEATURE
```
- trace付きPlaywright test例:
```bash
FEATURE=${FEATURE:-feature}
BASE_URL=http://localhost:3000 \
npx playwright test tests/e2e/<spec>.spec.ts \
  --headed \
  --output=.artifacts/$FEATURE/images \
  --trace=retain-on-failure \
  --reporter=line
```
  実行後、動画やtrace出力が別ディレクトリに散らばる場合は`.artifacts/$FEATURE/videos/`へ `mv` して整理。

## 運用フロー
1) 作業開始時に対象タスクのArtifact mdを作成。Contextと予定を書く。
2) 実行コマンドやログを逐次追記。
3) 画面変更後、全スクショを撮り直し `.artifacts/<feature>/images/` へ保存（動画は `videos/`）。
4) 目視で差分を確認（ヒューマンインザループ）。意図通りならREADMEに貼り付け。
5) **reviw でレビュー開始**（後述の「reviw によるレビュー」セクション参照）
6) 却下を受けたら再度実装し、修正がある限りスクショと動画を取り直し、必要があればREADME.mdを修正し、再度5を実行、承認されるまでループ
7) ユーザーからの承認後に初めてコミット、PRがある場合は、PR本文もここまでの修正を反映する

## reviw によるレビュー

reviw は CSV/TSV/Markdown/Diff/テキストファイルをブラウザでレビューし、コメントを YAML 形式で出力する CLI ツール。

### 基本コマンド

```bash
# 報告書を開く（必ずフォアグラウンドで実行）
npx reviw .artifacts/<feature>/README.md

# 動画があれば先に開いておく
open .artifacts/<feature>/videos/demo.webm
npx reviw .artifacts/<feature>/README.md

# git diff をレビュー
git diff HEAD | npx reviw

# 複数ファイルを同時に開く
npx reviw file1.md file2.csv data.tsv
```

### オプション

| オプション | 説明 |
|-----------|------|
| `--port <number>` | ポート番号指定（デフォルト: 4989） |
| `--encoding <enc>` | 文字エンコーディング指定（shift_jis, euc-jp 等） |
| `--no-open` | ブラウザ自動起動を無効化 |

### reviw の UI 機能

- **Markdown**: サイドバイサイドプレビュー、スクロール同期、Mermaid 図レンダリング
- **CSV/TSV**: 固定ヘッダー、列固定、フィルタリング
- **Diff**: GitHub 風表示、シンタックスハイライト
- **テーマ**: ライト/ダークモード切替
- **コメント**: セル/行クリックでコメント追加、Cmd/Ctrl+Enter で送信

### レビューワークフロー

```
npx reviw .artifacts/<feature>/README.md  # フォアグラウンドで起動
    ↓
ブラウザが開く
    ↓
ユーザーが内容を確認しコメントを追加
    ↓
「Submit & Exit」をクリック
    ↓
YAML 形式でフィードバックが出力される
    ↓
フィードバックを TodoWrite に登録（詳細に、要約禁止）
    ↓
修正 → 再度 reviw でレビュー → 承認まで繰り返し
```

### 重要：フォアグラウンド起動必須

```bash
# 正しい（フィードバックを受け取れる）
npx reviw report.md

# 間違い（フィードバックを受け取れない）
npx reviw report.md &
```

バックグラウンドで起動するとユーザーのコメントを受け取れないため、**必ずフォアグラウンドで起動**すること。

### 出力形式（YAML）

```yaml
file: report.md
mode: markdown
comments:
  - line: 15
    content: "この部分の説明を追加してください"
  - line: 23
    content: "エラーハンドリングが必要です"
summary: "全体的に良いですが、上記の点を修正してください"
```

## PR本文へのスクショ貼り付け

### ⚠️ 重要：ブランチ削除後も画像が残るURLを使う

PRのブランチはマージ後に削除されることが多い。ブランチ名ベースのURLは削除後に404になるため、**必ずコミットハッシュを使ったblob URLを使用する**。

```bash
# 現在のコミットハッシュを取得
COMMIT_HASH=$(git rev-parse HEAD)
# または短縮形
COMMIT_HASH=$(git rev-parse --short HEAD)
```

**正しいURL形式（コミットハッシュ使用）:**
```
![alt](https://github.com/<org>/<repo>/blob/<commit-hash>/.artifacts/<feature>/images/screenshot.png?raw=true)
```

**間違ったURL形式（ブランチ名使用 - 削除後に404）:**
```
![alt](https://github.com/<org>/<repo>/blob/<branch-name>/.artifacts/<feature>/images/screenshot.png?raw=true)
```

### スクショのレイアウト（縦長防止）

スクショが縦長に並ぶと見づらい。**HTMLテーブルを使って横方向にも配置**する：

```html
<!-- 2列レイアウト -->
<table>
  <tr>
    <td><img src="https://github.com/.../blob/<hash>/.artifacts/feature/images/before.png?raw=true" width="400"/></td>
    <td><img src="https://github.com/.../blob/<hash>/.artifacts/feature/images/after.png?raw=true" width="400"/></td>
  </tr>
  <tr>
    <td align="center">変更前</td>
    <td align="center">変更後</td>
  </tr>
</table>

<!-- 3列レイアウト（複数画面の比較） -->
<table>
  <tr>
    <td><img src=".../step1.png?raw=true" width="280"/></td>
    <td><img src=".../step2.png?raw=true" width="280"/></td>
    <td><img src=".../step3.png?raw=true" width="280"/></td>
  </tr>
  <tr>
    <td align="center">1. ログイン画面</td>
    <td align="center">2. 入力後</td>
    <td align="center">3. 完了画面</td>
  </tr>
</table>
```

### PR本文へ貼り付けるスクリプト例

```bash
FEATURE=${FEATURE:-feature}
ORG=$(gh repo view --json owner -q .owner.login)
REPO=$(gh repo view --json name -q .name)
COMMIT=$(git rev-parse HEAD)

# 画像一覧からMarkdownテーブルを生成
echo "<table><tr>"
count=0
for img in .artifacts/$FEATURE/images/*.png; do
  filename=$(basename "$img")
  echo "<td><img src=\"https://github.com/$ORG/$REPO/blob/$COMMIT/$img?raw=true\" width=\"400\"/></td>"
  count=$((count + 1))
  # 2列ごとに改行
  if [ $((count % 2)) -eq 0 ]; then
    echo "</tr><tr>"
  fi
done
echo "</tr></table>"
```

### GitHub CLIでPR本文を更新

```bash
gh api --method PATCH repos/<org>/<repo>/pulls/<num> -f body="$(cat /tmp/new-body.md)"
```

## 動画のGit LFS管理

動画ファイルはサイズが大きいため、**必ずGit LFSで管理する**。

### 初回セットアップ
```bash
# LFSがインストールされていない場合
brew install git-lfs  # macOS
git lfs install

# 動画ファイルをLFS追跡対象に追加
git lfs track "*.webm"
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track ".artifacts/**/*.webm"
git lfs track ".artifacts/**/*.mp4"

# .gitattributesをコミット
git add .gitattributes
git commit -m "chore: add video files to Git LFS"
```

### 動画追加時のフロー
```bash
# 1. 動画を配置
mv recording.webm .artifacts/$FEATURE/videos/

# 2. LFSで追跡されているか確認
git lfs status

# 3. 通常通りadd/commit
git add .artifacts/$FEATURE/videos/
git commit -m "docs: add demo video for $FEATURE"
```

### PR本文での動画リンク
動画はGitHub上で直接再生できないため、リンクで提供：
```markdown
📹 [デモ動画を見る](./.artifacts/feature/videos/demo.webm)
```

または、GIFに変換して埋め込み：
```bash
# webm → gif 変換（ffmpeg使用）
ffmpeg -i demo.webm -vf "fps=10,scale=600:-1" demo.gif
```

## ベストプラクティス
- スクショ/動画はファイル名に画面や状態が分かる単語を入れる（例: `login-success.png`）。
- 差分確認はフルページと要素単位の両方を使うと精度が上がる。
- テスト失敗時もスクショを残し、原因追跡に活用する。
- PR作成時はArtifact本文をそのまま貼り付け、レビュー指摘に合わせてArtifactを更新する。
- **スクショは縦長に並べず、2〜3列のテーブルレイアウトで横方向も活用する**。
- **画像URLは必ずコミットハッシュを使い、ブランチ削除後も表示されるようにする**。
- **動画は必ずGit LFSで管理し、リポジトリを肥大化させない**。

## 期待アウトプット
- `.artifacts/<feature>/` にタスク単位のREADMEがあり、証跡（スクショ・動画・ログ）が紐付いている。
- コミット前・PR push前に最新スクショへ更新済みで、ビジュアル差分が人の目で確認されている。
- ArtifactをそのままPR本文として流用できる。
- PRの画像はコミットハッシュベースのblob URLで、マージ後にブランチが削除されても表示される。
- 動画ファイルはGit LFSで管理され、clone時の負荷を軽減している。
