'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Flex,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { format, addHours } from 'date-fns';
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';
import { contentApi, schedulerApi } from '@/lib/api';

export default function ScheduleContentPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params.id as string;

  // Default to 1 hour from now
  const defaultDate = format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
  const [scheduledAt, setScheduledAt] = useState(defaultDate);

  const { data: content } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.getOne(id).then((res) => res.data),
  });

  const scheduleMutation = useMutation({
    mutationFn: () =>
      schedulerApi.schedule({
        contentId: id,
        scheduledAt: new Date(scheduledAt).toISOString(),
      }),
    onSuccess: () => {
      toast({
        title: 'Conteúdo agendado!',
        description: 'Seu post será publicado automaticamente.',
        status: 'success',
        duration: 5000,
      });
      router.push(`/dashboard/content/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao agendar',
        description: error.response?.data?.message || 'Tente novamente',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const quickSchedule = (hours: number) => {
    const date = addHours(new Date(), hours);
    setScheduledAt(format(date, "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <Box py={8}>
      <Container maxW="3xl">
        <HStack mb={8}>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </HStack>

        <VStack spacing={8} align="stretch">
          <VStack align="start" spacing={2}>
            <Heading size="xl" fontWeight="700" letterSpacing="-0.02em">
              Agendar Publicação
            </Heading>
            <Text color="gray.400">
              Escolha quando seu post será publicado no LinkedIn
            </Text>
          </VStack>

          {/* Content Preview */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <Text fontWeight="500" mb={4}>
              {content?.theme}
            </Text>
            <Box
              p={4}
              bg="surface.800"
              borderRadius="xl"
              maxH="200px"
              overflowY="auto"
            >
              <Text
                whiteSpace="pre-wrap"
                fontSize="sm"
                color="gray.300"
                noOfLines={8}
              >
                {content?.finalContent || content?.rawContent}
              </Text>
            </Box>
          </Box>

          {/* Schedule Form */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Data e Hora da Publicação</FormLabel>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  size="lg"
                />
              </FormControl>

              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  Atalhos rápidos:
                </Text>
                <HStack flexWrap="wrap" gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiClock />}
                    onClick={() => quickSchedule(1)}
                  >
                    Em 1 hora
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiClock />}
                    onClick={() => quickSchedule(3)}
                  >
                    Em 3 horas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiCalendar />}
                    onClick={() => quickSchedule(24)}
                  >
                    Amanhã
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiCalendar />}
                    onClick={() => quickSchedule(24 * 7)}
                  >
                    Em 1 semana
                  </Button>
                </HStack>
              </VStack>

              <Alert status="info" borderRadius="xl">
                <AlertIcon />
                <Text fontSize="sm">
                  O post será publicado automaticamente no horário agendado.
                  Certifique-se que sua conta LinkedIn está conectada.
                </Text>
              </Alert>

              <Button
                size="lg"
                leftIcon={<FiCalendar />}
                onClick={() => scheduleMutation.mutate()}
                isLoading={scheduleMutation.isPending}
                bgGradient="linear(to-r, accent.violet, linkedin.500)"
                _hover={{
                  bgGradient: 'linear(to-r, accent.violet, linkedin.400)',
                }}
              >
                Confirmar Agendamento
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
