<script>
    import Tableview from "$lib/Tableview.svelte";
    import Indicator from "$lib/Indicator.svelte";
    import { user, baseurl } from "$lib/store.js";
    import { onMount } from "svelte";

    /** @type {import('./$types').PageData} */
    export let data;
    let tableview = false;

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
                data.posts = data.posts.filter(post => post.created !== created);
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

    const getState = (post) => {
        if (!post.published) {
            return "draft";
        } else if (post.draftContent === post.publishedContent && post.published) {
            return "published";
        } else {
            return "changed";
        }
    }

    onMount(() => {
        document.body.classList.add("posts");
        document.body.classList.remove("login");
        document.body.classList.remove("post");
    });
</script>

<h1>Posts</h1>
{#if $user}
    <label
        class="btn btn-circle btn-outline btn-sm swap swap-rotate fixed bottom-4 right-5"
    >
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

    {#if tableview}
        <Tableview data={data.posts} />
    {:else}
        <nav class="posts">
            <a class="new" href="/posts/new">
                <div>+</div>
            </a>
            {#each data.posts as post}
                <div class="post relative">
                    <Indicator state={getState(post)}/>
                    <a
                        href="/posts/{post.alias}"
                        data-post-created={post.created}
                    >
                        {@html post.image}
                        <h4>{post.headline}</h4>
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
    <nav class="posts">
        {#each data.posts as post}
            <a
                class="post"
                href="/posts/{post.alias}"
                data-post-created={post.created}
            >
                {@html post.image}
                <h4>{post.headline}</h4>
            </a>
        {/each}
    </nav>
{/if}
