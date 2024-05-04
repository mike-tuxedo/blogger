import { error } from '@sveltejs/kit';
import { get } from "svelte/store";
import { user, baseurl } from "$lib/store.js";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    console.log(params);

    let post = null;
    const _user = get(user);
	// let url = `https://blogger-server.mike.fm-media-staging.at/posts?alias=${params.postAlias}`;

    // das muss ich mit dem timstamp bzw created machen, sonst kann da was falsches kommen
	let url = `${get(baseurl)}/posts.php?alias=${params.postAlias}`;
	if (!_user) {
		url += '&published=1'
	}

    if (params.postAlias === 'new') {
        console.log('new')
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
