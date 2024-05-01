import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    console.log(params);

    let post = null;

    if (params.postAlias === 'new') {
        post = null;
    } else {
        const response = await fetch(`https://blogger-server.mike.fm-media-staging.at/posts?alias=${params.postAlias}`);
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
