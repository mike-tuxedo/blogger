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
    const content = !isNewPost
        ? data.post.publishedContent.split("<!-- divider -->")
        : [];
    let postHeadline = data.post ? data.post.headline : "";
    let postAlias = data.post ? data.post.alias : "";
    let postPublished = data.post ? !!data.post.published : false;
    let postImage = data.post ? data.post.image : "/mountains.webp";
    let postTeaserText = data.post ? data.post.teaserText : "";
    let postDraftContent = data.post ? data.post.draftContent : "";
    let postPublishedContent = data.post ? data.post.publishedContent : "";

    $: if (isNewPost && content.length)
        data.post.publishedContent = content.join("<!-- divider -->");

    const savePost = async () => {
        const post = {
            headline: postHeadline,
            alias: postAlias,
            published: postPublished,
            image: postImage,
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

    $: if (postHeadline) {
        postAlias = postHeadline
            .replaceAll(" ", "-")
            .replaceAll("\n", "-")
            .toLowerCase();
    }
</script>


<div>
    <button on:click={() => goto('/posts')}>zurück</button>
    <button on:click={savePost}>save post</button>
</div>

{#if $user}
    <input
        type="text"
        name="alias"
        placeholder="alias"
        bind:value={postAlias}
    />
    <input
        type="text"
        name="image"
        placeholder="Bild"
        bind:value={postImage}
    />
    <textarea
        class="h1"
        type="text"
        name="headline"
        placeholder="Headline"
        bind:value={postHeadline}
    />
    <input type="checkbox" bind:checked={postPublished} />
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
    {#if data.post}<img src={data.post.image} />{/if}
    {#if data.post}<h1>{data.post.headline}</h1>{/if}
    {@html data.post ? data.post.publishedContent : ""}
{/if}

<style>
    textarea {
        width: 100%;
    }
</style>
