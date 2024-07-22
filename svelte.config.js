import preprocess from 'svelte-preprocess';
import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';

const isNodeBuild = process.env.ADAPTER === 'node';
const adapter = isNodeBuild ? adapterNode() : adapterStatic({
    fallback: "index.html",
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter,
        serviceWorker: {
            register: false
        }
    },
    preprocess: preprocess({
        scss: {
            prependData: `@import './src/variables.scss';@import './src/defaultTheme.scss';@import './src/app.scss';`
        }
    })
};

export default config;
