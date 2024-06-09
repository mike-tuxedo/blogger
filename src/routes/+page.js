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
	// Get posts
	let posts = [];
	const _user = get(user);
	let postUrl = `${get(baseurl)}/posts.php`;
	if (!_user) {
		postUrl += '?published=1';
	}

	const postRes = await fetch(postUrl);
	if (postRes.ok) {
		console.log("posts geladen");
		posts = await postRes.json();
	} else {
		throw new Error(`Error fetching data: ${postRes.status}`);
	}

	// Get startpage content
	let startpage;
	let startpageUrl = `${get(baseurl)}/startpage.php`;

	const startpageRes = await fetch(startpageUrl);
	if (startpageRes.ok) {
		console.log("startpage content geladen");
		startpage = await startpageRes.json();
	} else {
		throw new Error(`Error fetching data: ${startpageRes.status}`);
	}

	return { posts, startpage };
}