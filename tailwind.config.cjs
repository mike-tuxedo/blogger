module.exports = {
    content: ['./src/routes/**/*.{svelte,js,ts}'],
    plugins: [require("@tailwindcss/typography"), require('daisyui')],
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    primary: "#1ed38d",
                    secondary: "#333333",
                },
            },
            "dark",
            "cupcake",
            "bumblebee",
            "emerald",
            "corporate",
            "synthwave",
            "retro",
            "cyberpunk",
            "valentine",
            "halloween",
            "garden",
            "forest",
            "aqua",
            "lofi",
            "pastel",
            "fantasy",
            "wireframe",
            "black",
            "luxury",
            "dracula",
            "cmyk",
            "autumn",
            "business",
            "acid",
            "lemonade",
            "night",
            "coffee",
            "winter",
            "dim",
            "nord",
            "sunset",
        ],
    },
    // Stellen Sie sicher, dass Animationen nicht durch Purge entfernt werden
    purge: {
        content: ['./src/**/*.{html,svelte,js,ts}'],
        options: {
            safelist: ['animate-*'] // Um sicherzustellen, dass Animationsklassen erhalten bleiben
        }
    },
};