import { defineConfig } from 'vite';

export default defineConfig({
    clearScreen: false,
    server: {
        port: 8080
    },
    build: {
        outDir: 'dist',
        minify: 'terser',
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }
});
