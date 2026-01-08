'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiEdit3,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiLinkedin,
  FiPlus,
  FiChevronDown,
} from 'react-icons/fi';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

const navItems = [
  { icon: FiHome, label: 'Dashboard', href: '/dashboard' },
  { icon: FiEdit3, label: 'Conteúdos', href: '/dashboard/content' },
  { icon: FiCalendar, label: 'Agendamentos', href: '/dashboard/schedule' },
  { icon: FiBarChart2, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: FiSettings, label: 'Configurações', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, token, refreshToken, setUser, setTokens, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Wait for Zustand to rehydrate
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Try to refresh token if access token is missing but refresh token exists
  const { data: refreshData, isError: refreshError } = useQuery({
    queryKey: ['refresh-token'],
    queryFn: async () => {
      if (!refreshToken) throw new Error('No refresh token');
      const response = await authApi.refreshToken(refreshToken);
      return response.data;
    },
    enabled: isHydrated && !token && !!refreshToken,
    retry: false,
  });

  useEffect(() => {
    if (refreshData) {
      setTokens(refreshData.accessToken, refreshData.refreshToken);
      if (refreshData.user) {
        setUser(refreshData.user);
      }
    }
  }, [refreshData, setTokens, setUser]);

  // Fetch user profile if token exists but user is missing
  const { data: profileData, isError: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then((res) => res.data),
    enabled: isHydrated && !!token && !user,
    retry: false,
  });

  useEffect(() => {
    if (profileData && !user) {
      setUser(profileData);
    }
  }, [profileData, user, setUser]);

  // Redirect to login only if no tokens and refresh failed
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration

    const hasTokens = !!token || !!refreshToken;
    const isRefreshing = !token && !!refreshToken && !refreshError && !refreshData;
    
    // Don't redirect if we're still trying to refresh
    if (isRefreshing) return;
    
    // Only redirect if we have no tokens at all
    if (!hasTokens) {
      router.push('/login');
    } else if (refreshError && !token) {
      // Refresh failed and no access token, logout
      logout();
      router.push('/login');
    }
  }, [isHydrated, token, refreshToken, refreshError, refreshData, router, logout]);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/');
    }
  };

  // Show loading while hydrating or refreshing
  if (!isHydrated) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="surface.950"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="linkedin.500" thickness="4px" />
          <Text color="gray.400">Carregando...</Text>
        </VStack>
      </Box>
    );
  }

  // Show loading while refreshing token
  if (!token && !!refreshToken && !refreshError && !refreshData) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="surface.950"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="linkedin.500" thickness="4px" />
          <Text color="gray.400">Restaurando sessão...</Text>
        </VStack>
      </Box>
    );
  }

  // Don't render if no authentication (will redirect)
  if (!token && !refreshToken) {
    return null;
  }

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w="280px"
        bg="surface.900"
        borderRight="1px solid"
        borderColor="surface.800"
        position="fixed"
        h="100vh"
        display="flex"
        flexDirection="column"
      >
        {/* Logo */}
        <HStack px={6} py={5} spacing={3}>
          <Flex
            w={10}
            h={10}
            borderRadius="xl"
            bg="linkedin.500"
            align="center"
            justify="center"
          >
            <Icon as={FiLinkedin} color="white" boxSize={5} />
          </Flex>
          <Text fontWeight="700" fontSize="lg" letterSpacing="-0.01em">
            ContentGen
          </Text>
        </HStack>

        <Divider borderColor="surface.800" />

        {/* New Content Button */}
        <Box px={4} py={4}>
          <Box
            as={Link}
            href="/dashboard/content/new"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            py={3}
            px={4}
            bg="linkedin.500"
            color="white"
            borderRadius="xl"
            fontWeight="500"
            _hover={{
              bg: 'linkedin.400',
              transform: 'translateY(-1px)',
            }}
            transition="all 0.2s"
          >
            <Icon as={FiPlus} />
            Novo Conteúdo
          </Box>
        </Box>

        {/* Navigation */}
        <VStack align="stretch" spacing={1} px={3} flex={1}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Box
                key={item.href}
                as={Link}
                href={item.href}
                display="flex"
                alignItems="center"
                gap={3}
                px={4}
                py={3}
                borderRadius="lg"
                color={isActive ? 'white' : 'gray.400'}
                bg={isActive ? 'surface.800' : 'transparent'}
                fontWeight={isActive ? '500' : '400'}
                _hover={{
                  bg: 'surface.800',
                  color: 'white',
                }}
                transition="all 0.2s"
              >
                <Icon as={item.icon} boxSize={5} />
                <Text>{item.label}</Text>
              </Box>
            );
          })}
        </VStack>

        {/* User Menu */}
        <Box p={4} borderTop="1px solid" borderColor="surface.800">
          <Menu placement="top-start">
            <MenuButton
              w="full"
              p={3}
              borderRadius="xl"
              _hover={{ bg: 'surface.800' }}
              transition="all 0.2s"
            >
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={user?.name || user?.email}
                    src={user?.avatarUrl || undefined}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="500" fontSize="sm" noOfLines={1}>
                      {user?.name || 'Usuário'}
                    </Text>
                    <Text color="gray.500" fontSize="xs" noOfLines={1}>
                      {user?.email}
                    </Text>
                  </VStack>
                </HStack>
                <Icon as={FiChevronDown} color="gray.500" />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiSettings />} as={Link} href="/dashboard/settings">
                Configurações
              </MenuItem>
              <Divider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.400">
                Sair
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* Main Content */}
      <Box ml="280px" flex={1} bg="surface.950" minH="100vh">
        {children}
      </Box>
    </Flex>
  );
}
