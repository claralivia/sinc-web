/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        appleBlue: '#0A84FF',
        glass: {
          light: 'rgba(255, 255, 255, 0.12)',
          medium: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backdropBlur: {
        'apple': '20px',
      }
    },
  },
  plugins: [],
}
