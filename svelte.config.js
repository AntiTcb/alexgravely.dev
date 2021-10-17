import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        // hydrate the <div id="svelte"> element in src/app.html
        adapter: adapter(),
        target: '#svelte',
        vite: {
            css: {
                preprocessorOptions: {
                    scss: {
                        additionalData: '@import "src/variables.scss";'
                    }
                }
            },
            optimizeDeps: {
                include: ["highlight.js/lib/core"],
            }
        }
    },
    preprocess: [
        preprocess({
            scss: {
                prependData: '@import "src/variables.scss";'
            }
        })
    ]
};

export default config;
