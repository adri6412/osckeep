/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                keep: {
                    bg: '#0f172a', // Slate 900
                    sidebar: '#1e293b', // Slate 800
                    card: '#1e293b', // Slate 800
                    border: '#334155', // Slate 700
                    text: '#f1f5f9', // Slate 100
                    muted: '#94a3b8', // Slate 400
                    hover: '#334155', // Slate 700
                    // Note Colors (Pastel/Muted for Dark Mode)
                    red: '#77172e',
                    orange: '#692b17',
                    yellow: '#7c4a03',
                    green: '#264d3b',
                    teal: '#0c625d',
                    blue: '#256377',
                    darkblue: '#284255',
                    purple: '#472e5b',
                    pink: '#6c394f',
                    brown: '#4b443a',
                    gray: '#3c3f43'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
