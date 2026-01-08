'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Avatar,
  Badge,
  Flex,
  Icon,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  FiLinkedin,
  FiRefreshCw,
  FiCheck,
  FiAlertTriangle,
  FiLogOut,
} from 'react-icons/fi';
import { useAuthStore } from '@/store/auth';
import { authApi, linkedinApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();

  const { data: profile, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then((res) => res.data),
  });

  const linkedinProfile = profile?.linkedinProfile;
  const isTokenExpired = linkedinProfile
    ? new Date() >= new Date(linkedinProfile.tokenExpiresAt)
    : false;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleReconnect = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/v1/auth/linkedin`;
  };

  return (
    <Box py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          <VStack align="start" spacing={1}>
            <Heading size="lg" fontWeight="700" letterSpacing="-0.02em">
              Configurações
            </Heading>
            <Text color="gray.400">Gerencie sua conta e conexões</Text>
          </VStack>

          {/* Profile */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <Heading size="md" mb={6}>
              Perfil
            </Heading>
            <HStack spacing={6}>
              <Avatar
                size="xl"
                name={user?.name || user?.email}
                src={user?.avatarUrl || undefined}
              />
              <VStack align="start" spacing={2}>
                <Heading size="md">{user?.name || 'Usuário'}</Heading>
                <Text color="gray.400">{user?.email}</Text>
                <Badge colorScheme="blue">{user?.role}</Badge>
              </VStack>
            </HStack>
          </Box>

          {/* LinkedIn Connection */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor={isTokenExpired ? 'red.500' : 'surface.800'}
          >
            <HStack justify="space-between" mb={6}>
              <Heading size="md">Conexão LinkedIn</Heading>
              <Badge
                colorScheme={isTokenExpired ? 'red' : 'green'}
                fontSize="sm"
              >
                {isTokenExpired ? 'Token Expirado' : 'Conectado'}
              </Badge>
            </HStack>

            {linkedinProfile ? (
              <VStack align="stretch" spacing={4}>
                <Flex
                  p={4}
                  bg="surface.800"
                  borderRadius="xl"
                  align="center"
                  gap={4}
                >
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bg="linkedin.500"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiLinkedin} color="white" boxSize={6} />
                  </Flex>
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Text fontWeight="500">LinkedIn conectado</Text>
                      <Icon
                        as={isTokenExpired ? FiAlertTriangle : FiCheck}
                        color={isTokenExpired ? 'red.400' : 'green.400'}
                      />
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      Token expira em:{' '}
                      {format(
                        new Date(linkedinProfile.tokenExpiresAt),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </Text>
                  </VStack>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    variant="outline"
                    size="sm"
                    onClick={handleReconnect}
                  >
                    {isTokenExpired ? 'Reconectar' : 'Atualizar'}
                  </Button>
                </Flex>

                {isTokenExpired && (
                  <Box
                    p={4}
                    bg="red.900"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="red.700"
                  >
                    <HStack>
                      <Icon as={FiAlertTriangle} color="red.400" />
                      <Text color="red.300" fontSize="sm">
                        Seu token LinkedIn expirou. Reconecte sua conta para
                        continuar publicando.
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
            ) : (
              <Button
                leftIcon={<FiLinkedin />}
                onClick={handleReconnect}
                size="lg"
                w="full"
              >
                Conectar LinkedIn
              </Button>
            )}
          </Box>

          {/* Preferences */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <Heading size="md" mb={6}>
              Preferências
            </Heading>
            <VStack align="stretch" spacing={4}>
              <FormControl
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <VStack align="start" spacing={0}>
                  <FormLabel mb={0}>Auto-comentário</FormLabel>
                  <Text fontSize="sm" color="gray.500">
                    Adicionar primeiro comentário automático nos posts
                  </Text>
                </VStack>
                <Switch colorScheme="linkedin" defaultChecked />
              </FormControl>
              <Divider borderColor="surface.700" />
              <FormControl
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <VStack align="start" spacing={0}>
                  <FormLabel mb={0}>A/B Testing</FormLabel>
                  <Text fontSize="sm" color="gray.500">
                    Gerar variações de posts para teste
                  </Text>
                </VStack>
                <Switch colorScheme="linkedin" />
              </FormControl>
              <Divider borderColor="surface.700" />
              <FormControl
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <VStack align="start" spacing={0}>
                  <FormLabel mb={0}>Notificações por email</FormLabel>
                  <Text fontSize="sm" color="gray.500">
                    Receber atualizações sobre publicações
                  </Text>
                </VStack>
                <Switch colorScheme="linkedin" defaultChecked />
              </FormControl>
            </VStack>
          </Box>

          {/* Danger Zone */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="red.900"
          >
            <Heading size="md" mb={4} color="red.400">
              Zona de Perigo
            </Heading>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="500">Sair da conta</Text>
                <Text fontSize="sm" color="gray.500">
                  Você será desconectado desta sessão
                </Text>
              </VStack>
              <Button
                leftIcon={<FiLogOut />}
                colorScheme="red"
                variant="outline"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
