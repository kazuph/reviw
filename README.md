# reviw

A lightweight browser-based tool for reviewing and annotating tabular data, text, Markdown, and diff files. Supports CSV, TSV, plain text, Markdown, and unified diff formats. Comments are output as YAML to stdout.

## Features

### File Format Support
- **CSV/TSV**: View tabular data with sticky headers, column freezing, filtering, and column resizing
- **Markdown**: Side-by-side preview with synchronized scrolling
- **Diff/Patch**: GitHub-style diff view with syntax highlighting, collapsible large files (500+ lines), and binary files sorted to end
- **Text**: Line-by-line commenting for plain text files

### Mermaid.js Diagrams
- Auto-detect and render Mermaid diagrams in Markdown files
- Click any diagram to open fullscreen viewer
- Zoom with mouse wheel (centered on cursor position, up to 10x)
- Pan with mouse drag
- Minimap showing current viewport position
- Syntax error display in toast notifications

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
reviw <file> [--port 3000] [--encoding utf8|shift_jis|...]

# Multiple files (each opens on consecutive ports)
reviw file1.csv file2.md file3.tsv --port 3000

# Diff from stdin
git diff HEAD | reviw

# Diff file
reviw changes.diff
```

### Options
- `--port <number>`: Specify starting port (default: 3000)
- `--encoding <encoding>`: Force specific encoding (auto-detected by default)
- `--no-open`: Prevent automatic browser opening

### Workflow
1. Browser opens automatically (macOS: `open` / Linux: `xdg-open` / Windows: `start`)
2. Click cells/lines to add comments, or drag to select multiple
3. Use Cmd/Ctrl+Enter or click "Submit & Exit" to output comments
4. Comments are printed as YAML to stdout

## Screenshots

### CSV View
![CSV View](./assets/screenshot-csv.png?v=2)

### Markdown View
![Markdown View](./assets/screenshot-md.png?v=2)

### Diff View
![Diff View](./assets/screenshot-diff.png?v=2)

### Mermaid Fullscreen
![Mermaid Fullscreen](./assets/screenshot-mermaid.png?v=2)

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

## Development

- Main source: `cli.cjs`
- Tests: `npm test` (vitest + playwright)

## License

MIT
