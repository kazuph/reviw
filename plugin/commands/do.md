---
description: Task Start - worktree creation, planning, and review preparation in reviw
argument-hint: <task description>
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, TodoWrite, Task, AskUserQuestion
---

# Task Start Command

Receive requests for tasks to be done, set up the work environment, and create a plan.

**Role: You are the Project Manager (PM) interviewing the Product Owner (user).**

## Phase 0: Interactive Discovery (REQUIRED)

Before any implementation, conduct a structured interview with the user to fully understand requirements.

### Step 0-1: Development Approach Question

**Use AskUserQuestion tool** to ask about development approach:

```
Question: "How would you like to organize this work?"
Header: "Approach"
Options:
  1. "Use worktree (Recommended)" - Create isolated branch in separate directory using gwq. Clean separation, easy cleanup.
  2. "Work in current branch" - Make changes directly in current branch. Simpler for small changes.
  3. "Create new branch only" - Create branch but work in main directory. Middle ground.
```

### Step 0-1.5: Tool Installation Check (If worktree selected)

**If user selects worktree approach, check required tools:**

```bash
# Check if gwq is installed
which gwq
# Check if direnv is installed
which direnv
# Check if dotenvx is installed
which dotenvx || npx @dotenvx/dotenvx --version
```

**If gwq is not installed, display error and require installation:**

```
gwq is required for worktree management. Please install it:

  go install github.com/d-kuro/gwq@latest

  Or download from https://github.com/d-kuro/gwq/releases

After installation, configure ~/.config/gwq/config.toml
```

**Do NOT proceed with standard git worktree as fallback. gwq is mandatory.**

**Recommended Tool Stack:**

