<script>
    export let state = "";
    export let htmlClass = "";
</script>

{#if state === "draft"}
    <div class="inline-block w-8 h-8 bg-warning border-none rounded-full {htmlClass} tooltip" data-tip="Post is not published."></div>
{:else if state === "published"}
    <div class="inline-block w-8 h-8 bg-success border-none rounded-full {htmlClass} tooltip" data-tip="Post is published."></div>
{:else if state === "changed"}
    <div class="inline-block w-8 h-8 bg-info border-none rounded-full {htmlClass} tooltip" data-tip="Post is published, but not the actual draft version."></div>
{/if}

<style>
    div {
        border-radius: 9999;
    }
</style>