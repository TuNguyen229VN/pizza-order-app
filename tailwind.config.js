/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blackHeader: "rgb(17, 25, 40)",
        primary: "#E71E23",
        secondary: "rgb(99, 115, 129)"
      },
      keyframes: {
        bounceX: {
          "0%, 100%": {
            transform: "translateX(0)",
          },
          "50%": {
            transform: "translateX(-10px)",
          },
        },
      },
      animation: {
        "bounce-x": "bounceX 1s infinite",
      },
    },
  },
  plugins: [],
};
