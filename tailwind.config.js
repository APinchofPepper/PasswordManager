/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for password strength
        'password-weak': '#FF6B6B',
        'password-moderate': '#FCA311',
        'password-strong': '#4ECB71',
        'password-very-strong': '#2A9D8F'
      },
      boxShadow: {
        'password-input': '0 0 10px rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
}