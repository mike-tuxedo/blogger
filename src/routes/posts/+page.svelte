<script>
    import { user } from '$lib/store.js';

	/** @type {import('./$types').PageData} */
	export let data;

    console.log(data);
    const saveDummyPost = async () => {
        const post = {
            name: "Post1",
            alias: "post1",
            published: "1",
            teaserImage: "/favicon.png",
            teaserText: "Post 1 Teasertext",
            draftContent: "<p>test</p>",
            publishedContent: "<p>test</p>",
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

<button on:click={saveDummyPost}>save dummy post</button>


<h1>Posts</h1>
<nav class="posts">
    {#if $user}
    <a class="post" href="/posts/new" >
        <div>+</div>
    </a>
    {/if}
    {#each data.posts as post}
    <a class="post" href="/posts/{post.alias}" >
        <img src="{post.teaserImage}"/>
        <div>{post.teaserText}</div>
    </a>
    {/each}
</nav>

<style lang="scss">
    .posts {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
    }
    .post {
        display: flex;
        flex-direction: column;
        border: 1px solid $gray;
    }
</style>