import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rolesPath = path.resolve('config/agent-roles.json');
const rolesConfig = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
const requireRealDeviceGate = (process.env.REQUIRE_REAL_DEVICE_GATE ?? 'false') === 'true';

const runContext = {
  startedAt: new Date().toISOString(),
  gitRef: process.env.GITHUB_REF ?? 'local',
  gitSha: process.env.GITHUB_SHA ?? 'local',
  requireRealDeviceGate,
  roles: rolesConfig.roles,
};

fs.mkdirSync(path.resolve('artifacts/agent'), { recursive: true });
fs.writeFileSync(
  path.resolve('artifacts/agent/orchestrator-context.json'),
  JSON.stringify(runContext, null, 2),
  'utf8',
);

console.log('Orchestrator (Lead) initialized pipeline');
console.log(`- requireRealDeviceGate: ${requireRealDeviceGate}`);
console.log(`- roles: ${rolesConfig.roles.length}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `require_real_device_gate=${requireRealDeviceGate}\n`,
    'utf8',
  );
}
