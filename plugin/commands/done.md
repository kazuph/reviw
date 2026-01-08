---
description: Task completion check - Evidence collection, reviw review initiation
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite, Task, AskUserQuestion
---

# Task Completion Checklist

When you think implementation is done, run this command to verify completion criteria are met.

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

Tasks started with `/do` have their PLAN recorded in `.artifacts/<feature>/REPORT.md`.
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

### 2. Start Development Server (for Web projects)
   - Actually start the server

### 3. Operation Verification
   - Use `webapp-testing` skill to actually operate in browser
   - Verify expected behavior

### 4. Comprehensive Review (3 Integrated Review Agents in Parallel)

**Launch all 3 review agents simultaneously with Task tool:**

```
Launch THREE agents simultaneously with Task tool:

1. subagent_type: "reviw-plugin:review-code-security"
   → Type safety (any type detection)
   → Error handling adequacy
   → DRY principle violations
   → XSS, injection, OWASP Top 10
   → Hardcoded secrets, auth issues
   → Append "Code & Security Review" section to REPORT.md

2. subagent_type: "reviw-plugin:review-e2e"
   → goto restrictions (only first "/" allowed)
   → Mock/stub detection (ALL mocks prohibited)
   → User flow reproduction fidelity
   → DI (Dependency Injection) adequacy
   → Record change assertions
   → Wait strategy verification (no fixed sleeps)
   → Hardcoded values/environment locks
   → Append "E2E Test Review" section to REPORT.md

3. subagent_type: "reviw-plugin:review-ui-ux"
   → WCAG 2.2 AA compliance
   → Keyboard navigation, focus management
   → Design token compliance
   → Text/copy consistency
   → i18n coverage (if applicable)
   → Append "UI/UX Review" section to REPORT.md
   → **Note: Only execute if UI changes are included**
```

**Important: Execute all 3 agents in a single Task tool call for parallel execution.**

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

### 7. Start reviw Review

**Important: Launch reviw in foreground**

```bash
# Open video file first (if exists)
open .artifacts/<feature>/demo.mp4

# Open report with reviw (foreground)
npx reviw .artifacts/<feature>/REPORT.md
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

## Prohibited Actions

- Reporting only "Implementation complete!"
- Completion declaration without operation verification
- "It works" report without evidence
- Omitting verification via mock/skip/bypass
- **Checking TODO just for implementing**
- **Launching reviw in background**

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
