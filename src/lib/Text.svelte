<script>
    import Tiptap from "$lib/Tiptap.svelte";

    export let str = "";
    let content = str;
    $: str = `<div class='text'>${content}</div>`;
</script>

<Tiptap bind:content={content}/>
