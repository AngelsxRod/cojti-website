import { describe, expect, it } from '@jest/globals';

import { DatabaseService } from '../database/database.service';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

describe('LinksController', () => {
  const controller = new LinksController(
    new LinksService({ db: {} } as unknown as DatabaseService),
  );

  it('keeps the POST validation response', async () => {
    await expect(
      controller.create({
        title: 'Example',
        url: 'javascript:alert(1)',
        description: 'Description',
      }),
    ).rejects.toMatchObject({
      status: 400,
      response: {
        message: 'url must be an HTTP(S) URL',
        error: 'Bad Request',
        statusCode: 400,
      },
    });
  });

  it('keeps the PATCH validation response', async () => {
    await expect(controller.update(7, {})).rejects.toMatchObject({
      status: 400,
      response: {
        message: 'At least one link field is required',
        error: 'Bad Request',
        statusCode: 400,
      },
    });
  });
});
