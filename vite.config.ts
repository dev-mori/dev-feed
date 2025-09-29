import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 配信に対応させるため base を相対に
export default defineConfig({
  plugins: [react()],
  base: './',
});
