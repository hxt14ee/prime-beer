import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const checks = [
  { id: 'functional', result: process.env.FUNCTIONAL_RESULT ?? 'unknown' },
  { id: 'real-device', result: process.env.REAL_DEVICE_RESULT ?? 'unknown' },
  { id: 'design', result: process.env.DESIGN_RESULT ?? 'unknown' },
  { id: 'a11y', result: process.env.A11Y_RESULT ?? 'unknown' },
  { id: 'performance', result: process.env.PERFORMANCE_RESULT ?? 'unknown' },
];

const failed = checks.filter((check) => check.result !== 'success');
const planLines = [
  '# Fix Agent Plan',
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
];

if (failed.length === 0) {
  planLines.push('No blocking defects detected. No fix tasks required.');
} else {
  planLines.push('Detected failing gates:');
  for (const item of failed) {
    planLines.push(`- ${item.id}: ${item.result}`);
  }
  planLines.push('');
  planLines.push('Recommended order:');
  for (const item of failed) {
    if (item.id === 'functional') planLines.push('- Fix functional regressions first');
    if (item.id === 'real-device') planLines.push('- Resolve real-device incompatibilities');
    if (item.id === 'design') planLines.push('- Fix safe-area/layout/tap-target visual defects');
    if (item.id === 'a11y') planLines.push('- Resolve critical accessibility violations');
    if (item.id === 'performance') planLines.push('- Optimize LCP/INP/CLS and re-run Lighthouse');
  }
}

const fixResult = failed.length === 0 ? 'no_action' : 'plan_created';

fs.mkdirSync(path.resolve('artifacts/agent'), { recursive: true });
fs.writeFileSync(path.resolve('artifacts/agent/fix-plan.md'), `${planLines.join('\n')}\n`, 'utf8');

console.log('Fix Agent summary');
console.log(`- result: ${fixResult}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `fix_agent_result=${fixResult}\n`, 'utf8');
}
