<script>
    import { goto } from "$app/navigation";
    import Button from "$lib/Button.svelte";
    import Grid from "$lib/Grid.svelte";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    import { user } from "$lib/store.js";

    /** @type {import('./$types').PageData} */
    export let data;
	const isNewPost = !data.post;
    const content = !isNewPost ? data.post.publishedContent.split("<!-- divider -->") : [];
	let postName = '';
	let postTitle = '';
	let postpublished = '0';
	let postTeaserImage = '';
	let postTeaserText = '';
	let postDraftContent = '';
	let postPublishedContent = '';
    $: if (isNewPost && content.length) data.post.publishedContent = content.join("<!-- divider -->");

	const createPost = async () => {
		const post = {
			name: postName,
            alias: postTitle,
            published: postpublished,
            teaserImage: postTeaserImage,
            teaserText: postTeaserText,
            draftContent: postDraftContent,
            publishedContent: postPublishedContent,
        }

		try {
			console.log(JSON.stringify(post));
            const response = await fetch(
                "https://blogger-server.mike.fm-media-staging.at/post",
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(post),
                }
            );
            if (response.ok) {
                console.log("post erstellt");
            } else {
                const errorText = await response.text();
                console.error(
                    `Error fetching data: ${response.status}`,
                    errorText
                );
                throw new Error(
                    `Error fetching data: ${response.status} ${errorText}`
                );
            }
        } catch (error) {
            console.error("Error in JSON handling: ", error);
        }
	}
    const savePost = async () => {
        const post = {
			name: data.post.name,
            alias: data.post.alias,
            published: data.post.published,
            teaserImage: data.post.teaserImage,
            teaserText: data.post.teaserImage,
            draftContent: content.join("<!-- divider -->"),
            publishedContent: content.join("<!-- divider -->"),
        };

        try {
			console.log(JSON.stringify(post));
            const response = await fetch(
                "https://blogger-server.mike.fm-media-staging.at/post",
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify(post),
                }
            );
            if (response.ok) {
                console.log("post erstellt");
            } else {
                const errorText = await response.text();
                console.error(
                    `Error fetching data: ${response.status}`,
                    errorText
                );
                throw new Error(
                    `Error fetching data: ${response.status} ${errorText}`
                );
            }
        } catch (error) {
            console.error("Error in JSON handling: ", error);
        }
    };
</script>

<button on:click={savePost}>save post</button>
<button on:click={createPost}>create post</button>

{#if isNewPost}
<input type="text" name="name" placeholder="Titel" bind:value={postName}>
<input type="text" name="alias" placeholder="alias" bind:value={postTitle}>
<input type="text" name="teaserImage" placeholder="Teaserbild" bind:value={postTeaserImage}>
<input type="text" name="teaserText" placeholder="Teasertext" bind:value={postTeaserText}>
<input type="checkbox" bind:checked={postpublished}>
{/if}

{#if $user && content.length}
    {#each content as str}
        {#if str.substring(0, 4) === "<img"}
            <Image bind:str />
        {:else if str.substring(0, 4) === "<but"}
            <Button bind:str />
        {:else if str.substring(0, 4) === "<div"}
            <Grid bind:str />
        {:else}
            <Text bind:str />
        {/if}
    {/each}
    <div class="copyToSave hide">
        {@html content.join("")}
    </div>
{:else}
    {@html data.post ? data.post.publishedContent : ''}
{/if}
