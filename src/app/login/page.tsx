'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FiLinkedin } from 'react-icons/fi';
import Link from 'next/link';

export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return (
    <Box minH="100vh" display="flex" alignItems="center">
      {/* Background */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="radial(circle at 50% 50%, linkedin.500 0%, transparent 50%)"
        opacity={0.1}
        pointerEvents="none"
      />

      <Container maxW="md">
        <VStack
          spacing={8}
          p={10}
          bg="surface.900"
          borderRadius="2xl"
          border="1px solid"
          borderColor="surface.700"
          textAlign="center"
        >
          <Flex
            w={20}
            h={20}
            borderRadius="2xl"
            bg="linkedin.500"
            align="center"
            justify="center"
          >
            <Icon as={FiLinkedin} boxSize={10} color="white" />
          </Flex>

          <VStack spacing={3}>
            <Heading size="xl" fontWeight="700" letterSpacing="-0.02em">
              Bem-vindo de volta
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Conecte sua conta LinkedIn para continuar
            </Text>
          </VStack>

          <Button
            as="a"
            href={`${apiUrl}/api/v1/auth/linkedin`}
            size="lg"
            w="full"
            py={7}
            leftIcon={<FiLinkedin />}
            bgGradient="linear(to-r, linkedin.500, linkedin.600)"
            _hover={{
              bgGradient: 'linear(to-r, linkedin.400, linkedin.500)',
              transform: 'translateY(-2px)',
              boxShadow: '0 20px 40px -10px rgba(10, 102, 194, 0.4)',
            }}
          >
            Continuar com LinkedIn
          </Button>

          <Text color="gray.500" fontSize="sm">
            Ao continuar, você concorda com nossos{' '}
            <Text as="span" color="linkedin.400" cursor="pointer">
              Termos de Uso
            </Text>{' '}
            e{' '}
            <Text as="span" color="linkedin.400" cursor="pointer">
              Política de Privacidade
            </Text>
          </Text>

          <Button as={Link} href="/" variant="ghost" size="sm">
            ← Voltar para home
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
