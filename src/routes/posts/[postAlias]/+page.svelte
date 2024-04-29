<script>
	import Button from "$lib/Button.svelte";
	import Grid from "$lib/Grid.svelte";
	import Image from "$lib/Image.svelte";
	import Text from "$lib/Text.svelte";
	import { user } from "$lib/store.js";

	/** @type {import('./$types').PageData} */
	export let data;
	const content = data.post.content.split("<!-- divider -->");

	$: data.post.content = content.join("<!-- divider -->");

	const savePost = async () => {
		const post = {
			rowid: "0",
			name: "Post1",
			alias: "post1",
			published: "1",
			teaserImage: "/favicon.png",
			teaserText: "Post 1 Teasertext",
			draftContent: content.join("<!-- divider -->"),
			publishedContent: content.join("<!-- divider -->"),
		};

		const response = await fetch(
			"https://blogger-server.mike.fm-media-staging.at/post",
			{
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
				body: JSON.stringify(post),
			},
		);
		if (response.ok) {
			console.log("post erstellt");
		} else {
			throw new Error(`Error fetching data: ${response.status}`);
		}
	};
</script>

<button on:click={savePost}>save post</button>

{#if $user}
	{#each content as str}
		{#if str.substring(0, 4) === "<img"}
			<Image {str} />
		{:else if str.substring(0, 4) === "<but"}
			<Button {str} />
		{:else if str.substring(0, 4) === "<div"}
			<Grid {str} />
		{:else}
			<Text bind:str />
		{/if}
	{/each}
	<div class="copyToSave hide">
		{@html content.join("")}
	</div>
{:else}
	{@html data.post.content}
{/if}
