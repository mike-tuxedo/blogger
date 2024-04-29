<script>
	/** @type {import('./$types').PageData} */
	export let data;

    console.log(data);
</script>

<h1>Posts</h1>
<nav class="posts">
    {#each data.posts as post}
    <a class="post" href="/posts/{post.alias}">
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