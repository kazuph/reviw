#!/usr/bin/env bash
# Stop hook - 二段階宣誓システム（AI専用メッセージ版）
#
# フロー:
#   1. 宣誓文あり → スルー
#   2. 番号のみ回答（1-4）→ 第1.5段階メッセージでブロック（AIにだけ見える）
#   3. それ以外 → 第1段階メッセージでブロック（AIにだけ見える）

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

# 最近のtranscriptエントリを取得（最後200行）
RECENT=$(tail -200 "$TRANSCRIPT_PATH" 2>/dev/null || true)

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

# 宣誓文パターン
OATH_PATTERN="【実装】|【バグ修正】|【調査】|【相談】"

# 宣誓文が含まれているかチェック
if printf '%s' "$LATEST_ASSISTANT_TEXT" | grep -qE "$OATH_PATTERN"; then
  exit 0  # スルー
fi

# JSON出力用関数（AIにだけ見えるブロック）
block_with_reason() {
  local reason="$1"
  "$JQ" -n --arg reason "$reason" '{"decision": "block", "reason": $reason}'
  exit 0
}

# 最後の非空行を取得
LAST_LINE=$(printf '%s' "$LATEST_ASSISTANT_TEXT" | grep -v '^[[:space:]]*$' | tail -1 | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

# 最後の行が数字だけ（1-4）かチェック
if printf '%s' "$LAST_LINE" | grep -qE '^[1-4]$'; then
  CATEGORY="$LAST_LINE"

  if [ "$CATEGORY" = "1" ]; then
    block_with_reason '[reviw-plugin] 「1. 実装」ですね。

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
【実装】ビルド成功、動作確認済み。エビデンス: [パスを記載]

※注意事項を満たしていない場合、この宣誓文をつけることは禁止です。'
  fi

  if [ "$CATEGORY" = "2" ]; then
    block_with_reason '[reviw-plugin] 「2. バグ修正」ですね。

以下の注意事項を確認し、すべて満たしている場合のみ宣誓文を末尾につけて再度返答してください。

【注意事項】
□ バグの原因を特定したか？（推測ではなく）
□ 修正後にビルドが成功したか？
□ バグが再現しなくなったことを確認したか？
□ リグレッション（他の箇所が壊れていないか）を確認したか？
□ Playwrightでスクリーンショットを撮影したか？（UI関連の場合）
□ エビデンスのパスを明記しているか？

【宣誓文】
---
【バグ修正】原因特定済み、修正確認済み。エビデンス: [パスを記載]

※注意事項を満たしていない場合、この宣誓文をつけることは禁止です。'
  fi

  if [ "$CATEGORY" = "3" ]; then
    block_with_reason '[reviw-plugin] 「3. 調査」ですね。

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

※注意事項を満たしていない場合、この宣誓文をつけることは禁止です。'
  fi

  if [ "$CATEGORY" = "4" ]; then
    block_with_reason '[reviw-plugin] 「4. 相談」ですね。

以下の注意事項を確認し、すべて満たしている場合のみ宣誓文を末尾につけて再度返答してください。

【注意事項】
□ 推測や憶測で回答していないか？
□ 最新の情報が必要な場合、WebSearchで検索したか？
□ 回答に出典を明記しているか？（公式ドキュメントURL、ファイルパス等）
□ ユーザーの質問に直接答えているか？
□ 選択肢を提示しているか？（丸投げではなく）

【宣誓文】
---
【相談】知識とネットの情報を総動員し、矛盾のない回答をしました。出典: [URL等]

※注意事項を満たしていない場合、この宣誓文をつけることは禁止です。'
  fi
fi

# 宣誓文なし & 番号回答でもない → 第1段階メッセージ
block_with_reason '[reviw-plugin] 返答の分類が必要です。

あなたの返答は以下のどれに該当しますか？番号だけ回答してください。

1. 実装     - 新機能の実装を完了した
2. バグ修正 - 既存の問題を修正した
3. 調査     - コードベース調査・原因調査の結果を報告
4. 相談     - 計画・質問・提案をしている'
