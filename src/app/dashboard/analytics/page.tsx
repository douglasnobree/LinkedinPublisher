'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Flex,
  Icon,
  Skeleton,
  Select,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiTrendingUp,
  FiTarget,
} from 'react-icons/fi';
import { analyticsApi } from '@/lib/api';

const personaColors: Record<string, string> = {
  GENERAL: 'gray',
  TECH: 'blue',
  FOUNDER: 'purple',
  RECRUITER: 'green',
};

const personaLabels: Record<string, string> = {
  GENERAL: 'Geral',
  TECH: 'Tech',
  FOUNDER: 'Founder',
  RECRUITER: 'Recruiter',
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview().then((res) => res.data),
  });

  const { data: topPosts, isLoading: loadingTop } = useQuery({
    queryKey: ['analytics-top'],
    queryFn: () => analyticsApi.getTopPosts(5).then((res) => res.data),
  });

  const { data: personaData } = useQuery({
    queryKey: ['analytics-personas'],
    queryFn: () => analyticsApi.getByPersona().then((res) => res.data),
  });

  const stats = [
    {
      label: 'Impressões',
      value: overview?.totals?.impressions || 0,
      icon: FiEye,
      color: 'linkedin.500',
    },
    {
      label: 'Likes',
      value: overview?.totals?.likes || 0,
      icon: FiHeart,
      color: 'accent.rose',
    },
    {
      label: 'Comentários',
      value: overview?.totals?.comments || 0,
      icon: FiMessageCircle,
      color: 'accent.amber',
    },
    {
      label: 'Compartilhamentos',
      value: overview?.totals?.shares || 0,
      icon: FiShare2,
      color: 'accent.cyan',
    },
  ];

  return (
    <Box py={8}>
      <Container maxW="7xl">
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" fontWeight="700" letterSpacing="-0.02em">
              Analytics
            </Heading>
            <Text color="gray.400">
              Performance dos seus posts no LinkedIn
            </Text>
          </VStack>
          <Select
            w="200px"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </Select>
        </Flex>

        <VStack spacing={8} align="stretch">
          {/* Overview Stats */}
          <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={6}>
            {stats.map((stat) => (
              <Box
                key={stat.label}
                p={6}
                bg="surface.900"
                borderRadius="2xl"
                border="1px solid"
                borderColor="surface.800"
              >
                <HStack justify="space-between" mb={4}>
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
                <Skeleton isLoaded={!loadingOverview}>
                  <Text fontSize="3xl" fontWeight="700">
                    {stat.value.toLocaleString()}
                  </Text>
                </Skeleton>
                <Text color="gray.500" fontSize="sm" mt={1}>
                  {stat.label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* Engagement & Personas */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Engagement Rate */}
            <Box
              p={6}
              bg="surface.900"
              borderRadius="2xl"
              border="1px solid"
              borderColor="surface.800"
            >
              <HStack justify="space-between" mb={6}>
                <Heading size="md" fontWeight="600">
                  Taxa de Engajamento
                </Heading>
                <Icon as={FiTrendingUp} color="accent.emerald" boxSize={6} />
              </HStack>
              <VStack align="center" spacing={4}>
                <Text fontSize="5xl" fontWeight="700" color="accent.emerald">
                  {(overview?.avgEngagement || 0).toFixed(2)}%
                </Text>
                <Text color="gray.500">
                  Média de engajamento em {overview?.postsCount || 0} posts
                </Text>
              </VStack>
            </Box>

            {/* Persona Performance */}
            <Box
              p={6}
              bg="surface.900"
              borderRadius="2xl"
              border="1px solid"
              borderColor="surface.800"
            >
              <HStack justify="space-between" mb={6}>
                <Heading size="md" fontWeight="600">
                  Performance por Persona
                </Heading>
                <Icon as={FiTarget} color="accent.violet" boxSize={6} />
              </HStack>
              <VStack spacing={4} align="stretch">
                {personaData && personaData.length > 0 ? (
                  personaData.map((persona: any) => (
                    <Flex
                      key={persona.persona}
                      justify="space-between"
                      align="center"
                      p={3}
                      bg="surface.800"
                      borderRadius="xl"
                    >
                      <HStack>
                        <Badge colorScheme={personaColors[persona.persona]}>
                          {personaLabels[persona.persona]}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          {persona.posts} posts
                        </Text>
                      </HStack>
                      <Text fontWeight="600" color="accent.emerald">
                        {persona.avgEngagement?.toFixed(2) || 0}%
                      </Text>
                    </Flex>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    Publique posts para ver performance por persona
                  </Text>
                )}
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Top Performing Posts */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <Heading size="md" mb={6} fontWeight="600">
              Top Posts
            </Heading>
            {loadingTop ? (
              <VStack spacing={4}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} h="80px" w="full" borderRadius="xl" />
                ))}
              </VStack>
            ) : topPosts && topPosts.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {topPosts.map((post: any, index: number) => (
                  <Flex
                    key={post.id}
                    p={4}
                    bg="surface.800"
                    borderRadius="xl"
                    align="center"
                    gap={4}
                  >
                    <Flex
                      w={8}
                      h={8}
                      borderRadius="lg"
                      bg={index === 0 ? 'accent.amber' : 'surface.700'}
                      align="center"
                      justify="center"
                      fontWeight="700"
                      fontSize="sm"
                      color={index === 0 ? 'black' : 'white'}
                    >
                      {index + 1}
                    </Flex>
                    <VStack flex={1} align="start" spacing={1}>
                      <Text fontWeight="500" noOfLines={1}>
                        {post.content?.theme}
                      </Text>
                      <HStack spacing={4} color="gray.500" fontSize="sm">
                        <HStack>
                          <Icon as={FiEye} />
                          <Text>{post.impressions}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiHeart} />
                          <Text>{post.likes}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiMessageCircle} />
                          <Text>{post.comments}</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                    <Badge colorScheme="green" fontSize="sm">
                      {post.engagement?.toFixed(2)}%
                    </Badge>
                  </Flex>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                Publique posts para ver o ranking de performance
              </Text>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
