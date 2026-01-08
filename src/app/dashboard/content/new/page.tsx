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
  Textarea,
  Select,
  Flex,
  Icon,
  Progress,
  Badge,
  useToast,
  Collapse,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiZap, FiArrowLeft, FiEdit3, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { contentApi, jobsApi, type Content } from '@/lib/api';

interface FormData {
  theme: string;
  persona: string;
}

const personaOptions = [
  { value: 'GENERAL', label: 'Geral', description: 'Tom profissional e balanceado' },
  { value: 'TECH', label: 'Tech Leader', description: 'Foco em tecnologia e inovação' },
  { value: 'FOUNDER', label: 'Founder', description: 'Empreendedorismo e lições de negócio' },
  { value: 'RECRUITER', label: 'Recruiter', description: 'Carreira e cultura organizacional' },
];

const steps = [
  { label: 'Outline', description: 'Estruturando o conteúdo...' },
  { label: 'Conteúdo', description: 'Gerando o post...' },
  { label: 'Polimento', description: 'Otimizando para LinkedIn...' },
];

export default function NewContentPage() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(-1);
  const [contentId, setContentId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Content | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      persona: 'GENERAL',
    },
  });

  const theme = watch('theme');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => contentApi.create(data).then((res) => res.data),
    onSuccess: (content) => {
      setContentId(content.id);
      startGeneration(content);
    },
    onError: () => {
      toast({
        title: 'Erro ao criar conteúdo',
        status: 'error',
        duration: 3000,
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: { contentId: string; theme: string; persona: string }) =>
      jobsApi.startGeneration(data),
  });

  // Poll for content updates
  const { data: contentData } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentApi.getOne(contentId!).then((res) => res.data),
    enabled: !!contentId && currentStep >= 0,
    refetchInterval: currentStep >= 0 && currentStep < 3 ? 2000 : false,
  });

  useEffect(() => {
    if (contentData) {
      setGeneratedContent(contentData);
      
      // Update step based on content
      if (contentData.finalContent) {
        setCurrentStep(3);
      } else if (contentData.rawContent) {
        setCurrentStep(2);
      } else if (contentData.outline) {
        setCurrentStep(1);
      }
    }
  }, [contentData]);

  const startGeneration = async (content: Content) => {
    setCurrentStep(0);
    await generateMutation.mutateAsync({
      contentId: content.id,
      theme: content.theme,
      persona: content.persona,
    });
  };

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleEdit = () => {
    if (contentId) {
      router.push(`/dashboard/content/${contentId}/edit`);
    }
  };

  const handleSchedule = () => {
    if (contentId) {
      router.push(`/dashboard/content/${contentId}/schedule`);
    }
  };

  const isGenerating = currentStep >= 0 && currentStep < 3;
  const isComplete = currentStep === 3;

  return (
    <Box py={8}>
      <Container maxW="4xl">
        {/* Header */}
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
          {/* Title */}
          <VStack align="start" spacing={2}>
            <Heading size="xl" fontWeight="700" letterSpacing="-0.02em">
              Criar Novo Conteúdo
            </Heading>
            <Text color="gray.400">
              Defina o tema e deixe a IA gerar um post profissional
            </Text>
          </VStack>

          {/* Form */}
          <Box
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            p={8}
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.800"
          >
            <VStack spacing={6} align="stretch">
              <FormControl isRequired isDisabled={isGenerating || isComplete}>
                <FormLabel>Tema do Post</FormLabel>
                <Textarea
                  {...register('theme', { required: true, minLength: 10 })}
                  placeholder="Ex: Como a inteligência artificial está transformando o desenvolvimento de software em 2024"
                  rows={4}
                  fontSize="lg"
                />
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Seja específico sobre o que você quer abordar. Quanto mais contexto, melhor o resultado.
                </Text>
              </FormControl>

              <FormControl isDisabled={isGenerating || isComplete}>
                <FormLabel>Persona</FormLabel>
                <Select {...register('persona')}>
                  {personaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {!isGenerating && !isComplete && (
                <Button
                  type="submit"
                  size="lg"
                  leftIcon={<FiZap />}
                  isLoading={createMutation.isPending}
                  isDisabled={!theme || theme.length < 10}
                  bgGradient="linear(to-r, linkedin.500, brand.500)"
                  _hover={{
                    bgGradient: 'linear(to-r, linkedin.400, brand.400)',
                    transform: 'translateY(-1px)',
                  }}
                >
                  Gerar Conteúdo com IA
                </Button>
              )}
            </VStack>
          </Box>

          {/* Generation Progress */}
          <Collapse in={isGenerating || isComplete}>
            <Box
              p={8}
              bg="surface.900"
              borderRadius="2xl"
              border="1px solid"
              borderColor={isComplete ? 'accent.emerald' : 'surface.800'}
            >
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">
                    {isComplete ? '✨ Conteúdo Gerado!' : 'Gerando conteúdo...'}
                  </Heading>
                  {isComplete && (
                    <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                      Pronto para revisão
                    </Badge>
                  )}
                </HStack>

                {/* Steps */}
                <HStack spacing={4}>
                  {steps.map((step, index) => (
                    <Flex
                      key={step.label}
                      flex={1}
                      direction="column"
                      align="center"
                    >
                      <Flex
                        w={10}
                        h={10}
                        borderRadius="full"
                        bg={
                          currentStep > index
                            ? 'accent.emerald'
                            : currentStep === index
                            ? 'linkedin.500'
                            : 'surface.700'
                        }
                        align="center"
                        justify="center"
                        mb={2}
                      >
                        {currentStep > index ? (
                          <Icon as={FiCheck} color="white" />
                        ) : (
                          <Text color="white" fontWeight="600">
                            {index + 1}
                          </Text>
                        )}
                      </Flex>
                      <Text
                        fontSize="sm"
                        fontWeight="500"
                        color={currentStep >= index ? 'white' : 'gray.500'}
                      >
                        {step.label}
                      </Text>
                      {currentStep === index && (
                        <Text fontSize="xs" color="gray.400">
                          {step.description}
                        </Text>
                      )}
                    </Flex>
                  ))}
                </HStack>

                {isGenerating && (
                  <Progress
                    value={(currentStep / 3) * 100}
                    size="sm"
                    borderRadius="full"
                    colorScheme="linkedin"
                    bg="surface.700"
                    isIndeterminate={currentStep >= 0}
                  />
                )}

                {/* Preview */}
                {generatedContent?.finalContent && (
                  <Box
                    p={6}
                    bg="surface.800"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="surface.700"
                    maxH="400px"
                    overflowY="auto"
                  >
                    <Text whiteSpace="pre-wrap" lineHeight="1.8">
                      {generatedContent.finalContent}
                    </Text>
                  </Box>
                )}

                {/* Actions */}
                {isComplete && (
                  <HStack spacing={4}>
                    <Button
                      flex={1}
                      variant="outline"
                      leftIcon={<FiEdit3 />}
                      onClick={handleEdit}
                    >
                      Editar Conteúdo
                    </Button>
                    <Button
                      flex={1}
                      leftIcon={<FiRefreshCw />}
                      variant="outline"
                      onClick={() => {
                        setCurrentStep(-1);
                        setContentId(null);
                        setGeneratedContent(null);
                      }}
                    >
                      Gerar Novo
                    </Button>
                    <Button
                      flex={1}
                      colorScheme="green"
                      onClick={handleSchedule}
                    >
                      Agendar Publicação
                    </Button>
                  </HStack>
                )}
              </VStack>
            </Box>
          </Collapse>
        </VStack>
      </Container>
    </Box>
  );
}
