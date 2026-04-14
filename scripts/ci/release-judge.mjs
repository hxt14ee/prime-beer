import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

const checks = [
  {
    id: 'device-matrix',
    result: process.env.DEVICE_MATRIX_RESULT ?? 'unknown',
    blocking: false,
  },
  {
    id: 'functional',
    result: process.env.FUNCTIONAL_RESULT ?? 'unknown',
    blocking: true,
  },
  {
    id: 'real-device',
    result: process.env.REAL_DEVICE_RESULT ?? 'unknown',
    blocking: (process.env.REQUIRE_REAL_DEVICE_GATE ?? 'false') === 'true',
  },
  {
    id: 'design',
    result: process.env.DESIGN_RESULT ?? 'unknown',
    blocking: true,
  },
  {
    id: 'a11y',
    result: process.env.A11Y_RESULT ?? 'unknown',
    blocking: true,
  },
  {
    id: 'performance',
    result: process.env.PERFORMANCE_RESULT ?? 'unknown',
    blocking: true,
  },
  {
    id: 'fix-agent',
    result: process.env.FIX_RESULT ?? 'unknown',
    blocking: false,
  },
];

const hardFailures = checks.filter((check) => check.blocking && check.result !== 'success');
const verdict = hardFailures.length ? 'REJECT' : 'ACCEPT';

console.log('Release Judge Summary');
for (const check of checks) {
  console.log(`- ${check.id}: ${check.result}${check.blocking ? ' (blocking)' : ' (advisory)'}`);
}
console.log(`Final verdict: ${verdict}`);

fs.mkdirSync(path.resolve('artifacts/agent'), { recursive: true });
fs.writeFileSync(
  path.resolve('artifacts/agent/release-judge-summary.json'),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      verdict,
      checks,
      hardFailures,
    },
    null,
    2,
  ),
  'utf8',
);

if (hardFailures.length) {
  process.exitCode = 1;
}
