<script>
    import Indicator from "./Indicator.svelte";
  import { getState, toReadableDate } from "./utils.js";

  export let data;
  export let deletePost;
</script>

<div class="overflow-x-auto w-full">
  <table class="table w-full">
    <!-- head -->
    <thead>
      <tr>
        <th>Überschrift</th>
        <th>Alias</th>
        <th>Erstellt am</th>
        <th>Veröffentlicht</th>
        <th>Bild</th>
        <th>Published</th>
        <th>Edit</th>
        <th>Delete</th>
      </tr>
    </thead>
    <tbody>
      <tr class="post new text-center hover:bg-gray-200">
        <td colspan="8">
          <a
            class="flex items-center justify-center decoration-none h-20 w-full "
            href="/new"
          >
            <div>+</div>
          </a>
        </td>
      </tr>
      {#each data as post}
        <tr class="post text-center hover:bg-gray-200">
          <td>
            <h4 class="my-0">{post.draftHeadline}</h4>
          </td>
          <td>
            {post.alias}
          </td>
          <td>{toReadableDate(post.created)}</td>
          <td>{post.published ? "Ja" : "Nein"}</td>
          <td>{@html post.draftImage}</td>
          <td class="relative"><Indicator state={getState(post)}/></td>
          <td>
            <a
              href="/{post.alias}"
              class="btn btn-sm btn-circle rouded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-edit"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path
                  d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"
                />
                <path
                  d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"
                />
                <path d="M16 5l3 3" />
              </svg>
            </a>
          </td>
          <td>
            <button
              on:click={() => deletePost(post.created)}
              class="btn btn-sm btn-circle"
            >
              <svg
                class="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                />
              </svg>
            </button></td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
