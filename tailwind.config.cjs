// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./apps/expo/app/**/*.{js,jsx,ts,tsx}",
        "./apps/next/pages/**/*.{js,jsx,ts,tsx}",
        "./packages/app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    darkMode: "class",
    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
    },
    plugins: [],
};
