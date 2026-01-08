'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Icon,
  useToast,
  Input,
  Badge,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiImage, FiDownload } from 'react-icons/fi';
import { contentApi, normalizeImageUrl } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface ImageUploadProps {
  contentId: string;
  currentImageUrl?: string;
  onImageUploaded?: (imageUrl: string) => void;
}

export default function ImageUpload({
  contentId,
  currentImageUrl,
  onImageUploaded,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Normalize image URL when currentImageUrl changes
  useEffect(() => {
    const normalized = normalizeImageUrl(currentImageUrl);
    setUploadedImage(normalized);
    setPreviewUrl(normalized);
  }, [currentImageUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 10MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);

      // Upload file using FormData
      const formData = new FormData();
      formData.append('file', file);

      const token = useAuthStore.getState().token;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/api/v1/content/${contentId}/image/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar imagem');
      }

      const data = await response.json();

      // Use the full URL for the image
      const imageUrl = data.imageUrl.startsWith('http')
        ? data.imageUrl
        : `${API_URL}${data.imageUrl}`;

      setUploadedImage(imageUrl);
      setPreviewUrl(imageUrl);
      onImageUploaded?.(imageUrl);

      toast({
        title: 'Imagem enviada!',
        description: 'A imagem foi salva no seu post',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro ao enviar imagem',
        description: error.message || 'Tente novamente',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await contentApi.update(contentId, {
        imageUrl: null,
        imagePrompt: null,
      });

      setUploadedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImageUploaded?.('');

      toast({
        title: 'Imagem removida',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover imagem',
        description: error.message || 'Tente novamente',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <HStack>
          <Icon as={FiImage} color="linkedin.500" boxSize={5} />
          <Text fontWeight="600">Imagem do Post</Text>
        </HStack>
        {uploadedImage && (
          <Badge colorScheme="green" fontSize="sm">
            Imagem adicionada
          </Badge>
        )}
      </HStack>

      {previewUrl && (
        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          border="1px solid"
          borderColor="surface.700"
        >
          <Image
            src={previewUrl}
            alt="Post image"
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
                  link.href = previewUrl;
                  link.download = `post-image-${contentId}.png`;
                  link.click();
                }}
              >
                Download
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                leftIcon={<FiX />}
                onClick={handleRemove}
              >
                Remover
              </Button>
            </HStack>
          </Box>
        </Box>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        display="none"
        id="image-upload-input"
      />

      {!previewUrl && (
        <Button
          leftIcon={<FiUpload />}
          onClick={() => fileInputRef.current?.click()}
          isLoading={isUploading}
          loadingText="Enviando..."
          colorScheme="linkedin"
          variant="outline"
        >
          Enviar Imagem
        </Button>
      )}

      <Text fontSize="sm" color="gray.400">
        Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 10MB
      </Text>
    </VStack>
  );
}
