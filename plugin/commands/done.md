---
description: Task completion check - Evidence collection, reviw review initiation
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite, Task
---

# Task Completion Checklist

When you think implementation is done, run this command to verify completion criteria are met.

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

### 4. Report Creation/Evidence Organization + E2E Health Review

**Use report-builder and e2e-health-reviewer agents in parallel:**

```
Launch TWO agents simultaneously with Task tool:

1. subagent_type: "report-builder"
   → artifact-proof skill auto-loads
   → Execute report creation/evidence organization
   → Ready to start reviw review

2. subagent_type: "e2e-health-reviewer"
   → Check goto restrictions
   → Verify record change assertions
   → Detect hardcoded values/environment locks
   → Detect unnecessary mocks/stubs
   → Output to E2E_HEALTH_REVIEW.md (separate file)
```

**Important: Execute both agents in a single Task tool call for parallel execution.**

### 5. Start reviw Review

**Important: Launch reviw in foreground**

```bash
# Open video file first (if exists)
open .artifacts/<feature>/demo.mp4

# Open both reports with reviw (foreground)
npx reviw .artifacts/<feature>/REPORT.md .artifacts/<feature>/E2E_HEALTH_REVIEW.md
```

When reviw review starts:
1. Browser opens, report is displayed
2. User adds comments and Submit & Exit
3. Feedback returns in YAML format
4. Register feedback in TodoWrite and respond

**Reason for foreground launch:**
- To receive user review comments
- Feedback won't be conveyed in background

### 6. Feedback Response

After receiving feedback:
1. **MUST register in TodoWrite before starting work**
2. Write TODO sentences in detail (no summarization)
3. After modification complete, evidence collection again → reviw review

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
