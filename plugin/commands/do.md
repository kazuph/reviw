---
description: Task Start - worktree creation, planning, and review preparation in reviw
argument-hint: <task description>
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite
---

# Task Start Command

Receive requests for tasks to be done, set up the work environment, and create a plan.

## Important: Subagents Required

**To prevent context exhaustion, the following tasks MUST be executed by subagents (Task tool):**

| Task | Reason | Subagent |
|------|------|-----------------|
| webapp-testing | Context explosion from screenshot Read | `subagent_type: "general-purpose"` |
| artifact-proof | Exhaustion from image/video processing | `subagent_type: "general-purpose"` |
| E2E test execution | Context consumption from long logs | `subagent_type: "general-purpose"` |

```
When webapp-testing is executed directly in the main thread:
   → Read screenshots → Context exhaustion → compact triggered
   → Forgets /done content → Reports "Implementation complete!"
   → Rejection → Infinite loop
```

**Correct approach:**
```
Launch subagent with Task tool
→ Execute webapp-testing within subagent
→ Subagent summarizes results and returns
→ Main thread context is preserved
```

## Arguments

$ARGUMENTS = Request text for what to do, specification explanation, etc.

## When Resuming a Task

**At session startup / after compact, check existing worktrees before creating new ones.**

```bash
# Check worktrees in progress
git worktree list

# Move to worktree
cd .worktree/<feature-name>

# Check progress
cat .artifacts/<feature-name>/REPORT.md
```

**Check TODOs in REPORT.md and resume work from incomplete items.**

### Report Location

```
.worktree/<feature-name>/.artifacts/<feature-name>/REPORT.md
```

※ `<feature-name>` = part after removing prefix from branch name (e.g., `feature/auth` → `auth`)

## Execution Steps (For New Tasks)

### 1. Work Environment Setup

First, verify that the current project is a git repository.

```bash
# Execute at project root
git rev-parse --show-toplevel
```

Next, create a worktree for the task. Branch name is automatically generated appropriately from the request content.

### worktree Naming Convention

| Type | Branch Name | Example |
|------|-----------|-----|
| New feature | `feature/<feature-name>` | `feature/auth`, `feature/events` |
| Bug fix | `fix/<content>` | `fix/login-error`, `fix/validation` |
| Refactoring | `refactor/<target>` | `refactor/api-client` |
| Documentation | `docs/<target>` | `docs/readme` |

```bash
# Create worktree (--from-current to branch from current branch)
git gtr new <branch-name> --from-current

# Get worktree path
WORKTREE_PATH="$(git gtr go <branch-name>)"

# Move to worktree
cd "$WORKTREE_PATH"
```

### 2. .gitignore Configuration

**Important:** Exclude `.worktree` and `.artifacts` from commit targets.

```bash
# Add to project root .gitignore (only if not already present)
if ! grep -q "^\.worktree$" .gitignore 2>/dev/null; then
  echo ".worktree" >> .gitignore
fi
if ! grep -q "^\.artifacts$" .gitignore 2>/dev/null; then
  echo ".artifacts" >> .gitignore
fi
```

**Reason:**
- `.worktree/` - Work directory is for local use only
- `.artifacts/` - Evidence (screenshots/videos) excluded to prevent repository bloat

**When you want to commit specific evidence:**

Even if included in `.gitignore`, you can explicitly add with `git add --force`:

```bash
# Force add specific files
git add --force .artifacts/<feature>/images/important-screenshot.png
git add --force .artifacts/<feature>/REPORT.md

# Use Git LFS for videos
git lfs track "*.mp4" "*.webm"
git add .gitattributes
git add --force .artifacts/<feature>/videos/demo.mp4
```

The recommended approach is to exclude by default and explicitly commit only what's needed.

### 3. Deliverables Directory Preparation

Create `.artifacts/<feature-name>/` directory within the worktree.

**Directory Structure:**
```
.worktree/<feature-name>/
└── .artifacts/
    └── <feature-name>/
        ├── REPORT.md     # Plan, progress, and evidence links
        ├── images/       # Screenshots
        └── videos/       # Video files
```

```bash
mkdir -p .artifacts/<feature-name>/{images,videos}
```

### 4. Planning (REPORT.md)

Create `.artifacts/<feature-name>/REPORT.md` and write the plan in the following format:

