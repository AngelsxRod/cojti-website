import { getAuth } from '@cojti/auth/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  return getAuth().handler(request);
}

export const POST = GET;
