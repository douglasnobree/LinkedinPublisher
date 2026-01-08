'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Flex,
  Badge,
  Button,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FiEdit3,
  FiCalendar,
  FiCheckCircle,
  FiTrendingUp,
  FiArrowRight,
  FiPlus,
  FiZap,
} from 'react-icons/fi';
import { contentApi, analyticsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const statusColors: Record<string, string> = {
  DRAFT: 'gray',
  GENERATING: 'yellow',
  REVIEW: 'blue',
  SCHEDULED: 'purple',
  PUBLISHED: 'green',
  FAILED: 'red',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  GENERATING: 'Gerando',
  REVIEW: 'Revisão',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  FAILED: 'Falhou',
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => contentApi.getDashboard().then((res) => res.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview().then((res) => res.data),
  });

  const stats = [
    {
      label: 'Total de Posts',
      value: dashboard?.stats.total || 0,
      icon: FiEdit3,
      color: 'linkedin.500',
    },
    {
      label: 'Publicados',
      value: dashboard?.stats.published || 0,
      icon: FiCheckCircle,
      color: 'accent.emerald',
    },
    {
      label: 'Agendados',
      value: dashboard?.stats.scheduled || 0,
      icon: FiCalendar,
      color: 'accent.violet',
    },
    {
      label: 'Rascunhos',
      value: dashboard?.stats.draft || 0,
      icon: FiEdit3,
      color: 'accent.amber',
    },
  ];

  return (
    <Box py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={1}>
            <Text color="gray.400">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </Text>
            <Heading size="lg" fontWeight="700" letterSpacing="-0.02em">
              Olá, {user?.name?.split(' ')[0] || 'Usuário'} 👋
            </Heading>
          </VStack>
          <Button
            as={Link}
            href="/dashboard/content/new"
            leftIcon={<FiPlus />}
            size="lg"
          >
            Novo Conteúdo
          </Button>
        </Flex>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={6} mb={8}>
          {stats.map((stat) => (
            <Box
              key={stat.label}
              p={6}
              bg="surface.900"
              borderRadius="2xl"
              border="1px solid"
              borderColor="surface.800"
            >
              <HStack justify="space-between" mb={3}>
                <Flex
                  w={10}
                  h={10}
                  borderRadius="xl"
                  bg="surface.800"
                  align="center"
                  justify="center"
                >
                  <Icon as={stat.icon} color={stat.color} boxSize={5} />
                </Flex>
              </HStack>
              <Skeleton isLoaded={!loadingDashboard}>
                <Text fontSize="3xl" fontWeight="700">
                  {stat.value}
                </Text>
              </Skeleton>
              <Text color="gray.500" fontSize="sm" mt={1}>
                {stat.label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Recent Contents */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <HStack justify="space-between" mb={6}>
              <Heading size="md" fontWeight="600">
                Conteúdos Recentes
              </Heading>
              <Button
                as={Link}
                href="/dashboard/content"
                variant="ghost"
                size="sm"
                rightIcon={<FiArrowRight />}
              >
                Ver todos
              </Button>
            </HStack>

            <VStack align="stretch" spacing={4}>
              {loadingDashboard ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} h="80px" borderRadius="xl" />
                ))
              ) : dashboard?.recentContents.length === 0 ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={12}
                  color="gray.500"
                >
                  <Icon as={FiZap} boxSize={10} mb={4} />
                  <Text>Nenhum conteúdo ainda</Text>
                  <Button
                    as={Link}
                    href="/dashboard/content/new"
                    variant="ghost"
                    size="sm"
                    mt={2}
                  >
                    Criar primeiro conteúdo
                  </Button>
                </Flex>
              ) : (
                dashboard?.recentContents.map((content) => (
                  <Box
                    key={content.id}
                    as={Link}
                    href={`/dashboard/content/${content.id}`}
                    p={4}
                    bg="surface.800"
                    borderRadius="xl"
                    _hover={{ bg: 'surface.700' }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Badge colorScheme={statusColors[content.status]}>
                        {statusLabels[content.status]}
                      </Badge>
                      <Text color="gray.500" fontSize="xs">
                        {format(new Date(content.createdAt), 'dd/MM/yyyy')}
                      </Text>
                    </HStack>
                    <Text fontWeight="500" noOfLines={2}>
                      {content.theme}
                    </Text>
                    {content.analytics && (
                      <HStack mt={2} spacing={4} color="gray.500" fontSize="xs">
                        <Text>{content.analytics.impressions} impressões</Text>
                        <Text>{content.analytics.likes} likes</Text>
                      </HStack>
                    )}
                  </Box>
                ))
              )}
            </VStack>
          </Box>

          {/* Analytics Summary */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <HStack justify="space-between" mb={6}>
              <Heading size="md" fontWeight="600">
                Performance
              </Heading>
              <Button
                as={Link}
                href="/dashboard/analytics"
                variant="ghost"
                size="sm"
                rightIcon={<FiArrowRight />}
              >
                Ver detalhes
              </Button>
            </HStack>

            {analytics ? (
              <VStack align="stretch" spacing={6}>
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel color="gray.500">Impressões</StatLabel>
                    <StatNumber fontSize="2xl">
                      {analytics.totals?.impressions?.toLocaleString() || 0}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Total acumulado
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.500">Engajamento</StatLabel>
                    <StatNumber fontSize="2xl">
                      {(analytics.avgEngagement || 0).toFixed(2)}%
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Média
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Box
                  p={4}
                  bg="surface.800"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="surface.700"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text color="gray.500" fontSize="sm">
                        Total de Likes
                      </Text>
                      <Text fontWeight="700" fontSize="xl">
                        {analytics.totals?.likes?.toLocaleString() || 0}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={0}>
                      <Text color="gray.500" fontSize="sm">
                        Comentários
                      </Text>
                      <Text fontWeight="700" fontSize="xl">
                        {analytics.totals?.comments?.toLocaleString() || 0}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={0}>
                      <Text color="gray.500" fontSize="sm">
                        Compartilhamentos
                      </Text>
                      <Text fontWeight="700" fontSize="xl">
                        {analytics.totals?.shares?.toLocaleString() || 0}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={12}
                color="gray.500"
              >
                <Icon as={FiTrendingUp} boxSize={10} mb={4} />
                <Text>Publique conteúdos para ver analytics</Text>
              </Flex>
            )}
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
