<script>
    import Tiptap from "$lib/Tiptap.svelte";

    export let str = "";
    let content = str;
    $: str = content.substring(0, 18) === "<div class='text'>" ? content : `<div class='text'>${content}</div>`;
</script>

<Tiptap bind:content={content}/>