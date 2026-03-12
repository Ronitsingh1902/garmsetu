/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontSize: {
                // Shifting scale up for readability (Kisan Friendly)
                'xs': '0.85rem',    // was 0.75
                'sm': '0.95rem',    // was 0.875
                'base': '1.05rem',  // was 1rem
                'lg': '1.2rem',     // was 1.125
                'xl': '1.35rem',    // was 1.25
                '2xl': '1.65rem',   // was 1.5
                '3xl': '2.15rem',   // was 1.875
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            colors: {
                earth: {
                    50: '#fcfaf8',
                    100: '#f7f4ef',
                    200: '#efe6db',
                    300: '#dfcec0',
                    400: '#cbaea0',
                    500: '#b88e7d',
                    600: '#a67362',
                    700: '#8b5d4e',
                    800: '#754f46',
                    900: '#60423d',
                    950: '#332220',
                },
                crop: {
                    green: '#4ade80',
                    dark: '#166534'
                }
            },
        },
    },
    plugins: [],
}
