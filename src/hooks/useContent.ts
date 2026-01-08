import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { contentApi, jobsApi, type Content } from '@/lib/api';

export function useContents(options?: { status?: string }) {
  return useQuery({
    queryKey: ['contents', options?.status],
    queryFn: () =>
      contentApi.getAll({ status: options?.status }).then((res) => res.data),
  });
}

export function useContent(id: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.getOne(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: { theme: string; persona?: string }) =>
      contentApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao criar conteúdo',
        status: 'error',
        duration: 3000,
      });
    },
  });
}

export function useUpdateContent(id: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: Partial<Content>) =>
      contentApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      toast({
        title: 'Conteúdo salvo',
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
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => contentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Conteúdo excluído',
        status: 'success',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao excluir',
        status: 'error',
        duration: 3000,
      });
    },
  });
}

export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { contentId: string; theme: string; persona: string }) =>
      jobsApi.startGeneration(data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content', variables.contentId] });
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => contentApi.getDashboard().then((res) => res.data),
  });
}
