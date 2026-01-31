#!/usr/bin/env bash
# Stop hook - 自動分類宣誓システム
#
# フロー:
#   1. 宣誓文あり → スルー
#   2. ツール使用から自動分類 → 該当する宣誓文を要求
#
# 分類ロジック:
#   - Edit/Write/MultiEdit/NotebookEdit → 実装/修正
#   - Read/Grep/Glob/WebSearch/WebFetch のみ → 調査
#   - それ以外 → 相談

INPUT=$(cat)

# jqの場所を特定
JQ=/usr/bin/jq
if [ ! -x "$JQ" ]; then
  JQ=/opt/homebrew/bin/jq
fi
if [ ! -x "$JQ" ]; then
  exit 0
fi

TRANSCRIPT_PATH=$(printf '%s' "$INPUT" | "$JQ" -r '.transcript_path // empty' 2>/dev/null || true)

# transcriptがなければスキップ
if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

# 最近のtranscriptエントリを取得（最後500行で十分なツール履歴を確保）
RECENT=$(tail -500 "$TRANSCRIPT_PATH" 2>/dev/null || true)

if [ -z "$RECENT" ]; then
  exit 0
fi

# 最新のassistantメッセージのテキスト内容を取得
LATEST_ASSISTANT_TEXT=$(printf '%s' "$RECENT" | "$JQ" -rs '
  [.[] | select(.type == "assistant")] | last |
  .message.content[]? | select(.type == "text") | .text // empty
' 2>/dev/null || true)

if [ -z "$LATEST_ASSISTANT_TEXT" ]; then
  exit 0
fi

# 宣誓文パターン（3分類）
OATH_PATTERN="【実装/修正】|【調査】|【相談】"

# 宣誓文が含まれているかチェック
if printf '%s' "$LATEST_ASSISTANT_TEXT" | grep -qE "$OATH_PATTERN"; then
  exit 0  # スルー
fi

# ツール使用履歴から分類を自動判定
# 最新のユーザーメッセージ以降のツール使用を確認

# コード変更ツール（実装/修正）
CODE_CHANGE_TOOLS="Edit|Write|MultiEdit|NotebookEdit"

# 情報収集ツール（調査）
RESEARCH_TOOLS="Read|Grep|Glob|WebSearch|WebFetch"

# ツール使用を検出
TOOL_USES=$(printf '%s' "$RECENT" | "$JQ" -rs '
  [.[] | select(.type == "assistant") | .message.content[]? | select(.type == "tool_use") | .name] | unique | .[]
' 2>/dev/null || true)

# 分類判定
CATEGORY=""

if printf '%s' "$TOOL_USES" | grep -qE "$CODE_CHANGE_TOOLS"; then
  CATEGORY="impl"
elif printf '%s' "$TOOL_USES" | grep -qE "$RESEARCH_TOOLS"; then
  CATEGORY="research"
else
  CATEGORY="consult"
fi

# 分類に応じたメッセージを出力
if [ "$CATEGORY" = "impl" ]; then
  cat >&2 <<'BLOCK'
[reviw-plugin] コード変更を検出しました。「実装/修正」として確認します。

以下の注意事項を確認し、すべて満たしている場合のみ宣誓文を末尾につけて再度返答してください。

【注意事項】
□ ビルドが成功したか？（npm run build等）
□ 型エラー・lintエラーがないか？
□ Playwrightでスクリーンショットを撮影したか？（Web実装の場合）
□ openコマンドで画像を開いてユーザーに見せたか？
□ テストを実行してパスしたか？（テスト環境がある場合）
□ エビデンスのパスを明記しているか？

【宣誓文】
---
【実装/修正】ビルド成功、動作確認済み。エビデンス: [パスを記載]

※注意事項を満たしていない場合、この宣誓文をつけることは禁止です。
BLOCK
  exit 2
fi

if [ "$CATEGORY" = "research" ]; then
  cat >&2 <<'BLOCK'
[reviw-plugin] 情報収集を検出しました。「調査」として確認します。

以下の注意事項を確認し、すべて満たしている場合のみ宣誓文を末尾につけて再度返答してください。

【注意事項】
□ 実際にファイルを読んだか？（Glob/Grep/Readを使用）
□ ファイルパスと行番号を明記しているか？
□ 推測ではなく事実に基づいているか？
□ 関連する他のファイルも確認したか？
□ 最新の情報が必要な場合、WebSearchで検索したか？
□ 回答に出典を明記しているか？（ファイルパス、URL等）

【宣誓文】
---
【調査】コードベースを実際に読み、事実に基づいた調査結果を報告しました。出典: [ファイルパスまたはURL]

※注意事項を満たしていない場合、この宣誓文をつけることは禁止です。
BLOCK
  exit 2
fi

# consult（相談）
cat >&2 <<'BLOCK'
[reviw-plugin] 「相談」として確認します。

以下の注意事項を確認し、すべて満たしている場合のみ宣誓文を末尾につけて再度返答してください。

【注意事項】
□ 推測や憶測で回答していないか？
□ 最新の情報が必要な場合、WebSearchで検索したか？
□ 回答に出典を明記しているか？（公式ドキュメントURL、ファイルパス等）
□ ユーザーの質問に直接答えているか？
□ 選択肢を提示しているか？（丸投げではなく）

【宣誓文】
---
【相談】事実に基づいた回答をしました。出典: [URL等]

※注意事項を満たしていない場合、この宣誓文をつけることは禁止です。
BLOCK
exit 2