| Tool | Purpose | Install |
|------|---------|---------|
| **gwq** | Git worktree manager with fuzzy finder | `go install github.com/d-kuro/gwq@latest` or download from [releases](https://github.com/d-kuro/gwq/releases) |
| **direnv** | Auto-load environment variables per directory | `brew install direnv` |
| **dotenvx** | Encrypted .env file management | `npm install -g @dotenvx/dotenvx` |

**Why this stack:**
- **gwq**: Manages worktrees with auto `npm install`, fuzzy finder for switching. Uses global basedir (e.g., `~/src`) with ghq-compatible directory structure.
- **direnv**: Parent directory `.envrc` is inherited by child directories. With gwq, place `.envrc` at Owner level (`~/src/github.com/owner/.envrc`).
- **dotenvx**: `.env` is encrypted and committed to git, decrypted only in memory at runtime
- **Combined**: `.envrc` with `DOTENV_PRIVATE_KEY` auto-decrypts `.env` in all worktrees (no file copying needed)

### Step 0-2: Specification Deep-Dive (PM Interview)

**As Project Manager, drill down into specifications with multiple rounds of questions.**

```
┌─────────────────────────────────────────────────────────────────┐
│  PM Interview Protocol (Iterative Questioning)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Round 1: User Story & Scope                                    │
│    - What problem does this solve?                              │
│    - Who is the target user?                                    │
│    - What is the expected outcome?                              │
│    - What is NOT in scope?                                      │
│                                                                 │
│  Round 2: Functional Requirements (based on Round 1)            │
│    - What are the specific actions users will take?             │
│    - What data inputs/outputs are needed?                       │
│    - What are the edge cases?                                   │
│    - What validation rules apply?                               │
│                                                                 │
│  Round 3: Technical Constraints (based on Round 1-2)            │
│    - Are there performance requirements?                        │
│    - Are there existing patterns to follow?                     │
│    - What dependencies are involved?                            │
│    - Are there security considerations?                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Use AskUserQuestion tool iteratively:**

1. First, ask 2-3 questions about user story and scope
2. Based on answers, formulate 2-3 follow-up questions about functional details
3. Based on answers, ask about technical constraints and preferences
4. Summarize understanding and confirm before proceeding

**Example question flow:**

```
Round 1 Example:
Q1: "What specific problem are you trying to solve?"
Q2: "Who will use this feature and in what context?"
Q3: "What does success look like for this feature?"

Round 2 Example (based on Round 1 answers):
Q4: "You mentioned X - what happens when Y?"
Q5: "Should the system handle Z case?"
Q6: "What error messages should users see?"

Round 3 Example (based on Round 1-2 answers):
Q7: "Should we follow the existing pattern in [file] or try something different?"
Q8: "Given the requirements, I see two approaches: A or B. Which do you prefer?"
```

### Step 0-3: Architecture & Implementation Approach

**After understanding requirements, propose implementation approach and confirm:**

```
Use AskUserQuestion to present options:

Question: "Based on our discussion, here are the implementation approaches:"
Header: "Architecture"
Options:
  1. "[Approach A]" - [Brief explanation with trade-offs]
  2. "[Approach B]" - [Brief explanation with trade-offs]
  3. "Let me explain more" - Need more context before deciding
```

**Only proceed to implementation after user confirms approach.**

### Step 0-4: Record Q&A in REPORT.md (REQUIRED)

**All questions asked and answers received MUST be recorded in REPORT.md.**

After completing the interview, add the following section to REPORT.md:

```markdown
## Requirements Discovery (Q&A Log)

### Development Approach
- **Q**: How would you like to organize this work?
- **A**: [User's answer]

### User Story & Scope
- **Q**: [Question 1]
- **A**: [Answer 1]

- **Q**: [Question 2]
- **A**: [Answer 2]

### Functional Requirements
- **Q**: [Question 3]
- **A**: [Answer 3]

### Architecture Decision
- **Q**: [Implementation approach question]
- **A**: [User's choice and reasoning]

### Key Decisions Summary
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Development approach | worktree / current branch | [reason] |
| Architecture | [chosen approach] | [reason] |
| [Other key decision] | [choice] | [reason] |
```

**Why this matters:**
- Preserves context for future sessions (after compact)
- Documents requirements for review
- Enables traceability of decisions
- Helps when resuming work

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
# Or use gwq for fuzzy finding
gwq list

# Move to worktree (gwq shows the full path)
cd <worktree-path>

# Check progress
cat .artifacts/<feature-name>/REPORT.md
```

**Check TODOs in REPORT.md and resume work from incomplete items.**

### Report Location

```
<worktree>/.artifacts/<feature-name>/REPORT.md
```

- `<worktree>` = Directory created by gwq (e.g., `~/src/github.com/owner/myrepo-feature-auth/`)
- `<feature-name>` = part after removing prefix from branch name (e.g., `feature/auth` → `auth`)

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
# Create worktree with gwq (required)
gwq add -b <branch-name>

# gwq automatically:
# - Creates worktree in basedir (e.g., ~/src/github.com/owner/myrepo-feature-auth/)
# - Runs setup_commands (npm install, etc.)

# Move to worktree (gwq shows the path after creation)
cd <worktree-path>
```

**gwq Configuration (~/.config/gwq/config.toml):**

> **Note:** gwqは**グローバルなbasedir**を前提とした設計です。プロジェクトローカルな`.worktree/`配置はサポートされていません。

```toml
[worktree]
# グローバルなbasedirを指定（環境に合わせて変更）
# デフォルト: ~/worktrees
# ghq連携: ghqのrootと同じディレクトリ（例: ~/src, ~/ghq, ~/code）
basedir = "~/worktrees"
auto_mkdir = true

[naming]
# ディレクトリ構造のテンプレート
# ghq連携時は {{.Repository}}-{{.Branch}} でリポジトリと同階層に配置
template = "{{.Host}}/{{.Owner}}/{{.Repository}}-{{.Branch}}"

[naming.sanitize_chars]
"/" = "-"
":" = "-"

[[repository_settings]]
repository = "*"
copy_files = []  # direnvで環境変数を継承するのでコピー不要
setup_commands = ["npm install || pnpm install || yarn install || true"]
```

**ghq連携パターン（ghqユーザーは推奨）:**

ghqを使っている場合、**basedirをghqのrootと同じにすることを推奨**します。理由：
- 同じOwner配下に並ぶのでdirenvの`.envrc`が自動継承される
- `ls`で見たときに関連リポジトリ（メイン＋worktree）が一目瞭然
- ghqとgwqが同じディレクトリ構造で動く

```
# ghqのroot確認
git config --get ghq.root  # 例: ~/src

# gwqのbasedirをghqと同じに設定
basedir = "~/src"  # ghqのrootに合わせる
```

この場合のディレクトリ構造：
```
~/src/github.com/owner/       # または ~/ghq/github.com/owner/ など
├── .envrc                    ← Ownerレベルで環境変数設定（direnv）
├── myrepo/                   ← ghqで管理（メインリポジトリ）
├── myrepo-feature-auth/      ← gwqで作成（worktree）
└── myrepo-fix-bug/           ← gwqで作成（worktree）
```

direnvは親ディレクトリの`.envrc`を継承するため、Ownerレベルに環境変数を設定しておけば、ghqで管理するリポジトリもgwqで作成するworktreeも、同じ環境変数が自動適用されます。

### 2. .gitignore Configuration

**Important:** Exclude `.artifacts` and `.envrc` from commit targets.

```bash
# Add to project root .gitignore (only if not already present)
for pattern in ".artifacts" ".envrc"; do
  if ! grep -q "^\\$pattern\$" .gitignore 2>/dev/null; then
    echo "$pattern" >> .gitignore
  fi
done
```

**Reason:**
- `.artifacts/` - Evidence (screenshots/videos) excluded to prevent repository bloat
- `.envrc` - Contains `DOTENV_PRIVATE_KEY` for decryption

### 2.5. Environment Setup (direnv + dotenvx)

**Recommended: Set up encrypted environment variables**

```bash
# 1. Initialize dotenvx encryption (if .env exists and not yet encrypted)
dotenvx encrypt
# This generates .env.keys with DOTENV_PRIVATE_KEY

# 2. Create .envrc with the key from .env.keys, then delete .env.keys
cat > .envrc << 'EOF'
# Decrypt .env at runtime (file stays encrypted on disk)
export DOTENV_PRIVATE_KEY="<copy-key-from-.env.keys-then-delete-file>"
eval "$(dotenvx decrypt --stdout --format shell 2>/dev/null)" || dotenv_if_exists
EOF

# 3. Delete .env.keys (no longer needed - key is in .envrc)
rm .env.keys

# 4. Allow direnv
direnv allow
```

**How it works with gwq worktrees:**

```
~/src/github.com/owner/       # Owner level (ghq root)
├── .envrc                    # DOTENV_PRIVATE_KEY (shared by all repos)
├── myrepo/                   # Main repository
│   └── .env                  # Encrypted (git commit OK)
└── myrepo-feature-auth/      # Worktree created by gwq
    └── .env                  # ← Auto-decrypted via parent .envrc
```

- `.env` is always encrypted on disk, decrypted only in memory at runtime
- direnv automatically inherits `.envrc` from parent directories
- gwq worktrees get environment variables without copying any files
- To add/modify env vars: use `dotenvx set KEY="value"` (auto re-encrypts)

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
<worktree>/                   # e.g., ~/src/github.com/owner/myrepo-feature-auth/
└── .artifacts/
    └── <feature-name>/       # e.g., auth (from feature/auth)
        ├── REPORT.md         # Plan, progress, and evidence links
        ├── images/           # Screenshots
        └── videos/           # Video files
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

## E2E Test Policy (CRITICAL - Read Before Implementation)

**E2E tests will be strictly reviewed by the review-e2e agent at /done. Implementing without understanding these rules will result in rejection and rework.**

### Absolute Prohibitions

| Category | Prohibited | Reason |
|----------|-----------|--------|
| **Mocks** | `jest.fn`, `vi.fn`, `sinon.*`, `mock`, `Mock` | Fake behavior hides real bugs |
| **Network intercepts** | `route.fulfill`, `page.route`, `nock`, `msw` | Must test real API |
| **Time mocks** | `useFakeTimers`, `clock.*`, `setSystemTime` | Must test real timing |
| **DB mocks** | `mockPrisma`, `mockFirestore`, `mockDatabase` | Must use real emulator |
| **Auth shortcuts** | `loginAs`, `signInAs`, `setAuthToken`, `setSession` | Must go through UI |
| **Direct API calls** | `fetch()`, `axios.*` in tests (except setup) | UI operations only |
| **localStorage/sessionStorage direct manipulation** | `localStorage.setItem` in tests | Must use UI |

### goto Restrictions

```
✅ Allowed:
   - page.goto('/') or page.goto(baseUrl)  // First navigation only
   - page.goto('http://localhost:9099')     // Emulator switch (Firebase etc.)
   - page.goto(process.env.MAILPIT_URL)     // Emulator switch

❌ Prohibited:
   - page.goto('/dashboard')  // After initial navigation - use UI clicks
   - page.goto('/settings')   // After initial navigation - use UI clicks
```

### Required Patterns

| Pattern | Requirement |
|---------|-------------|
| **Navigation** | After first goto, ALL navigation must be via UI clicks |
| **Authentication** | Must go through actual login form (UI flow) |
| **Data creation** | Use seed data or create via UI operations |
| **Waiting** | Use element/state-based waits, NOT `sleep` or `waitForTimeout` |
| **Assertions** | Include DB/record change assertions, not just UI checks |

### Dependency Injection (DI)

```
✅ Correct DI:
   - Firebase Emulator (localhost:9099)
   - Mailpit (localhost:8025)
   - Environment variable switching

❌ Wrong approach:
   - Mocking Firebase in code
   - Stubbing email sending
   - In-memory database replacement
```

### Example: Good vs Bad E2E Test

```typescript
// ❌ BAD - Will be rejected at review
test('user can view dashboard', async () => {
  await page.goto('/dashboard');  // NG: Direct navigation
  localStorage.setItem('token', 'fake-token');  // NG: Auth shortcut
  await expect(page.locator('.dashboard')).toBeVisible();
});

// ✅ GOOD - Will pass review
test('user can view dashboard', async () => {
  await page.goto('/');  // OK: Initial navigation
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');  // OK: UI flow
  await expect(page.locator('.dashboard')).toBeVisible();

  // Assert DB state changed
  const user = await db.query('SELECT * FROM users WHERE email = ?', ['test@example.com']);
  expect(user.last_login).toBeTruthy();
});
```

**Understanding this policy before writing E2E tests prevents 90% of rejections at review.**

## Prohibited Actions

- **Direct work on main branch prohibited** - Always create a worktree before starting work
- Starting implementation without a plan
- Working on main branch without creating a worktree
- Forgetting to collect evidence
- Reporting completion without executing /done
- Writing code directly in the main thread (causes context exhaustion)
- Only declaring "will implement" without launching subagents
- Executing parallelizable tasks sequentially (reduced efficiency)
- **Writing E2E tests without reading the E2E Test Policy above**
- **Using mocks, stubs, or shortcuts in E2E tests**

## PR Creation Flow (Reference)

Follow the project's CLAUDE.md for PR creation target (develop / main).

```bash
# 1. After completing work in worktree
cd <worktree-path>  # gwq shows the path

# 2. Commit (after executing /done)
git add .
git commit -m "feat: <content>"

# 3. Push
git push -u origin <branch-name>

# 4. Create PR (follow project settings)
gh pr create --base <target-branch> --head <branch-name>

# 5. After merge, remove worktree
gwq remove <branch-name>
# Or: git worktree remove <worktree-path>
```

**Note**: Some projects prohibit AI from creating PRs directly to main. Check the project's CLAUDE.md.

## Example

```
/do Add a login button that navigates to /login when clicked
```

This will:
1. Create a worktree with `feature/add-login-button` branch using gwq
2. Write the plan to `<worktree>/.artifacts/add-login-button/REPORT.md`
3. Register TODOs in TodoWrite
4. Display deliverable-focused action guidelines
