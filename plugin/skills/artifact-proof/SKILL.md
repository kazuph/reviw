---
name: artifact-proof
description: Accumulate evidence (screenshots, videos, logs) under .artifacts/<feature>/ for visual regression and PR documentation workflow. [MANDATORY] Before saying "implementation complete", you MUST use this skill to collect evidence and present a report with proof. Completion reports without evidence are PROHIBITED.
allowed-tools:
  - Shell
---

# Artifact Proof

An operational workflow for preserving development evidence (screenshots, videos, logs) in `.artifacts/<feature>/` and reusing it for PR descriptions.
Assumes human-in-the-loop visual regression, requiring screenshots to be retaken and verified before commits and PR pushes.

## Triggers
- When asked for work evidence for a PR
- When visual diff checking is needed for UI changes
- When E2E/Playwright execution results need to be preserved

## Core Principles
- Use `.artifacts/` (md) and `.artifacts/media/` (images/videos) to avoid polluting the repository.
- Treat screenshots as semi-automated human-in-the-loop visual regression. After making changes, **retake all screenshots before commits and PR pushes to replace them**. Human verification ensures the changes are intentional before committing.
- Browsers should primarily use Playwright's bundled Chromium. Chrome-based browsers are a last resort.
- Editing should use `apply_patch` only. Operations that break others' changes (like `git reset`) are prohibited.

## Directory and Naming
- Decide on a FEATURE and create the following:
  - `.artifacts/<feature>/REPORT.md`
  - `.artifacts/<feature>/images/`
  - `.artifacts/<feature>/videos/`
- Naming examples: `20251130-login-before.png`, `20251130-login-after.png`, `20251130-login-run.webm`
- **Video files (.webm, .mp4, etc.) must be managed with Git LFS** (details below)

## Artifact Template (REPORT.md)
```markdown
# <feature> / <ticket>

Created: YYYY-MM-DD
Branch: <branch-name>
Status: Awaiting Review

## Context (依頼内容)
- Background and requirements
- Out of scope
- Acceptance criteria

## Plan (計画)
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Evidence (証拠) ⭐ MOST IMPORTANT

### Screenshots
| Before | After |
|--------|-------|
| ![Before](./images/YYYYMMDD-feature-before.png) | ![After](./images/YYYYMMDD-feature-after.png) |

### Videos
- 📹 [Demo video](./videos/YYYYMMDD-feature-demo.webm)

### Test Results
```bash
# Command executed
npx playwright test tests/e2e/feature.spec.ts --reporter=line

# Result
✓ 5 passed (10s)
```

### Verification Checklist
- [ ] Build: `npm run build` passed
- [ ] Dev server: Started successfully
- [ ] Manual verification: Feature works as expected
- [ ] E2E tests: All passing

### How to Reproduce
```bash
# Steps to reproduce the evidence above
pnpm install
pnpm dev
# Then navigate to http://localhost:3000/feature
```

## Notes
- Items for user to confirm
- Known limitations
- Future improvements
```

## Example of Capturing Evidence with Playwright (Screenshots + Videos)
```bash
FEATURE=${FEATURE:-feature}
mkdir -p .artifacts/$FEATURE/{images,videos}
node -e "const { chromium } = require('playwright');
(async () => {
  const feature = process.env.FEATURE || 'feature';
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: `.artifacts/${feature}/videos` } });
  const page = await context.newPage();
  await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
  // TODO: Describe scenario operations here
  const stamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
  await page.screenshot({ path: `.artifacts/${feature}/images/${stamp}-step.png`, fullPage: true });
  await browser.close();
})();" \
FEATURE=$FEATURE
```
- Playwright test example with trace:
```bash
FEATURE=${FEATURE:-feature}
BASE_URL=http://localhost:3000 \
npx playwright test tests/e2e/<spec>.spec.ts \
  --headed \
  --output=.artifacts/$FEATURE/images \
  --trace=retain-on-failure \
  --reporter=line
```
  After execution, if videos or trace outputs are scattered in different directories, organize them by moving to `.artifacts/$FEATURE/videos/`.

