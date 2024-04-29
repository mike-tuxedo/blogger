<script>
    import "../app.scss";
    import { page } from "$app/stores";
    import { slide } from "svelte/transition";
    import { user } from "$lib/store.js";

    let showMenu = false;
    let showMenuBtn = true;
    let innerWidth = 0;

    $: if (innerWidth) {
        showMenu = innerWidth >= 768 ? true : showMenu;
        showMenuBtn = innerWidth >= 768 ? false : true;
    }
</script>

<svelte:window bind:innerWidth />

{#if $user}
    <div class="user">
        <div class="logout" on:click={() => ($user = null)}>logout</div>
    </div>
{/if}
<div class="page">
    {#if $page.url.pathname !== "/login"}
        <aside>
            {#if showMenuBtn}
                <button class="menu" on:click={() => (showMenu = !showMenu)}
                    >menü</button
                >
            {/if}
            {#if showMenu}
                <div transition:slide={{ duration: 200 }}>
                    <a href="/">home</a>
                    <a href="/posts">posts</a>
                    <a href="/posts/test">post test</a>
                    <a href="/login">login</a>
                </div>
            {/if}
        </aside>
    {/if}
    <main>
        <slot />
    </main>
</div>

<style lang="scss">
    .user {
        position: fixed;
        z-index: 100;
        top: 20px;
        right: 20px;
    }
    .page {
        min-height: 100vh;
        max-width: $lgBreakpoint;
        width: 100%;
        margin: 0 auto;
        padding: 20px;
        box-sizing: border-box;

        aside {
            div {
                display: grid;
                grid-template-columns: 1fr;
                border: 1px solid $gray;
                border-radius: 10px;
                padding: 10px;
                margin-right: 20px;
            }
        }

        main {
            width: 100%;
        }

        @media (min-width: $mdBreakpoint) {
            display: flex;
            justify-content: center;

            aside {
                min-width: $asideWidth;
            }
        }
    }
</style>
