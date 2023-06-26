const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,tsx}'],
    theme: {
        extend: {
            animation: {
                'quick-button-trigger': 'flash 750ms ease-in-out 1',
            },
            keyframes: {
                flash: {
                    '0%': { 'background-color': colors.slate[500] },
                },
            },
        },
    },
    plugins: [],
};
