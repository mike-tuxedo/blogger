<script>
    import { fade } from "svelte/transition";

    export let index;
    export let addNewElement;
    let showElementPopup = false;

    const add = (elStr, index) => {
        showElementPopup = false;
        addNewElement(elStr, index);
    }
</script>

<div class="addElement">
    <button on:click={() => (showElementPopup = !showElementPopup)}>+</button>
    {#if showElementPopup}
        <div class="elements" transition:fade>
            <button class="add-text" on:click={() => add("text", index)}
                >Text</button
            >
            <button
                class="add-image"
                on:click={() => add("image", index)}
            >
                Image
            </button>
            <button
                class="add-button"
                on:click={() => add("button", index)}
            >
                Button
            </button>
            <button class="add-grid" on:click={() => add("grid", index)}
                >Grid</button
            >
        </div>
    {/if}
</div>

<style>
    .addElement {
        text-align: center;
        opacity: 0;
        padding:15px;
        transition: all 0.3s;
    }
    .addElement:hover {
        opacity: 1;
    }
    .elements {
        display: inline-block;
    }
</style>