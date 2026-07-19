import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'remove-redirects',
        closeBundle() {
          const redirectsPath = path.resolve(__dirname, 'dist/_redirects');
          if (existsSync(redirectsPath)) {
            unlinkSync(redirectsPath);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