## Operational Flow
1) Create an Artifact md for the target task when starting work. Write Context and plans.
2) Continuously append executed commands and logs.
3) After UI changes, retake all screenshots and save to `.artifacts/<feature>/images/` (videos to `videos/`).
4) Verify differences visually (human-in-the-loop). If intentional, paste into README.
5) **Start review with reviw** (see "Review with reviw" section below)
6) If rejected, re-implement, retake screenshots and videos as long as there are changes, update REPORT.md if necessary, execute step 5 again, and loop until approved
7) Only commit after user approval; if there's a PR, reflect all modifications in the PR description

## Review with reviw

reviw is a CLI tool that reviews CSV/TSV/Markdown/Diff/text files in a browser and outputs comments in YAML format.

### Basic Commands

```bash
# Open a report (must run in foreground)
npx reviw .artifacts/<feature>/REPORT.md

# If there's a video, open it first
open .artifacts/<feature>/videos/demo.webm
npx reviw .artifacts/<feature>/REPORT.md

# Review git diff
git diff HEAD | npx reviw

# Open multiple files simultaneously
npx reviw file1.md file2.csv data.tsv
```

### Options

| Option | Description |
|--------|-------------|
| `--port <number>` | Specify port number (default: 4989) |
| `--encoding <enc>` | Specify character encoding (shift_jis, euc-jp, etc.) |
| `--no-open` | Disable automatic browser launch |

### reviw UI Features

- **Markdown**: Side-by-side preview, scroll sync, Mermaid diagram rendering
- **CSV/TSV**: Fixed header, column pinning, filtering
- **Diff**: GitHub-style display, syntax highlighting
- **Theme**: Light/dark mode toggle
- **Comments**: Click cells/rows to add comments, Cmd/Ctrl+Enter to submit

### Review Workflow

```
npx reviw .artifacts/<feature>/REPORT.md  # Launch in foreground
    ↓
Browser opens
    ↓
User reviews content and adds comments
    ↓
Click "Submit & Exit"
    ↓
Feedback is output in YAML format
    ↓
Register feedback in TodoWrite (detailed, no summarizing)
    ↓
Fix → Review again with reviw → Repeat until approved
```

### Important: Foreground Launch Required

```bash
# Correct (can receive feedback)
npx reviw report.md

# Wrong (cannot receive feedback)
npx reviw report.md &
```

Launching in the background prevents receiving user comments, so **always launch in foreground**.

### Output Format (YAML)

```yaml
file: report.md
mode: markdown
comments:
  - line: 15
    content: "Please add an explanation for this part"
  - line: 23
    content: "Error handling is needed"
summary: "Overall good, but please fix the above points"
```

## Pasting Screenshots in PR Descriptions

### ⚠️ Important: Use URLs that persist after branch deletion

PR branches are often deleted after merging. Branch-name-based URLs become 404 after deletion, so **always use blob URLs with commit hashes**.

```bash
# Get current commit hash
COMMIT_HASH=$(git rev-parse HEAD)
# Or short form
COMMIT_HASH=$(git rev-parse --short HEAD)
```

**Correct URL format (using commit hash):**
```
![alt](https://github.com/<org>/<repo>/blob/<commit-hash>/.artifacts/<feature>/images/screenshot.png?raw=true)
```

**Wrong URL format (using branch name - 404 after deletion):**
```
![alt](https://github.com/<org>/<repo>/blob/<branch-name>/.artifacts/<feature>/images/screenshot.png?raw=true)
```

### Screenshot Layout (Preventing Vertical Stacking)

Vertically stacked screenshots are hard to read. **Use HTML tables to arrange them horizontally as well**:

