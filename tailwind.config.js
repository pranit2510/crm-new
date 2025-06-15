const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    // Removed "./src/pages/..." as it's less relevant for app router by default
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        'primary-dark': '#0056b3',
        secondary: '#6c757d',
        light: '#f8f9fa',
        dark: '#343a40',
        success: '#28a745',
        warning: '#ffc107',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        // You can add a specific class for headings if needed, or use Inter for both.
        // heading: ['YourHeadingFont', ...fontFamily.sans],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}; 