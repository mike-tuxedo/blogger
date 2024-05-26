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
	let posts = [];
	const _user = get(user);
	let url = `${get(baseurl)}/posts.php`;
	if (!_user) {
		url += '?published=1';
	}

	const response = await fetch(url);
	if (response.ok) {
		console.log("posts geladen");
		posts = await response.json();
	} else {
		throw new Error(`Error fetching data: ${response.status}`);
	}

	return { posts };
}