import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
          premium: "var(--color-brand-premium)",
        },
        success: "var(--color-success)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        "white-soft": "var(--color-white-soft)",
        cloud: "var(--color-cloud)",
        surface: {
          background: "var(--surface-background)",
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          hover: "var(--surface-hover)",
          elevated: "var(--surface-elevated)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
        },
        background: "var(--surface-background)",
        foreground: "var(--text-primary)",
        card: "var(--surface-primary)",
        "card-foreground": "var(--text-primary)",
        popover: "var(--surface-primary)",
        "popover-foreground": "var(--text-primary)",
        primary: "var(--color-brand-secondary)",
        "primary-foreground": "var(--surface-background)",
        secondary: "var(--surface-secondary)",
        "secondary-foreground": "var(--color-white-soft)",
        muted: "var(--surface-secondary)",
        "muted-foreground": "var(--text-secondary)",
        accent: "var(--surface-hover)",
        "accent-foreground": "var(--text-primary)",
        destructive: "var(--color-error)",
        border: "var(--border-default)",
        input: "var(--surface-primary)",
        ring: "var(--color-info)",
      },
    },
  },
  plugins: [],
} satisfies Config