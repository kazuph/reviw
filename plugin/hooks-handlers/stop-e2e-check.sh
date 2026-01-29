#!/usr/bin/env bash
# Stop / SubagentStop hook
# コード変更があるのにテスト実行の痕跡がなければブロック

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

# ソースコードの変更があったか確認
# Write/Edit ツールでソースファイル（テストファイル以外）を変更した痕跡を探す
CODE_CHANGED=$(printf '%s' "$RECENT" | "$JQ" -r '
  select(.type == "assistant") |
  .message.content[]? |
  select(.type == "tool_use") |
  select(.name == "Write" or .name == "Edit" or .name == "MultiEdit") |
  .input.file_path // empty
' 2>/dev/null | grep -vE '\.(test|spec|e2e)\.' | grep -vE '__tests__/' | grep -vE '\.(md|json|yaml|yml|toml|txt|css|scss|html|png|jpg|svg)$' | grep -E '\.(ts|tsx|js|jsx|cjs|mjs|py|rb|go|rs|vue|svelte)$' | head -1 || true)

# コード変更がなければチェック不要（質問への回答やドキュメント編集等）
if [ -z "$CODE_CHANGED" ]; then
  exit 0
fi

# テスト実行の痕跡を確認
TEST_RUN=$(printf '%s' "$RECENT" | "$JQ" -r '
  select(.type == "assistant") |
  .message.content[]? |
  select(.type == "tool_use") |
  select(.name == "Bash") |
  .input.command // empty
' 2>/dev/null | grep -cE 'vitest|playwright|jest|npm test|npx test|npm run test|pnpm test|yarn test|pytest|go test|cargo test' || true)

# webapp-testing skill の使用痕跡を確認
WEBAPP_TEST=$(printf '%s' "$RECENT" | "$JQ" -r '
  select(.type == "assistant") |
  .message.content[]? |
  select(.type == "tool_use") |
  select(.name == "Skill") |
  .input.skill // empty
' 2>/dev/null | grep -c 'webapp-testing' || true)

# テスト実行もwebapp-testingも使われていない場合
if [ "${TEST_RUN:-0}" -eq 0 ] && [ "${WEBAPP_TEST:-0}" -eq 0 ]; then
  cat >&2 <<'BLOCK'
[reviw-plugin] ソースコードを変更しましたが、テストが実行されていません。

完了する前に以下を実施してください:
1. E2Eテストまたは結合テストを書いて実行する（モック禁止）
2. webapp-testing skill でブラウザ検証する
3. テスト結果のエビデンスを収集する

テスト未実行での完了宣言は禁止されています。
BLOCK
  exit 2
fi

exit 0
