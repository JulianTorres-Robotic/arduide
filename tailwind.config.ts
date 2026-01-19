import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
        arduino: {
          teal: "hsl(var(--arduino-teal))",
          "teal-light": "hsl(var(--arduino-teal-light))",
          "teal-dark": "hsl(var(--arduino-teal-dark))",
        },
        panel: {
          bg: "hsl(var(--panel-bg))",
          header: "hsl(var(--panel-header))",
          border: "hsl(var(--panel-border))",
        },
        syntax: {
          keyword: "hsl(var(--syntax-keyword))",
          string: "hsl(var(--syntax-string))",
          number: "hsl(var(--syntax-number))",
          comment: "hsl(var(--syntax-comment))",
          function: "hsl(var(--syntax-function))",
          variable: "hsl(var(--syntax-variable))",
          type: "hsl(var(--syntax-type))",
          operator: "hsl(var(--syntax-operator))",
        },
        status: {
          connected: "hsl(var(--status-connected))",
          disconnected: "hsl(var(--status-disconnected))",
          connecting: "hsl(var(--status-connecting))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "2rem",
        "2xl": "2.5rem",
        full: "9999px",
      },
      fontFamily: {
        sans: ["'Quicksand'", "'Nunito'", "'Segoe UI'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
      },
      boxShadow: {
        'clay-card': '8px 8px 16px rgba(165, 177, 194, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.8), inset 4px 4px 8px rgba(255, 255, 255, 0.5), inset -4px -4px 8px rgba(0, 0, 0, 0.05)',
        'clay-btn': '6px 6px 12px rgba(165, 177, 194, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.1)',
        'clay-btn-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.2)',
        'neu-pressed': 'inset 6px 6px 12px rgba(165, 177, 194, 0.25), inset -6px -6px 12px rgba(255, 255, 255, 0.8)',
        'glow-sm': '0 0 10px hsl(var(--primary) / 0.3)',
        'glow-md': '0 0 20px hsl(var(--primary) / 0.4)',
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
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(0.95)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-slow": "bounce-slow 3s infinite ease-in-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;