import type { Metadata } from 'next';
import { TooltipProvider } from '@cojti/ui/components/tooltip';
import './globals.css';

export const metadata: Metadata = {
  title: 'Demetrio Cojtí Cuxil | Sitio personal',
  description:
    'Sitio personal de Demetrio Cojtí Cuxil: trayectoria, publicaciones y actividades.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
