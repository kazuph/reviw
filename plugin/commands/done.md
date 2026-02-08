---
description: Task completion check - Evidence collection, reviw review initiation
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite, Task, AskUserQuestion
---

# Task Completion Checklist

When you think implementation is done, run this command to verify completion criteria are met.

## Report Creation Rules (MANDATORY - Read Before Proceeding)

**These rules MUST be followed when creating or updating REPORT.md:**

### 1. Language Policy
- **Write the report in the user's language** (日本語で依頼されたら日本語で作成)
- Match the language the user used when making their request
- Technical terms and code can remain in English

### 2. Media Format (Images & Videos)
- **ALWAYS use `![]()` syntax** (image syntax, NOT link syntax)
- **ALWAYS place in tables** to arrange horizontally (2-3 columns)
- Vertical stacking is prohibited - it makes scrolling tedious

```markdown
| Before | After |
|--------|-------|
| ![Before](./images/before.png) | ![After](./images/after.png) |

| Video | Flow | Description |
|-------|------|-------------|
| ![Demo](./videos/demo.webm) | Step1 → Step2 → Step3 | Feature demo |
```

### 3. Priority Ordering (Critical First)
- **Critical/High severity issues → TOP of report**
- Previous feedback response → Second
- Evidence → Third
- Everything else → Use collapsible sections

### 4. Feedback Accumulation (Original Text Required)
- **Record user feedback in near-original text** (ほぼ原文で記録)
- **NEVER summarize or paraphrase** - copy exact wording
- **Register as TODO immediately when receiving feedback** (指摘を受けたらすぐTodo化)
- Accumulate across iterations - never delete old feedback

```
When user says: "ボタンの位置がずれている"
Record as: "ボタンの位置がずれている" ← Exact text
NOT as: "UI alignment issue" ← Summarized (WRONG)
```

---

## Phase 0: Report Level Selection (REQUIRED)

**Before starting the review process, ask user about desired report level.**

Use AskUserQuestion tool:

```
Question: "What level of report do you need for this task?"
Header: "Report Level"
Options:
  1. "Full Review (Recommended)" - All 3 review agents + detailed evidence + comprehensive REPORT.md
  2. "Quick Review" - E2E + Code Security only, minimal evidence
  3. "Evidence Only" - Skip review agents, just collect screenshots/videos
  4. "Skip to reviw" - Already have evidence, go straight to reviw review
```

**Actions based on selection:**

| Level | Review Agents | Evidence | REPORT.md |
|-------|---------------|----------|-----------|
| Full Review | All 3 (code-security, e2e, ui-ux) | Screenshots + Video | Comprehensive |
| Quick Review | 2 (code-security, e2e) | Screenshots only | Summary |
| Evidence Only | Skip | Screenshots + Video | Basic |
| Skip to reviw | Skip | Use existing | Use existing |

## Important: Subagent Mandatory (compact countermeasure)

**Forgetting this rule and reporting "Implemented!" happens because context is lost due to compact.**
**The following work MUST be executed by subagents (Task tool):**

| Work | Reason | Subagent |
|------|--------|----------|
| Report creation/evidence organization | Context depletion from image/video processing | `subagent_type: "report-builder"` |
| webapp-testing | Context explosion from screenshot Read | `subagent_type: "general-purpose"` |
| E2E test execution | Context consumption from long logs | `subagent_type: "general-purpose"` |

```
Bad pattern (direct execution on main thread):
   webapp-testing screenshot capture
   → Read screenshot
   → Context depletion
   → compact triggered
   → /done contents forgotten
   → Report with "Implemented!"
   → Infinite loop

Good pattern (execution via subagent):
   Launch subagent with Task tool
   → Execute webapp-testing within subagent
   → Subagent verifies screenshots
   → Return summary to main thread
   → Main thread context preserved
   → Can report while remembering /done rules
```

## Handoff from /do

Tasks started with `/do` have their PLAN recorded in `.artifacts/<feature=branch_name>/REPORT.md`.
First, verify the TODO status:

```bash
# Check REPORT.md in .artifacts directory
cat .artifacts/*/REPORT.md | grep -A 50 "## PLAN"
```

**What does checking a TODO mean?**

| Check status | Meaning | Next action |
|--------------|---------|-------------|
| `- [ ]` Unchecked | Not yet complete | Continue work |
| `- [x]` Checked | **Verified** and complete | Move to next item |

**Important: Do NOT check items for "just implemented"**

Conditions for checking:
- Implementation + Build success + Operation verification + Evidence collection

## Completion Criteria (3 stages)

