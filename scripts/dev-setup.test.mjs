import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { prepareDevEnvironment } from './dev-setup.mjs';

const secret = 'a'.repeat(32);

async function inTemporaryRoot(run) {
  const root = mkdtempSync(join(tmpdir(), 'cojti-dev-setup-'));
  try {
    await run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('creates local credentials and a MariaDB URL when no database is configured', async () => {
  await inTemporaryRoot(async (root) => {
    const { env, useLocalDatabase } = await prepareDevEnvironment(root, {});
    const envPath = join(root, '.env');
    const contents = readFileSync(envPath, 'utf8');

    assert.equal(useLocalDatabase, true);
    assert.match(env.COJTI_DB_PASSWORD, /^[a-f0-9]{64}$/);
    assert.match(env.LINKS_WRITE_API_KEY, /^[a-f0-9]{64}$/);
    assert.match(env.BETTER_AUTH_SECRET, /^[a-f0-9]{64}$/);
    assert.equal(env.BETTER_AUTH_URL, 'http://localhost:3001');
    assert.equal(
      env.DATABASE_URL,
      `mysql://cojti:${env.COJTI_DB_PASSWORD}@localhost:${env.COJTI_MARIADB_PORT}/cojti`,
    );
    assert.match(contents, /COJTI_DB_PASSWORD=/);
    assert.equal(statSync(envPath).mode & 0o777, 0o600);
  });
});

test('keeps process environment values ahead of .env values', async () => {
  await inTemporaryRoot(async (root) => {
    writeFileSync(
      join(root, '.env'),
      `BETTER_AUTH_SECRET=${'b'.repeat(32)}\nDATABASE_URL=mysql://file/db\n`,
    );
    const initialEnv = {
      BETTER_AUTH_SECRET: secret,
      DATABASE_URL: 'mysql://process/db',
    };

    const { env, useLocalDatabase } = await prepareDevEnvironment(
      root,
      initialEnv,
    );

    assert.equal(useLocalDatabase, false);
    assert.equal(env.BETTER_AUTH_SECRET, secret);
    assert.equal(env.DATABASE_URL, 'mysql://process/db');
    assert.equal(initialEnv.BETTER_AUTH_URL, undefined);
    assert.equal(env.BETTER_AUTH_URL, 'http://localhost:3001');
  });
});

test('rejects an invalid auth secret', async () => {
  await inTemporaryRoot(async (root) => {
    await assert.rejects(
      prepareDevEnvironment(root, {
        DATABASE_URL: 'mysql://process/db',
        BETTER_AUTH_SECRET: 'replace-with-a-secret',
      }),
      /Set a long BETTER_AUTH_SECRET in .env/,
    );
  });
});

test('rejects an already running Next instance before starting the database', async () => {
  await inTemporaryRoot(async (root) => {
    const lockDir = join(root, 'apps/web/.next/dev');
    mkdirSync(lockDir, { recursive: true });
    writeFileSync(join(lockDir, 'lock'), JSON.stringify({ pid: process.pid }));

    await assert.rejects(
      prepareDevEnvironment(root, {
        DATABASE_URL: 'mysql://process/db',
        BETTER_AUTH_SECRET: secret,
      }),
      new RegExp(
        `Ya hay un servidor Next\\.js de este proyecto activo \\(PID ${process.pid}\\)`,
      ),
    );
  });
});
