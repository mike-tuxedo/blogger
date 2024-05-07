<script>
    import "../variables.scss";
    import "../defaultTheme.scss";
    import "../app.scss";
    import "../normalize.css";
    import { page } from "$app/stores";
    import { slide } from "svelte/transition";
    import { user } from "$lib/store.js";
    import { onMount } from "svelte";

    let showMenu = false;
    let showMenuBtn = true;
    let innerWidth = 0;
    let body = null;

    $: if (innerWidth) {
        showMenu = innerWidth >= 768 ? true : showMenu;
        showMenuBtn = innerWidth >= 768 ? false : true;
    }

    $: if (body) {
        if ($user) {
            body.classList.add('logged-in');
        } else {
            body.classList.remove('logged-in');
        }
    }

    let mainClass;
    $: switch ($page.url.pathname) {
        case '/posts': mainClass = 'posts'; break;
        case '/': mainClass = 'home'; break;
        default: mainClass = 'post-detail'; break;
    }

    onMount(() => {
        body = document.body;
    })
</script>

<svelte:window bind:innerWidth />

{#if $user}
    <div class="user">
        <div class="logout" on:click={() => ($user = null)}>logout</div>
    </div>
{/if}
{#if $page.url.pathname !== "/login"}
{#if showMenuBtn}
    <button class="menu" on:click={() => (showMenu = !showMenu)}
        >menü</button
    >
{/if}
<nav class="nav-main">
        {#if showMenu}
            <div transition:slide={{ duration: 200 }}>
                <a href="/">home</a>
                <a href="/posts">posts</a>
                <a href="/posts/test" data-sveltekit-preload-data="off">post 404 test</a>
                <a href="/login">login</a>
            </div>
        {/if}
    </nav>
{/if}
<main class="content {mainClass}">
    <slot />
</main>

<style lang="scss">
    .user {
        position: fixed;
        z-index: 100;
        top: 20px;
        right: 20px;
    }
</style>
