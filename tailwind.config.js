/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './lib/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class', // Use class strategy for dark mode
    theme: {
        extend: {
            colors: {
                'brand-primary': 'var(--current-brand-primary)',
                'brand-accent': 'var(--current-brand-accent)',
                'background-primary': 'var(--current-background-primary)',
                'background-secondary': 'var(--current-background-secondary)',
                'text-primary': 'var(--current-text-primary)',
                'text-secondary': 'var(--current-text-secondary)',
                border: 'var(--current-border-color)',
            },
            boxShadow: {
                DEFAULT: '0 1px 3px 0 var(--current-shadow-color)',
                md: '0 4px 6px -1px var(--current-shadow-color)',
                lg: '0 10px 15px -3px var(--current-shadow-color)',
            },
        },
    },
    plugins: [],
};