```html
<!-- 2-column layout -->
<table>
  <tr>
    <td><img src="https://github.com/.../blob/<hash>/.artifacts/feature/images/before.png?raw=true" width="400"/></td>
    <td><img src="https://github.com/.../blob/<hash>/.artifacts/feature/images/after.png?raw=true" width="400"/></td>
  </tr>
  <tr>
    <td align="center">Before</td>
    <td align="center">After</td>
  </tr>
</table>

<!-- 3-column layout (comparing multiple screens) -->
<table>
  <tr>
    <td><img src=".../step1.png?raw=true" width="280"/></td>
    <td><img src=".../step2.png?raw=true" width="280"/></td>
    <td><img src=".../step3.png?raw=true" width="280"/></td>
  </tr>
  <tr>
    <td align="center">1. Login Screen</td>
    <td align="center">2. After Input</td>
    <td align="center">3. Completion Screen</td>
  </tr>
</table>
```

### Example Script for Pasting in PR Description

```bash
FEATURE=${FEATURE:-feature}
ORG=$(gh repo view --json owner -q .owner.login)
REPO=$(gh repo view --json name -q .name)
COMMIT=$(git rev-parse HEAD)

# Generate Markdown table from image list
echo "<table><tr>"
count=0
for img in .artifacts/$FEATURE/images/*.png; do
  filename=$(basename "$img")
  echo "<td><img src=\"https://github.com/$ORG/$REPO/blob/$COMMIT/$img?raw=true\" width=\"400\"/></td>"
  count=$((count + 1))
  # New row every 2 columns
  if [ $((count % 2)) -eq 0 ]; then
    echo "</tr><tr>"
  fi
done
echo "</tr></table>"
```

### Update PR Description with GitHub CLI

```bash
gh api --method PATCH repos/<org>/<repo>/pulls/<num> -f body="$(cat /tmp/new-body.md)"
```

## Managing Videos with Git LFS

Video files are large, so **they must be managed with Git LFS**.

### Initial Setup
```bash
# If LFS is not installed
brew install git-lfs  # macOS
git lfs install

# Add video files to LFS tracking
git lfs track "*.webm"
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track ".artifacts/**/*.webm"
git lfs track ".artifacts/**/*.mp4"

# Commit .gitattributes
git add .gitattributes
git commit -m "chore: add video files to Git LFS"
```

### Flow for Adding Videos
```bash
# 1. Place the video
mv recording.webm .artifacts/$FEATURE/videos/

# 2. Verify LFS tracking
git lfs status

# 3. Add/commit normally
git add .artifacts/$FEATURE/videos/
git commit -m "docs: add demo video for $FEATURE"
```

### Video Links in PR Description
Videos cannot be played directly on GitHub, so provide them as links:
```markdown
📹 [View demo video](./.artifacts/feature/videos/demo.webm)
```

Or convert to GIF for embedding:
```bash
# webm → gif conversion (using ffmpeg)
ffmpeg -i demo.webm -vf "fps=10,scale=600:-1" demo.gif
```

## Best Practices
- Include screen or state-descriptive words in screenshot/video filenames (e.g., `login-success.png`).
- Use both full-page and element-level captures for better diff accuracy.
- Preserve screenshots even for test failures to aid in debugging.
- When creating PRs, paste Artifact content directly; update Artifacts based on review feedback.
- **Don't stack screenshots vertically; use 2-3 column table layouts for horizontal utilization**.
- **Always use commit hashes in image URLs so they display even after branch deletion**.
- **Always manage videos with Git LFS to avoid repository bloat**.

## Expected Outputs
- `.artifacts/<feature>/` contains task-specific READMEs with linked evidence (screenshots, videos, logs).
- Screenshots are updated to the latest before commits and PR pushes, with visual diffs verified by human eyes.
- Artifacts can be directly reused as PR descriptions.
- PR images use commit hash-based blob URLs that remain visible after branch deletion post-merge.
- Video files are managed with Git LFS, reducing clone overhead.
