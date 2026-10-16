'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@cojti/auth/client';
import { Button } from '@cojti/ui/components/button';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace('/auth');
    router.refresh();
  }

  return <Button onClick={signOut}>Cerrar sesión</Button>;
}