| Stage | Content | Progress |
|-------|---------|----------|
| 1/3 | Implementation complete | Do NOT report yet |
| 2/3 | Build/start/operation verification complete | Do NOT report yet |
| 3/3 | reviw review → User approval | Now finally complete |

```
+---------------------------------------------------------------+
|  Implementation complete ≠ Task complete                      |
+---------------------------------------------------------------+
|                                                               |
|  "Implemented" → Rejected                                     |
|  "Build passed" → Rejected                                    |
|  "It works (no evidence)" → Rejected                          |
|                                                               |
|  "Verified operation with evidence" → Finally review starts   |
|                                                               |
+---------------------------------------------------------------+
```

## Required Actions After Implementation

Do NOT say "complete" until all of the following are executed:

### Pre-Check: Read Project Type

```bash
PROJECT_TYPE=$(grep -m1 '^Project-Type:' .artifacts/*/REPORT.md 2>/dev/null | awk '{print $2}')
if [ -z "$PROJECT_TYPE" ]; then PROJECT_TYPE="web"; fi
echo "Project type: $PROJECT_TYPE"
```

**This value determines which verification and review steps to execute below.**

### 0. Verify TODO Current Status (Rejection Determination)

```
Check current TODO status and reject if any of the following apply:

- Only implementation TODOs are checked → Reject
- Verification TODOs (build/operation check) are unchecked → Reject
- Evidence collection TODOs are unchecked → Reject

On rejection, display:
"Implementation alone is not completion. Execute build → operation verification → evidence collection."
```

### 1. Execute Build
   - Verify no errors with `npm run build` / `pnpm build` etc.
   - Check for type errors, lint errors

### 2. Start Development Server / Prepare Runtime (project-type-aware)

| Project Type | Action |
|-------------|--------|
| **web** | Start frontend dev server (`npm run dev` / `pnpm dev` / etc.) |
| **fullstack** | Start both frontend dev server AND backend API server |
| **backend** | Start API server OR run test suite directly (no browser needed) |
| **mobile** | Ensure simulator/device is running and app is built (`npx expo start`, `flutter run`, etc.) |

### 3. Operation Verification (branch by project type)

| Project Type | Verification Method |
|-------------|---------------------|
| **web** | Use `webapp-testing` skill - Playwright browser operation and screenshots |
| **backend** | Use `backend-testing` skill - Run test framework (jest/vitest/pytest/go test/cargo test), NO curl, NO manual API calls |
| **mobile** | Use `mobile-testing` skill - Maestro MCP for E2E flows, `take_screenshot` for evidence |
| **fullstack** | Use BOTH `webapp-testing` (frontend) AND `backend-testing` (backend API tests) |

### 3.5. E2E Test Verification BEFORE Screenshots (CRITICAL)

**スクショ・動画を撮影する前に、以下を必ず確認する：**

```
┌─────────────────────────────────────────────────────────────────┐
│  E2E Test Pre-Screenshot Checklist                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  □ ユーザーの修正依頼を直接確認できるE2Eテストになっているか？  │
│    → 依頼内容がアサートされていないならテストを修正する         │
│    → コード修正だけでスクショを撮っても意味がない              │
│                                                                 │
│  □ UI操作をせずAPIを直接呼ぶだけでPassするテストはないか？      │
│    → fetch()やaxiosでデータ作成していないか                    │
│    → 本来UIフォームを経由すべき操作を省略していないか          │
│                                                                 │
│  □ レコード変化のアサーションがあるか？                         │
│    → UIチェックだけでなくDB/データの状態変化も検証             │
│                                                                 │
│  上記を満たさないE2Eで撮影したスクショ・動画は即リジェクト      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**なぜこれが重要か：**
- コードを修正しただけでE2Eを回すと「何も変わっていない」スクショが撮れる
- ユーザーは変化を確認できず、無駄なレビューサイクルが発生する
- E2Eテスト自体が依頼内容を検証していないと、バグを見逃す

### 3.6. Backend Test Pre-Evidence Checklist (for backend / fullstack)

```
┌─────────────────────────────────────────────────────────────────┐
│  Backend Test Pre-Evidence Checklist                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  □ テストがユーザーの修正依頼を直接検証しているか？             │
│    → 依頼内容がアサートされていないならテストを追加する         │
│                                                                 │
│  □ curl や手動APIコールではなくテストフレームワークを使用か？   │
│    → jest/vitest/pytest/go test/cargo test を使うこと           │
│    → curl でのAPI確認は禁止                                     │
│                                                                 │
│  □ モック・スタブを使用していないか？                           │
│    → 実際のDB（エミュレータ可）に対してテストすること           │
│    → DI経由のローカルエミュレータは許可                         │
│                                                                 │
│  □ カバレッジレポートを生成しているか？                         │
│    → テスト実行時に --coverage フラグを付与                     │
│                                                                 │
│  上記を満たさないテストで撮影したエビデンスは即リジェクト        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.7. Mobile Test Pre-Evidence Checklist (for mobile)

