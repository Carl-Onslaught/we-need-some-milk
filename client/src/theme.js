import { extendTheme } from '@chakra-ui/react';

const emerald = {
  900: '#13211B',
  800: '#1B2E2B', // Main background
  700: '#22332F', // Card/Stat background
  600: '#2C4A3A', // Button hover
  500: '#3A6B4C',
  400: '#4E8C5E',
  300: '#6CBF7E',
  200: '#A7EFC5',
  100: '#E6FFF3',
};

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      'html, body, #root': {
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: emerald[800],
        color: '#F5F5F5',
      },
      'body': {
        fontFamily: 'body',
        lineHeight: 'base',
        background: emerald[800],
      },
      '*': {
        borderColor: emerald[700],
      },
      ':root': {
        colorScheme: 'dark',
      },
    }),
  },
  colors: {
    brand: {
      primary: emerald[800],
      100: emerald[100],
      200: emerald[200],
      300: emerald[300],
      400: emerald[400],
      500: emerald[500],
      600: emerald[600],
      700: emerald[700],
      800: emerald[800],
      900: emerald[900],
      card: emerald[700],
      hover: emerald[600],
      text: '#F5F5F5',
      textSecondary: '#E0E0E0',
      white: '#F5F5F5',
      gold: '#FFD700', // For logo/highlights only
    },
    gray: {
      50: '#F5F5F5',
      100: '#E0E0E0',
      200: '#BDBDBD',
      300: '#9E9E9E',
      400: '#757575',
      500: '#616161',
      600: '#424242',
      700: '#212121',
      800: '#181818',
      900: '#111111',
    },
  },
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Text: {
      baseStyle: {
        color: '#F5F5F5',
      },
      variants: {
        secondary: {
          color: '#E0E0E0',
        },
        accent: {
          color: 'brand.gold',
        },
      },
    },
    Heading: {
      baseStyle: {
        color: '#F5F5F5',
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: '#F5F5F5',
          color: emerald[800],
          _hover: {
            bg: emerald[600],
            color: '#F5F5F5',
            boxShadow: '0 0 10px #2C4A3A',
          },
        },
        outline: {
          borderColor: emerald[600],
          color: '#F5F5F5',
          _hover: {
            bg: '#F5F5F5',
            color: emerald[800],
            borderColor: emerald[600],
            boxShadow: '0 0 10px #2C4A3A',
          },
        },
        ghost: {
          color: '#F5F5F5',
          _hover: {
            bg: emerald[700],
            color: '#F5F5F5',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: emerald[700],
          borderRadius: 'xl',
          boxShadow: 'lg',
          borderColor: emerald[600],
          borderWidth: '1px',
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: emerald[700],
            color: '#F5F5F5',
            _hover: {
              bg: emerald[600],
            },
            _focus: {
              bg: emerald[600],
              borderColor: emerald[600],
            },
          },
        },
        outline: {
          field: {
            bg: emerald[800],
            borderColor: emerald[600],
            color: '#F5F5F5',
            _hover: {
              borderColor: emerald[400],
            },
            _focus: {
              borderColor: emerald[600],
              boxShadow: '0 0 0 1px #2C4A3A',
            },
          },
        },
      },
    },
    Table: {
      baseStyle: {
        th: {
          color: '#E0E0E0',
          borderColor: emerald[600],
        },
        td: {
          color: '#F5F5F5',
          borderColor: emerald[600],
        },
      },
    },
    Tabs: {
      baseStyle: {
        tab: {
          color: '#E0E0E0',
          _selected: {
            color: '#F5F5F5',
            borderColor: emerald[600],
          },
        },
        panel: {
          bg: emerald[700],
        },
      },
    },
  },
});

export default theme;

