/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'eos-yellow': '#C78B07',
                'eos-grey-dark': '#141414',
                'eos-grey-light': '#A59BAA',
            },
        },
    },
    plugins: [],
};
