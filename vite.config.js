import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@import "src/variables.scss";',
            },
        },
    },
    optimizeDeps: {
        include: ['highlight.js/lib/core'],
    },
};

export default config;
