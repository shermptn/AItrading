// PostCSS configuration (CommonJS). This ensures PostCSS reliably loads the config.
// It uses the dedicated Tailwind PostCSS plugin and autoprefixer.
module.exports = {
  plugins: [
    // use the new dedicated plugin package
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
