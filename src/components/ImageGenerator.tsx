'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Spinner,
  Select,
  useToast,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FiImage, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { contentApi, normalizeImageUrl } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2img: (
          prompt: string,
          options?: { model?: string; quality?: string }
        ) => Promise<HTMLImageElement>;
      };
    };
  }
}

interface ImageGeneratorProps {
  contentId: string;
  theme: string;
  persona?: string;
  currentImageUrl?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

const IMAGE_MODELS = [
  { value: 'gemini-2.5-flash-image-preview', label: 'Gemini 2.5 Flash (Rápido)' },
  { value: 'gpt-image-1', label: 'GPT Image 1' },
  { value: 'dall-e-3', label: 'DALL-E 3 (Alta Qualidade)' },
  { value: 'stabilityai/stable-diffusion-3-medium', label: 'Stable Diffusion 3' },
  { value: 'black-forest-labs/FLUX.1-schnell', label: 'Flux.1 Schnell' },
];

export default function ImageGenerator({
  contentId,
  theme,
  persona = 'GENERAL',
  currentImageUrl,
  onImageGenerated,
}: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-image-preview');
  const [imagePrompt, setImagePrompt] = useState('');
  const toast = useToast();

  // Normalize image URL when currentImageUrl changes
  useEffect(() => {
    const normalized = normalizeImageUrl(currentImageUrl);
    setGeneratedImage(normalized);
  }, [currentImageUrl]);

  const generateImagePrompt = (theme: string, persona: string): string => {
    const personaPrompts: Record<string, string> = {
      TECH: 'professional tech illustration, modern, clean, tech-focused, minimalist',
      FOUNDER: 'business illustration, entrepreneurial, inspiring, professional, modern',
      RECRUITER: 'workplace illustration, diverse team, professional, welcoming, inclusive',
      GENERAL: 'professional illustration, modern, clean, engaging, minimalist',
    };

    const style = personaPrompts[persona] || personaPrompts.GENERAL;
    return `${theme}. ${style}, high quality, LinkedIn post image, professional design, 16:9 aspect ratio`;
  };

  const handleGenerate = async () => {
    // Wait for Puter.ai to load
    let retries = 0;
    while (!window.puter?.ai?.txt2img && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }

    if (!window.puter?.ai?.txt2img) {
      toast({
        title: 'Puter.ai não disponível',
        description: 'Use a opção de upload de imagem manualmente',
        status: 'warning',
        duration: 5000,
      });
      return;
    }

    setIsGenerating(true);
    const prompt = generateImagePrompt(theme, persona);
    setImagePrompt(prompt);

    try {
      const imageElement = await window.puter.ai.txt2img(prompt, {
        model: selectedModel,
        quality: selectedModel === 'dall-e-3' ? 'hd' : selectedModel.includes('gpt-image') ? 'medium' : undefined,
      });

      let imageUrl = '';

      // Handle different return types from Puter.ai
      const element = imageElement as any;

      if (element instanceof HTMLImageElement) {
        imageUrl = element.src;
      } else if (element instanceof HTMLCanvasElement) {
        // Convert canvas to data URL
        imageUrl = element.toDataURL('image/png');
      } else if (typeof element === 'string') {
        imageUrl = element;
      } else if (element?.src) {
        imageUrl = element.src;
      } else {
        // Try to get src from any element
        const src = element?.getAttribute?.('src') ||
          element?.src ||
          '';
        if (src) {
          imageUrl = src;
        }
      }

      // If still no URL, try to convert to data URL
      if (!imageUrl && element) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (element instanceof HTMLImageElement) {
            canvas.width = element.naturalWidth || 1024;
            canvas.height = element.naturalHeight || 1024;
            ctx.drawImage(element, 0, 0);
            imageUrl = canvas.toDataURL('image/png');
          } else if (element instanceof HTMLCanvasElement) {
            imageUrl = element.toDataURL('image/png');
          }
        }
      }

      if (!imageUrl) {
        throw new Error('Não foi possível obter a URL da imagem gerada');
      }

      // Convert image to blob and upload
      let finalImageUrl = imageUrl;

      // If it's a data URL, convert to blob and upload
      if (imageUrl.startsWith('data:image/')) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'generated-image.png', { type: blob.type });

          const formData = new FormData();
          formData.append('file', file);

          const token = useAuthStore.getState().token;
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

          const uploadResponse = await fetch(`${API_URL}/api/v1/content/${contentId}/image/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            finalImageUrl = uploadData.imageUrl.startsWith('http')
              ? uploadData.imageUrl
              : `${API_URL}${uploadData.imageUrl}`;
          }
        } catch (uploadError) {
          console.warn('Failed to upload generated image, saving as base64:', uploadError);
          // Fallback to base64 if upload fails
        }
      }

      setGeneratedImage(finalImageUrl);

      // Save to backend
      await contentApi.update(contentId, {
        imageUrl: finalImageUrl,
        imagePrompt: prompt,
      });

      onImageGenerated?.(finalImageUrl);

      toast({
        title: 'Imagem gerada!',
        description: 'A imagem foi salva no seu post',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Image generation error:', error);

      // Handle 403 or other API errors
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        toast({
          title: 'Acesso negado',
          description: 'O serviço de geração de imagens não está disponível. Use a opção de upload manual.',
          status: 'warning',
          duration: 7000,
        });
      } else {
        toast({
          title: 'Erro ao gerar imagem',
          description: error.message || 'Tente novamente ou use a opção de upload manual',
          status: 'error',
          duration: 5000,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <HStack>
          <Icon as={FiImage} color="linkedin.500" boxSize={5} />
          <Text fontWeight="600">Imagem do Post</Text>
        </HStack>
        {generatedImage && (
          <Badge colorScheme="green" fontSize="sm">
            Imagem gerada
          </Badge>
        )}
      </HStack>

      {generatedImage && (
        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          border="1px solid"
          borderColor="surface.700"
        >
          <Image
            src={generatedImage}
            alt="Generated post image"
            w="full"
            maxH="400px"
            objectFit="cover"
          />
          <Box
            position="absolute"
            top={2}
            right={2}
            p={2}
            bg="blackAlpha.700"
            borderRadius="md"
          >
            <HStack spacing={2}>
              <Button
                size="xs"
                leftIcon={<FiDownload />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = `post-image-${contentId}.png`;
                  link.click();
                }}
              >
                Download
              </Button>
            </HStack>
          </Box>
        </Box>
      )}

      <VStack spacing={3} align="stretch">
        <Select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          size="md"
        >
          {IMAGE_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </Select>

        <Button
          leftIcon={isGenerating ? <Spinner size="sm" /> : <FiRefreshCw />}
          onClick={handleGenerate}
          isLoading={isGenerating}
          loadingText="Gerando imagem..."
          colorScheme="linkedin"
        >
          {generatedImage ? 'Regenerar Imagem' : 'Gerar Imagem'}
        </Button>

        {imagePrompt && (
          <Box
            p={3}
            bg="surface.800"
            borderRadius="lg"
            fontSize="sm"
            color="gray.400"
          >
            <Text fontWeight="500" mb={1} color="gray.300">
              Prompt usado:
            </Text>
            <Text>{imagePrompt}</Text>
          </Box>
        )}
      </VStack>
    </VStack>
  );
}
