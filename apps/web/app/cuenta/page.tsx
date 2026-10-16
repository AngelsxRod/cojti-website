import { getAuth } from '@cojti/auth/server';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@cojti/ui/components/card';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { SignOutButton } from './sign-out-button';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await getAuth().getCurrentUser(await headers());
  if (!user) redirect('/auth');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mi cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Nombre:</strong> {user.name}
          </p>
          <p>
            <strong>Correo:</strong> {user.email}
          </p>
          <div className="flex gap-3">
            <SignOutButton />
            <Link
              href="/"
              className="self-center text-sm underline underline-offset-4"
            >
              Ir al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
