// Generates fake "settings page" screenshots (light/dark) used as evidence
// images in examples/showcase-report.md for the README demo GIF.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pageHtml = (dark) => `<!doctype html>
<html>
<head>
<style>
  * { margin: 0; box-sizing: border-box; font-family: -apple-system, "Segoe UI", sans-serif; }
  body { background: ${dark ? "#0f1117" : "#f6f7f9"}; color: ${dark ? "#e6e8ee" : "#1a1d23"}; }
  .app { display: flex; height: 100vh; }
  .side { width: 200px; background: ${dark ? "#161922" : "#ffffff"}; border-right: 1px solid ${dark ? "#262b38" : "#e4e7ec"}; padding: 20px 14px; }
  .logo { font-weight: 700; font-size: 15px; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
  .logo .dot { width: 22px; height: 22px; border-radius: 7px; background: linear-gradient(135deg, #6366f1, #8b5cf6); }
  .nav { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
  .nav div { padding: 8px 10px; border-radius: 8px; color: ${dark ? "#9aa1b2" : "#5b6271"}; }
  .nav .on { background: ${dark ? "#23283a" : "#eef0ff"}; color: ${dark ? "#c7cbff" : "#4f46e5"}; font-weight: 600; }
  .main { flex: 1; padding: 28px 36px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .sub { font-size: 13px; color: ${dark ? "#8b93a7" : "#6b7280"}; margin-bottom: 24px; }
  .card { background: ${dark ? "#161922" : "#ffffff"}; border: 1px solid ${dark ? "#262b38" : "#e4e7ec"}; border-radius: 12px; padding: 18px 20px; max-width: 560px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
  .card h3 { font-size: 14px; margin-bottom: 3px; }
  .card p { font-size: 12px; color: ${dark ? "#8b93a7" : "#6b7280"}; }
  .toggle { width: 44px; height: 24px; border-radius: 12px; position: relative; flex-shrink: 0; background: ${dark ? "#6366f1" : "#d3d7df"}; }
  .toggle::after { content: ""; position: absolute; top: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; left: ${dark ? "22px" : "2px"}; box-shadow: 0 1px 3px rgba(0,0,0,.25); }
  .toggle.static { background: #6366f1; } .toggle.static::after { left: 22px; }
  select { background: ${dark ? "#0f1117" : "#f6f7f9"}; color: inherit; border: 1px solid ${dark ? "#262b38" : "#d3d7df"}; border-radius: 8px; padding: 6px 10px; font-size: 13px; }
</style>
</head>
<body>
<div class="app">
  <div class="side">
    <div class="logo"><div class="dot"></div>Acme Studio</div>
    <div class="nav"><div>Dashboard</div><div>Projects</div><div>Members</div><div class="on">Settings</div></div>
  </div>
  <div class="main">
    <h1>Settings</h1>
    <div class="sub">Appearance &amp; preferences</div>
    <div class="card">
      <div><h3>Dark mode</h3><p>Switch the interface to a darker palette. Follows your choice across sessions.</p></div>
      <div class="toggle"></div>
    </div>
    <div class="card">
      <div><h3>Email notifications</h3><p>Weekly digest of project activity.</p></div>
      <div class="toggle static"></div>
    </div>
    <div class="card">
      <div><h3>Language</h3><p>Interface language.</p></div>
      <select><option>English</option></select>
    </div>
  </div>
</div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 880, height: 520 }, deviceScaleFactor: 2 });
for (const dark of [false, true]) {
  await page.setContent(pageHtml(dark));
  await page.screenshot({ path: path.join(ROOT, "examples", "assets", `demo-settings-${dark ? "dark" : "light"}.png`) });
}
await browser.close();
console.log("done");
