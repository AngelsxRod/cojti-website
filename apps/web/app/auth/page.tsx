'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@cojti/auth/client';
import { Button } from '@cojti/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cojti/ui/components/card';
import { Input } from '@cojti/ui/components/input';
import { Label } from '@cojti/ui/components/label';

export default function AuthPage() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '');

    try {
      const result = register
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message ?? 'No se pudo completar la solicitud.');
        return;
      }

      router.replace('/cuenta');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servicio de autenticación.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{register ? 'Crear cuenta' : 'Iniciar sesión'}</CardTitle>
          <CardDescription>
            Accede al sitio de Demetrio Cojtí Cuxil con tu correo electrónico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {register && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                minLength={8}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Procesando…' : register ? 'Registrarse' : 'Entrar'}
            </Button>
          </form>
          <Button
            type="button"
            variant="link"
            className="mt-3 px-0"
            onClick={() => {
              setRegister(!register);
              setError('');
            }}
          >
            {register ? 'Ya tengo cuenta' : 'Crear una cuenta'}
          </Button>
          <p className="mt-4 text-sm">
            <Link href="/" className="underline underline-offset-4">
              Volver al inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
