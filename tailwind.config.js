/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "550px",
      md: "1000px",
      lg: "1500px",
    },

    fontFamily: {
      sans: ["Halyard Display", "sans-serif"],
    },
    spacing: {
      1: "5px",
      2: "10px",
      3: "15px",
      4: "20px",
      5: "25px",
      6: "30px",
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "32px",
      "3xl": "clamp(20px, 6vw, 40px)/clamp(25px, 4vw, 55px)",
      "4xl": "clamp(40px, 10vw, 80px)/clamp(55px, 8vw, 110px)",
    },
    extend: {
      colors: {
        "red-100": "hsla(0, 100%, 96%, 1)",
        "red-500": "hsla(0, 100%, 65%, 1)",
        "red-600": "hsla(360, 79%, 59%, 1)",
        green: "hsla(133, 68%, 39%, 1)",
        white: "hsla(0, 0%, 100%, 1)",
        black: "hsla(280, 4%, 15%, 1)",
        "grey-50": "hsla(0, 0%, 96%, 1)",
        "grey-100": "hsla(0, 0%, 94%, 1)",
        "grey-500": "hsla(0, 0%, 84%, 1)",
        "grey-800": "hsla(0, 0%, 34%, 1)",
        "white-opacity-10": "hsla(0, 0%, 100%, 0.1)",
        "red-500-opacity-5": "hsla(0, 100%, 65%, 0.05)",
        "black-opacity-25": "hsla(280, 4%, 15%, 0.25)",
        "black-opacity-50": "hsla(280, 4%, 15%, 0.5)",
        "black-opacity-60": "hsla(280, 4%, 15%, 0.6)",
        "black-opacity-75": "hsla(280, 4%, 15%, 0.75)",
        "loading-skeleton-opacity-100": "hsl(270, 1%, 47%, 1)",
        "loading-skeleton-opacity-10": "hsl(270, 1%, 47%, 0.1)",
      },
    },
  },
  plugins: [],
};
