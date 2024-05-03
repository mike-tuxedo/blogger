import { error } from '@sveltejs/kit';
import { get } from "svelte/store";
import { user } from "$lib/store.js";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    let post = null;
    const _user = get(user);
	let url = `https://blogger-server.mike.fm-media-staging.at/posts?alias=${params.postAlias}`;
	if (!_user) {
		url += '&published=1'
	}

    if (params.postAlias === 'new') {
        post = null;
    } else {
        const response = await fetch(url);
        if (!response.ok) {
            // Hier musst du auf response.status als Zahl prüfen, nicht als String
            if (response.status === 404) {
                // Richtiges Werfen eines 404-Fehlers
                throw error(404, 'Post not found');
            } else {
                // Richtiges Werfen eines 500-Fehlers
                throw error(500, 'An unexpected error occurred');
            }
        }
    
        post = await response.json();
        console.log("post geladen");
    }

    return { post };
}
