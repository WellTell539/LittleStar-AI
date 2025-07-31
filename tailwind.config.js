/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
        // AI伴侣风格颜色
        ai: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#4facfe',
          warm: '#ffecd2',
          soft: {
            bg: '#f8fafc',
            card: 'rgba(255, 255, 255, 0.95)',
            text: '#1e293b',
            textSecondary: '#64748b'
          }
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "ai-float": {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-8px) rotate(2deg)' },
          '50%': { transform: 'translateY(-12px) rotate(0deg)' },
          '75%': { transform: 'translateY(-8px) rotate(-2deg)' },
        },
        "ai-bounce": {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.05)' },
        },
        "ai-wave": {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(10deg)' },
          '75%': { transform: 'rotate(-10deg)' },
        },
        "ai-thinking": {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' },
        },
        "ai-happy": {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        "ai-working": {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(5px) rotate(5deg)' },
          '75%': { transform: 'translateX(-5px) rotate(-5deg)' },
        },
        "sparkle": {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        "pulse-glow": {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(102, 126, 234, 0.6)',
            transform: 'scale(1.05)'
          },
        },
        "gradient-shift": {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ai-float": 'ai-float 3s ease-in-out infinite',
        "ai-bounce": 'ai-bounce 2s ease-in-out infinite',
        "ai-wave": 'ai-wave 2s ease-in-out infinite',
        "ai-thinking": 'ai-thinking 2s ease-in-out infinite',
        "ai-happy": 'ai-happy 1s ease-in-out infinite',
        "ai-working": 'ai-working 2s ease-in-out infinite',
        "sparkle": 'sparkle 1.5s ease-in-out infinite',
        "pulse-glow": 'pulse-glow 2s ease-in-out infinite',
        "gradient-shift": 'gradient-shift 8s ease infinite',
        bounce: 'bounce 1s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-warm': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'large': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(102, 126, 234, 0.3)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      maxWidth: {
        'fluid': '1400px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 