```
┌─────────────────────────────────────────────────────────────────┐
│  Mobile Test Pre-Evidence Checklist                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  □ Maestro E2Eフローがユーザーの依頼内容を検証しているか？      │
│    → ユーザーが求めた動作がフロー内でアサートされていること     │
│                                                                 │
│  □ アサーション（assertVisible, assertText等）が含まれているか？│
│    → タップだけでアサーションなしのフローは無効                 │
│                                                                 │
│  □ スクリーンショットが各ステップで撮影されているか？           │
│    → Maestro MCP take_screenshot を使用                         │
│    → 操作前/操作後の比較ができること                            │
│                                                                 │
│  □ 対象の画面サイズ・デバイスで実行しているか？                 │
│    → シミュレータ/実機が正しく設定されていること               │
│                                                                 │
│  上記を満たさないフローで撮影したスクショは即リジェクト          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Comprehensive Review (3 Integrated Review Agents in Parallel)

**Launch all 3 review agents simultaneously with Task tool:**

```
Launch review agents simultaneously with Task tool (selection depends on PROJECT_TYPE):

1. subagent_type: "reviw-plugin:review-code-security"
   → Applies to: ALL project types
   → Type safety (any type detection)
   → Error handling adequacy
   → DRY principle violations
   → XSS, injection, OWASP Top 10
   → Hardcoded secrets, auth issues
   → Append "Code & Security Review" section to REPORT.md

2. subagent_type: "reviw-plugin:review-e2e"
   → Applies to: ALL project types (adapted per type)
   → Web/Fullstack: goto restrictions, UI flow fidelity, Playwright assertions
   → Backend: test framework assertions, no curl, API contract verification
   → Mobile: Maestro flow assertions, screen state verification
   → Mock/stub detection (ALL mocks prohibited)
   → DI (Dependency Injection) adequacy
   → Record change assertions
   → Wait strategy verification (no fixed sleeps)
   → Hardcoded values/environment locks
   → Append "E2E Test Review" section to REPORT.md

3. subagent_type: "reviw-plugin:review-ui-ux"
   → Applies to: web, mobile (if UI changes), fullstack (if frontend changes)
   → SKIP for: backend (no UI to review)
   → WCAG 2.2 AA compliance
   → Keyboard navigation, focus management
   → Design token compliance
   → Text/copy consistency
   → i18n coverage (if applicable)
   → Append "UI/UX Review" section to REPORT.md
```

**Project Type → Review Agent Matrix:**

| Review Agent | web | backend | mobile | fullstack |
|-------------|-----|---------|--------|-----------|
| review-code-security | YES | YES | YES | YES |
| review-e2e | YES | YES (test suite) | YES (Maestro) | YES (both) |
| review-ui-ux | YES | SKIP | YES (if UI changes) | YES (frontend only) |

**Important: Execute applicable agents in a single Task tool call for parallel execution.**

**Agent name mapping (for reference):**
| Old name (deprecated) | New integrated agent |
|-----------------------|----------------------|
| review-code-quality | reviw-plugin:review-code-security |
| review-security | reviw-plugin:review-code-security |
| review-a11y-ux | reviw-plugin:review-ui-ux |
| review-figma-fidelity | reviw-plugin:review-ui-ux |
| review-copy-consistency | reviw-plugin:review-ui-ux |
| review-e2e-integrity | reviw-plugin:review-e2e |
| e2e-health-reviewer | reviw-plugin:review-e2e |

### 5. Review Agent Findings Check (CRITICAL - Do NOT Skip)

**After review agents complete, check their findings BEFORE creating the report:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Review Agent Findings → Decision Gate                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Read REPORT.md sections added by review agents:                │
│    - Code & Security Review                                     │
│    - E2E Test Review                                            │
│    - UI/UX Review (if applicable)                               │
│                                                                 │
│  Check for Critical/High severity issues:                       │
│    YES → STOP. Fix issues first. Return to Step 1.              │
│    NO  → Proceed to Step 6 (Report Creation)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**If Critical/High issues found:**
1. Register ALL findings in TodoWrite (detailed, no summarization)
2. Fix each issue
3. Re-run build/verification
4. Re-run review agents (return to Step 4)
5. Only proceed when no Critical/High issues remain

**This is NOT optional. Proceeding with Critical/High issues will result in rejection.**

### 6. Report Creation/Evidence Organization

**Only after review agents pass (no Critical/High issues), launch report-builder:**

```
Launch ONE agent with Task tool:

