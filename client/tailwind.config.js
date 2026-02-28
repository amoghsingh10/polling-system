/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#7765DA",
                "primary-hover": "#5767D0",
                background: "#F2F2F2",
                text: "#373737",
                muted: "#6E6E6E"
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
