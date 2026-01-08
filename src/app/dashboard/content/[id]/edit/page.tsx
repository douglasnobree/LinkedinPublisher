'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiCalendar } from 'react-icons/fi';
import { contentApi } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [finalContent, setFinalContent] = useState('');

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.getOne(id).then((res) => res.data),
  });

  useEffect(() => {
    if (content?.finalContent) {
      setFinalContent(content.finalContent);
    }
  }, [content]);

  const updateMutation = useMutation({
    mutationFn: (data: { finalContent: string }) =>
      contentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      toast({
        title: 'Conteúdo salvo!',
        status: 'success',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao salvar',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ finalContent });
  };

  const handleSaveAndSchedule = async () => {
    await updateMutation.mutateAsync({ finalContent });
    router.push(`/dashboard/content/${id}/schedule`);
  };

  const charCount = finalContent.length;
  const isOverLimit = charCount > 3000;

  return (
    <Box py={8}>
      <Container maxW="4xl">
        <HStack mb={8}>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          <VStack align="start" spacing={2}>
            <HStack>
              <Heading size="xl" fontWeight="700" letterSpacing="-0.02em">
                Editar Conteúdo
              </Heading>
            </HStack>
            <Text color="gray.400">{content?.theme}</Text>
          </VStack>

          {/* Image Upload */}
          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <ImageUpload
              contentId={id}
              currentImageUrl={content?.imageUrl || undefined}
              onImageUploaded={(imageUrl) => {
                queryClient.invalidateQueries({ queryKey: ['content', id] });
              }}
            />
          </Box>

          <Box
            p={6}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <FormLabel m={0}>Conteúdo Final</FormLabel>
                <Badge
                  colorScheme={isOverLimit ? 'red' : charCount > 2500 ? 'yellow' : 'gray'}
                >
                  {charCount} / 3000 caracteres
                </Badge>
              </HStack>

              <Textarea
                value={finalContent}
                onChange={(e) => setFinalContent(e.target.value)}
                rows={20}
                fontSize="md"
                lineHeight="1.8"
                fontFamily="body"
                resize="vertical"
                placeholder="Edite o conteúdo do seu post..."
              />

              <HStack justify="flex-end" spacing={3}>
                <Button
                  variant="outline"
                  leftIcon={<FiSave />}
                  onClick={handleSave}
                  isLoading={updateMutation.isPending}
                >
                  Salvar
                </Button>
                <Button
                  leftIcon={<FiCalendar />}
                  onClick={handleSaveAndSchedule}
                  isLoading={updateMutation.isPending}
                  isDisabled={isOverLimit}
                >
                  Salvar e Agendar
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
