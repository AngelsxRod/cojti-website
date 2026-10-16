import { BadRequestException } from '@nestjs/common';
import type { CreateLinkDto, UpdateLinkDto } from '@cojti/api';

const fields = ['title', 'url', 'description'] as const;
type LinkField = (typeof fields)[number];

function parseBody(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('The request body must be an object');
  }

  const values = body as Record<string, unknown>;
  if (
    Object.keys(values).some((field) => !fields.includes(field as LinkField))
  ) {
    throw new BadRequestException('Unknown link field');
  }
  return values;
}

function parseField(field: LinkField, value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} must be a non-empty string`);
  }

  const text = value.trim();
  if (field === 'url') {
    try {
      const url = new URL(text);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      return url.toString();
    } catch {
      throw new BadRequestException('url must be an HTTP(S) URL');
    }
  }
  return text;
}

export function parseCreateLink(body: unknown): CreateLinkDto {
  const values = parseBody(body);
  return {
    title: parseField('title', values.title),
    url: parseField('url', values.url),
    description: parseField('description', values.description),
  };
}

export function parseUpdateLink(body: unknown): UpdateLinkDto {
  const values = parseBody(body);
  const result: UpdateLinkDto = {};

  for (const field of fields) {
    if (field in values) result[field] = parseField(field, values[field]);
  }
  if (Object.keys(result).length === 0) {
    throw new BadRequestException('At least one link field is required');
  }
  return result;
}
