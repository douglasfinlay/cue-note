/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'eos-grey-dark': '#141414',
                'eos-grey-light': '#A59BAA',
                'eos-scene-marker': '#001F10',
                'eos-yellow': '#C78B07',
            },
        },
    },
    plugins: [],
};
