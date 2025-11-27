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
                    bg: '#202124',
                    card: '#202124',
                    border: '#5f6368',
                    text: '#e8eaed',
                    sidebar: '#202124',
                    hover: '#28292c',
                    yellow: '#f28b82', // Red/Pink
                    orange: '#fbbc04',
                    yellow2: '#fff475',
                    green: '#ccff90',
                    teal: '#a7ffeb',
                    blue: '#cbf0f8',
                    darkblue: '#aecbfa',
                    purple: '#d7aefb',
                    pink: '#fdcfe8',
                    brown: '#e6c9a8',
                    gray: '#e8eaed'
                }
            }
        },
    },
    plugins: [],
}
