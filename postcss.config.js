// Use the dedicated Tailwind PostCSS plugin package.
// Using CommonJS here is the most compatible approach for PostCSS configs.
module.exports = {
  plugins: [
    // Tailwind's PostCSS plugin moved to @tailwindcss/postcss
    // Install it with: npm install -D @tailwindcss/postcss
    require('@tailwindcss/postcss'),
    // autoprefixer should already be present; keep it enabled
    require('autoprefixer'),
  ],
};
