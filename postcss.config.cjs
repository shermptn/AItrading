// PostCSS configuration (CommonJS). This ensures PostCSS reliably loads the config.
// It uses the dedicated Tailwind PostCSS plugin and autoprefixer.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
