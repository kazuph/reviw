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

### Plugin Features

| Component | Name | Description |
|-----------|------|-------------|
| **Command** | `/reviw:do` | Start a task - create worktree, plan, register todos |
| **Command** | `/reviw:done` | Complete checklist - collect evidence, start review with reviw |
| **Agent** | `report-builder` | Prepare reports and evidence for user review |
| **Skill** | `artifact-proof` | Collect evidence (screenshots, videos, logs) + reviw review workflow |
| **Hook** | PreToolUse | Remind to review before git commit/push |
| **Hook** | Stop | Warn if task is still in progress |

### Workflow

```
/reviw:do <task description>
    ↓
Create worktree + Plan
    ↓
Implementation
    ↓
/reviw:done
    ↓
Collect evidence + Create report
    ↓
npx reviw opens report (foreground)
    ↓
User comments → Submit & Exit
    ↓
Register feedback to Todo
    ↓
Fix → Re-review until approved
```

### Completion Criteria

| Stage | Content |
|-------|---------|
| 1/3 | Implementation complete |
| 2/3 | Build, start, verification complete |
| 3/3 | Review with reviw → User approval |

## Development

- Main source: `cli.cjs`
- Tests: `npm test` (vitest + playwright)
- Plugin: `plugin/` directory

## License

MIT
