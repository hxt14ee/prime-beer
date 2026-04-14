import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const matrixPath = path.resolve('config/mobile-device-matrix.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

const errors = [];
const warn = [];

if (!Array.isArray(matrix?.tiers?.tierA) || matrix.tiers.tierA.length === 0) {
  errors.push('Tier A matrix is empty');
}
if (!Array.isArray(matrix?.tiers?.tierB) || matrix.tiers.tierB.length === 0) {
  warn.push('Tier B matrix is empty');
}
if (!matrix?.releaseGates?.coreWebVitals) {
  errors.push('Missing core web vitals thresholds');
}
if (!matrix?.marketBaseline?.topResolutions?.length) {
  warn.push('Top resolutions baseline is missing');
}

const result = errors.length ? 'failure' : (warn.length ? 'warning' : 'success');

const summary = {
  checkedAt: new Date().toISOString(),
  result,
  errors,
  warnings: warn,
  tierADeviceCount: matrix?.tiers?.tierA?.length ?? 0,
  tierBDeviceCount: matrix?.tiers?.tierB?.length ?? 0,
  marketMonth: matrix?.marketBaseline?.month ?? 'unknown',
};

fs.mkdirSync(path.resolve('artifacts/agent'), { recursive: true });
fs.writeFileSync(
  path.resolve('artifacts/agent/device-matrix-summary.json'),
  JSON.stringify(summary, null, 2),
  'utf8',
);

console.log('Device Matrix Agent summary');
console.log(`- result: ${result}`);
if (errors.length) console.log(`- errors: ${errors.join('; ')}`);
if (warn.length) console.log(`- warnings: ${warn.join('; ')}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `device_matrix_result=${result}\n`, 'utf8');
}

// Non-blocking role by design: never hard-fail the pipeline here.
process.exitCode = 0;
