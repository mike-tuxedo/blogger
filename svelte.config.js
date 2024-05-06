import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
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
