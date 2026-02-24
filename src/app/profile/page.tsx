'use client';

import UserProfile from '@/components/auth/UserProfile';
import { Box, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Mi Perfil
        </Typography>
        <UserProfile onLogout={() => router.push('/auth')} />
      </Container>
    </Box>
  );
}
