<script>
    import Tableview from "$lib/Tableview.svelte";
    import Indicator from "$lib/Indicator.svelte";
    import { user, baseurl, postsView } from "$lib/store.js";
    import { onMount } from "svelte";
    import { getState, toReadableDate } from "$lib/utils.js";
    import { slide } from "svelte/transition";
    import HomeSettings from "$lib/HomeSettings.svelte";
    import { hotKeyAction } from "svelte-legos";
    import Text from "$lib/Text.svelte";

    /** @type {import('./$types').PageData} */
    export let data;
    $: posts = data.posts;

    let closeSetting;
    let tableview = $postsView === "table";
    $: $postsView = tableview ? "table" : "grid";

    console.log(data);

    /** Start content */
    let metatitle = data.startpage ? data.startpage.metatitle : "";
    let metadescription = data.startpage ? data.startpage.metadescription : "";
    let theme = data.startpage ? data.startpage.theme : "";
    let draftContent = data.startpage ? data.startpage.draftContent : "";
    let publishedContent = data.startpage
        ? data.startpage.publishedContent
        : "";
    let initialDraftContent = draftContent;
    let publishedEqualsDraft = draftContent === publishedContent;
    let draftChanged = false;

    const createUpdateStartpage = async () => {
        closeSetting();

        const post = {
            draftContent,
            publishedContent,
            metatitle: metatitle,
            metadescription: metadescription,
            theme: theme,
        };

        try {
            const response = await fetch(`${$baseurl}/startpage.php`, {
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
                    aliasError = true;
                } else {
                    console.log("Startpage gespeichert");
                    initialDraftContent = draftContent;
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
        publishedContent = draftContent;

        await createUpdateStartpage();

        checkForChanges();
    };
    /** End content*/

    const deletePost = async (created) => {
        const post = {
            created: created,
        };

        try {
            const response = await fetch(`${$baseurl}/post.php`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "DELETE",
                body: JSON.stringify(post),
            });
            if (response.ok) {
                console.log("post gelöscht");
                data.posts = data.posts.filter(
                    (post) => post.created !== created,
                );
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

    const filterPosts = (query) => {
        console.log(query);
        posts = data.posts.filter((cur) => {
            return (
                cur.publishedHeadline
                    .toLowerCase()
                    .search(query.toLowerCase()) >= 0 ||
                cur.publishedContent
                    .toLowerCase()
                    .search(query.toLowerCase()) >= 0
            );
        });
    };

    function checkForChanges() {
        draftChanged = draftContent !== initialDraftContent;
        publishedEqualsDraft = publishedContent === draftContent;
    }

    onMount(() => {
        document.body.classList.add("posts");
        document.body.classList.remove("login");
        document.body.classList.remove("post");
    });
</script>
<!-- 
<h4 class="mt-6">Todos</h4>
<ol>
    <li>Add real login, check if account exist and add admin if not.</li>
    <li>Implement a category system</li>
    <li>Add themechanger</li>
    <li>
        Overwrite Images with the same name on the server, instead of
        uploading it multiple times
    </li>
    <li>Implement a search function</li>
    <li>
        Check if no posts are available, check if an user exists, if not
        show modal to switch to login page and create user.
    </li>
    <li>
        Enhance Settings
        <ol>
            <li>Save additional metatags</li>
            <li>Add switch themes function</li>
            <li>Add posibility for custom css</li>
            <li>Check how to switch between php and nodejs api</li>
        </ol>
    </li>
</ol>
<hr /> -->

<!-- Backup Text -->
<!-- <h1>Welcome to Blog Your Mind.</h1>
    <p>
        This is your startpage and the content you are reading is editable.
        Just go to your login page under <strong
        ><em>https://your-domain-that-i-cant.know/login</em></strong
        > and setup your admin profile and than come back here and start editing
        this content as you like.
    </p>
    <p>
        Under this content you will find your posts. Just click on the plus
        and create your first post.
    </p>
    <h3>I hope you will have fun with it, ENJOY! :)</h3> -->
{#if publishedContent}
    <Text bind:str={publishedContent} />
{/if}

{#if $user}
    {#if draftContent}
        <Text bind:str={draftContent} />
    {/if}

    <div class="controls inline-flex gap-2 fixed bottom-4 right-5 z-30">
        <button
            class="btn btn-outline btn-sm bg-white"
            class:btn-warning={draftChanged}
            on:click={createUpdateStartpage}
            use:hotKeyAction={{ ctrl: true, code: "KeyS" }}>Save draft</button
        >
        <button
            class="btn btn-outline btn-sm"
            class:btn-success={publishedEqualsDraft}
            class:btn-warning={!publishedEqualsDraft}
            on:click={publishDraft}
            use:hotKeyAction={{ ctrl: true, code: "KeyP" }}
            >Publish draft</button
        >
        <label class="btn btn-circle btn-outline btn-sm swap swap-rotate">
            <input type="checkbox" bind:checked={tableview} />
            <svg
                class="w-5 h-5 swap-on"
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
                    d="M9.143 4H4.857A.857.857 0 0 0 4 4.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 10 9.143V4.857A.857.857 0 0 0 9.143 4Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 20 9.143V4.857A.857.857 0 0 0 19.143 4Zm-10 10H4.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286A.857.857 0 0 0 9.143 14Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z"
                />
            </svg>
            <svg
                class="w-5 h-5 swap-off"
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
                    stroke-width="2"
                    d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5"
                />
            </svg>
        </label>
        <HomeSettings
            bind:close={closeSetting}
            bind:metatitle
            bind:metadescription
            bind:theme
        />
    </div>

    {#if tableview}
        <nav class="posts tableview">
            <Tableview data={posts} {deletePost} />
        </nav>
    {:else}
        <nav class="posts gridview">
            <a class="post new" href="/new">
                <div>+</div>
            </a>
            {#each posts as post}
                <div class="post relative">
                    <Indicator
                        state={getState(post)}
                        htmlClass="absolute z-10 top-2 left-2"
                    />
                    <a href="/{post.alias}" data-post-created={post.created}>
                        {#if post.showDraftHeroImage}
                            {@html post.draftImage}
                        {:else}
                            <img src="favicon.png" alt="placeholder" />
                        {/if}
                        <div class="post-info">
                            <h4>{post.draftHeadline}</h4>
                            <span>{toReadableDate(post.created)}</span>
                        </div>
                    </a>
                    <button
                        on:click={() => deletePost(post.created)}
                        class="btn btn-circle btn-outline btn-sm bnt-error absolute top-2 right-2"
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
                                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                            />
                        </svg>
                    </button>
                </div>
            {/each}
        </nav>
    {/if}
{:else}
    <label
        class="input input-bordered flex items-center gap-2 w-1/2 ml-auto mb-8"
    >
        <input
            type="text"
            class="grow"
            placeholder="Search"
            on:keyup={(e) => filterPosts(e.target.value)}
        />
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="w-4 h-4 opacity-70"
            ><path
                fill-rule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clip-rule="evenodd"
            /></svg
        >
    </label>
    <nav class="posts gridview">
        {#each posts as post}
            <a
                class="post"
                href="/{post.alias}"
                data-post-created={post.created}
                transition:slide
            >
                {@html post.publishedImage}
                <div class="post-info">
                    <h4>{post.publishedHeadline}</h4>
                    <span>{toReadableDate(post.created)}</span>
                </div>
            </a>
        {/each}
    </nav>
{/if}
