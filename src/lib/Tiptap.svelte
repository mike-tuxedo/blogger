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
    import { fly } from "svelte/transition";

    export let content = "";
    let editorElement;
    let editor;
    let selectedImage = null;
    let selectedParagraph = null;

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

    function setSelectedNode(event) {
        const { target } = event;
        console.log(target.tagName);
        if (target.tagName === "IMG") {
            selectedImage = target;
            selectedParagraph = null;
        } else if (["P", "H1", "H2", "H3", "H4"].includes(target.tagName)) {
            selectedParagraph = target;
            selectedImage = null;
        } else {
            selectedImage = null;
        }
    }

    function handleClick(event) {
        setSelectedNode(event);
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
        setSelectedNode(event);

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
        setSelectedNode(event);

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
        <div class="tiptap-controls" transition:fly>
            {#if selectedParagraph}
                {#key selectedParagraph}
                    <button
                        on:click={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()}
                        class:active={editor.isActive("heading", { level: 1 })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-h-1"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M19 18v-8l-2 2" />
                            <path d="M4 6v12" />
                            <path d="M12 6v12" />
                            <path d="M11 18h2" />
                            <path d="M3 18h2" />
                            <path d="M4 12h8" />
                            <path d="M3 6h2" />
                            <path d="M11 6h2" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()}
                        class:active={editor.isActive("heading", { level: 2 })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-h-2"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path
                                d="M17 12a2 2 0 1 1 4 0c0 .591 -.417 1.318 -.816 1.858l-3.184 4.143l4 0"
                            />
                            <path d="M4 6v12" />
                            <path d="M12 6v12" />
                            <path d="M11 18h2" />
                            <path d="M3 18h2" />
                            <path d="M4 12h8" />
                            <path d="M3 6h2" />
                            <path d="M11 6h2" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()}
                        class:active={editor.isActive("heading", { level: 3 })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-h-3"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M19 14a2 2 0 1 0 -2 -2" />
                            <path d="M17 16a2 2 0 1 0 2 -2" />
                            <path d="M4 6v12" />
                            <path d="M12 6v12" />
                            <path d="M11 18h2" />
                            <path d="M3 18h2" />
                            <path d="M4 12h8" />
                            <path d="M3 6h2" />
                            <path d="M11 6h2" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 4 })
                                .run()}
                        class:active={editor.isActive("heading", { level: 4 })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-h-4"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M20 18v-8l-4 6h5" />
                            <path d="M4 6v12" />
                            <path d="M12 6v12" />
                            <path d="M11 18h2" />
                            <path d="M3 18h2" />
                            <path d="M4 12h8" />
                            <path d="M3 6h2" />
                            <path d="M11 6h2" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().toggleBlockquote().run()}
                        class:active={editor.isActive("blockquote")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-blockquote"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M6 15h15" />
                            <path d="M21 19h-15" />
                            <path d="M15 11h6" />
                            <path d="M21 7h-6" />
                            <path
                                d="M9 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2"
                            />
                            <path
                                d="M3 9h1a1 1 0 1 1 -1 1v-2.5a2 2 0 0 1 2 -2"
                            />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().toggleBulletList().run()}
                        class:active={editor.isActive("bulletList")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-list"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M9 6l11 0" />
                            <path d="M9 12l11 0" />
                            <path d="M9 18l11 0" />
                            <path d="M5 6l0 .01" />
                            <path d="M5 12l0 .01" />
                            <path d="M5 18l0 .01" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().toggleOrderedList().run()}
                        class:active={editor.isActive("orderedList")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-list-numbers"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M11 6h9" />
                            <path d="M11 12h9" />
                            <path d="M12 18h8" />
                            <path
                                d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4"
                            />
                            <path d="M6 10v-6l-2 2" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().toggleCodeBlock().run()}
                        class:active={editor.isActive("codeBlock")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-source-code"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path
                                d="M14.5 4h2.5a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-5"
                            />
                            <path d="M6 5l-2 2l2 2" />
                            <path d="M10 9l2 -2l-2 -2" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().setHorizontalRule().run()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-separator-horizontal"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 12l16 0" />
                            <path d="M8 8l4 -4l4 4" />
                            <path d="M16 16l-4 4l-4 -4" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().setTextAlign("left").run()}
                        class:active={editor.isActive({ textAlign: "left" })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-align-left"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 6l16 0" />
                            <path d="M4 12l10 0" />
                            <path d="M4 18l14 0" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().setTextAlign("center").run()}
                        class:active={editor.isActive({ textAlign: "center" })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-align-center"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 6l16 0" />
                            <path d="M8 12l8 0" />
                            <path d="M6 18l12 0" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().setTextAlign("right").run()}
                        class:active={editor.isActive({ textAlign: "right" })}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-align-right"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 6l16 0" />
                            <path d="M10 12l10 0" />
                            <path d="M6 18l14 0" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().toggleBold().run()}
                        class:active={editor.isActive("bold")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-bold"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
                            <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
                        </svg>
                    </button>
                    <button
                        on:click={() =>
                            editor.chain().focus().toggleItalic().run()}
                        class:active={editor.isActive("italic")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon icon-tabler icon-tabler-italic"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M11 5l6 0" />
                            <path d="M7 19l6 0" />
                            <path d="M14 5l-4 14" />
                        </svg>
                    </button>
                {/key}
            {/if}
            {#if selectedImage}
                <button on:click={() => applyImageWidth("w-full")}
                    ><svg
                        class="icon icon-tabler icon-tabler-resize"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        xmlns="http://www.w3.org/2000/svg"
                        ><path d="M0 0h24v24H0z" stroke="none" /><path
                            d="M4 6V5a1 1 0 0 1 1-1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2M4 18v1a1 1 0 0 0 1 1h1m5 0h2m5 0h1a1 1 0 0 0 1-1v-1"
                        /><rect
                            x="4"
                            y="8.082"
                            width="15.989"
                            height="7.84"
                            ry="1.3"
                            stroke="#000"
                            style="paint-order:stroke fill markers"
                        /></svg
                    ></button
                >
                <button on:click={() => applyImageWidth("w-1/2")}
                    ><svg
                        class="icon icon-tabler icon-tabler-resize"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        xmlns="http://www.w3.org/2000/svg"
                        ><path d="M0 0h24v24H0z" stroke="none" /><path
                            d="M4 6V5a1 1 0 0 1 1-1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2M4 11.211v2M4 18v1a1 1 0 0 0 1 1h1m5 0h2m5 0h1a1 1 0 0 0 1-1v-1"
                        /><rect
                            x="7.191"
                            y="8.395"
                            width="9.617"
                            height="7.211"
                            ry="1.3"
                            stroke="#000"
                            style="paint-order:stroke fill markers"
                        /></svg
                    ></button
                >
                <button on:click={() => applyImageWidth("w-1/4")}
                    ><svg
                        class="icon icon-tabler icon-tabler-resize"
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        xmlns="http://www.w3.org/2000/svg"
                        ><path d="M0 0h24v24H0z" stroke="none" /><path
                            d="M4 6V5a1 1 0 0 1 1-1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2M4 11.211v2M4 18v1a1 1 0 0 0 1 1h1m5 0h2m5 0h1a1 1 0 0 0 1-1v-1"
                        /><rect
                            x="9.175"
                            y="9.166"
                            width="5.649"
                            height="5.668"
                            ry="1.3"
                            stroke="#000"
                            style="paint-order:stroke fill markers"
                        /></svg
                    ></button
                >
                <button on:click={() => applyImageFloats("float-left")}
                    ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-float-left"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path
                            d="M4 5m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        />
                        <path d="M14 7l6 0" />
                        <path d="M14 11l6 0" />
                        <path d="M4 15l16 0" />
                        <path d="M4 19l16 0" />
                    </svg></button
                >
                <button on:click={() => applyImageAlignment("mr-auto")}
                    ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-align-left"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 6l16 0" />
                        <path d="M4 12l10 0" />
                        <path d="M4 18l14 0" />
                    </svg></button
                >
                <button on:click={() => applyImageAlignment("mx-auto")}
                    ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-align-center"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 6l16 0" />
                        <path d="M8 12l8 0" />
                        <path d="M6 18l12 0" />
                    </svg></button
                >
                <button on:click={() => applyImageAlignment("ml-auto")}
                    ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-align-right"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 6l16 0" />
                        <path d="M10 12l10 0" />
                        <path d="M6 18l14 0" />
                    </svg></button
                >
                <button on:click={() => applyImageFloats("float-right")}
                    ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-float-right"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path
                            d="M14 5m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"
                        />
                        <path d="M4 7l6 0" />
                        <path d="M4 11l6 0" />
                        <path d="M4 15l16 0" />
                        <path d="M4 19l16 0" />
                    </svg></button
                >
                <button on:click={deleteImage}
                    ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon icon-tabler icon-tabler-trash"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 7l16 0" />
                        <path d="M10 11l0 6" />
                        <path d="M14 11l0 6" />
                        <path
                            d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"
                        />
                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                    </svg></button
                >
            {/if}
        </div>
    {/if}

    <div bind:this={editorElement} class="tiptap-editor"></div>
</div>

<style lang="scss">
</style>
