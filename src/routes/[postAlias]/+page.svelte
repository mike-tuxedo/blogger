<script>
    import { goto } from "$app/navigation";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    import { user, baseurl } from "$lib/store.js";
    import Settings from "$lib/Settings.svelte";
    import { onMount } from "svelte";
    import { hotKeyAction } from "svelte-legos";
    import { customSlide, transformTextToURL } from "$lib/utils.js";

    /** @type {import('./$types').PageData} */
    export let data;
    const isnew = !Object.keys(data).length;
    let postHeadline = !isnew ? data.headline : "";
    let postAlias = !isnew ? data.alias : "";
    let postCreated = !isnew ? data.created : Date.now();
    let postPublished = !isnew ? !!data.published : false;
    let postImage = !isnew ? data.image : "<img src='/favicon.png'/>";
    let postDraftContent = !isnew ? data.draftContent : "";
    let postPublishedContent = !isnew ? data.publishedContent : "";
    let postShowHeroImage = !isnew ? !!data.showHeroImage : true;

    let initialHeadline = postHeadline;
    let initialShowHeroImage = postShowHeroImage;

    const saveDraft = async () => {
        if (!postAlias) {
            postAlias = transformTextToURL(postHeadline);
        }

        const post = {
            headline: postHeadline,
            alias: postAlias,
            created: postCreated,
            published: postPublished,
            image: postImage,
            draftContent: postDraftContent,
            publishedContent: data.publishedContent,
            showHeroImage: postShowHeroImage
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
                console.log("post gespeichert");
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
        initialShowHeroImage = postShowHeroImage;
        initialHeadline = postHeadline;

        const post = {
            headline: postHeadline,
            alias: postAlias,
            created: postCreated,
            published: postPublished,
            image: postImage,
            draftContent: postDraftContent,
            publishedContent: postDraftContent,
            showHeroImage: postShowHeroImage
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
                console.log("post published");
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
            showHeroImage: postShowHeroImage
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
                console.log("post unpublished");
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

    let publishedState = "btn-outline";
    $: if (!postPublished) {
        publishedState = "btn-outline";
    } else if (postDraftContent === postPublishedContent && postPublished && 
    (postShowHeroImage === initialShowHeroImage) && (postHeadline === initialHeadline)) {
        publishedState = "btn-success";
    } else {
        publishedState = "btn-warning";
    }

    let showLightbox = false;
    let imgModalSrc = "";
    let imgModalAlt = "";

    onMount(() => {
        document.body.classList.add("post");

        if (!$user) {
            let images = document.querySelectorAll("main img");
            images.forEach((img) => {
                img.addEventListener("click", (e) => {
                    let src = e.target.src.replace(/300|600/, "1200");
                    imgModalSrc = src;
                    imgModalAlt = e.target.alt;
                    showLightbox = true;
                });
            });
        }
    });
</script>

<button
    class="btn btn-outline btn-secondary fixed left-4 top-8"
    on:click={() => goto("/")}
    use:hotKeyAction={{ ctrl: true, code: "Backspace" }}
>
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
</button>
{#if $user}
    <div class="controls inline-flex gap-2 fixed bottom-4 right-5 z-30">
        <button
            class="btn btn-outline btn-sm bg-white"
            on:click={saveDraft}
            use:hotKeyAction={{ ctrl: true, code: "KeyS" }}>Save draft</button
        >
        <button
            class="btn {publishedState} btn-sm"
            on:click={publishDraft}
            use:hotKeyAction={{ ctrl: true, code: "KeyP" }}
            >Publish draft</button
        >
        {#if postPublished}
            <button
                class="btn btn-outline btn-sm bg-white"
                on:click={unpublish}
                use:hotKeyAction={{ ctrl: true, code: "KeyU" }}
                >Unpublish</button
            >
        {/if}
        <Settings post={data} bind:alias={postAlias}/>
    </div>
    <div class="relative min-h-10">
        <button on:click={() => postShowHeroImage = !postShowHeroImage} class="absolute z-10 btn btn-primary top-4 right-4">Toggle heroimage</button>
        {#if postShowHeroImage}
        <div transition:customSlide>
            <Image bind:str={postImage} htmlClass="heroimage"/>
        </div>
        {/if}
    </div>
    <textarea
        class="h1"
        type="text"
        name="headline"
        placeholder="Add some stuning headline ..."
        autofocus
        rows="1"
        bind:value={postHeadline}
    />
    <Text bind:str={postDraftContent} />
{:else}
    <div class:hero={postShowHeroImage}>
        {#if postShowHeroImage}{@html postImage}{/if}
        <h1 class="headline">{postHeadline}</h1>
    </div>
    {@html postPublishedContent}
{/if}

{#if showLightbox}
    <div class="modal" style="opacity: 1">
        <img
            src={imgModalSrc}
            alt={imgModalAlt}
        />
        <button class="btn btn-sm btn-circle btn-secondary absolute right-5 top-5" on:click={() => (showLightbox = !showLightbox)}>✕</button>
    </div>
{/if}
