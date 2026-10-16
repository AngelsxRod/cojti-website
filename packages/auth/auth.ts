import { betterAuth } from 'better-auth/minimal';

// Used only by the Better Auth CLI to generate the Drizzle schema.
export const auth = betterAuth({
  emailAndPassword: { enabled: true },
});
