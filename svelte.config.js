// import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: "index.html",
		}),
		serviceWorker: {
			register: false
		}
	},
	preprocess: preprocess({
		scss: {
		  prependData: `@import './src/variables.scss';@import './src/defaultTheme.scss';@import './src/app.scss';`
		} 
	 }),
};

export default config;
