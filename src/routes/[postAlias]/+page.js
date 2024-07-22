import { error } from '@sveltejs/kit';
import { get } from "svelte/store";
import { user, baseurl, usePhpApi } from "$lib/store.js";

let $usePhpApi = get(usePhpApi);

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    console.log('PARAMS:',params);

    const $user = get(user);
    let post = null;
	let postsUrl = $usePhpApi ? `${get(baseurl)}/api/posts.php?alias=${params.postAlias}` : `${get(baseurl)}/api/posts?alias=${params.postAlias}`;

	if (!$user) {
		postsUrl += '&published=1'
	}

    if (params.postAlias === 'new') {
        return null;
    } else {
        const response = await fetch(postsUrl);
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
