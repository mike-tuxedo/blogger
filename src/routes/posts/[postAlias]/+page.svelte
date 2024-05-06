<script>
    import { goto } from "$app/navigation";
    import Button from "$lib/Button.svelte";
    import Grid from "$lib/Grid.svelte";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    import { user, baseurl } from "$lib/store.js";
    import { slide } from "svelte/transition";

    /** @type {import('./$types').PageData} */
    export let data;
    const isnew = !Object.keys(data).length;
    let postHeadline = !isnew ? data.headline : "";
    let postAlias = !isnew ? data.alias : "";
    let postCreated = !isnew ? data.created : null;
    let postPublished = !isnew ? !!data.published : false;
    let postImage = !isnew ? data.image : "/mountains.webp";
    let postDraftContent = !isnew ? data.draftContent : "";
    let postPublishedContent = !isnew ? data.publishedContent : "";

    let draft = postDraftContent
        ? postDraftContent.split("<!-- divider -->")
        : [];

    $: if (draft) {
        postDraftContent = draft.join("<!-- divider -->");
    }

    const savePost = async () => {
        const post = {
            headline: postHeadline,
            alias: postAlias,
            created: postCreated,
            published: postPublished,
            image: postImage,
            draftContent: postDraftContent,
            publishedContent: postDraftContent,
        };

        try {
            console.log(JSON.stringify(post));
            const response = await fetch(`${$baseurl}/post.php`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(post),
            });
            if (response.ok) {
                console.log("post erstellt");
            } else {
                const errorText = await response.text();
                console.error(
                    `Error fetching data: ${response.status}`,
                    errorText,
                );
                throw new Error(
                    `Error fetching data: ${response.status} ${errorText}`,
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

    let showElementPopup = false;
    const addNewElement = (el) => {
        showElementPopup = false;

        if (el === "text") {
            draft = [...draft, ""];
        } else if (el === "image") {
            draft = [...draft, '<img src="/favicon.png">'];
        } else if (el === "button") {
            draft = [...draft, "<button>Button</button>"];
        } else if (el === "grid") {
            draft = [...draft, '<div class="grid"></div>'];
        }
    };
</script>

<div>
    <button on:click={() => goto("/posts")}>zurück</button>
    <button on:click={savePost}>save post</button>
</div>

{#if $user}
    <label class="mb-2 inline-block">
        <span>published</span>
        <input type="checkbox" bind:checked={postPublished} />
    </label><br />
    <label class="mb-5 inline-block">
        https://yourdomain.com/posts/
        <input
            type="text"
            name="alias"
            placeholder="alias"
            bind:value={postAlias}
        />
    </label>
    <Image bind:str={postImage} />
    <textarea
        class="h1 mb-2"
        type="text"
        name="headline"
        placeholder="Headline"
        bind:value={postHeadline}
    />
    {#each draft as str}
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
    <button on:click={() => (showElementPopup = !showElementPopup)}>+</button>
    {#if showElementPopup}
        <div class="elements" transition:slide>
            <div class="text" on:click={() => addNewElement("text")}>Text</div>
            <div class="image" on:click={() => addNewElement("image")}>
                Image
            </div>
            <div class="button" on:click={() => addNewElement("button")}>
                Button
            </div>
            <div class="grid" on:click={() => addNewElement("grid")}>Grid</div>
        </div>
    {/if}
{:else}
    <img src={postImage} />
    <h1>{postHeadline}</h1>
    {@html postPublishedContent}
{/if}

<style>
    textarea {
        width: 100%;
    }
</style>
