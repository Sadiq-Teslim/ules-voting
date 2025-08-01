/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif']
            },
            colors: {
                'vote-bg': '#F7F8FC',
                'vote-primary': '#4A43EC', // The main button purple/blue
                'vote-primary-hover': '#3A33CC',
                'vote-text-dark': '#1E1E1E',
                'vote-text-light': '#8A8A8A',
                'vote-gold': '#FFC700' // The golden accent color
            }
        }
    },
    plugins: []
}