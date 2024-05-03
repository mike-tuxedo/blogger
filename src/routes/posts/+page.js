import { get } from "svelte/store";
import { user } from "$lib/store.js";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	let posts = [];
	const _user = get(user);
	let url = "https://blogger-server.mike.fm-media-staging.at/posts";
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