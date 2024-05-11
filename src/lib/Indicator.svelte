<script>
    export let state = "";
</script>

{#if state === "draft"}
    <div class="btn btn-circle btn-xs bg-info absolute z-10 top-2 left-2"></div>
{:else if state === "published"}
    <div class="btn btn-circle btn-xs bg-success absolute z-10 top-2 left-2"></div>
{:else if state === "changed"}
    <div class="btn btn-circle btn-xs bg-warning absolute z-10 top-2 left-2"></div>
{/if}
