<script>
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import TextAlign from "@tiptap/extension-text-align";
    import Blockquote from "@tiptap/extension-blockquote";
    import CodeBlock from "@tiptap/extension-code-block";
    import HorizontalRule from "@tiptap/extension-horizontal-rule";
    import Dropcursor from "@tiptap/extension-dropcursor";
    import { baseurl } from "$lib/store.js";
    import CustomTiptapImage from "$lib/CustomTipTapImage.js";

    export let content = "";
    let editorElement;
    let editor;
    let selectedImage = null;

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.oasis.opendocument.text",
    ];

    onMount(() => {
        editor = new Editor({
            element: editorElement,
            extensions: [
                StarterKit,
                TextAlign.configure({
                    types: ["heading", "paragraph"],
                }),
                Blockquote,
                CodeBlock,
                HorizontalRule,
                Dropcursor,
                CustomTiptapImage.configure({
                    inline: false,
                    allowBase64: false,
                }),
            ],
            content: content,
            onUpdate: ({ editor }) => {
                console.log("update");
                updateSelectedImage(editor);
                content = editor.getHTML();
                console.log(content);
            },
        });

        editorElement.addEventListener("paste", handlePaste);
        editorElement.addEventListener("drop", handleDrop);
        editorElement.addEventListener("click", handleClick);
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
        editorElement.removeEventListener("paste", handlePaste);
        editorElement.removeEventListener("drop", handleDrop);
        editorElement.addEventListener("click", handleClick);
    });

    function handleClick(event) {
        const { target } = event;
        if (target.tagName === "IMG") {
            selectedImage = target;
        } else {
            selectedImage = null;
        }
    }

    function updateSelectedImage(editor) {
        const { doc, selection } = editor.state;
        const node = doc.nodeAt(selection.from);
        if (node?.type.name === "image") {
            selectedImage = editor.view.domAtPos(selection.from).node;
        } else {
            selectedImage = null;
        }
    }

    async function handlePaste(event) {
        const files = Array.from(event.clipboardData.files);
        if (files.length > 0) {
            for (const file of files) {
                await uploadFile(file);
            }
        } else {
            const text = event.clipboardData.getData("text");
            if (isYouTubeLink(text)) {
                const youtubeEmbed = generateYouTubeEmbed(text);
                editor.commands.insertContent(youtubeEmbed);
            }
        }
    }

    async function handleDrop(event) {
        const items = event.dataTransfer.items;
        if (items.length === 0) return;

        event.preventDefault();
        const pos = editor.view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
        });

        console.log(pos);

        for (const item of items) {
            if (item.kind === "file") {
                const file = item.getAsFile();
                await uploadFile(file, pos.pos);
            } else if (
                item.kind === "string" &&
                item.type === "text/uri-list"
            ) {
                const url = await new Promise((resolve) =>
                    item.getAsString(resolve)
                );
                if (isImageUrl(url)) {
                    await uploadImageFromUrl(url, pos.pos);
                }
            }
        }
    }

    async function uploadFile(file, pos = null) {
        if (!allowedMimeTypes.includes(file.type)) {
            console.error("Unsupported file type:", file.type);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${$baseurl}/image.php`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json(); // Parse JSON response
                let html = `<img class="tiptap-image" src="${$baseurl}/uploads/300_${data.filename}" srcset="${$baseurl}/uploads/300_${data.filename} 300w, ${$baseurl}/uploads/600_${data.filename} 600w, ${$baseurl}/uploads/1200_${data.filename} 1200w" alt="${data.filename}" />`;

                console.log(pos);
                if (pos !== null) {
                    editor.chain().insertContentAt(pos, html).focus().run();
                } else {
                    editor.chain().focus().insertContent(html).run();
                }
            } else {
                console.error(`${file.name} upload failed`);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }

    async function uploadImageFromUrl(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], url.split("/").pop(), {
                type: blob.type,
            });
            await uploadFile(file);
        } catch (error) {
            console.error("Failed to fetch image from URL:", error);
        }
    }

    function isYouTubeLink(text) {
        const youtubeRegex =
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return youtubeRegex.test(text);
    }

    function generateYouTubeEmbed(url) {
        let videoId = url.split("v=")[1] || url.split("youtu.be/")[1];
        const ampersandPosition = videoId.indexOf("&");
        if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
        }
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }

    function isImageUrl(url) {
        return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
    }

    let imageWidths = ["w-full", "w-1/2", "w-1/4"];
    function applyImageWidth(htmlClass) {
        if (selectedImage) {
            editor.commands.updateAttributes("image", {
                widthClass: htmlClass,
            });
        }
    }

    let imageFloats = ["float-left", "float-none", "float-right"];
    function applyImageFloats(htmlClass) {
        if (selectedImage) {
            editor.commands.updateAttributes("image", {
                alignClass: htmlClass,
            });
        }
    }

    let imageAlignments = ["mr-auto", "mx-auto", "ml-auto"];
    function applyImageAlignment(htmlClass) {
        if (selectedImage) {
            editor.commands.updateAttributes("image", {
                alignClass: htmlClass,
            });
        }
    }

    function deleteImage() {
        if (selectedImage) {
            editor.commands.deleteSelection();
            selectedImage = null;
        }
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
        </button>|
        <button
            on:click={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()}
            class:active={editor.isActive("heading", { level: 2 })}
        >
            H2
        </button>|
        <button
            on:click={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()}
            class:active={editor.isActive("heading", { level: 3 })}
        >
            H3
        </button>|
        <button
            on:click={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()}
            class:active={editor.isActive("heading", { level: 4 })}
        >
            H4
        </button>|
        <button
            on:click={() => editor.chain().focus().toggleBlockquote().run()}
            class:active={editor.isActive("blockquote")}
        >
            Zitat
        </button>|
        <button
            on:click={() => editor.chain().focus().toggleBulletList().run()}
            class:active={editor.isActive("bulletList")}
        >
            Liste
        </button>|
        <button
            on:click={() => editor.chain().focus().toggleOrderedList().run()}
            class:active={editor.isActive("orderedList")}
        >
            Liste mit Zahlen
        </button>|
        <button
            on:click={() => editor.chain().focus().toggleCodeBlock().run()}
            class:active={editor.isActive("codeBlock")}
        >
            Code
        </button>|
        <button
            on:click={() => editor.chain().focus().setHorizontalRule().run()}
        >
            HR
        </button>|
        <button
            on:click={() => editor.chain().focus().setTextAlign("left").run()}
            class:active={editor.isActive({ textAlign: "left" })}
        >
            Links
        </button>|
        <button
            on:click={() => editor.chain().focus().setTextAlign("center").run()}
            class:active={editor.isActive({ textAlign: "center" })}
        >
            Zentriert
        </button>|
        <button
            on:click={() => editor.chain().focus().setTextAlign("right").run()}
            class:active={editor.isActive({ textAlign: "right" })}
        >
            Rechts
        </button>|
        <button
            on:click={() => editor.chain().focus().toggleBold().run()}
            class:active={editor.isActive("bold")}
        >
            Fett
        </button>|
        <button
            on:click={() => editor.chain().focus().toggleItalic().run()}
            class:active={editor.isActive("italic")}
        >
            Kursiv
        </button>|
        <!-- <button on:click={addImage}>Image</button> -->
    {/if}

    <div bind:this={editorElement} class="tiptap-editor"></div>

    {#if selectedImage}
        <div
            class="image-toolbar"
            class:selectedImage
            style="top: {selectedImage.offsetTop +
                70}px; left: auto; right: 20px;"
        >
            <button on:click={() => applyImageWidth("w-full")}
                >Volle Breite</button
            >
            <button on:click={() => applyImageWidth("w-1/2")}
                >Mittlere Breite</button
            >
            <button on:click={() => applyImageWidth("w-1/4")}
                >Kleine Breite</button
            >
            <button on:click={() => applyImageFloats("float-left")}
                >Float Left</button
            >
            <button on:click={() => applyImageAlignment("mr-auto")}
                >Align Left</button
            >
            <button on:click={() => applyImageAlignment("mx-auto")}
                >Align Center</button
            >
            <button on:click={() => applyImageAlignment("ml-auto")}
                >Align Right</button
            >
            <button on:click={() => applyImageFloats("float-right")}
                >Float Right</button
            >
            <button on:click={deleteImage}>Löschen</button>
        </div>
    {/if}
</div>

<style lang="scss">
</style>
