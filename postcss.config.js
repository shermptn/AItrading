// Use the dedicated Tailwind PostCSS plugin package
module.exports = {
  plugins: [
    // Install with: npm install --save-dev @tailwindcss/postcss
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
