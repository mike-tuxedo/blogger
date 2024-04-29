<script>
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";

    export let content = "";
    let element;
    let editor;

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [StarterKit],
            content: content,
            onTransaction: () => {
                editor = editor;
                content = element.children[0].innerHTML;
            },
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });
</script>

<div>
    {#if editor}
        <button
            on:click={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()}
            class:active={editor.isActive("heading", { level: 1 })}
        >
            H1
        </button>
        <button
            on:click={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()}
            class:active={editor.isActive("heading", { level: 2 })}
        >
            H2
        </button>
        <button
            on:click={() => editor.chain().focus().setParagraph().run()}
            class:active={editor.isActive("paragraph")}
        >
            P
        </button>
    {/if}

    <div bind:this={element} />
</div>

<style>
    button.active {
        background: black;
        color: white;
    }
</style>