/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			ink: '#1a1a1a',
  			'ink-soft': '#6b665f',
  			deep: '#1a1a1a',
  			gold: '#f3e3cc',
  			mustard: '#fbb91c',
  			'mustard-deep': '#e8a60d',
  			slat: '#c08250',
  			'slat-ink': '#8b5e34',
  			sand: '#f8f5ef',
  			'cream-100': '#f1ece4',
  			latte: '#e6ddd1',
  			// Tertiary text. Dark enough for AA (4.5:1) on every ground it runs
  			// on — white, sand and cream-100. It will not clear AA on `latte`;
  			// nor does `ink-soft` (4.23:1), so latte is not a text ground for
  			// anything below primary ink.
  			ash: '#736a5e',
  			// The old, lighter ash, kept for disabled controls only — WCAG 1.4.3
  			// exempts them, and a disabled slot that matches live tertiary text
  			// stops reading as disabled.
  			'ash-disabled': '#a39a8e',
  			bronze: '#3a2f27',
  			obsidian: '#2b211a'
  		},
  		// ── V2 design system — namespaced, does not touch V1 ──
  		fontFamily: {
  			display: ['var(--font-display)', 'Arial Narrow', 'sans-serif'],
  			body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			// Paragraph copy. Applied to <p> globally in v2.css, so this
  			// utility is only needed to opt other elements into the same face.
  			paragraph: ['var(--font-paragraph)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			// High-contrast specimen serif. Headline sizes only — see fontSize
  			// `serif-*` below for the range it stays legible in.
  			serif: ['var(--font-serif)', 'Georgia', 'serif']
  		},
  		fontSize: {
  			'display-xl': ['64px', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
  			'display-fluid': ['clamp(2.75rem, calc(2.05rem + 2.88vw), 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
  			'v2-h1': ['48px', { lineHeight: '1.0', letterSpacing: '-0.015em' }],
  			'v2-h2': ['36px', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
  			'v2-h3': ['20px', { lineHeight: '1.20' }],
  			'v2-body': ['16px', { lineHeight: '1.50' }],
  			'v2-body-sm': ['14px', { lineHeight: '1.45' }],
  			'v2-label': ['12px', { lineHeight: '1.30' }],
  			// Specimen serif scale. Leading tightens as the face grows, but tracking
  			// stays at its own fitting — the swashes overhang, so negative tracking
  			// collides glyphs. Not offered below 28px: the hairlines break up.
  			'serif-hero': ['clamp(3rem, calc(1.9rem + 4.6vw), 6.5rem)', { lineHeight: '0.92' }],
  			'serif-xl': ['clamp(2.5rem, calc(1.95rem + 2.3vw), 4rem)', { lineHeight: '0.98' }],
  			'serif-lg': ['clamp(2rem, calc(1.7rem + 1.25vw), 2.75rem)', { lineHeight: '1.05' }],
  			'serif-md': ['1.75rem', { lineHeight: '1.15' }],
  			// Tracked-out condensed eyebrow, as used above the specimen grid.
  			'eyebrow': ['0.75rem', { lineHeight: '1.20', letterSpacing: '0.18em' }],
  			'eyebrow-lg': ['0.875rem', { lineHeight: '1.20', letterSpacing: '0.16em' }]
  		},
  		boxShadow: {
  			'v2-sm': 'none',
  			'v2-md': 'none'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'v2-md': '8px',
  			'v2-lg': '12px',
  			'v2-xl': '16px',
  			'v2-2xl': '20px',
  			'v2-3xl': '24px',
  			'v2-4xl': '32px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
