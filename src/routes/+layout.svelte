<script>
    import "../variables.scss";
    import "../defaultTheme.scss";
    import "../app.scss";
    import { page } from "$app/stores";
    import { slide } from "svelte/transition";
    import { user } from "$lib/store.js";
    import { onMount } from "svelte";
    import { onNavigate } from "$app/navigation";

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
            body.classList.add("logged-in");
        } else {
            body.classList.remove("logged-in");
        }
    }

    let mainClass;
    $: switch ($page.url.pathname) {
        case "/posts":
            mainClass = "posts";
            break;
        case "/":
            mainClass = "home";
            break;
        default:
            mainClass = "post-detail";
            break;
    }

    onMount(() => {
        body = document.body;
    });

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<svelte:window bind:innerWidth />

{#if $user}{/if}
{#if $page.url.pathname !== "/login"}
    <nav class="nav-main">
        <a href="/"><img src="/logo.svg" class="logo" alt="Logo" /></a>
        <div class="main-menu">
            <a href="/" class="btn btn-sm btn-secondary">home</a>
            {#if $user}
                <button
                    class="btn btn-sm btn-secondary btn-circle"
                    on:click={() => ($user = null)}
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
                            d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                        />
                    </svg>
                </button>
            {:else}
                <a href="/login" class="btn btn-sm btn-secondary"
                    >login</a
                >
            {/if}
        </div>
    </nav>
{/if}
<main class="content {mainClass} prose">
    <slot />
</main>
