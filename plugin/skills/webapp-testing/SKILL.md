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
  - `node_site_diagnostics.js` - Node版の簡易診断（コンソールエラー/HTTP失敗収集＋スクショ）

---

## Node Playwright Addendum (local extensions)

Node版の運用で便利だった手筋を追記しておく。公式本文はPython基盤のまま保持し、ここだけローカル拡張として参照する。

- **即席ワンライナー**: `/tmp`を汚さない一発実行が最速。`networkidle`待機とフルページスクショの最小例:
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

- **証跡セット（スクリプト/動画/スクショ/trace）**: 証跡が必要なときは`.artifacts/<feature>/`にまとめる。**Playwrightスクリプト自体も`scripts/`に保存**し、何を実行したか再現可能にする。動画は`recordVideo`、traceはPlaywright Testで`--trace=retain-on-failure`が手軽。
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
  # Playwright Testでtraceを残す場合
  # BASE_URL=http://localhost:3000 npx playwright test tests/e2e/<spec>.spec.ts --headed --output=.artifacts/$FEATURE/images --trace=retain-on-failure --reporter=line
  ```

- **Chrome DevTools MCPの併用判断**: スクショだけで原因が読みにくいレイアウト/フォント/重ね順/パフォーマンスは、まずPlaywrightで再現と証跡取得 → それでも不明ならDevTools MCPでStyles/Computed/Box model/Performanceをピンポイント確認。

- **Lighthouseによる性能スナップショット**: ざっくり性能を測りたいときの最小実行。出力は`/tmp`に集約。
  ```bash
  npx lighthouse ${BASE_URL:-http://localhost:3000} --output=json --output-path=/tmp/lh.json --chrome-flags="--headless" --only-categories=performance
  node -e "const data = require('/tmp/lh.json'); const perf = data.categories.performance; console.log('Performance Score', Math.round(perf.score*100));"
  ```

運用ポリシー: 基本はheadless、証跡が要るときだけheadedに切り替え。プロジェクト直下を汚さず`/tmp`か`.artifacts/`配下に書き出し、終了後は不要ファイルを削除する。

## DevTools MCP不要でPlaywrightだけでやる方法メモ
Chrome DevTools MCPの中身はPuppeteer+CDP。Playwrightも同じCDPを叩けるので、以下の手順で代替する。

- **Performanceトレース（Performanceパネル相当）**: Playwright標準のトレースを使う。
  ```python
  with sync_playwright() as p:
      browser = p.chromium.launch(headless=True)
      context = browser.new_context(record_video_dir=None)
      context.tracing.start(screenshots=True, snapshots=True)
      page = context.new_page()
      page.goto("http://localhost:3000", wait_until="networkidle")
      # ここで操作
      context.tracing.stop(path=".artifacts/feature/traces/trace.zip")
      browser.close()
  ```
  DevToolsの`Performance`ビューに近い詳細が欲しければCDPセッションで`Tracing.start`/`end`し、出力JSONを`chrome://tracing`や`perfetto.dev`で読む。

- **Coverage（Coverageパネル相当）**: CDP経由で取得。
  ```python
  cdp = page.context.new_cdp_session(page)
  cdp.send("Profiler.enable")
  cdp.send("Profiler.startPreciseCoverage", {"callCount": True, "detailed": True})
  # ここで操作
  result = cdp.send("Profiler.takePreciseCoverage")
  cdp.send("Profiler.stopPreciseCoverage"); cdp.send("Profiler.disable")
  # result["result"] にファイルごとの使用率が入る
  ```

- **Styles/Box Model/Computed値の確認**: DevTools UIでなく値だけ取る。
  ```python
  box = page.locator("selector").evaluate("el => el.getBoundingClientRect()")
  styles = page.locator("selector").evaluate("el => getComputedStyle(el)")
  ```

- **Networkボディ取得**: `page.on('request')`でメタは取れるが、レスポンス本文はCDPで。
  ```python
  cdp = page.context.new_cdp_session(page)
  resp = cdp.send("Network.getResponseBody", {"requestId": "<target requestId>"})
  ```
  `requestId`は`page.on("requestfinished", ...)`で`request.timing()`と一緒にログして紐付ける。

- **コンソール/エラー収集**: Playwrightのイベントで足りる。
  ```python
  page.on("console", lambda msg: print("console:", msg.type, msg.text))
  page.on("pageerror", lambda err: print("pageerror:", err))
  page.on("requestfailed", lambda req: print("requestfailed:", req.url))
  ```

## ファイル配置規約

検証時に生成するファイルは以下の構成で `.artifacts/<feature>/` に集約する：

```
.artifacts/<feature>/
├── scripts/      # Playwrightスクリプト（.py / .js / .ts）
├── images/       # スクリーンショット
├── videos/       # 録画ファイル
└── traces/       # Playwright trace（.zip）
```

- **スクリプトも証跡の一部**: 何を実行したか再現可能にするため、使い捨てでも `scripts/` に保存
- **命名規則**: `<timestamp>-<step>.png`、`verify-<feature>.py` など意図が分かる名前を推奨
- **即席検証のみ `/tmp`**: 証跡不要の一発確認は `/tmp` でOK、ただし後から参照できない前提
