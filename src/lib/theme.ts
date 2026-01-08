import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: '"Outfit", sans-serif',
    body: '"Outfit", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0077b6',
      600: '#005f92',
      700: '#00476d',
      800: '#002f49',
      900: '#001824',
    },
    linkedin: {
      50: '#e6f3ff',
      100: '#b3d9ff',
      200: '#80bfff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#0A66C2',
      600: '#084d92',
      700: '#063462',
      800: '#041b31',
      900: '#020e19',
    },
    surface: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    accent: {
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e',
      violet: '#8b5cf6',
      cyan: '#06b6d4',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'surface.950',
        color: 'gray.100',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'linkedin.500',
          color: 'white',
          _hover: {
            bg: 'linkedin.600',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'linkedin.700',
            transform: 'translateY(0)',
          },
        },
        ghost: {
          color: 'gray.300',
          _hover: {
            bg: 'surface.800',
            color: 'white',
          },
        },
        outline: {
          borderColor: 'surface.600',
          color: 'gray.300',
          _hover: {
            bg: 'surface.800',
            borderColor: 'linkedin.500',
            color: 'white',
          },
        },
        gradient: {
          bgGradient: 'linear(to-r, linkedin.500, brand.500)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, linkedin.600, brand.600)',
            transform: 'translateY(-1px)',
            boxShadow: 'xl',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'surface.900',
          borderRadius: 'xl',
          border: '1px solid',
          borderColor: 'surface.800',
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'surface.800',
            borderColor: 'surface.700',
            _hover: {
              bg: 'surface.700',
            },
            _focus: {
              bg: 'surface.800',
              borderColor: 'linkedin.500',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'surface.800',
          borderColor: 'surface.700',
          _hover: {
            bg: 'surface.700',
          },
          _focus: {
            bg: 'surface.800',
            borderColor: 'linkedin.500',
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'surface.900',
          borderRadius: 'xl',
        },
        overlay: {
          bg: 'blackAlpha.700',
          backdropFilter: 'blur(4px)',
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'surface.800',
          borderColor: 'surface.700',
        },
        item: {
          bg: 'transparent',
          _hover: {
            bg: 'surface.700',
          },
        },
      },
    },
    Tabs: {
      variants: {
        soft: {
          tab: {
            color: 'gray.400',
            _selected: {
              color: 'white',
              bg: 'surface.800',
              borderRadius: 'lg',
            },
          },
          tablist: {
            bg: 'surface.900',
            p: 1,
            borderRadius: 'xl',
          },
        },
      },
    },
  },
});
