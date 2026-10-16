import { randomBytes } from 'node:crypto';
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');
const nextDevLockPath = resolve(root, 'apps/web/.next/dev/lock');
const env = { ...process.env };

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function availablePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
  });
}

function assertWebPortAvailable() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(
          new Error(
            'El puerto 3001 ya está ocupado. Revisa http://localhost:3001 y detén el servidor anterior antes de ejecutar pnpm dev otra vez.',
          ),
        );
      } else {
        reject(error);
      }
    });
    server.listen(3001, () => server.close(resolvePort));
  });
}

function assertNextDevNotRunning() {
  if (!existsSync(nextDevLockPath)) return;

  let pid;
  try {
    pid = JSON.parse(readFileSync(nextDevLockPath, 'utf8')).pid;
  } catch {
    return;
  }
  if (!Number.isInteger(pid) || pid <= 0) return;

  try {
    process.kill(pid, 0);
  } catch (error) {
    if (error.code === 'ESRCH') return;
    if (error.code !== 'EPERM') throw error;
  }

  throw new Error(
    `Ya hay un servidor Next.js de este proyecto activo (PID ${pid}). Detén su terminal con Ctrl+C o ejecuta kill ${pid} antes de iniciar pnpm dev otra vez.`,
  );
}

async function main() {
  if (!existsSync(envPath) && !env.DATABASE_URL) {
    const password = randomBytes(32).toString('hex');
    const apiKey = randomBytes(32).toString('hex');
    const authSecret = randomBytes(32).toString('hex');
    const port = await availablePort();
    writeFileSync(
      envPath,
      `COJTI_DB_PASSWORD=${password}\nCOJTI_DB_PORT=${port}\nLINKS_WRITE_API_KEY=${apiKey}\nBETTER_AUTH_SECRET=${authSecret}\n`,
      { flag: 'wx', mode: 0o600 },
    );
    console.log('Created .env with local development credentials.');
  }

  if (existsSync(envPath)) {
    const fileEnv = parseEnv(readFileSync(envPath, 'utf8'));
    for (const [key, value] of Object.entries(fileEnv)) {
      if (env[key] === undefined) env[key] = value;
    }
  }

  if (!env.BETTER_AUTH_SECRET) {
    const secret = randomBytes(32).toString('hex');
    if (existsSync(envPath)) {
      appendFileSync(envPath, `BETTER_AUTH_SECRET=${secret}\n`);
    } else {
      writeFileSync(envPath, `BETTER_AUTH_SECRET=${secret}\n`, {
        flag: 'wx',
        mode: 0o600,
      });
    }
    env.BETTER_AUTH_SECRET = secret;
  }
  if (
    env.BETTER_AUTH_SECRET.length < 32 ||
    env.BETTER_AUTH_SECRET.startsWith('replace-with-')
  ) {
    throw new Error('Set a long BETTER_AUTH_SECRET in .env.');
  }
  env.BETTER_AUTH_URL ||= 'http://localhost:3001';

  assertNextDevNotRunning();
  await assertWebPortAvailable();

  if (!env.DATABASE_URL) {
    if (
      !env.COJTI_DB_PASSWORD ||
      env.COJTI_DB_PASSWORD.startsWith('replace-with-')
    ) {
      throw new Error(
        'Set COJTI_DB_PASSWORD in .env, or provide DATABASE_URL.',
      );
    }
    if (!/^[A-Za-z0-9_-]+$/.test(env.COJTI_DB_PASSWORD)) {
      throw new Error(
        'COJTI_DB_PASSWORD must contain only letters, digits, hyphens or underscores.',
      );
    }

    run('docker', ['compose', 'up', '-d', '--wait', 'db']);
    env.DATABASE_URL = `postgresql://cojti:${env.COJTI_DB_PASSWORD}@localhost:${env.COJTI_DB_PORT || '5432'}/cojti`;
  }

  run('pnpm', ['--filter', '@cojti/db', 'build']);
  run('pnpm', ['--filter', '@cojti/db', 'db:migrate']);

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
