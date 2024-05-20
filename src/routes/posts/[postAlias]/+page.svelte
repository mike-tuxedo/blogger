<script>
    import { goto } from "$app/navigation";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    import { user, baseurl } from "$lib/store.js";
    import Settings from "$lib/Settings.svelte";
    import { onMount } from "svelte";
    import { hotKeyAction } from "svelte-legos";

    /** @type {import('./$types').PageData} */
    export let data;
    const isnew = !Object.keys(data).length;
    let postHeadline = !isnew ? data.headline : "";
    let postAlias = !isnew ? data.alias : "";
    let postCreated = !isnew ? data.created : null;
    let postPublished = !isnew ? !!data.published : false;
    let postImage = !isnew ? data.image : "<img src='/favicon.png'/>";
    let postDraftContent = !isnew ? data.draftContent : "";
    let postPublishedContent = !isnew ? data.publishedContent : "";

    const saveDraft = async () => {
        const post = {
            headline: postHeadline,
            alias: postAlias,
            created: postCreated,
            published: postPublished,
            image: postImage,
            draftContent: postDraftContent,
            publishedContent: data.publishedContent,
        };

        try {
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

    const publishDraft = async () => {
        postPublished = true;
        postPublishedContent = postDraftContent;

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

    const unpublish = async () => {
        postPublished = false;

        const post = {
            headline: postHeadline,
            alias: postAlias,
            created: postCreated,
            published: postPublished,
            image: postImage,
            draftContent: postDraftContent,
            publishedContent: postPublishedContent,
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

    let publishedState = "btn-outline";
    $: if (!postPublished) {
        publishedState = "btn-outline";
    } else if (postDraftContent === postPublishedContent && postPublished) {
        publishedState = "btn-success";
    } else {
        publishedState = "btn-warning";
    }

    $: console.log(postDraftContent);

    onMount(() => {
        document.body.classList.add("post");
    });
</script>

<button class="btn btn-link btn-primary" on:click={() => goto("/posts")} use:hotKeyAction={{ ctrl: true, code: 'Backspace' }}>
    <svg
        class="w-5 h-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m15 19-7-7 7-7"
        />
    </svg>
    back
</button>
{#if $user}
    <div class="controls inline-flex gap-2 fixed bottom-4 right-5 z-30">
        <button class="btn btn-outline btn-sm bg-white" on:click={saveDraft} use:hotKeyAction={{ ctrl: true, code: 'KeyS' }}
            >Save draft</button
        >
        <button class="btn {publishedState} btn-sm" on:click={publishDraft} use:hotKeyAction={{ ctrl: true, code: 'KeyP' }}
            >Publish draft</button
        >
        {#if postPublished}
            <button class="btn btn-outline btn-sm bg-white" on:click={unpublish} use:hotKeyAction={{ ctrl: true, code: 'KeyU' }}
                >Unpublish</button
            >
        {/if}
        <Settings post={data} />
    </div>

    <label for="alias">
        Alias
        <input type="text" id="alias" bind:value={postAlias} />
    </label>
    <Image bind:str={postImage} htmlClass="heroimage" />
    <textarea
        class="h1 mb-2"
        type="text"
        name="headline"
        placeholder="Headline"
        bind:value={postHeadline}
    />
    <Text bind:str={postDraftContent} />
{:else}
    {@html postImage}
    <h1>{postHeadline}</h1>
    {@html postPublishedContent}
{/if}
