#!/usr/bin/env bash

# Stop hook: Output completion checklist as JSON additionalContext
# This message is injected into AI's context (invisible to user)

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "additionalContext": "[reviw-plugin] 完了報告前チェックリスト\n\n【完了基準】実装だけでは 1/3。以下を確認せよ：\n\n□ 実装完了（1/3）\n  → ビルドは成功したか？ (npm run build / pnpm build)\n  → 型エラー・lint エラーはないか？\n\n□ 動作検証完了（2/3）\n  → 開発サーバーを起動して実際に動かしたか？\n  → webapp-testing スキルで検証したか？\n\n□ レビュー完了（3/3）\n  → .artifacts/<feature>/ にエビデンス（スクショ・動画）はあるか？\n  → artifact-proof スキルで報告書を作成したか？\n  → /done を実行したか？\n  → reviw でフォアグラウンド起動してレビューを受けたか？\n  → ユーザーから承認を得たか？\n\n【禁止事項】\n  ✗ 「実装しました！」だけの報告\n  ✗ 動作確認なしの完了宣言\n  ✗ 証拠なしの「動きました」報告\n  ✗ reviw でのレビュー前にコミット・プッシュ\n\n【もし上記が未完了なら】\n  → 完了報告ではなく、次に何をすべきか伝えること\n  → /done を実行してレビューフローに進むこと"
  }
}
EOF

exit 0
