import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const requireGate = (process.env.REQUIRE_REAL_DEVICE_GATE ?? 'false') === 'true';
const provider = (process.env.REAL_DEVICE_PROVIDER ?? 'none').toLowerCase();
const realDeviceCommand = process.env.REAL_DEVICE_COMMAND ?? '';

let result = 'skipped';
let details = 'Real device provider is disabled';

if (provider !== 'none') {
  if (provider === 'browserstack') {
    const hasUser = !!process.env.BROWSERSTACK_USERNAME;
    const hasKey = !!process.env.BROWSERSTACK_ACCESS_KEY;
    if (!hasUser || !hasKey) {
      result = 'failure';
      details = 'BrowserStack credentials are missing';
    } else if (!realDeviceCommand.trim()) {
      result = 'warning';
      details = 'BrowserStack is configured but REAL_DEVICE_COMMAND is empty';
    } else {
      const run = spawnSync(realDeviceCommand, {
        shell: true,
        stdio: 'inherit',
        env: process.env,
      });
      result = run.status === 0 ? 'success' : 'failure';
      details = run.status === 0
        ? 'Real device command completed'
        : `Real device command failed with exit code ${run.status}`;
    }
  } else {
    result = 'warning';
    details = `Unknown provider "${provider}"`;
  }
}

const summary = {
  checkedAt: new Date().toISOString(),
  provider,
  result,
  details,
  requireGate,
};

fs.mkdirSync(path.resolve('artifacts/agent'), { recursive: true });
fs.writeFileSync(
  path.resolve('artifacts/agent/real-device-summary.json'),
  JSON.stringify(summary, null, 2),
  'utf8',
);

console.log('Real Device Agent summary');
console.log(`- provider: ${provider}`);
console.log(`- result: ${result}`);
console.log(`- details: ${details}`);
console.log(`- requireGate: ${requireGate}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `real_device_result=${result}\n`, 'utf8');
}

if (requireGate && result !== 'success') {
  process.exitCode = 1;
}
