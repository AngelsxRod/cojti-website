import { describe, expect, it } from '@jest/globals';

import { parseCreateLink, parseUpdateLink } from './links-validation';

describe('link request validation', () => {
  it('accepts an HTTP URL and trims the fields', () => {
    expect(
      parseCreateLink({
        title: ' Example ',
        url: 'https://example.com',
        description: ' Description ',
      }),
    ).toEqual({
      title: 'Example',
      url: 'https://example.com/',
      description: 'Description',
    });
  });

  it('rejects unsafe or incomplete writes', () => {
    expect(() =>
      parseCreateLink({
        title: 'Bad',
        url: 'javascript:alert(1)',
        description: 'X',
      }),
    ).toThrow();
    expect(() => parseUpdateLink({})).toThrow();
    expect(() => parseUpdateLink({ title: '' })).toThrow();
  });
});
