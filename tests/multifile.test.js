import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', '.artifacts');
const CSV_FILE = path.join(__dirname, 'fixtures', 'sample.csv');
const MD_FILE = path.join(__dirname, 'fixtures', 'sample.md');

function waitForServer(port, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const checkReady = setInterval(() => {
      if (Date.now() - start > timeout) {
        clearInterval(checkReady);
        reject(new Error(`Server on port ${port} did not start within ${timeout}ms`));
        return;
      }
      http.get(`http://localhost:${port}/healthz`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(checkReady);
          resolve();
        }
      }).on('error', () => {});
    }, 200);
  });
}

/**
 * CLIの出力からポート番号とファイル名を動的に取得してサーバーを起動
 * ポート競合があった場合でも、実際に使用されたポートを正しく取得できる
 */
function startMultiFileServer(basePort) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['cli.cjs', CSV_FILE, MD_FILE, '--port', String(basePort), '--no-open'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      detached: true,
    });

    let output = '';
    const portFileMap = new Map(); // port -> filename
    const expectedFileCount = 2;
    let resolved = false;

    const parseOutput = (data) => {
      output += data.toString();
      // CLIの出力パターン: "Viewer started: http://localhost:XXXX  (file: filename)"
      const regex = /Viewer started: http:\/\/localhost:(\d+)\s+\(file:\s*([^)]+)\)/g;
      let match;
      while ((match = regex.exec(output)) !== null) {
        const port = parseInt(match[1], 10);
        const filename = match[2].trim();
        if (!portFileMap.has(port)) {
          portFileMap.set(port, filename);
        }
      }
    };

    serverProcess.stdout.on('data', parseOutput);
    serverProcess.stderr.on('data', parseOutput);

    const checkServersReady = async () => {
      if (resolved) return;
      if (portFileMap.size >= expectedFileCount) {
        const ports = Array.from(portFileMap.keys());
        try {
          // 全てのサーバーが起動するまで待機
          await Promise.all(ports.map(port => waitForServer(port)));
          resolved = true;
          serverProcess.portFileMap = portFileMap;
          resolve(serverProcess);
        } catch (err) {
          // まだ起動していない場合は待機継続
        }
      }
    };

    // 出力を監視して定期的にチェック
    serverProcess.stdout.on('data', () => checkServersReady());
    serverProcess.stderr.on('data', () => checkServersReady());

    // タイムアウト
    setTimeout(() => {
      if (!resolved) {
        try {
          process.kill(-serverProcess.pid, 'SIGKILL');
        } catch (_) {}
        reject(new Error(`Failed to start servers. Found ${portFileMap.size}/${expectedFileCount} ports. Output: ${output}`));
      }
    }, 15000);
  });
}

/**
 * portFileMapからファイル名に対応するポートを取得
 */
function getPortForFile(portFileMap, targetFilename) {
  for (const [port, filename] of portFileMap) {
    if (filename.includes(targetFilename)) {
      return port;
    }
  }
  return null;
}

describe('Multi-file E2E Tests', () => {
  let browser;
  let serverProcess;
  let csvPort;
  let mdPort;
  const basePort = 3004;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startMultiFileServer(basePort);

    // CLI出力から動的にポートを取得
    const portFileMap = serverProcess.portFileMap;
    csvPort = getPortForFile(portFileMap, 'sample.csv');
    mdPort = getPortForFile(portFileMap, 'sample.md');

    if (!csvPort || !mdPort) {
      throw new Error(`Failed to find ports. portFileMap: ${JSON.stringify([...portFileMap])}`);
    }
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) {
      try {
        process.kill(-serverProcess.pid, 'SIGKILL');
      } catch (e) {
        // ignore if already dead
      }
    }
  });

  test('opens multiple files on separate ports', async () => {
    // Test CSV file on dynamically acquired port
    const csvPage = await browser.newPage();
    await csvPage.goto(`http://localhost:${csvPort}`);
    await expect(csvPage.locator('header h1')).toContainText('sample.csv');
    const csvTable = csvPage.locator('#csv-table');
    await expect(csvTable).toBeVisible();

    await csvPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'multi-01-csv.png'), fullPage: true });

    // Test MD file on dynamically acquired port
    const mdPage = await browser.newPage();
    await mdPage.goto(`http://localhost:${mdPort}`);
    await expect(mdPage.locator('header h1')).toContainText('sample.md');
    const mdPreview = mdPage.locator('.md-preview');
    await expect(mdPreview).toBeVisible();

    await mdPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'multi-02-md.png'), fullPage: true });

    // Add comment to CSV
    const csvCell = csvPage.locator('td[data-row="1"][data-col="1"]');
    await csvCell.click();
    const csvCommentCard = csvPage.locator('#comment-card');
    await expect(csvCommentCard).toBeVisible();
    await csvPage.locator('#comment-input').fill('CSV comment from multi-file test');
    await csvPage.locator('#save-comment').click();
    await expect(csvCell).toHaveClass(/has-comment/);

    await csvPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'multi-03-csv-comment.png'), fullPage: true });

    // Add comment to MD
    const mdCell = mdPage.locator('td[data-row="1"][data-col="1"]');
    await mdCell.click();
    const mdCommentCard = mdPage.locator('#comment-card');
    await expect(mdCommentCard).toBeVisible();
    await mdPage.locator('#comment-input').fill('MD comment from multi-file test');
    await mdPage.locator('#save-comment').click();
    await expect(mdCell).toHaveClass(/has-comment/);

    await mdPage.screenshot({ path: path.join(ARTIFACTS_DIR, 'multi-04-md-comment.png'), fullPage: true });

    await csvPage.close();
    await mdPage.close();
  });
});
