import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

import { prepareDevEnvironment } from './dev-setup.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args, env) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  const { env, useLocalDatabase } = await prepareDevEnvironment(
    root,
    process.env,
  );

  if (useLocalDatabase) {
    run('docker', ['compose', 'up', '-d', '--wait', 'db'], env);
  }

  run('pnpm', ['--filter', '@cojti/db', 'build'], env);
  run('pnpm', ['--filter', '@cojti/db', 'db:migrate'], env);

  const dev = spawn('pnpm', ['exec', 'turbo', 'run', 'dev'], {
    cwd: root,
    env,
    stdio: 'inherit',
  });
  dev.on('error', (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  dev.on('exit', (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
