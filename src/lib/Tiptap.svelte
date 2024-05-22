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
    import { fade, fly, scale, slide } from "svelte/transition";
    import Icon from "./Icon.svelte";
    import { clickOutsideAction } from "svelte-legos";

    export let content = "";
    let editorElement;
    let editorOuterElement;
    let editor;
    let selectedImage = null;
    let selectedParagraph = null;
    let currentNode = null;
    let changedCount = 1;
    let containerY = 0;
    let mouseY = 0;

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
                updateSelectedImage(editor);
                content = editor.getHTML();
            },
        });

        editorElement.addEventListener("paste", handlePaste);
        editorElement.addEventListener("drop", handleDrop);
        editorElement.addEventListener("click", handleClick);
        editorElement.addEventListener("mousedown", handleMouseDown);
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
        editorElement.removeEventListener("paste", handlePaste);
        editorElement.removeEventListener("drop", handleDrop);
        editorElement.addEventListener("click", handleClick);
        editorElement.addEventListener("mousedown", handleMouseDown);
    });

    function setSelectedNode(event) {
        const { target } = event;
        selectedImage = null;
        selectedParagraph = null;

        setTimeout(() => {
            containerY = editorOuterElement.getBoundingClientRect().top;
            mouseY = event.clientY;

            if (target.tagName === "IMG") {
                selectedImage = target;
                currentNode = target;
                selectedParagraph = null;
            } else if (["P", "H1", "H2", "H3", "H4", "STRONG", "CODE", "PRE", "DIV", "UL", "OL", "LI", "EM"].includes(target.tagName)) {
                selectedParagraph = target;
                currentNode = target;
                selectedImage = null;
            }
        }, 50);
    }

    function handleClick(event) {
        setSelectedNode(event);
    }
    
    function handleMouseDown(event) {
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

    function applyImageWidth(htmlClass) {
        if (selectedImage) {
            editor.commands.updateAttributes("image", {
                widthClass: htmlClass,
            });
            changedCount++;
        }
    }

    function applyImageFloats(htmlClass) {
        if (selectedImage) {
            editor.commands.updateAttributes("image", {
                alignClass: htmlClass,
            });
            changedCount++;
        }
    }

    function applyImageAlignment(htmlClass) {
        if (selectedImage) {
            editor.commands.updateAttributes("image", {
                alignClass: htmlClass,
            });
            changedCount++;
        }
    }

    function deleteImage() {
        if (selectedImage) {
            editor.commands.deleteSelection();
            selectedImage = null;
        }
    }

    function handleClickOutside() {
        selectedImage = null;
        selectedParagraph = null;
    }

    let controlsWidth;
    let controlsHeight;
    let textControls;
    let imageControls;
    let controlsOffset = 80;
    $: if (textControls) {
        controlsWidth = `${textControls.clientWidth}px`;
        controlsHeight = `${textControls.clientHeight}px`;
    } else if (imageControls) {
        controlsWidth = `${imageControls.clientWidth}px`;
        controlsHeight = `${imageControls.clientHeight}px`;
    }
</script>

<div use:clickOutsideAction={handleClickOutside} bind:this={editorOuterElement}>
    {#if selectedParagraph}
        <div
            transition:scale={{ duration: 150, start: 0.9 }}
            class="tiptap-controls absolute top-0 flex"
            style="top: {mouseY - containerY - controlsOffset}px"
            bind:this={textControls}
        >
            <button
                on:click={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                    changedCount++;
                }}
                class:active={changedCount &&
                    editor.isActive("heading", { level: 1 })}
            >
                <Icon name="heading-1" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                    changedCount++;
                }}
                class:active={changedCount &&
                    editor.isActive("heading", { level: 2 })}
            >
                <Icon name="heading-2" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                    changedCount++;
                }}
                class:active={changedCount &&
                    editor.isActive("heading", { level: 3 })}
            >
                <Icon name="heading-3" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleHeading({ level: 4 }).run();
                    changedCount++;
                }}
                class:active={changedCount &&
                    editor.isActive("heading", { level: 4 })}
            >
                <Icon name="heading-4" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleBold().run();
                    changedCount++;
                }}
                class:active={changedCount && editor.isActive("bold")}
            >
                <Icon name="bold" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleItalic().run();
                    changedCount++;
                }}
                class:active={changedCount && editor.isActive("italic")}
            >
                <Icon name="italic" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleBulletList().run();
                    changedCount++;
                }}
                class:active={changedCount && editor.isActive("bulletList")}
            >
                <Icon name="bullet-list" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleOrderedList().run();
                    changedCount++;
                }}
                class:active={changedCount && editor.isActive("orderedList")}
            >
                <Icon name="ordered-list" />
            </button>
            <div style="border-right: 1px solid #888; margin-top: 8px; height: 28px"/>
            <button
                on:click={() => {
                    editor.chain().focus().setTextAlign("left").run();
                    changedCount++;
                }}
                class:active={changedCount &&
                    editor.isActive({ textAlign: "left" })}
            >
                <Icon name="align-left" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().setTextAlign("center").run();
                    changedCount++;
                }}
                class:active={changedCount &&
                    editor.isActive({ textAlign: "center" })}
            >
                <Icon name="align-center" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().setTextAlign("right").run();
                    changedCount++;
                }}
                class:active={changedCount &&
                    editor.isActive({ textAlign: "right" })}
            >
                <Icon name="align-right" />
            </button>
            <div style="border-right: 1px solid #888; margin-top: 8px; height: 28px"/>
            <button
                on:click={() => {
                    editor.chain().focus().toggleBlockquote().run();
                    changedCount++;
                }}
                class:active={changedCount && editor.isActive("blockquote")}
            >
                <Icon name="blockquote" />
            </button>
            <button
                on:click={() => {
                    editor.chain().focus().toggleCodeBlock().run();
                    changedCount++;
                }}
                class:active={changedCount && editor.isActive("codeBlock")}
            >
                <Icon name="code-block" />
            </button>
            <button
                on:click={() => {
                    {
                        editor.chain().focus().setHorizontalRule().run();
                        changedCount++;
                    }
                }}
                class:active={changedCount && editor.isActive("horizontalRule")}
            >
                <Icon name="horizontal-rule" />
            </button>
        </div>
    {:else if selectedImage}
        <div
            transition:scale={{ duration: 150, start: 0.9 }}
            class="tiptap-controls absolute top-0 flex"
            style="top: {mouseY - containerY - controlsOffset}px"
            bind:this={imageControls}
        >
            <button
                on:click={() => applyImageWidth("w-full")}
                class:active={changedCount &&
                    editor.isActive({ widthClass: "w-full" })}
                ><Icon name="full-width" /></button
            >
            <button
                on:click={() => applyImageWidth("w-1/2")}
                class:active={changedCount &&
                    editor.isActive({ widthClass: "w-1/2" })}
                ><Icon name="resize" /></button
            >
            <button
                on:click={() => applyImageWidth("w-1/4")}
                class:active={changedCount &&
                    editor.isActive({ widthClass: "w-1/4" })}
                ><Icon name="resize-small" /></button
            >
            <div style="border-right: 1px solid #888; margin-top: 8px; height: 28px"/>
            <button
                on:click={() => applyImageFloats("float-left")}
                class:active={changedCount &&
                    editor.isActive({ alignClass: "float-left" })}
                ><Icon name="float-left" /></button
            >
            <button
                on:click={() => applyImageAlignment("mr-auto")}
                class:active={changedCount &&
                    editor.isActive({ alignClass: "mr-auto" })}
                ><Icon name="align-left" /></button
            >
            <button
                on:click={() => applyImageAlignment("mx-auto")}
                class:active={changedCount &&
                    editor.isActive({ alignClass: "mx-auto" })}
                ><Icon name="align-center" /></button
            >
            <button
                on:click={() => applyImageAlignment("ml-auto")}
                class:active={changedCount &&
                    editor.isActive({ alignClass: "ml-auto" })}
                ><Icon name="align-right" /></button
            >
            <button
                on:click={() => applyImageFloats("float-right")}
                class:active={changedCount &&
                    editor.isActive({
                        alignClass: "float-right",
                    })}><Icon name="float-right" /></button
            >
            <div style="border-right: 1px solid #888; margin-top: 8px; height: 28px"/>
            <button on:click={deleteImage}><Icon name="trash" /></button>
        </div>
    {/if}

    <div bind:this={editorElement} class="tiptap-editor"></div>
</div>

<style lang="scss">
</style>
