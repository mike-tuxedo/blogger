<script>
    import { user } from "./store.js";
    import Button from "$lib/Button.svelte";
    import Grid from "$lib/Grid.svelte";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    
    export let str = "";
    let draft = str.substring(18, str.length - 6);
    let elements = draft ? draft.split("<!-- coldivider -->") : ['', ''];

    $: console.log('elements', elements);

    const setElement = (index, el) => {
        if (el === "text") {
            elements[index] = "<p>Dein Text hier</p>";
        } else if (el === "image") {
            elements[index] = '<img src="/favicon.png">';
        } else if (el === "button") {
            elements[index] = "<button>Button</button>";
        }

        str = `<div class="grid-${elements.length}">`+elements.join("<!-- coldivider -->")+'</div>';
        console.log('str', str);
    };
</script>

<div class="grid-{elements.length}">
    {#if $user}
        {#each elements as element, index}
            <div class="col">
                {#if element.substring(0, 4) === "<img"}
                    <Image bind:element />
                {:else if element.substring(0, 4) === "<but"}
                    <Button bind:element />
                {:else if element.substring(0, 4) === "<div"}
                    <Grid bind:element />
                {:else if element.substring(0, 4) === "<p"}
                    <Text bind:element />
                {:else}
                    <div
                        class="text"
                        on:click={() => setElement(index, "text")}
                    >
                        Text
                    </div>
                    <div
                        class="image"
                        on:click={() => setElement(index, "image")}
                    >
                        Image
                    </div>
                    <div
                        class="button"
                        on:click={() => setElement(index, "button")}
                    >
                        Button
                    </div>
                {/if}
            </div>
        {/each}
    {:else}
        {@html str}
    {/if}
</div>
