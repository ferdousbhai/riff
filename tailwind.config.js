/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/mainview/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#1a1a2e",
          light: "#232342",
          lighter: "#2d2d4a",
        },
        accent: {
          DEFAULT: "#7c3aed",
          light: "#a78bfa",
        },
      },
    },
  },
};
