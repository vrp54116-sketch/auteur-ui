/**
 * next/font/google configurations for the 12 authentic OFL typography pairings.
 * Compatible with Next.js 13/14/15 App Router and Pages Router.
 * Each export configures variable axes and optical sizing where available.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

export const fontPairingConfigs = {
  'nocturne-editorial': {
    display: {
      loader: 'Newsreader',
      options: {
        subsets: ['latin'],
        style: ['normal', 'italic'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Source_Serif_4',
      options: {
        subsets: ['latin'],
        style: ['normal', 'italic'],
        variable: '--font-text',
        display: 'swap',
      },
    },
    mono: {
      loader: 'JetBrains_Mono',
      options: {
        subsets: ['latin'],
        variable: '--font-mono',
        display: 'swap',
      },
    },
  },

  'fraunces-inter': {
    display: {
      loader: 'Fraunces',
      options: {
        subsets: ['latin'],
        axes: ['opsz', 'SOFT', 'WONK'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Inter',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'cormorant-proza': {
    display: {
      loader: 'Cormorant_Garamond',
      options: {
        subsets: ['latin'],
        weight: ['300', '400', '500', '600', '700'],
        style: ['normal', 'italic'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Proza_Libre',
      options: {
        subsets: ['latin'],
        weight: ['400', '500', '600', '700', '800'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'syne-jakarta': {
    display: {
      loader: 'Syne',
      options: {
        subsets: ['latin'],
        weight: ['400', '500', '600', '700', '800'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Plus_Jakarta_Sans',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'space-grotesk-mono': {
    display: {
      loader: 'Space_Grotesk',
      options: {
        subsets: ['latin'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Space_Mono',
      options: {
        subsets: ['latin'],
        weight: ['400', '700'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'dm-serif-sans': {
    display: {
      loader: 'DM_Serif_Display',
      options: {
        subsets: ['latin'],
        weight: '400',
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'DM_Sans',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'playfair-source-sans': {
    display: {
      loader: 'Playfair_Display',
      options: {
        subsets: ['latin'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Source_Sans_3',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'outfit-jakarta': {
    display: {
      loader: 'Outfit',
      options: {
        subsets: ['latin'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Plus_Jakarta_Sans',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'bricolage-inter': {
    display: {
      loader: 'Bricolage_Grotesque',
      options: {
        subsets: ['latin'],
        axes: ['opsz', 'wdth'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Inter',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'instrument-serif-sans': {
    display: {
      loader: 'Instrument_Serif',
      options: {
        subsets: ['latin'],
        weight: '400',
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'Instrument_Sans',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'cinzel-garamond': {
    display: {
      loader: 'Cinzel',
      options: {
        subsets: ['latin'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'EB_Garamond',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
  },

  'epilogue-jetbrains': {
    display: {
      loader: 'Epilogue',
      options: {
        subsets: ['latin'],
        variable: '--font-display',
        display: 'swap',
      },
    },
    body: {
      loader: 'JetBrains_Mono',
      options: {
        subsets: ['latin'],
        variable: '--font-text',
        display: 'swap',
      },
    },
    mono: {
      loader: 'JetBrains_Mono',
      options: {
        subsets: ['latin'],
        variable: '--font-mono',
        display: 'swap',
      },
    },
  },
}

