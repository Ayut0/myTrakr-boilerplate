/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./frontend/**/*.{html,js}", "./src/**/*.{html,js}"],
  theme: {
    extend: {
      margin: {
        centered: "0 auto",
      },
      width: {
        30: "30%",
        90: "90%",
      },
    },
  },
  plugins: [],
};