```markdown
# <Task Name>

Created: YYYY-MM-DD
Branch: <branch-name>
Status: In Progress

## Overview

<Summary of request content>

## Progress

| Date | Content | Status |
|------|------|------|
| YYYY-MM-DD | Planning | Completed |
| YYYY-MM-DD | API Implementation | In Progress |

## PLAN

### TODO

- [ ] <Specific task 1>
- [ ] <Specific task 2>
- [ ] <Specific task 3>
- [ ] Execute build and type check
- [ ] Start development server
- [ ] Verify operation with webapp-testing
- [ ] Collect evidence with artifact-proof
- [ ] Complete report with /done (review in reviw)

### Completion Criteria

- [ ] Implementation completed
- [ ] Build successful
- [ ] Operation verified
- [ ] Evidence (screenshots/videos) collected
- [ ] Reviewed in reviw

## Test Results

### Unit Tests
- `tests/unit/xxx.test.ts`: PASS/FAIL

### Integration Tests
- `tests/integration/xxx.test.ts`: PASS/FAIL

### E2E Tests
- `tests/e2e/xxx.spec.ts`: PASS/FAIL

## Technical Notes

<Add notes and observations during implementation>

## Evidence

<Add links to evidence collected with artifact-proof>
```

### 5. Reflection to TodoWrite

Reflect the above PLAN to the TodoWrite tool as well. This visualizes progress.

### 6. Parallel Implementation with Subagents

**After planning, implementation MUST be executed with subagents (Task tool).**

The main thread should focus on the director role and proceed with the following flow:

```
┌─────────────────────────────────────────────────────────────┐
│  Main Thread (Director)                                     │
│                                                             │
│  1. Planning completed                                      │
│  2. Classify tasks by dependencies                          │
│     ├─ Independent tasks → Launch subagents in parallel     │
│     └─ Dependent tasks → Launch after previous completion   │
│  3. Integrate results from each subagent                    │
│  4. Proceed to next phase                                   │
└─────────────────────────────────────────────────────────────┘
```

**Example of Parallel Execution:**

```
# Launch 3 independent component implementations in parallel
Task(subagent_type="webapp-master", prompt="Implement HeaderComponent...")
Task(subagent_type="webapp-master", prompt="Implement SidebarComponent...")
Task(subagent_type="webapp-master", prompt="Implement FooterComponent...")
```

**Subagent Selection Criteria:**

| Task Type | subagent_type | Notes |
|-----------|---------------|------|
| Web UI Implementation | `webapp-master` | General frontend |
| Expo/RN Implementation | `expo-app-maker` | Mobile apps |
| Code Investigation | `Explore` | Understanding existing code |
| Design Review | `Plan` | Architecture review |
| Operation Verification | `general-purpose` + webapp-testing skill | Verification phase |
| Evidence Collection | `general-purpose` + artifact-proof skill | Completion report preparation |

### 7. Confirm Action Guidelines Focused on Deliverables

**Display important notes:**

```
+---------------------------------------------------------------+
|  Task Start                                                   |
+---------------------------------------------------------------+
|                                                               |
|  Current location: $WORKTREE_PATH                             |
|  Branch: <branch-name>                                        |
|                                                               |
|  Implementation completion is only 1/3 of the work            |
|                                                               |
|  Completion criteria:                                         |
|    1/3: Implementation complete                               |
|    2/3: Build, start, and operation verification complete     |
|    3/3: Review in reviw → User approval                       |
|                                                               |
|  Tools to use:                                                |
|    - reviw: Browser-based review tool                         |
|    - webapp-testing: Browser operation and verification       |
|    - artifact-proof: Evidence collection                      |
|                                                               |
|  Execute /done when work is complete to start review          |
|                                                               |
+---------------------------------------------------------------+
```

## Prohibited Actions

- **Direct work on main branch prohibited** - Always create a worktree before starting work
- Starting implementation without a plan
- Working on main branch without creating a worktree
- Forgetting to collect evidence
- Reporting completion without executing /done
- Writing code directly in the main thread (causes context exhaustion)
- Only declaring "will implement" without launching subagents
- Executing parallelizable tasks sequentially (reduced efficiency)

## PR Creation Flow (Reference)

Follow the project's CLAUDE.md for PR creation target (develop / main).

```bash
# 1. After completing work in worktree
cd .worktree/<feature-name>

# 2. Commit (after executing /done)
git add .
git commit -m "feat: <content>"

# 3. Push
git push -u origin <branch-name>

# 4. Create PR (follow project settings)
gh pr create --base <target-branch> --head <branch-name>

# 5. After merge, remove worktree
cd ../..
git worktree remove .worktree/<feature-name>
```

**Note**: Some projects prohibit AI from creating PRs directly to main. Check the project's CLAUDE.md.

## Example

```
/do Add a login button that navigates to /login when clicked
```

This will:
1. Create a worktree with `feature/add-login-button` branch
2. Write the plan to `.worktree/add-login-button/.artifacts/add-login-button/REPORT.md`
3. Register TODOs in TodoWrite
4. Display deliverable-focused action guidelines
