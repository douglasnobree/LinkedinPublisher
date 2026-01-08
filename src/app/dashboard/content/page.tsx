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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  Select,
  Skeleton,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiCalendar,
  FiTrash2,
  FiEye,
  FiZap,
} from 'react-icons/fi';
import { useState } from 'react';
import { contentApi, type Content } from '@/lib/api';

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

const personaLabels: Record<string, string> = {
  GENERAL: 'Geral',
  TECH: 'Tech',
  FOUNDER: 'Founder',
  RECRUITER: 'Recruiter',
};

export default function ContentListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contents', statusFilter],
    queryFn: () =>
      contentApi
        .getAll({ status: statusFilter || undefined, limit: 50 })
        .then((res) => res.data),
  });
  console.log(data);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
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

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este conteúdo?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Box py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" fontWeight="700" letterSpacing="-0.02em">
              Meus Conteúdos
            </Heading>
            <Text color="gray.400">
              Gerencie todos os seus posts para LinkedIn
            </Text>
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

        {/* Filters */}
        <HStack mb={6} spacing={4}>
          <Select
            w="200px"
            placeholder="Todos os status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="DRAFT">Rascunho</option>
            <option value="REVIEW">Em revisão</option>
            <option value="SCHEDULED">Agendado</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </HStack>

        {/* Table */}
        <Box
          bg="surface.900"
          borderRadius="2xl"
          border="1px solid"
          borderColor="surface.800"
          overflow="hidden"
        >
          {isLoading ? (
            <VStack p={8} spacing={4}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} h="60px" w="full" borderRadius="lg" />
              ))}
            </VStack>
          ) : data?.items.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={16}
              color="gray.500"
            >
              <Icon as={FiZap} boxSize={12} mb={4} />
              <Text fontSize="lg" mb={2}>
                Nenhum conteúdo encontrado
              </Text>
              <Button
                as={Link}
                href="/dashboard/content/new"
                leftIcon={<FiPlus />}
                variant="outline"
                mt={2}
              >
                Criar primeiro conteúdo
              </Button>
            </Flex>
          ) : (
            <Table>
              <Thead>
                <Tr borderColor="surface.800">
                  <Th color="gray.500" borderColor="surface.800">
                    Tema
                  </Th>
                  <Th color="gray.500" borderColor="surface.800">
                    Persona
                  </Th>
                  <Th color="gray.500" borderColor="surface.800">
                    Status
                  </Th>
                  <Th color="gray.500" borderColor="surface.800">
                    Criado em
                  </Th>
                  <Th color="gray.500" borderColor="surface.800" w="100px">
                    Ações
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.items.map((content) => (
                  <Tr
                    key={content.id}
                    _hover={{ bg: 'surface.800' }}
                    cursor="pointer"
                    borderColor="surface.800"
                  >
                    <Td borderColor="surface.800">
                      <Link href={`/dashboard/content/${content.id}`}>
                        <Text
                          fontWeight="500"
                          noOfLines={1}
                          maxW="400px"
                          _hover={{ color: 'linkedin.400' }}
                        >
                          {content.theme}
                        </Text>
                      </Link>
                    </Td>
                    <Td borderColor="surface.800">
                      <Badge variant="subtle" colorScheme="gray">
                        {personaLabels[content.persona]}
                      </Badge>
                    </Td>
                    <Td borderColor="surface.800">
                      <Badge colorScheme={statusColors[content.status]}>
                        {statusLabels[content.status]}
                      </Badge>
                    </Td>
                    <Td borderColor="surface.800" color="gray.400">
                      {format(new Date(content.createdAt), 'dd/MM/yyyy HH:mm')}
                    </Td>
                    <Td borderColor="surface.800">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEye />}
                            as={Link}
                            href={`/dashboard/content/${content.id}`}
                          >
                            Visualizar
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit2 />}
                            as={Link}
                            href={`/dashboard/content/${content.id}/edit`}
                          >
                            Editar
                          </MenuItem>
                          {content.status === 'REVIEW' && (
                            <MenuItem
                              icon={<FiCalendar />}
                              as={Link}
                              href={`/dashboard/content/${content.id}/schedule`}
                            >
                              Agendar
                            </MenuItem>
                          )}
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.400"
                            onClick={() => handleDelete(content.id)}
                          >
                            Excluir
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Container>
    </Box>
  );
}
