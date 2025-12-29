---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. [MANDATORY] Before saying "implementation complete", you MUST use this skill to run tests and verify functionality. Completion reports without verification are PROHIBITED.
license: Complete terms in LICENSE.txt
---

# Web Application Testing

To test local web applications, write native Python Playwright scripts.

**Helper Scripts Available**:
- `scripts/with_server.py` - Manages server lifecycle (supports multiple servers)

**Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is abslutely necessary. These scripts can be very large and thus pollute your context window. They exist to be called directly as black-box scripts rather than ingested into your context window.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Run: python scripts/with_server.py --help
        │        Then use the helper + write simplified Playwright script
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Example: Using with_server.py

To start a server, run `--help` first, then use the helper:

**Single server:**
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
```

**Multiple servers (e.g., backend + frontend):**
```bash
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

To create an automation script, include only Playwright logic (servers are managed automatically):
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True) # Always launch chromium in headless mode
    page = browser.new_page()
    page.goto('http://localhost:5173') # Server already running and ready
    page.wait_for_load_state('networkidle') # CRITICAL: Wait for JS to execute
    # ... your automation logic
    browser.close()
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Common Pitfall

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

## Best Practices

- **Use bundled scripts as black boxes** - To accomplish a task, consider whether one of the scripts available in `scripts/` can help. These scripts handle common, complex workflows reliably without cluttering the context window. Use `--help` to see usage, then invoke directly.
- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`

## Reference Files

- **examples/** - Examples showing common patterns:
  - `element_discovery.py` - Discovering buttons, links, and inputs on a page
  - `static_html_automation.py` - Using file:// URLs for local HTML
  - `console_logging.py` - Capturing console logs during automation
  - `node_site_diagnostics.js` - Simple Node diagnostics (console errors/HTTP failures collection + screenshots)

---

## Node Playwright Addendum (local extensions)

Documenting useful patterns from Node operations. The official content above remains Python-based; this section serves as a local extension for reference.

- **Quick one-liner**: Fastest approach without cluttering `/tmp`. Minimal example for `networkidle` wait and full-page screenshot:
  ```bash
  node -e "const { chromium } = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/webapp.png', fullPage: true });
    await browser.close();
    console.log('saved: /tmp/webapp.png');
  })();"
  ```

- **Evidence collection (scripts/videos/screenshots/traces)**: When evidence is required, consolidate in `.artifacts/<feature>/`. **Save the Playwright script itself in `scripts/`** to make execution reproducible. Videos use `recordVideo`, traces use `--trace=retain-on-failure` in Playwright Test for convenience.
  ```bash
  FEATURE=${FEATURE:-feature}
  mkdir -p .artifacts/$FEATURE/{scripts,images,videos}
  node -e "const { chromium } = require('playwright');
  (async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: `.artifacts/${FEATURE}/videos` }
    });
    const page = await context.newPage();
    await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `.artifacts/${FEATURE}/images/${Date.now()}-step.png`, fullPage: true });
    await browser.close();
  })();"
  # When keeping traces with Playwright Test
  # BASE_URL=http://localhost:3000 npx playwright test tests/e2e/<spec>.spec.ts --headed --output=.artifacts/$FEATURE/images --trace=retain-on-failure --reporter=line
  ```

- **Decision on Chrome DevTools MCP usage**: For layout/font/stacking/performance issues hard to diagnose from screenshots alone, first reproduce and capture evidence with Playwright → if still unclear, pinpoint with DevTools MCP for Styles/Computed/Box model/Performance.

- **Performance snapshot with Lighthouse**: Minimal execution for rough performance measurement. Output consolidated in `/tmp`.
  ```bash
  npx lighthouse ${BASE_URL:-http://localhost:3000} --output=json --output-path=/tmp/lh.json --chrome-flags="--headless" --only-categories=performance
  node -e "const data = require('/tmp/lh.json'); const perf = data.categories.performance; console.log('Performance Score', Math.round(perf.score*100));"
  ```

Operation policy: Default to headless, switch to headed only when evidence is needed. Write to `/tmp` or `.artifacts/` subdirectory without cluttering the project root, and delete unnecessary files after completion.

## Notes on Playwright-only approach without DevTools MCP
Chrome DevTools MCP internally uses Puppeteer + CDP. Playwright can also use CDP, so substitute with the following steps.

- **Performance trace (equivalent to Performance panel)**: Use Playwright's standard tracing.
  ```python
  with sync_playwright() as p:
      browser = p.chromium.launch(headless=True)
      context = browser.new_context(record_video_dir=None)
      context.tracing.start(screenshots=True, snapshots=True)
      page = context.new_page()
      page.goto("http://localhost:3000", wait_until="networkidle")
      # Perform operations here
      context.tracing.stop(path=".artifacts/feature/traces/trace.zip")
      browser.close()
  ```
  For detailed output similar to DevTools `Performance` view, use a CDP session with `Tracing.start`/`end` and read the output JSON with `chrome://tracing` or `perfetto.dev`.

- **Coverage (equivalent to Coverage panel)**: Retrieve via CDP.
  ```python
  cdp = page.context.new_cdp_session(page)
  cdp.send("Profiler.enable")
  cdp.send("Profiler.startPreciseCoverage", {"callCount": True, "detailed": True})
  # Perform operations here
  result = cdp.send("Profiler.takePreciseCoverage")
  cdp.send("Profiler.stopPreciseCoverage"); cdp.send("Profiler.disable")
  # result["result"] contains usage per file
  ```

- **Checking Styles/Box Model/Computed values**: Retrieve values without DevTools UI.
  ```python
  box = page.locator("selector").evaluate("el => el.getBoundingClientRect()")
  styles = page.locator("selector").evaluate("el => getComputedStyle(el)")
  ```

- **Network body retrieval**: `page.on('request')` captures metadata, but response body needs CDP.
  ```python
  cdp = page.context.new_cdp_session(page)
  resp = cdp.send("Network.getResponseBody", {"requestId": "<target requestId>"})
  ```
  Get `requestId` by logging with `page.on("requestfinished", ...)` along with `request.timing()` for correlation.

- **Console/error collection**: Playwright events are sufficient.
  ```python
  page.on("console", lambda msg: print("console:", msg.type, msg.text))
  page.on("pageerror", lambda err: print("pageerror:", err))
  page.on("requestfailed", lambda req: print("requestfailed:", req.url))
  ```

## File placement conventions

Consolidate verification-generated files in `.artifacts/<feature>/` with the following structure:

```
.artifacts/<feature>/
├── scripts/      # Playwright scripts (.py / .js / .ts)
├── images/       # Screenshots
├── videos/       # Recorded videos
└── traces/       # Playwright traces (.zip)
```

- **Scripts are also part of evidence**: Save in `scripts/` even if disposable, to make execution reproducible
- **Naming convention**: Use descriptive names like `<timestamp>-<step>.png`, `verify-<feature>.py` that convey intent
- **Quick validation only in `/tmp`**: OK for one-off checks without evidence, but assume no future reference
