<script>
    import Tiptap from "$lib/Tiptap.svelte";
    export let str = "";
</script>

<Tiptap bind:content={str}/>