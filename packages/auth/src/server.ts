import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { authSchema, createDatabase } from '@cojti/db';
import { betterAuth } from 'better-auth/minimal';

export type AuthOptions = {
  databaseUrl: string;
  secret: string;
  baseURL: string;
};

export type AuthUser = { id: string; name: string; email: string };

export type AuthService = {
  handler: (request: Request) => Promise<Response>;
  getCurrentUser: (headers: Headers) => Promise<AuthUser | null>;
  close: () => Promise<void>;
};

export function createAuth({
  databaseUrl,
  secret,
  baseURL,
}: AuthOptions): AuthService {
  if (secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters');
  }

  const origin = new URL(baseURL);
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  ) {
    throw new Error('BETTER_AUTH_URL must be an HTTP(S) origin without a path');
  }
  const { db, pool } = createDatabase(databaseUrl);
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'mysql',
      schema: authSchema,
    }),
    secret,
    baseURL: origin.origin,
    advanced: { useSecureCookies: origin.protocol === 'https:' },
    emailAndPassword: { enabled: true },
  });

  return {
    handler: (request) => auth.handler(request),
    getCurrentUser: async (headers) => {
      const session = await auth.api.getSession({ headers });
      if (!session) return null;
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      };
    },
    close: () => pool.end(),
  };
}

let instance: ReturnType<typeof createAuth> | undefined;

export function getAuth(): AuthService {
  if (!instance) {
    const databaseUrl = process.env.DATABASE_URL;
    const secret = process.env.BETTER_AUTH_SECRET;
    const baseURL = process.env.BETTER_AUTH_URL;

    if (!databaseUrl)
      throw new Error('DATABASE_URL is required for Better Auth');
    if (!secret) throw new Error('BETTER_AUTH_SECRET is required');
    if (!baseURL) throw new Error('BETTER_AUTH_URL is required');

    instance = createAuth({ databaseUrl, secret, baseURL });
  }

  return instance;
}
