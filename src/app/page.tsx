'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import {
  FiZap,
  FiCalendar,
  FiTrendingUp,
  FiLinkedin,
  FiArrowRight,
  FiTarget,
  FiUsers,
  FiBarChart2,
} from 'react-icons/fi';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const features = [
  {
    icon: FiZap,
    title: 'Geração com IA',
    description: 'Conteúdo profissional gerado por GPT-4 com tom otimizado para LinkedIn',
    color: 'accent.amber',
  },
  {
    icon: FiCalendar,
    title: 'Agendamento Inteligente',
    description: 'Publique no melhor horário para maximizar engajamento',
    color: 'accent.emerald',
  },
  {
    icon: FiTrendingUp,
    title: 'Analytics Detalhado',
    description: 'Métricas em tempo real de impressões, likes e engajamento',
    color: 'accent.cyan',
  },
  {
    icon: FiTarget,
    title: 'Personas Customizadas',
    description: 'Tech, Founder, Recruiter - cada um com tom específico',
    color: 'accent.violet',
  },
  {
    icon: FiUsers,
    title: 'A/B Testing',
    description: 'Teste variações de posts e descubra o que funciona',
    color: 'accent.rose',
  },
  {
    icon: FiBarChart2,
    title: 'Auto-Comment',
    description: 'Primeiro comentário automático para boost de engajamento',
    color: 'linkedin.500',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Background Effects */}
      <Box
        position="absolute"
        top="-50%"
        left="-25%"
        w="150%"
        h="150%"
        bgGradient="radial(circle at 30% 20%, linkedin.500 0%, transparent 40%)"
        opacity={0.15}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-50%"
        right="-25%"
        w="150%"
        h="150%"
        bgGradient="radial(circle at 70% 80%, brand.500 0%, transparent 40%)"
        opacity={0.1}
        pointerEvents="none"
      />
      
      {/* Grid Pattern */}
      <Box
        position="absolute"
        inset={0}
        bgImage="linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)"
        bgSize="60px 60px"
        pointerEvents="none"
      />

      {/* Navigation */}
      <Container maxW="7xl" py={6}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={FiLinkedin} boxSize={8} color="linkedin.500" />
            <Text fontWeight="700" fontSize="xl" letterSpacing="-0.02em">
              ContentGen
            </Text>
          </HStack>
          <HStack spacing={4}>
            {isAuthenticated ? (
              <Button as={Link} href="/dashboard" rightIcon={<FiArrowRight />}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button as={Link} href="/login" variant="ghost">
                  Entrar
                </Button>
                <Button
                  as="a"
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/linkedin`}
                  rightIcon={<FiLinkedin />}
                >
                  Conectar LinkedIn
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Container>

      {/* Hero Section */}
      <Container maxW="7xl" pt={{ base: 16, md: 24 }} pb={20}>
        <VStack spacing={8} textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              bg="surface.800"
              color="linkedin.400"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="500"
              border="1px solid"
              borderColor="surface.700"
            >
              ✨ Powered by GPT-4
            </Badge>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
              fontWeight="700"
              lineHeight="1.1"
              letterSpacing="-0.03em"
              maxW="4xl"
            >
              Gere conteúdo
              <Box
                as="span"
                bgGradient="linear(to-r, linkedin.400, brand.400)"
                bgClip="text"
              >
                {' '}
                irresistível{' '}
              </Box>
              para o LinkedIn
            </Heading>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.400"
              maxW="2xl"
              lineHeight="1.7"
            >
              De uma simples ideia a um post publicado. Nossa IA gera, refina e publica
              conteúdo otimizado para engajamento no LinkedIn automaticamente.
            </Text>
          </MotionBox>

          <MotionFlex
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            gap={4}
            flexDir={{ base: 'column', sm: 'row' }}
          >
            <Button
              as="a"
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/linkedin`}
              size="lg"
              px={8}
              py={7}
              fontSize="md"
              leftIcon={<FiLinkedin />}
              bgGradient="linear(to-r, linkedin.500, linkedin.600)"
              _hover={{
                bgGradient: 'linear(to-r, linkedin.400, linkedin.500)',
                transform: 'translateY(-2px)',
                boxShadow: '0 20px 40px -10px rgba(10, 102, 194, 0.4)',
              }}
            >
              Começar Gratuitamente
            </Button>
            <Button
              as={Link}
              href="#features"
              size="lg"
              variant="outline"
              px={8}
              py={7}
              fontSize="md"
            >
              Como funciona
            </Button>
          </MotionFlex>
        </VStack>

        {/* Demo Preview */}
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          mt={20}
          position="relative"
        >
          <Box
            bg="surface.900"
            borderRadius="2xl"
            border="1px solid"
            borderColor="surface.700"
            p={8}
            position="relative"
            overflow="hidden"
          >
            {/* Glow effect */}
            <Box
              position="absolute"
              top="-50%"
              left="50%"
              transform="translateX(-50%)"
              w="100%"
              h="200%"
              bgGradient="radial(circle, linkedin.500 0%, transparent 50%)"
              opacity={0.1}
              animation={`${pulse} 4s ease-in-out infinite`}
            />
            
            <VStack spacing={6} align="stretch" position="relative">
              {/* Input */}
              <Box
                bg="surface.800"
                borderRadius="xl"
                p={4}
                border="1px solid"
                borderColor="surface.700"
              >
                <Text color="gray.500" fontSize="sm" mb={2}>
                  Tema
                </Text>
                <Text color="gray.200" fontSize="lg">
                  Como a IA está transformando o desenvolvimento de software em 2024
                </Text>
              </Box>

              {/* Arrow */}
              <Flex justify="center">
                <Box
                  p={3}
                  borderRadius="full"
                  bg="linkedin.500"
                  animation={`${float} 2s ease-in-out infinite`}
                >
                  <Icon as={FiZap} color="white" boxSize={5} />
                </Box>
              </Flex>

              {/* Output */}
              <Box
                bg="surface.800"
                borderRadius="xl"
                p={4}
                border="1px solid"
                borderColor="linkedin.500"
                boxShadow="0 0 20px rgba(10, 102, 194, 0.2)"
              >
                <HStack justify="space-between" mb={3}>
                  <Badge colorScheme="green">Pronto para publicar</Badge>
                  <Text color="gray.500" fontSize="sm">
                    2847 caracteres
                  </Text>
                </HStack>
                <Text color="gray.200" fontSize="md" lineHeight="1.8">
                  🚀 A IA não está apenas mudando o desenvolvimento de software.
                  <br />
                  <br />
                  Ela está redefinindo completamente o que significa ser desenvolvedor.
                  <br />
                  <br />
                  Nos últimos 6 meses, vi transformações que antes levariam anos...
                </Text>
              </Box>
            </VStack>
          </Box>
        </MotionBox>
      </Container>

      {/* Features Section */}
      <Box id="features" py={20} bg="surface.900" position="relative">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" fontWeight="700" letterSpacing="-0.02em">
                Tudo que você precisa
              </Heading>
              <Text color="gray.400" fontSize="lg" maxW="2xl">
                Um sistema completo para dominar o LinkedIn sem escrever uma linha
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {features.map((feature, index) => (
                <MotionBox
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box
                    p={8}
                    bg="surface.800"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="surface.700"
                    _hover={{
                      borderColor: 'surface.600',
                      transform: 'translateY(-4px)',
                      boxShadow: 'xl',
                    }}
                    transition="all 0.3s ease"
                    h="full"
                  >
                    <VStack align="start" spacing={4}>
                      <Flex
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="surface.700"
                        align="center"
                        justify="center"
                      >
                        <Icon
                          as={feature.icon}
                          boxSize={6}
                          color={feature.color}
                        />
                      </Flex>
                      <Heading size="md" fontWeight="600">
                        {feature.title}
                      </Heading>
                      <Text color="gray.400" lineHeight="1.7">
                        {feature.description}
                      </Text>
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxW="7xl" py={20}>
        <Box
          p={{ base: 8, md: 16 }}
          borderRadius="3xl"
          bgGradient="linear(135deg, surface.800, surface.900)"
          border="1px solid"
          borderColor="surface.700"
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-r, linkedin.500, brand.500)"
            opacity={0.05}
          />
          <VStack spacing={6} position="relative">
            <Heading size="xl" fontWeight="700" letterSpacing="-0.02em">
              Pronto para multiplicar seu alcance?
            </Heading>
            <Text color="gray.400" fontSize="lg" maxW="xl">
              Junte-se a milhares de profissionais que já usam IA para criar
              conteúdo de alto impacto
            </Text>
            <Button
              as="a"
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/linkedin`}
              size="lg"
              px={10}
              py={7}
              leftIcon={<FiLinkedin />}
            >
              Conectar com LinkedIn
            </Button>
          </VStack>
        </Box>
      </Container>

      {/* Footer */}
      <Box borderTop="1px solid" borderColor="surface.800" py={8}>
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <HStack spacing={2}>
              <Icon as={FiLinkedin} boxSize={6} color="linkedin.500" />
              <Text fontWeight="600">ContentGen</Text>
            </HStack>
            <Text color="gray.500" fontSize="sm">
              © 2024 LinkedIn Content Generator. Feito com ❤️ e IA.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
