'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/lib/theme';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sistema de reporte de incidentes de seguridad y convivencia" />
        <title>Reporte de Incidentes</title>
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
