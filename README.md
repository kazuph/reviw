<p align="center">
  <img src="https://raw.githubusercontent.com/kazuph/reviw/main/assets/logo.svg" alt="reviw - Human-in-the-loop Review" width="600">
</p>

<p align="center">
  <strong>Human-in-the-loop review interface for AI coding workflows</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/reviw"><img src="https://img.shields.io/npm/v/reviw.svg" alt="npm version"></a>
  <a href="https://github.com/kazuph/reviw/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/reviw.svg" alt="license"></a>
  <a href="./README.ja.md">日本語</a>
</p>

---

> [!WARNING]
> **Alpha Software**: This project is in active development. Expect breaking changes, API instability, and incomplete features. Use at your own risk in production environments.

---

# reviw

A lightweight browser-based tool for reviewing and annotating tabular data, text, Markdown, and diff files. Supports CSV, TSV, plain text, Markdown, and unified diff formats. Comments are output as YAML to stdout.

## Features

### File Format Support
- **CSV/TSV**: View tabular data with sticky headers, column freezing, filtering, and column resizing
- **Markdown**: Side-by-side preview with synchronized scrolling, click-to-comment from preview
- **Diff/Patch**: GitHub-style diff view with syntax highlighting, collapsible large files (500+ lines), and binary files sorted to end
- **Text**: Line-by-line commenting for plain text files

### Mermaid.js Diagrams
- Auto-detect and render Mermaid diagrams in Markdown files
- Click any diagram to open fullscreen viewer
- Zoom with mouse wheel (centered on cursor position, up to 10x)
- Pan with mouse drag
- Syntax error display in toast notifications

### Media Fullscreen
- Click images in Markdown preview to open fullscreen viewer
- Click videos to open fullscreen playback with native controls
- Click anywhere (including the image/video itself) to close the fullscreen overlay
- Clicking media automatically highlights the corresponding source line in the Markdown panel

### UI Features
- **Theme toggle**: Switch between light and dark modes
- **Multi-file support**: Open multiple files simultaneously on separate ports
- **Drag selection**: Select rectangular regions or multiple rows for batch comments
- **Real-time updates**: Hot reload on file changes via SSE
- **Comment persistence**: Auto-save comments to localStorage with recovery modal
- **Keyboard shortcuts**: Cmd/Ctrl+Enter to open submit modal
- **Multi-tab sync**: Submit from any tab closes all tabs for the same file
- **Server detection**: Reuse existing server instead of starting a new one (via lock files)
- **Tab activation (macOS)**: Automatically activates existing browser tab via AppleScript

### Output
- YAML format with file, mode, row, col, value, and comment text
- Overall summary field for review notes

## Installation

```bash
npm install -g reviw
```

Or run directly with npx:

```bash
npx reviw <file>
```

## Usage

```bash
# Single file
reviw <file> [--port 4989] [--encoding utf8|shift_jis|...]

# Multiple files (each opens on consecutive ports)
reviw file1.csv file2.md file3.tsv --port 4989

# Diff from stdin
git diff HEAD | reviw

# Diff file
reviw changes.diff
```

### Options
- `--port <number>`: Specify starting port (default: 4989)
- `--encoding <encoding>`: Force specific encoding (auto-detected by default)
- `--no-open`: Prevent automatic browser opening
- `--help, -h`: Show help message
- `--version, -v`: Show version number

### Workflow
1. Browser opens automatically (macOS: `open` / Linux: `xdg-open` / Windows: `start`)
2. Click cells/lines to add comments, or drag to select multiple
3. Use Cmd/Ctrl+Enter or click "Submit & Exit" to output comments
4. Comments are printed as YAML to stdout

## Screenshots

