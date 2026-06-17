import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'


export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({}),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      // 使用 CSS 变量以支持深色模式
      primary: 'var(--color-primary)',
      'primary-foreground': 'var(--color-primary-foreground)',
      secondary: 'var(--color-muted)',
      'secondary-foreground': 'var(--color-foreground)',
      accent: 'var(--color-primary)',
      'accent-foreground': 'var(--color-background)',
      background: 'var(--color-background)',
      foreground: 'var(--color-foreground)',
      card: 'var(--color-card)',
      'card-foreground': 'var(--color-foreground)',
      popover: 'var(--color-card)',
      'popover-foreground': 'var(--color-foreground)',
      muted: 'var(--color-muted)',
      'muted-foreground': 'var(--color-muted)',
      border: 'var(--color-border)',
      input: 'var(--color-border)',
      ring: 'var(--color-primary)',
      destructive: '#dc2626',
    },
    fontFamily: {
      sans: ['Open Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['Geist Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
    },
    maxWidth: {
      site: 'var(--outer-container-width)',
    },
  },
  shortcuts: {
    'btn': 'px-6 py-3 bg-primary text-background hover:opacity-80 transition-opacity cursor-pointer font-medium text-xs uppercase tracking-wide',
    'card': 'bg-card border border-border transition-colors duration-200 hover:border-primary',
    'section-title': 'text-xs font-mono uppercase tracking-wider text-secondary my-3 mx-6 font-medium',
    'corner': 'absolute -inset-1 border border-primary rounded-sm opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-200 ease-out pointer-events-none',
    'animate-fade-in-up': 'opacity-0 animate-[fade-in-up_0.5s_ease_forwards]',
  },
  preflights: [
    {
      getCSS: () => `
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
    },
  ],
})
