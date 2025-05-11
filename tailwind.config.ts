import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      textAlign: {
        start: "start",
        end: "end",
      },
      margin: {
        'start': 'margin-inline-start',
        'end': 'margin-inline-end',
      },
      padding: {
        'start': 'padding-inline-start',
        'end': 'padding-inline-end',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.text-start': {
          textAlign: 'start',
        },
        '.text-end': {
          textAlign: 'end',
        },
        '.ms-auto': {
          marginInlineStart: 'auto',
        },
        '.me-auto': {
          marginInlineEnd: 'auto',
        },
        '.ps-0': {
          paddingInlineStart: '0',
        },
        '.ps-1': {
          paddingInlineStart: '0.25rem',
        },
        '.ps-2': {
          paddingInlineStart: '0.5rem',
        },
        '.ps-3': {
          paddingInlineStart: '0.75rem',
        },
        '.ps-4': {
          paddingInlineStart: '1rem',
        },
        '.pe-0': {
          paddingInlineEnd: '0',
        },
        '.pe-1': {
          paddingInlineEnd: '0.25rem',
        },
        '.pe-2': {
          paddingInlineEnd: '0.5rem',
        },
        '.pe-3': {
          paddingInlineEnd: '0.75rem',
        },
        '.pe-4': {
          paddingInlineEnd: '1rem',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} satisfies Config

export default config