subagent_type: "reviw-plugin:report-builder"
   → artifact-proof skill auto-loads
   → Calculate total review score (X/15 for 3 agents)
   → Organize priority action items
   → Execute report creation/evidence organization
   → Ready to start reviw review
```

### 6.5. Report Validation (artifact-proof 5 Rules Check)

**After report-builder completes, validate REPORT.md against artifact-proof rules:**

```
Launch ONE agent with Task tool:

subagent_type: "reviw-plugin:report-validator"
prompt: |
  .artifacts/ 配下のREPORT.mdを検証してください。
  artifact-proofスキルの5ルールに準拠しているか確認し、
  違反があれば具体的な修正方法を提示してください。
```

**5 Rules Checklist:**

| # | Rule | Check |
|---|------|-------|
| 1 | 言語ポリシー | ユーザーの依頼言語と一致しているか |
| 2 | メディアフォーマット | `![]()` 構文 + テーブル配置（縦積み禁止） |
| 3 | 優先順位 | 📌 Attention Required → 📋 Previous Feedback の順序 |
| 4 | フィードバック累積 | 原文記録 + `<details>` タグ + 累積形式 |
| 5 | TodoList連携 | User Request ⇄ Response セクションの存在 |

**Validation Result Actions:**

| Result | Action |
|--------|--------|
| 5/5 Pass | ✅ Proceed to Step 7 (reviw review) |
| 3-4/5 Pass | ⚠️ Warning displayed, recommend fixes before proceeding |
| 0-2/5 Pass | ❌ Return to Step 6, request report-builder to fix violations |

### 7. Start reviw Review

**Important: Launch reviw in foreground**

```bash
# Open video file first (if exists)
open .artifacts/<feature=branch_name>/demo.mp4

# Open report with reviw (foreground)
npx reviw .artifacts/<feature=branch_name>/REPORT.md
```

When reviw review starts:
1. Browser opens, report is displayed
2. User adds comments and Submit & Exit
3. Feedback returns in YAML format
4. Register feedback in TodoWrite and respond

**Reason for foreground launch:**
- To receive user review comments
- Feedback won't be conveyed in background

### 8. User Feedback Response (Improvement Cycle)

After receiving user feedback from reviw:

```
┌─────────────────────────────────────────────────────────────────┐
│  Feedback Response Cycle                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Parse YAML feedback                                         │
│  2. Register EACH comment in TodoWrite                          │
│     - DO NOT summarize - copy exact text                        │
│     - Include file:line references                              │
│                                                                 │
│  3. Fix issues one by one                                       │
│     - Mark TODO complete after each fix                         │
│                                                                 │
│  4. After ALL fixes complete:                                   │
│     - Re-run build                                              │
│     - Re-collect evidence (webapp-testing)                      │
│     - Update REPORT.md with new evidence                        │
│                                                                 │
│  5. Return to Step 6 (Start reviw Review again)                 │
│     - User will verify fixes                                    │
│     - Repeat until approval                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**NEVER do this:**
- ❌ Write REPORT.md and declare "done" without fixing
- ❌ Skip re-verification after fixes
- ❌ Summarize feedback (copy exact text)
- ❌ Batch multiple fixes without individual TODO tracking

## reviw Usage Tips

```bash
# Open Markdown
npx reviw report.md

# Open multiple files
npx reviw file1.md file2.csv

# Open git diff
git diff HEAD | npx reviw

# Specify port
npx reviw report.md --port 5000
```

## TodoList Management (CRITICAL)

When the user adds new requests/tasks during the session:
1. **IMMEDIATELY add them to TodoList** - do not delay
2. TodoList is the contract with the user - never skip this step
3. Update todo status in real-time as you work
4. Mark tasks complete ONLY after user approval

## Prohibited Actions

- Reporting only "Implementation complete!"
- Completion declaration without operation verification
- "It works" report without evidence
- Omitting verification via mock/skip/bypass
- **Checking TODO just for implementing**
- **Launching reviw in background**
- **Ignoring new user requests without adding to TodoList**

## Report Template

```
## Implementation Details
- [What was implemented]

## TODO Completion Status (Handoff from /do)
- [x] Implementation: [specific details]
- [x] Build: Success
- [x] Operation verification: Verified with webapp-testing
- [x] Evidence: Collected with artifact-proof

## Verification Results
- Build: [success/failure]
- Operation verification: [success/failure]
- Evidence: [screenshot/video path]

## Confirmation Items
[If there's anything for user to confirm, describe here]
```

---

**Until this checklist is satisfied, it cannot be called task complete.**
**If completion is claimed with only implementation, immediately reject.**
**Task completion only occurs after receiving reviw review.**
