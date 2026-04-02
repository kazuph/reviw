#!/usr/bin/env bash
# PreToolUse hook: Inject current time and elapsed time into Claude's context
# Inspired by yancya's approach: https://x.com/yancya/status/1905195498851295486

TRACK_FILE="/tmp/claude-reviw-time-track-${CLAUDE_SESSION_ID:-default}"
NOW=$(date +%s)
NOW_HUMAN=$(date "+%Y-%m-%d %H:%M:%S %Z")

if [ -f "$TRACK_FILE" ]; then
    LAST=$(cat "$TRACK_FILE")
    DIFF=$((NOW - LAST))
    if [ $DIFF -ge 3600 ]; then
        ELAPSED="$((DIFF / 3600))h $((DIFF % 3600 / 60))m"
    elif [ $DIFF -ge 60 ]; then
        ELAPSED="$((DIFF / 60))m $((DIFF % 60))s"
    else
        ELAPSED="${DIFF}s"
    fi
    MSG="[Time] ${NOW_HUMAN} | Since last action: ${ELAPSED}"
else
    MSG="[Time] ${NOW_HUMAN} | Session start"
fi

echo "$NOW" > "$TRACK_FILE"

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "${MSG}"
  }
}
EOF
exit 0
