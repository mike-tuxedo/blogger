<script>
    import Tiptap from "$lib/Tiptap.svelte";

    export let str = "";
</script>

<div>
    <Tiptap bind:content={str}/>
</div>
