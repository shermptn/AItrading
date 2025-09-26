// PostCSS configuration — CommonJS module so PostCSS will always load it.
module.exports = {
  plugins: [
    // Tailwind's PostCSS plugin (new separate package)
    // Install: npm install --save-dev @tailwindcss/postcss
    require('@tailwindcss/postcss'),
    // Autoprefixer for vendor prefixes
    require('autoprefixer'),
  ],
};
