
<script>
  export let post = null;
  export let alias;
  export let close = () => {
    modal.close();
  }
  let modal;
  let metadescription = '';
  let metatitle = '';
</script>

{#if post}
<button class="btn-settings btn btn-circle btn-sm btn-outline" onclick="my_modal_3.showModal()">
  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
    </svg>
</button>

<!-- You can open the modal using ID.showModal() method -->
<dialog id="my_modal_3" class="modal" bind:this={modal}>
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 class="font-bold text-lg">Pagesettings</h3>
    <label class="form-control w-full mb-4">
      <div class="label">
        <span class="label-text">{location.host}/{alias}</span>
      </div>
      <input type="text" class="input input-bordered w-full" placeholder="Alias" bind:value={alias}/>
    </label>
    <label class="input input-bordered flex items-center gap-2 mb-4">
      <input type="text" class="text-md" placeholder="Metatitle" bind:value={metatitle}/>
    </label>
    <textarea class="textarea textarea-bordered w-full" placeholder="Metadescription" bind:value={metadescription}></textarea>
  </div>
</dialog>
{/if}
