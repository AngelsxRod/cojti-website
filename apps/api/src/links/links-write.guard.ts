import { createHash, timingSafeEqual } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class LinksWriteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const configuredKey = process.env.LINKS_WRITE_API_KEY;
    const suppliedKey: unknown = context.switchToHttp().getRequest().headers[
      'x-api-key'
    ];

    if (!configuredKey || typeof suppliedKey !== 'string') {
      throw new UnauthorizedException('A valid API key is required');
    }

    const expected = createHash('sha256').update(configuredKey).digest();
    const received = createHash('sha256').update(suppliedKey).digest();

    if (!timingSafeEqual(expected, received)) {
      throw new UnauthorizedException('A valid API key is required');
    }

    return true;
  }
}
