<script>
    import { goto } from "$app/navigation";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    import { user, baseurl } from "$lib/store.js";
    import PostSettings from "$lib/PostSettings.svelte";
    import { onMount } from "svelte";
    import { hotKeyAction } from "svelte-legos";
    import { customSlide, transformTextToURL } from "$lib/utils.js";
    import { fly } from "svelte/transition";

    /** @type {import('./$types').PageData} */
    export let data;
    const isnew = !Object.keys(data).length;
    let draftHeadline = !isnew ? data.draftHeadline : "";
    let publishedHeadline = !isnew ? data.publishedHeadline : "";
    let alias = !isnew ? data.alias : "";
    let created = !isnew ? data.created : Date.now();
    let published = !isnew ? !!data.published : false;
    let draftImage = !isnew ? data.draftImage : "<img src='/favicon.png'/>";
    let publishedImage = !isnew
        ? data.publishedImage
        : "<img src='/favicon.png'/>";
    let draftContent = !isnew ? data.draftContent : "";
    let publishedContent = !isnew ? data.publishedContent : "";
    let showDraftHeroImage = !isnew ? !!data.showDraftHeroImage : true;
    let showPublishedHeroImage = !isnew ? !!data.showPublishedHeroImage : true;

    let initialDraftHeadline = draftHeadline;
    let initialDraftImage = draftImage;
    let initialDraftContent = draftContent;
    let initialShowDraftHeroImage = showDraftHeroImage;

    let draftChanged = false;
    let publishedEqualsDraft = draftContent === publishedContent;

    let closeSetting;
    let aliasError = false;

    const createUpdatePost = async () => {
        closeSetting();

        if (!alias) {
            alias = transformTextToURL(draftHeadline);
        }

        const post = {
            draftHeadline,
            publishedHeadline,
            alias,
            created,
            published,
            publishedImage,
            draftImage,
            draftContent,
            publishedContent,
            showDraftHeroImage,
            showPublishedHeroImage,
            metatitle: "",
            metadescription: "",
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
                const data = await response.json(); // Verarbeitet die Antwort als JSON
                if (data.error) {
                    console.log("Server response:", data);
                    // aliasErrorModal.show();
                    aliasError = true;
                } else {
                    console.log("post gespeichert");
                    initialDraftHeadline = draftHeadline;
                    initialDraftImage = draftImage;
                    initialDraftContent = draftContent;
                    initialShowDraftHeroImage = showDraftHeroImage;
                    // draftChanged = false;
                }
            } else {
                const errorText = await response.text(); // Holt den Text der Fehlerantwort
                console.error(
                    `Error fetching data: ${response.status}`,
                    errorText,
                );
            }
        } catch (error) {
            console.error("Error in network or JSON handling: ", error);
        }

        checkForChanges();
    };

    const publishDraft = async () => {
        published = true;
        publishedHeadline = draftHeadline;
        publishedImage = draftImage;
        publishedContent = draftContent;
        showPublishedHeroImage = showDraftHeroImage;

        await createUpdatePost();

        checkForChanges();
    };

    const unpublish = async () => {
        published = false;

        await createUpdatePost();

        checkForChanges();
    };

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

    function checkForChanges() {
        if (
            draftHeadline === initialDraftHeadline &&
            draftImage === initialDraftImage &&
            draftContent === initialDraftContent &&
            showDraftHeroImage === initialShowDraftHeroImage
        ) {
            draftChanged = false;
        } else {
            draftChanged = true;
        }

        if (
            published &&
            publishedHeadline === draftHeadline &&
            publishedImage === draftImage &&
            publishedContent === draftContent &&
            showPublishedHeroImage === showDraftHeroImage
        ) {
            publishedEqualsDraft = true;
        } else {
            publishedEqualsDraft = false;
        }
    }

    $: if (draftHeadline || draftImage || draftContent || showDraftHeroImage) {
        checkForChanges();
    }
</script>

<button
    class="btn btn-outline btn-secondary fixed left-4 top-20"
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
            class:btn-warning={draftChanged}
            disabled={!draftHeadline.length}
            on:click={createUpdatePost}
            use:hotKeyAction={{ ctrl: true, code: "KeyS" }}>Save draft</button
        >
        <button
            class="btn btn-outline btn-sm"
            class:btn-success={published && publishedEqualsDraft}
            class:btn-warning={published && !publishedEqualsDraft}
            disabled={!draftHeadline.length}
            on:click={publishDraft}
            use:hotKeyAction={{ ctrl: true, code: "KeyP" }}
            >Publish draft</button
        >
        {#if published}
            <button
                class="btn btn-outline btn-sm bg-white"
                on:click={unpublish}
                use:hotKeyAction={{ ctrl: true, code: "KeyU" }}
                >Unpublish</button
            >
        {/if}
        <PostSettings post={data} bind:alias bind:close={closeSetting}/>
    </div>
    <div class="relative min-h-10">
        <button
            on:click={() => (showDraftHeroImage = !showDraftHeroImage)}
            class="absolute z-10 btn btn-primary top-4 right-4"
            >Toggle heroimage</button
        >
        {#if showDraftHeroImage}
            <div transition:customSlide>
                <Image bind:str={draftImage} htmlClass="heroimage" />
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
        bind:value={draftHeadline}
    />
    <Text bind:str={draftContent} />
{:else}
    <div class:hero={showPublishedHeroImage}>
        {#if showPublishedHeroImage}{@html publishedImage}{/if}
        <h1 class="headline">{publishedHeadline}</h1>
    </div>
    {@html publishedContent}
{/if}

{#if showLightbox}
    <div class="modal" style="opacity: 1">
        <img src={imgModalSrc} alt={imgModalAlt} />
        <button
            class="btn btn-sm btn-circle btn-secondary absolute right-5 top-5"
            on:click={() => (showLightbox = !showLightbox)}>✕</button
        >
    </div>
{/if}

{#if aliasError}
<div role="alert" class="alert alert-error shadow-lg" transition:fly={{ y: 150 }}>
    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={() => aliasError = false }>✕</button>
    <span>
        Your <b>alias</b> is already in use. Please open settings (bottom right)
        and change the alias.
    </span>
</div>
{/if}