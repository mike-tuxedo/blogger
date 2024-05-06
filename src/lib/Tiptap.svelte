<script>
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import TextAlign from "@tiptap/extension-text-align";
    import Blockquote from "@tiptap/extension-blockquote";
    import CodeBlock from "@tiptap/extension-code-block";
    import HorizontalRule from "@tiptap/extension-horizontal-rule";
    import TipTapGrid from "./TipTapGrid.js"; // Importiere die oben definierte Extension

    export let content = "";
    let element;
    let editor;

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [
                StarterKit,
                TextAlign.configure({
                    types: ["heading", "paragraph"],
                }),
                Blockquote,
                CodeBlock,
                HorizontalRule,
                TipTapGrid.configure({ numberOfColumns: 2 }), // Setze die Spaltenanzahl hier oder über Befehle
            ],
            content: content,
            onUpdate: ({ editor }) => {
                content = editor.getHTML();
            },
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });

    function addGridDiv() {
        editor.commands.setGridDiv({ numberOfColumns: 4 });
    }
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
            on:click={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()}
            class:active={editor.isActive("heading", { level: 3 })}
        >
            H3
        </button>
        <button
            on:click={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()}
            class:active={editor.isActive("heading", { level: 4 })}
        >
            H4
        </button>
        <button
            on:click={() => editor.chain().focus().toggleBlockquote().run()}
            class:active={editor.isActive("blockquote")}
        >
            Zitat
        </button>
        <button
            on:click={() => editor.chain().focus().toggleBulletList().run()}
            class:active={editor.isActive("bulletList")}
        >
            Liste
        </button>
        <button
            on:click={() => editor.chain().focus().toggleOrderedList().run()}
            class:active={editor.isActive("orderedList")}
        >
            Liste mit Zahlen
        </button>
        <button
            on:click={() => editor.chain().focus().toggleCodeBlock().run()}
            class:active={editor.isActive("codeBlock")}
        >
            Code
        </button>
        <button
            on:click={() => editor.chain().focus().setHorizontalRule().run()}
        >
            HR
        </button>
        <button
            on:click={() => editor.chain().focus().setTextAlign("left").run()}
            class:active={editor.isActive({ textAlign: "left" })}
        >
            Links
        </button>
        <button
            on:click={() => editor.chain().focus().setTextAlign("center").run()}
            class:active={editor.isActive({ textAlign: "center" })}
        >
            Zentriert
        </button>
        <button
            on:click={() => editor.chain().focus().setTextAlign("right").run()}
            class:active={editor.isActive({ textAlign: "right" })}
        >
            Rechts
        </button>
        <button
            on:click={() => editor.chain().focus().toggleBold().run()}
            class:active={editor.isActive("bold")}
        >
            Fett
        </button>
        <button
            on:click={() => editor.chain().focus().toggleItalic().run()}
            class:active={editor.isActive("italic")}
        >
            Kursiv
        </button>
    {/if}

    <div bind:this={element}></div>
</div>

<style lang="scss">
    button.active {
        background: black;
        color: white;
    }
</style>
