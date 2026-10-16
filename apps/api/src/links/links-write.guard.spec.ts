import type { ExecutionContext } from '@nestjs/common';
import { afterEach, describe, expect, it } from '@jest/globals';

import { LinksWriteGuard } from './links-write.guard';

function context(key?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { 'x-api-key': key } }),
    }),
  } as unknown as ExecutionContext;
}

describe('LinksWriteGuard', () => {
  const originalKey = process.env.LINKS_WRITE_API_KEY;
  const guard = new LinksWriteGuard();

  afterEach(() => {
    if (originalKey === undefined) delete process.env.LINKS_WRITE_API_KEY;
    else process.env.LINKS_WRITE_API_KEY = originalKey;
  });

  it('allows the configured key', () => {
    process.env.LINKS_WRITE_API_KEY = 'test-secret';
    expect(guard.canActivate(context('test-secret'))).toBe(true);
  });

  it('rejects missing, wrong, or unconfigured keys', () => {
    process.env.LINKS_WRITE_API_KEY = 'test-secret';
    expect(() => guard.canActivate(context())).toThrow();
    expect(() => guard.canActivate(context('wrong'))).toThrow();
    delete process.env.LINKS_WRITE_API_KEY;
    expect(() => guard.canActivate(context('test-secret'))).toThrow();
  });
});
