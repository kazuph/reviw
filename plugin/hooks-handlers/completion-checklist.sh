#!/usr/bin/env bash

# UserPromptSubmit hook: Output completion checklist
# This message is injected into AI's context BEFORE generating a response

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "[reviw-plugin] Session Start & Task Resumption Guide\n\n【Task Resumption】When starting a session or after compact, verify the following:\n\n  → Check active worktree with git wt (or git worktree list)\n  → Current plan and progress are in <worktree>/.artifacts/<feature>/REPORT.md\n  → Review TODOs in REPORT.md and resume from incomplete items\n\n【Report Location】\n  <worktree>/.artifacts/<feature>/REPORT.md\n  ※ <worktree> = Directory created by git wt (e.g., .worktree/feature-auth/)\n  ※ <feature> = branch name (e.g., feature/auth → auth)\n\n【Completion Criteria】Implementation alone is only 1/3. Verify the following:\n\n□ Implementation Complete (1/3)\n  → Did the build succeed? (npm run build / pnpm build)\n  → Are there no type errors or lint errors?\n\n□ Verification Complete (2/3)\n  → Did you start the dev server and actually test it?\n  → Did you verify with webapp-testing skill?\n\n□ Review Complete (3/3)\n  → Is there evidence (screenshots/videos) in .artifacts/<feature>/?\n  → Did you create a report using artifact-proof skill?\n  → Did you execute the /reviw-plugin:done command?\n  → Did you receive review by launching reviw in foreground?\n  → Did you get approval from the user?\n\n【Prohibited Actions】\n  ✗ Reporting only \"Implementation done!\"\n  ✗ Declaring completion without testing\n  ✗ Reporting \"It works!\" without evidence\n  ✗ Committing/pushing before reviw review\n\n【If the above is incomplete】\n  → Do not report completion; communicate what should be done next\n  → Execute /reviw-plugin:done command to proceed to review flow"
  }
}
EOF

exit 0