### CSV View
![CSV View](https://raw.githubusercontent.com/kazuph/reviw/main/assets/screenshot-csv.png)

### Markdown View
![Markdown View](https://raw.githubusercontent.com/kazuph/reviw/main/assets/screenshot-md.png)

### Diff View
![Diff View](https://raw.githubusercontent.com/kazuph/reviw/main/assets/screenshot-diff.png)

### Mermaid Fullscreen
![Mermaid Fullscreen](https://raw.githubusercontent.com/kazuph/reviw/main/assets/screenshot-mermaid.png)

### Submit Review Dialog
![Submit Review Dialog](https://raw.githubusercontent.com/kazuph/reviw/main/assets/screenshot-submit-dialog.png)

## Output Example

```yaml
file: data.csv
mode: csv
reason: button
at: '2025-11-26T12:00:00.000Z'
comments:
  - row: 2
    col: 3
    text: This value needs review
    value: '150'
summary: Overall the data looks good, minor issues noted above.
```

## Claude Code Plugin

This repository also serves as a Claude Code plugin marketplace. The plugin integrates reviw into Claude Code workflows with task management and review automation.

### Installation

```bash
# In Claude Code
/plugin marketplace add kazuph/reviw
/plugin install reviw-plugin@reviw-marketplace
```

### Plugin Directory Structure

```
plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata (name, version, description)
├── commands/
│   ├── do.md                 # /reviw:do command definition
│   └── done.md               # /reviw:done command definition
├── agents/
│   ├── report-builder.md     # Report generation agent
│   ├── e2e-health-reviewer.md    # E2E test health check
│   ├── review-code-quality.md    # Code quality review
│   ├── review-security.md        # Security audit
│   ├── review-a11y-ux.md         # Accessibility & UX
│   ├── review-figma-fidelity.md  # Design fidelity
│   ├── review-copy-consistency.md # Text consistency
│   └── review-e2e-integrity.md   # E2E test integrity
├── skills/
│   ├── artifact-proof/
│   │   └── SKILL.md          # Evidence collection skill
│   └── webapp-testing/
│       ├── SKILL.md          # Web testing skill
│       ├── scripts/          # Helper scripts
│       └── examples/         # Usage examples
├── hooks/
│   └── hooks.json            # Hook definitions
├── hooks-handlers/
│   └── completion-checklist.sh  # UserPromptSubmit handler
└── README.md
```

### Components Overview

| Type | Name | Description |
|------|------|-------------|
| **Command** | `/reviw:do` | Start a task - create worktree with gwq, plan, register todos |
| **Command** | `/reviw:done` | Complete checklist - run 7 review agents, collect evidence, start review |
| **Agent** | `report-builder` | Prepare reports and evidence for user review |
| **Agent** | `review-code-quality` | Code quality: readability, DRY, type safety, error handling |
| **Agent** | `review-security` | Security: XSS, injection, OWASP Top 10, secrets detection |
| **Agent** | `review-a11y-ux` | Accessibility: WCAG 2.2 AA, keyboard nav, UX flow |
| **Agent** | `review-figma-fidelity` | Design: token compliance, visual consistency |
| **Agent** | `review-copy-consistency` | Copy: text consistency, tone & manner, i18n |
| **Agent** | `review-e2e-integrity` | E2E: user flow reproduction, mock contamination |
| **Agent** | `e2e-health-reviewer` | E2E: goto restrictions, record assertions, hardcoding |
| **Skill** | `artifact-proof` | Collect evidence (screenshots, videos, logs) |
| **Skill** | `webapp-testing` | Browser automation and verification with Playwright |
| **Hook** | PreToolUse | Remind to review before git commit/push |
| **Hook** | UserPromptSubmit | Inject completion checklist into AI context |

---

### Commands

#### `/reviw:do <task description>`

Starts a new task with proper environment setup.

**What it does:**
1. Creates a git worktree using gwq for isolated development (`feature/<name>`, `fix/<name>`, etc.)
2. Sets up `.artifacts/<feature>/` directory for evidence
3. Creates `REPORT.md` with plan and TODO checklist
4. Registers todos in TodoWrite for progress tracking

**Directory structure created:**
```
<worktree>/                   # e.g., ~/src/github.com/owner/myrepo-feature-auth/
└── .artifacts/
    └── <feature>/            # e.g., auth (from feature/auth)
        ├── REPORT.md         # Plan, progress, evidence links
        ├── images/           # Screenshots
        └── videos/           # Video recordings
```

**Task resumption:** When a session starts or after context compaction, the command checks for existing worktrees (via `gwq list`) and resumes from `REPORT.md`.

#### `/reviw:done`

Validates completion criteria before allowing task completion.

**Checklist enforced:**
- [ ] Build succeeded (no type/lint errors)
- [ ] Development server started and working
- [ ] Verified with `webapp-testing` skill
- [ ] Evidence collected in `.artifacts/<feature>/`
- [ ] Report created with `artifact-proof` skill
- [ ] Reviewed with reviw (foreground mode)
- [ ] User approval received

**Prohibited:**
- Saying "implementation complete" without verification
- Committing/pushing before reviw review
- Reports without evidence

---

### Agents

#### Review Agents (7 agents run in parallel)

When `/reviw:done` is executed, 7 review agents run simultaneously and append their findings to `REPORT.md`:

| Agent | Focus | Output Section |
|-------|-------|----------------|
| `review-code-quality` | Readability, DRY, type safety, error handling | Code Quality Review |
| `review-security` | XSS, injection, OWASP Top 10, secrets | Security Review |
| `review-a11y-ux` | WCAG 2.2 AA, keyboard nav, focus management | A11y & UX Review |
| `review-figma-fidelity` | Design tokens, visual consistency | Figma Fidelity Review |
| `review-copy-consistency` | Text consistency, i18n, tone & manner | Copy Consistency Review |
| `review-e2e-integrity` | User flow reproduction, mock contamination | E2E Integrity Review |
| `e2e-health-reviewer` | goto restrictions, record assertions | E2E Health Review |

**Total score:** Each agent scores X/5, combined for X/35 total.

**Invocation (parallel):**
```
Task tool with 7 parallel calls:
  subagent_type: "review-code-quality"
  subagent_type: "review-security"
  subagent_type: "review-a11y-ux"
  subagent_type: "review-figma-fidelity"
  subagent_type: "review-copy-consistency"
  subagent_type: "review-e2e-integrity"
  subagent_type: "e2e-health-reviewer"
```

#### `report-builder`

Specialized agent for preparing review materials (runs after review agents).

**Role:**
- Organize implementation into a structured report
- Calculate total review score (X/35)
- Collect and arrange evidence (screenshots, videos)
- Prepare `REPORT.md` for reviw review
- Parse reviw feedback and register as todos

**Invocation:**
```
Task tool with subagent_type: "report-builder"
```

**Skills auto-loaded:** `artifact-proof`

---

### Skills

#### `artifact-proof`

Manages evidence collection for visual regression and PR documentation.

**Features:**
- Screenshots and videos under `.artifacts/<feature>/`
- Playwright integration for automated capture
- Git LFS setup for video files
- PR image URLs with commit hashes (persist after branch deletion)

**reviw integration:**
```bash
# Open report in reviw (foreground required)
npx reviw .artifacts/<feature>/REPORT.md

# With video preview
open .artifacts/<feature>/videos/demo.webm
npx reviw .artifacts/<feature>/REPORT.md
```

#### `webapp-testing`

Browser automation toolkit using Playwright.

**Features:**
- TypeScript Playwright Test (`@playwright/test`)
- Playwright configuration with webServer support
- Screenshot and video capture
- Console log and network request monitoring
- CDP integration for advanced debugging

**Quick verification:**
```bash
node -e "const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/webapp.png', fullPage: true });
  await browser.close();
})();"
```

---

### Hooks

#### PreToolUse (Bash matcher)

Triggers when `git commit` or `git push` is detected.

**Message:** Reminds to run `/reviw:done` and review with reviw before committing.

#### UserPromptSubmit

Injects completion checklist into every AI response context.

**Purpose:** Prevents "implementation complete" claims without proper verification. The checklist is always visible to the AI, ensuring consistent enforcement of completion criteria.

---

### Workflow

```
/reviw:do <task description>
    ↓
Create worktree + Plan + TodoWrite
    ↓
Implementation (via subagents)
    ↓
Build & Verify (webapp-testing)
    ↓
/reviw:done
    ↓
┌─────────────────────────────────────────────┐
│  7 Review Agents (parallel execution)       │
│                                             │
│  review-code-quality ──┐                    │
│  review-security ──────┤                    │
│  review-a11y-ux ───────┼──→ REPORT.md      │
│  review-figma-fidelity ┤    (append)        │
│  review-copy-consistency                    │
│  review-e2e-integrity ─┤                    │
│  e2e-health-reviewer ──┘                    │
└─────────────────────────────────────────────┘
    ↓
report-builder (organize + score)
    ↓
Collect evidence (artifact-proof)
    ↓
npx reviw opens report (foreground)
    ↓
User comments → Submit & Exit
    ↓
Register feedback to Todo
    ↓
Fix → Re-review until approved
    ↓
Commit & PR (only after approval)
```

### Completion Criteria

| Stage | Content | Status |
|-------|---------|--------|
| 1/3 | Implementation complete | Do not report yet |
| 2/3 | Build, start, verification complete | Do not report yet |
| 3/3 | Review with reviw → User approval | Now complete |

### Design Philosophy

The plugin enforces **human-in-the-loop** development:

1. **No shortcuts:** Mocks, bypasses, and skipped verifications are prohibited
2. **Evidence required:** Every completion claim must have screenshots/videos
3. **User approval:** Only the user can mark a task as complete
4. **Context preservation:** Heavy operations run in subagents to prevent context exhaustion

### `.artifacts` Directory Policy

The `.artifacts/` directory stores screenshots, videos, and reports generated during development. **By default, this directory should be added to `.gitignore`** to prevent repository bloat from large media files.

```bash
# Add to .gitignore (recommended)
echo ".artifacts" >> .gitignore
```

**Why ignore by default:**
- Screenshots and videos can be large (especially screen recordings)
- Evidence is primarily for the review process, not permanent documentation
- Keeps repository size manageable

**If you need to commit specific evidence:**

Use `git add --force` to explicitly add files you want to preserve:

```bash
# Force add specific evidence files
git add --force .artifacts/feature/images/final-screenshot.png
git add --force .artifacts/feature/REPORT.md

# Or force add an entire feature's evidence
git add --force .artifacts/feature/
```

**For video files**, use Git LFS to avoid bloating the repository:

```bash
git lfs track "*.mp4" "*.webm" "*.mov"
git add .gitattributes
git add --force .artifacts/feature/videos/demo.mp4
```

This approach gives you full control: ignore by default, commit only what matters.

## Development

- Main source: `cli.cjs`
- Tests: `npm test` (vitest + playwright)
- Plugin: `plugin/` directory

## License

MIT
