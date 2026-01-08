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
  Flex,
  Icon,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FiCalendar,
  FiClock,
  FiX,
  FiExternalLink,
  FiPlus,
} from 'react-icons/fi';
import { schedulerApi } from '@/lib/api';

const statusColors: Record<string, string> = {
  PENDING: 'purple',
  PROCESSING: 'yellow',
  COMPLETED: 'green',
  FAILED: 'red',
  CANCELLED: 'gray',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Aguardando',
  PROCESSING: 'Publicando',
  COMPLETED: 'Publicado',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
};

export default function SchedulePage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulerApi.getAll().then((res) => res.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => schedulerApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: 'Agendamento cancelado',
        status: 'success',
        duration: 3000,
      });
    },
  });

  const upcomingSchedules = schedules?.filter(
    (s) => s.status === 'PENDING' || s.status === 'PROCESSING'
  );
  const pastSchedules = schedules?.filter(
    (s) => s.status === 'COMPLETED' || s.status === 'FAILED' || s.status === 'CANCELLED'
  );

  return (
    <Box py={8}>
      <Container maxW="5xl">
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" fontWeight="700" letterSpacing="-0.02em">
              Agendamentos
            </Heading>
            <Text color="gray.400">
              Gerencie seus posts agendados para publicação
            </Text>
          </VStack>
          <Button as={Link} href="/dashboard/content/new" leftIcon={<FiPlus />}>
            Novo Conteúdo
          </Button>
        </Flex>

        <VStack spacing={8} align="stretch">
          {/* Upcoming */}
          <Box>
            <Heading size="md" mb={4}>
              Próximos
            </Heading>
            {isLoading ? (
              <VStack spacing={4}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} h="100px" borderRadius="xl" />
                ))}
              </VStack>
            ) : upcomingSchedules?.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={12}
                bg="surface.900"
                borderRadius="2xl"
                border="1px solid"
                borderColor="surface.800"
              >
                <Icon as={FiCalendar} boxSize={10} color="gray.600" mb={4} />
                <Text color="gray.500">Nenhum post agendado</Text>
                <Button
                  as={Link}
                  href="/dashboard/content"
                  variant="ghost"
                  size="sm"
                  mt={2}
                >
                  Agendar um post
                </Button>
              </Flex>
            ) : (
              <VStack spacing={4} align="stretch">
                {upcomingSchedules?.map((schedule: any) => (
                  <Box
                    key={schedule.id}
                    p={6}
                    bg="surface.900"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="surface.800"
                  >
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={3} flex={1}>
                        <HStack>
                          <Badge colorScheme={statusColors[schedule.status]}>
                            {statusLabels[schedule.status]}
                          </Badge>
                        </HStack>
                        <Text fontWeight="500" noOfLines={2}>
                          {schedule.content?.theme}
                        </Text>
                        <HStack color="gray.500" fontSize="sm">
                          <Icon as={FiClock} />
                          <Text>
                            {format(
                              new Date(schedule.scheduledAt),
                              "EEEE, d 'de' MMMM 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </Text>
                        </HStack>
                      </VStack>
                      <HStack>
                        <Button
                          as={Link}
                          href={`/dashboard/content/${schedule.contentId}`}
                          size="sm"
                          variant="ghost"
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<FiX />}
                          onClick={() => cancelMutation.mutate(schedule.id)}
                          isLoading={cancelMutation.isPending}
                        >
                          Cancelar
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          {/* Past */}
          {pastSchedules && pastSchedules.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>
                Histórico
              </Heading>
              <VStack spacing={4} align="stretch">
                {pastSchedules.map((schedule: any) => (
                  <Box
                    key={schedule.id}
                    p={6}
                    bg="surface.900"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="surface.800"
                    opacity={schedule.status === 'CANCELLED' ? 0.6 : 1}
                  >
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={3} flex={1}>
                        <HStack>
                          <Badge colorScheme={statusColors[schedule.status]}>
                            {statusLabels[schedule.status]}
                          </Badge>
                        </HStack>
                        <Text fontWeight="500" noOfLines={2}>
                          {schedule.content?.theme}
                        </Text>
                        <HStack color="gray.500" fontSize="sm">
                          <Icon as={FiClock} />
                          <Text>
                            {schedule.publishedAt
                              ? format(
                                  new Date(schedule.publishedAt),
                                  "d 'de' MMMM 'às' HH:mm",
                                  { locale: ptBR }
                                )
                              : format(
                                  new Date(schedule.scheduledAt),
                                  "d 'de' MMMM",
                                  { locale: ptBR }
                                )}
                          </Text>
                        </HStack>
                      </VStack>
                      <HStack>
                        <Button
                          as={Link}
                          href={`/dashboard/content/${schedule.contentId}`}
                          size="sm"
                          variant="ghost"
                        >
                          Ver
                        </Button>
                        {schedule.status === 'COMPLETED' && (
                          <Button
                            as="a"
                            href="#"
                            target="_blank"
                            size="sm"
                            variant="ghost"
                            rightIcon={<FiExternalLink />}
                          >
                            LinkedIn
                          </Button>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
