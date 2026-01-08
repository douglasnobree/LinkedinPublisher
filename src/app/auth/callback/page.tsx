'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');

      if (!token) {
        router.push('/login?error=no_token');
        return;
      }

      try {
        // Store token temporarily
        useAuthStore.setState({ token, refreshToken: refreshToken || null });

        // Fetch user profile
        const { data: user } = await authApi.getProfile();

        // Set auth state with both tokens
        setAuth(token, refreshToken || '', user);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="linkedin.500" thickness="4px" />
        <Text color="gray.400">Autenticando...</Text>
      </VStack>
    </Box>
  );
}
