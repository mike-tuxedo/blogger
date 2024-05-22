<script>
    import "../variables.scss";
    import "../defaultTheme.scss";
    import "../app.scss";
    import { page } from "$app/stores";
    import { slide } from "svelte/transition";
    import { user } from "$lib/store.js";
    import { onMount } from "svelte";
    import { onNavigate } from '$app/navigation'
    
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

    onNavigate((navigation) => {
		if (!document.startViewTransition) return

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
		})
	})
</script>

<svelte:window bind:innerWidth />

{#if $user}
<button class="btn-logout btn btn-circle btn-outline bg-white btn-sm fixed bottom-4 left-5 z-30" on:click={() => ($user = null)}>
    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"/>
      </svg>
</button>
{/if}
{#if $page.url.pathname !== "/login"}
{#if showMenuBtn}
    <button class="menu" on:click={() => (showMenu = !showMenu)}
        >menü</button
    >
{/if}
    <nav class="nav-main">
        <img src="/logo.svg" class="logo" alt="Logo"/>
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
<main class="content {mainClass} prose">
    <slot />
</main>

<style lang="scss">

</style>
