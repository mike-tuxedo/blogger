import { get } from "svelte/store";
import { user, baseurl, usePhpApi } from "$lib/store.js";

let $usePhpApi = get(usePhpApi);

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	const $user = get(user);
	let posts = [];
	let postUrl = $usePhpApi ? `${get(baseurl)}/api/posts.php` : `${get(baseurl)}/api/posts`;

	if (!$user) {
		postUrl += '?published=1';
	}

	const postRes = await fetch(postUrl);
	if (postRes.ok) {
		posts = await postRes.json();
	} else {
		throw new Error(`Error fetching data: ${postRes.status}`);
	}

	// Get startpage content
	let startpage;
	let startpageUrl = $usePhpApi ? `${get(baseurl)}/api/startpage.php` : `${get(baseurl)}/api/startpage`;

	const startpageRes = await fetch(startpageUrl);
	if (startpageRes.ok) {
		console.log("startpage content geladen");
		startpage = await startpageRes.json();
	} else {
		throw new Error(`Error fetching data: ${startpageRes.status}`);
	}

	return { posts, startpage };
}
