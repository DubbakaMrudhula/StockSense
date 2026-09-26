import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/products': 'http://localhost:5000',
      '/categories': 'http://localhost:5000',
      '/uoms': 'http://localhost:5000',
      '/locations': 'http://localhost:5000',
      '/stats': 'http://localhost:5000',
      '/api': 'http://localhost:5000'
    }
  }
});
