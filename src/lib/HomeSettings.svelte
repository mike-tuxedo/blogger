
<script>
  export let metatitle = 'Blog My Mind';
  export let metadescription = 'Maybe the easiest way to blog';
  export let theme = 'defaultLight';
  export let close = () => {
    modal.close();
  }
  let modal;
</script>

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

    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Title</span>
      </div>
      <input type="text" bind:value={metatitle} class="input input-bordered" />
    </label>

    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Description</span>
      </div>
      <textarea class="textarea textarea-bordered" bind:value={metadescription}></textarea>
    </label>

    <label class="form-control w-full">
      <div class="label">
        <span class="label-text">Theme</span>
      </div>
      <select class="select select-bordered" bind:value={theme}>
        <option disabled selected>Pick one</option>
        <option>No Theme (style it your own way)</option>
        <option>Default Light</option>
        <option>Default Dark</option>
      </select>
    </label>
  </div>
</dialog>
