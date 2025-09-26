// PostCSS config that prefers the new @tailwindcss/postcss plugin when available,
// but falls back to the classic tailwindcss plugin if not. Using CommonJS ensures
// PostCSS always loads this file reliably.
module.exports = (function () {
  const plugins = [];

  try {
    // New separate PostCSS plugin for Tailwind (if installed)
    // npm install --save-dev @tailwindcss/postcss
    plugins.push(require('@tailwindcss/postcss'));
    // eslint-disable-next-line no-console
    console.info('Using @tailwindcss/postcss plugin for PostCSS.');
  } catch (err) {
    try {
      // Fallback to the tailwindcss package directly (older setups)
      plugins.push(require('tailwindcss'));
      // eslint-disable-next-line no-console
      console.info('Using tailwindcss directly for PostCSS.');
    } catch (err2) {
      // If neither is present, let PostCSS fail later with a clear message
      // eslint-disable-next-line no-console
      console.warn('Neither @tailwindcss/postcss nor tailwindcss found. PostCSS will throw.');
    }
  }

  // Autoprefixer should be present
  try {
    plugins.push(require('autoprefixer'));
  } catch {
    // autoprefixer missing — build will later show an error; we still include the attempt
    // eslint-disable-next-line no-console
    console.warn('autoprefixer not found. Please npm install --save-dev autoprefixer');
  }

  return { plugins };
})();
