<script>
    import { user } from '$lib/store.js';
    import { fade } from 'svelte/transition';

	/** @type {import('./$types').PageData} */
	export let data;
</script>


<h1>Posts</h1>
<nav class="nav-posts">
    {#if $user}
    <a class="new" href="/posts/new" >
        <div>+</div>
    </a>
    {/if}
    {#each data.posts as post}
    <a class="post" href="/posts/{post.alias}" data-post-created={post.created}>
        {@html post.image}
        <h4>{post.headline}</h4>
    </a>
    {/each}
</nav>