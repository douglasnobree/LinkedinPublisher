'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Icon,
  Skeleton,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiEdit3,
  FiCalendar,
  FiTrash2,
  FiRefreshCw,
  FiExternalLink,
  FiClock,
  FiTrendingUp,
} from 'react-icons/fi';
import { contentApi, jobsApi } from '@/lib/api';

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
  REVIEW: 'Em Revisão',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
  FAILED: 'Falhou',
};

const personaLabels: Record<string, string> = {
  GENERAL: 'Geral',
  TECH: 'Tech Leader',
  FOUNDER: 'Founder',
  RECRUITER: 'Recruiter',
};

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.getOne(id).then((res) => res.data),
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getByContent(id).then((res) => res.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => contentApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Conteúdo excluído', status: 'success' });
      router.push('/dashboard/content');
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () =>
      jobsApi.startGeneration({
        contentId: id,
        theme: content!.theme,
        persona: content!.persona,
      }),
    onSuccess: () => {
      toast({ title: 'Regenerando conteúdo...', status: 'info' });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    },
  });

  if (isLoading) {
    return (
      <Box py={8}>
        <Container maxW="5xl">
          <VStack spacing={6} align="stretch">
            <Skeleton h="40px" w="200px" />
            <Skeleton h="200px" borderRadius="2xl" />
            <Skeleton h="400px" borderRadius="2xl" />
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!content) {
    return (
      <Box py={8}>
        <Container maxW="5xl">
          <Text>Conteúdo não encontrado</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box py={8}>
      <Container maxW="5xl">
        {/* Header */}
        <HStack mb={6}>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          {/* Title & Status */}
          <Flex
            justify="space-between"
            align="start"
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <VStack align="start" spacing={3} flex={1}>
              <HStack>
                <Badge colorScheme={statusColors[content.status]} fontSize="sm">
                  {statusLabels[content.status]}
                </Badge>
                <Badge variant="outline" colorScheme="gray">
                  {personaLabels[content.persona]}
                </Badge>
              </HStack>
              <Heading size="lg" fontWeight="600" letterSpacing="-0.01em">
                {content.theme}
              </Heading>
              <HStack spacing={4} color="gray.500" fontSize="sm">
                <HStack>
                  <Icon as={FiClock} />
                  <Text>
                    Criado em{' '}
                    {format(new Date(content.createdAt), "d 'de' MMMM, yyyy", {
                      locale: ptBR,
                    })}
                  </Text>
                </HStack>
                <Text>•</Text>
                <Text>Versão {content.version}</Text>
              </HStack>
            </VStack>

            <HStack spacing={2}>
              {content.status === 'REVIEW' && (
                <Button
                  as={Link}
                  href={`/dashboard/content/${id}/schedule`}
                  leftIcon={<FiCalendar />}
                  colorScheme="green"
                >
                  Agendar
                </Button>
              )}
              <Button
                as={Link}
                href={`/dashboard/content/${id}/edit`}
                leftIcon={<FiEdit3 />}
                variant="outline"
              >
                Editar
              </Button>
              <Button
                leftIcon={<FiRefreshCw />}
                variant="ghost"
                onClick={() => regenerateMutation.mutate()}
                isLoading={regenerateMutation.isPending}
              >
                Regenerar
              </Button>
              <Button
                leftIcon={<FiTrash2 />}
                variant="ghost"
                colorScheme="red"
                onClick={() => {
                  if (confirm('Excluir este conteúdo?')) {
                    deleteMutation.mutate();
                  }
                }}
              >
                Excluir
              </Button>
            </HStack>
          </Flex>

          {/* Schedule Info */}
          {content.schedule && (
            <Box
              p={4}
              bg={
                content.schedule.status === 'COMPLETED'
                  ? 'green.900'
                  : 'surface.800'
              }
              borderRadius="xl"
              border="1px solid"
              borderColor={
                content.schedule.status === 'COMPLETED'
                  ? 'green.700'
                  : 'surface.700'
              }
            >
              <HStack justify="space-between">
                <HStack>
                  <Icon
                    as={content.schedule.status === 'COMPLETED' ? FiTrendingUp : FiCalendar}
                    color={
                      content.schedule.status === 'COMPLETED'
                        ? 'green.400'
                        : 'purple.400'
                    }
                  />
                  <Text fontWeight="500">
                    {content.schedule.status === 'COMPLETED'
                      ? `Publicado em ${format(
                          new Date(content.schedule.publishedAt!),
                          "d 'de' MMMM 'às' HH:mm",
                          { locale: ptBR }
                        )}`
                      : `Agendado para ${format(
                          new Date(content.schedule.scheduledAt),
                          "d 'de' MMMM 'às' HH:mm",
                          { locale: ptBR }
                        )}`}
                  </Text>
                </HStack>
                {content.analytics?.postId && (
                  <Button
                    as="a"
                    href={`https://www.linkedin.com/feed/update/${content.analytics.postId}`}
                    target="_blank"
                    size="sm"
                    rightIcon={<FiExternalLink />}
                    variant="ghost"
                  >
                    Ver no LinkedIn
                  </Button>
                )}
              </HStack>
            </Box>
          )}

          {/* Analytics */}
          {content.analytics && (
            <Box
              p={6}
              bg="surface.900"
              borderRadius="2xl"
              border="1px solid"
              borderColor="surface.800"
            >
              <Heading size="sm" mb={4}>
                Performance
              </Heading>
              <HStack spacing={8}>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="700">
                    {content.analytics.impressions.toLocaleString()}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Impressões
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="700">
                    {content.analytics.likes}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Likes
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="700">
                    {content.analytics.comments}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Comentários
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="700">
                    {content.analytics.shares}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Compartilhamentos
                  </Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="700" color="accent.emerald">
                    {content.analytics.engagement.toFixed(2)}%
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Engajamento
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Content Tabs */}
          <Box
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
            overflow="hidden"
          >
            <Tabs variant="soft" colorScheme="linkedin">
              <TabList p={4} bg="surface.800">
                <Tab>Conteúdo Final</Tab>
                <Tab>Rascunho</Tab>
                <Tab>Outline</Tab>
                <Tab>Jobs ({jobs?.length || 0})</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={6}>
                  {content.finalContent ? (
                    <Box
                      p={6}
                      bg="surface.800"
                      borderRadius="xl"
                      whiteSpace="pre-wrap"
                      lineHeight="1.8"
                    >
                      {content.finalContent}
                    </Box>
                  ) : (
                    <Text color="gray.500">
                      Conteúdo final ainda não gerado
                    </Text>
                  )}
                </TabPanel>

                <TabPanel p={6}>
                  {content.rawContent ? (
                    <Box
                      p={6}
                      bg="surface.800"
                      borderRadius="xl"
                      whiteSpace="pre-wrap"
                      lineHeight="1.8"
                    >
                      {content.rawContent}
                    </Box>
                  ) : (
                    <Text color="gray.500">Rascunho não disponível</Text>
                  )}
                </TabPanel>

                <TabPanel p={6}>
                  {content.outline ? (
                    <Box
                      p={6}
                      bg="surface.800"
                      borderRadius="xl"
                      whiteSpace="pre-wrap"
                      lineHeight="1.8"
                    >
                      {content.outline}
                    </Box>
                  ) : (
                    <Text color="gray.500">Outline não disponível</Text>
                  )}
                </TabPanel>

                <TabPanel p={6}>
                  <VStack align="stretch" spacing={3}>
                    {jobs?.map((job) => (
                      <Flex
                        key={job.id}
                        p={4}
                        bg="surface.800"
                        borderRadius="xl"
                        justify="space-between"
                        align="center"
                      >
                        <HStack>
                          <Badge
                            colorScheme={
                              job.status === 'COMPLETED'
                                ? 'green'
                                : job.status === 'FAILED'
                                ? 'red'
                                : job.status === 'PROCESSING'
                                ? 'yellow'
                                : 'gray'
                            }
                          >
                            {job.status}
                          </Badge>
                          <Text fontWeight="500">{job.type}</Text>
                        </HStack>
                        <Text color="gray.500" fontSize="sm">
                          {format(new Date(job.createdAt), 'dd/MM HH:mm')}
                        </Text>
                      </Flex>
                    ))}
                    {(!jobs || jobs.length === 0) && (
                      <Text color="gray.500">Nenhum job registrado</Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
