import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        // hydrate the <div id="svelte"> element in src/app.html
        adapter: adapter(),
    },
    preprocess: [
        preprocess({
            scss: {
                prependData: '@import "src/variables.scss";',
            },
        }),
    ],
};

export default config;
