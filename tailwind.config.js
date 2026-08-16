/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
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
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        heading: ['var(--font-sora)', 'sans-serif'],
        score: ['var(--font-chakra)', 'sans-serif'],
      },
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
        // Golazo Theme
        pitch: {
          DEFAULT: "#1F8A5C",
          bright: "#29C179"
        },
        gold: {
          DEFAULT: "#D9A93B",
          dim: "#8A6E2B"
        },
        claret: {
          DEFAULT: "#B23A48",
          dim: "#7A2933"
        },
        stadium: {
          base: "#0B0E14",
          surface: "#141821",
          raised: "#1B2029",
          border: "#252B38",
          turf: "#3DDC84",
          gold: "#E8B34C",
          blue: "#5B8DEF",
          "text-primary": "#F4F6F8",
          "text-secondary": "#8A93A3",
          "text-muted": "#565F70",
        },
        brand: {
          blue: '#38BDF8',
          green: '#34D399',
          gold: '#FBBF24',
          goldDeep: '#D97706',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'nav-ambient': '0 20px 60px -15px rgba(56,189,248,0.25)',
        'fab-glow': '0 0 24px rgba(56,189,248,0.5)',
        'gold-glow': '0 0 12px rgba(251,191,36,0.4)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #38BDF8 0%, #34D399 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FCD34D 0%, #D97706 100%)',
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
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" }
        },
        "shine": {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
        "meteor-effect": {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        "gradient": {
          to: {
            backgroundPosition: "var(--bg-size, 200%) 0",
          },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        "slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "marquee": "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "shimmer": "shimmer 2s infinite",
        "shine": "shine var(--duration) infinite linear",
        "meteor-effect": "meteor-effect 5s linear infinite",
        "gradient": "gradient 8s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        "slide": "slide var(--speed) ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
