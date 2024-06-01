<script>
    import Dropzone from "svelte-file-dropzone";
    import { baseurl, user } from "$lib/store.js";
    import { fade } from "svelte/transition";

    export let str = "";
    export let htmlClass = "";
    let uploading = false;

    let files = {
        accepted: [],
        rejected: [],
    };

    const handleFilesSelect = async (e) => {
        uploading = true;
        const { acceptedFiles, fileRejections } = e.detail;
        files.accepted = [...files.accepted, ...acceptedFiles];
        files.rejected = [...files.rejected, ...fileRejections];

        // Upload accepted files
        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append("file", file);

            loadPreview(file);

            try {
                const response = await fetch(`${$baseurl}/image.php`, {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json(); // Parse JSON response
                    console.log(data);
                    // hier müsste gleich figure mit srcset gemacht werden
                    str = `<img class="${htmlClass}" src="uploads/300_${data.filename}" srcset="uploads/300_${data.filename} 300w, uploads/600_${data.filename} 600w, uploads/1200_${data.filename} 1200w" alt="${data.filename}" />`;
                    console.log(`${file.name} uploaded successfully`);
                } else {
                    console.error(`${file.name} upload failed`);
                }
                uploading = false;
            } catch (error) {
                console.error("Error upuploading file:", error);
                uploading = false;
            }
        }
    };

    let preview = "";
    function loadPreview(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            preview = event.target.result;
        };
        reader.readAsDataURL(file);
    }
</script>

{#if $user}
    <Dropzone on:drop={handleFilesSelect} bind:files let:files>
        {#if preview}
            <div class="image absolute {htmlClass}" class:uploading transition:fade>
                <img class="dropzone-preview" src={preview} transition:fade />
            </div>
        {:else if str.length}
            <div class="image absolute" class:uploading transition:fade>{@html str}</div>
        {:else}
            <p class="dropezone-text" transition:fade>drop file here</p>
        {/if}
        {#if uploading}
            <div class="loading loading-spinner loading-lg h-full" transition:fade>lade</div>
        {/if}
    </Dropzone>
{:else}
    <div class="image" transition:fade>
        {@html str}
    </div>
{/if}

<style>
    .dropzone-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .dropezone-text {
        padding: 20px;
    }
</style>
