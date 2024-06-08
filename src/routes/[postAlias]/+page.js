import { error } from '@sveltejs/kit';
import { get } from "svelte/store";
import { user, baseurl, usePhpApi } from "$lib/store.js";
import { PUBLIC_NODE_API_URL, PUBLIC_PHP_API_URL } from '$env/static/public';

let $usePhpApi = get(usePhpApi);
if ($usePhpApi) {
	baseurl.set(PUBLIC_PHP_API_URL);
} else {
	baseurl.set(PUBLIC_NODE_API_URL);
}

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    console.log(params);

    let post = null;
    const _user = get(user);
	let url = `${get(baseurl)}/posts.php?alias=${params.postAlias}`;
	if (!_user) {
		url += '&published=1'
	}

    if (params.postAlias === 'new') {
        return null;
    } else {
        const response = await fetch(url);
        post = await response.json();

        if (!response.ok || post[0] == undefined) {
            // Hier musst du auf response.status als Zahl prüfen, nicht als String
            if (response.status === 404) {
                // Richtiges Werfen eines 404-Fehlers
                throw error(404, 'Post not found');
            } else {
                // Richtiges Werfen eines 500-Fehlers
                throw error(500, 'An unexpected error occurred');
            }
        }
    
        console.log("post geladen", post[0]);
        return post[0];
    }
}
