import { extendTheme } from '@chakra-ui/react'

const colors = {
  brand: {
    50: '#E7F0EF',
    100: '#C4DAD8',
    200: '#9FC3C0',
    300: '#78ABA6',
    400: '#549390',
    500: '#1B5E6B', // primary — Tunisian door teal
    600: '#164F5A',
    700: '#113F48',
    800: '#0C2E35',
    900: '#071D22',
  },
  gold: {
    50: '#FBF3E4',
    100: '#F3DFB4',
    200: '#EACB84',
    300: '#E0B454',
    400: '#D5A138',
    500: '#C68A2E', // accent — saffron
    600: '#A8721F',
    700: '#835918',
    800: '#5E4011',
    900: '#39270A',
  },
  olive: {
    500: '#6B8E4E',
    600: '#597A3F',
  },
  amber: {
    500: '#D9A441',
    600: '#B78528',
  },
  brick: {
    500: '#B03A2E',
    600: '#932F25',
  },
  sand: {
    50: '#FCFAF6',
    100: '#FAF7F1',
    200: '#F1EAD9',
    300: '#E5DAC1',
    400: '#D8CFC0',
  },
  ink: {
    500: '#24292B',
    600: '#1A1D1F',
    muted: '#6B6660',
  },
}

const fonts = {
  heading: `'Tajawal', 'IBM Plex Sans Arabic', sans-serif`,
  body: `'Tajawal', 'IBM Plex Sans Arabic', sans-serif`,
}

const styles = {
  global: {
    body: {
      bg: 'sand.100',
      color: 'ink.500',
    },
  },
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: '700',
      borderRadius: 'lg',
    },
    variants: {
      solid: (props) => {
        if (props.colorScheme === 'brand') {
          return { bg: 'brand.500', color: 'white', _hover: { bg: 'brand.600' }, _active: { bg: 'brand.700' } }
        }
        if (props.colorScheme === 'gold') {
          return { bg: 'gold.500', color: 'white', _hover: { bg: 'gold.600' }, _active: { bg: 'gold.700' } }
        }
        return {}
      },
    },
    defaultProps: { colorScheme: 'brand' },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        boxShadow: '0 1px 2px rgba(17,63,72,0.06), 0 4px 16px rgba(17,63,72,0.06)',
        border: '1px solid',
        borderColor: 'sand.300',
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'md',
      fontWeight: '700',
      px: 2,
      py: '2px',
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          fontFamily: 'body',
          textTransform: 'none',
          fontWeight: '700',
          color: 'ink.muted',
          borderColor: 'sand.300',
          fontSize: 'sm',
        },
        td: {
          borderColor: 'sand.200',
        },
      },
    },
  },
}

const theme = extendTheme({
  direction: 'rtl',
  colors,
  fonts,
  styles,
  components,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export default theme
