<script>
    import { goto } from "$app/navigation";
    import Button from "$lib/Button.svelte";
    import Grid from "$lib/Grid.svelte";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    import AddElementBtn from "$lib/AddElementBtn.svelte";
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
        console.log(draft);
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

    let showElementPopup = false;
    const addNewElement = (el, index) => {
        const currentDraft = draft;
        console.log('Element', el);

        if (el === "text") {
            currentDraft.splice(index + 1, 0, "<div class='text'></div>");
        } else if (el === "image") {
            currentDraft.splice(index + 1, 0, "<img class='image' src='/favicon.png'>");
        } else if (el === "button") {
            currentDraft.splice(index + 1, 0, "<button class='btn'>Button</button>");
        } else if (el === "grid") {
            currentDraft.splice(index + 1, 0, "<div class='grid-2'></div>");
        }

        draft = currentDraft;
    };
</script>

<div class="df jcsb aic mb-2">
    <button on:click={() => goto("/posts")} class="fl">zurück</button>
    {#if $user}
        <button on:click={savePost} class="ase">save draft</button>
        <button on:click={savePost} class="ase">publish</button>
    {/if}
</div>
{#if $user}
<div class="mb-2">
    <label>
        <span>published</span>
        <input type="checkbox" bind:checked={postPublished} />
    </label><br />
    <label>
        https://yourdomain.com/posts/
        <input
            type="text"
            name="alias"
            placeholder="alias"
            bind:value={postAlias}
        />
    </label>
</div>
    <Image bind:str={postImage} htmlClass="heroimage"/>
    <textarea
        class="h1 mb-2"
        type="text"
        name="headline"
        placeholder="Headline"
        bind:value={postHeadline}
    />
    <AddElementBtn addNewElement={addNewElement} index={-1}/>
    {#each draft as str, index}
        {#if str.substring(0, 4) === "<img"}
            <Image bind:str />
            <AddElementBtn addNewElement={addNewElement} index={index}/>
        {:else if str.substring(0, 4) === "<but"}
            <Button bind:str />
            <AddElementBtn addNewElement={addNewElement} index={index}/>
        {:else if str.substring(0, 18) === "<div class='text'>"}
            <Text bind:str />
            <AddElementBtn addNewElement={addNewElement} index={index}/>
        {:else if str.substring(0, 4) === "<div"}
            <Grid bind:str />
            <AddElementBtn addNewElement={addNewElement} index={index}/>
        {/if}
    {/each}
{:else}
    {@html postImage}
    <h1>{postHeadline}</h1>
    {@html postPublishedContent}
{/if}

<style>
    textarea {
        width: 100%;
    }
</style>
