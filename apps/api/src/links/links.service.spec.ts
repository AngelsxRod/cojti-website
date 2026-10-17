import { describe, expect, it } from '@jest/globals';

import { DatabaseService } from '../database/database.service';
import { LinksService } from './links.service';

function createTestService() {
  const link = {
    id: 7,
    title: 'Example',
    url: 'https://example.com/',
    description: 'Description',
  };
  const writes: unknown[] = [];
  let queries = 0;

  const db = {
    insert: () => {
      queries++;
      return {
        values: (values: unknown) => {
          writes.push(values);
          return { $returningId: async () => [{ id: link.id }] };
        },
      };
    },
    update: () => {
      queries++;
      return {
        set: (values: unknown) => {
          writes.push(values);
          return { where: async () => [{ affectedRows: 1 }] };
        },
      };
    },
    select: () => {
      queries++;
      return {
        from: () => ({ where: () => ({ limit: async () => [link] }) }),
      };
    },
  };

  return {
    service: new LinksService({ db } as unknown as DatabaseService),
    link,
    writes,
    get queries() {
      return queries;
    },
  };
}

describe('LinksService', () => {
  it('validates and normalizes a link before inserting it', async () => {
    const test = createTestService();

    await expect(
      test.service.create({
        title: ' Example ',
        url: 'https://example.com',
        description: ' Description ',
      }),
    ).resolves.toEqual(test.link);
    expect(test.writes).toEqual([
      {
        title: 'Example',
        url: 'https://example.com/',
        description: 'Description',
      },
    ]);
  });

  it('validates a link update before writing and returning the link', async () => {
    const test = createTestService();

    await expect(
      test.service.update(7, { url: 'https://example.com' }),
    ).resolves.toEqual(test.link);
    expect(test.writes).toEqual([{ url: 'https://example.com/' }]);
  });

  it('rejects invalid writes before querying MariaDB', async () => {
    const test = createTestService();

    await expect(
      test.service.create({
        title: 'Example',
        url: 'javascript:alert(1)',
        description: 'Description',
      }),
    ).rejects.toThrow('url must be an HTTP(S) URL');
    await expect(test.service.update(7, {})).rejects.toThrow(
      'At least one link field is required',
    );
    expect(test.queries).toBe(0);
  });
});
