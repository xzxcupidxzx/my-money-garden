import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			income: {
  				DEFAULT: 'hsl(var(--income))',
  				foreground: 'hsl(var(--income-foreground))'
  			},
  			expense: {
  				DEFAULT: 'hsl(var(--expense))',
  				foreground: 'hsl(var(--expense-foreground))'
  			},
  			transfer: {
  				DEFAULT: 'hsl(var(--transfer))',
  				foreground: 'hsl(var(--transfer-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))',
  				'6': 'hsl(var(--chart-6))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
		borderRadius: {
			none: '0',
			sm: 'calc(var(--radius) - 4px)',
			DEFAULT: 'var(--radius)',
			md: 'var(--radius)',
			lg: 'calc(var(--radius) + 8px)',
			xl: 'calc(var(--radius) + 16px)',
			'2xl': 'calc(var(--radius) + 24px)',
			full: '9999px'
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'slide-up': {
  				from: {
  					transform: 'translateY(100%)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		},
		fontFamily: {
			sans: [
				'Space Grotesk',
				'Archivo',
				'ui-sans-serif',
				'system-ui',
				'-apple-system',
				'sans-serif'
			],
			display: [
				'Space Grotesk',
				'Archivo',
				'sans-serif'
			],
			mono: [
				'JetBrains Mono',
				'ui-monospace',
				'SFMono-Regular',
				'Menlo',
				'Monaco',
				'Consolas',
				'monospace'
			]
		},
		fontSize: {
			// Typography scale from styleguide
			'headline-1': ['2rem', { lineHeight: '2.5rem', fontWeight: '700', letterSpacing: '-0.02em' }],
			'headline-2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.01em' }],
			'subtitle': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
			'body-1': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
			'body-2': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
			'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
			'button': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500', letterSpacing: '0.01em' }]
		},
		letterSpacing: {
			tighter: '-0.05em',
			tight: '-0.025em',
			normal: '0',
			wide: '0.025em',
			wider: '0.05em',
			widest: '0.1em'
		},
		// Spacing scale from styleguide: 4, 8, 16, 24, 32, 48
		spacing: {
			'0': '0',
			'px': '1px',
			'0.5': '0.125rem',
			'1': '0.25rem',   // 4px
			'2': '0.5rem',    // 8px
			'3': '0.75rem',
			'4': '1rem',      // 16px
			'5': '1.25rem',
			'6': '1.5rem',    // 24px
			'7': '1.75rem',
			'8': '2rem',      // 32px
			'9': '2.25rem',
			'10': '2.5rem',
			'11': '2.75rem',
			'12': '3rem',     // 48px
			'14': '3.5rem',
			'16': '4rem',
			'20': '5rem',
			'24': '6rem',
			'28': '7rem',
			'32': '8rem',
			'36': '9rem',
			'40': '10rem',
			'44': '11rem',
			'48': '12rem',
			'52': '13rem',
			'56': '14rem',
			'60': '15rem',
			'64': '16rem',
			'72': '18rem',
			'80': '20rem',
			'96': '24rem'
		}
	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
