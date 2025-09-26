import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Do NOT include the external: ['react', 'react-dom'] line!
  build: {
    rollupOptions: {
      // external: ['react', 'react-dom'],  // <--- REMOVE or comment this out
    },
  },
});
