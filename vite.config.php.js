import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs-extra';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        outDir: 'build-php',
        rollupOptions: {
            plugins: [
                {
                    name: 'copy-php-api',
                    writeBundle() {
                        fs.copySync('php-api', path.join('build-php', 'php-api'));
                    }
                }
            ]
        }
    }
});
