<script>
    export let data;

    console.log(data);

    // Funktion zur Konvertierung des Unix-Timestamps in ein lesbares Datum
    const convertTimestamp = (timestamp) => {
        let date = new Date(timestamp * 1000);
        return date.toLocaleDateString("de-DE");
    };
</script>


<div class="overflow-x-auto">
    <table class="table">
      <!-- head -->
      <thead>
        <tr>
            <th>Überschrift</th>
            <th>Alias</th>
            <th>Erstellt am</th>
            <th>Veröffentlicht</th>
            <th>Bild</th>
            <th>Entwurf Inhalt</th>
            <th>Veröffentlichter Inhalt</th>
        </tr>
      </thead>
      <tbody>
        {#each data as post}
        <tr>
            <td><h4>{post.headline}</h4></td>
            <td>{post.alias}</td>
            <td>{convertTimestamp(post.created)}</td>
            <td>{post.published ? 'Ja' : 'Nein'}</td>
            <td>{@html post.image}</td>
            <td><code>{post.draftContent.substring(0,100)}...</code></td>
            <td><code>{post.publishedContent ? post.publishedContent.substring(0,100) : ''}...</code></td>
        </tr>
        {/each}
      </tbody>
    </table>
  </div>