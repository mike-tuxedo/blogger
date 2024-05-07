<script>
    import { user } from "./store.js";
    import Button from "$lib/Button.svelte";
    import Grid from "$lib/Grid.svelte";
    import Image from "$lib/Image.svelte";
    import Text from "$lib/Text.svelte";
    
    export let str = "";
    let draft = str.substring(20, str.length - 6);
    let elements = draft ? draft.split("<!-- coldivider -->") : ['', ''];
    console.log('Render grid')

    $: if (elements) {
        console.log('elements', elements, 'draft', draft);
        draft = elements.join("<!-- coldivider -->");
        str = `<div class="grid-${elements.length}">`+draft+'</div>';
    }

    const setElement = (index, el) => {
        if (el === "text") {
            elements[index] = "<div class='text'></div>";
        } else if (el === "image") {
            elements[index] = '<img src="/favicon.png">';
        } else if (el === "button") {
            elements[index] = "<button>Button</button>";
        }

        draft = elements.join("<!-- coldivider -->");
        str = `<div class="grid-${elements.length}">`+draft+'</div>';
    };

// const changed = (index, str) => {
//     elements[index] = str;
//     draft = elements.join("<!-- coldivider -->");
//     str = `<div class="grid-${elements.length}">`+draft+'</div>';
// }
</script>

<div class="grid-{elements.length}">
    {#if $user}
        {#each elements as str, index}
            <!-- coldivider -->
            <div class="col">
                {#if str.substring(0, 4) === "<img"}
                    <Image bind:str />
                {:else if str.substring(0, 4) === "<but"}
                    <Button bind:str />
                {:else if str.substring(0, 18) === "<div class='text'>"}
                    <Text bind:str />
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
