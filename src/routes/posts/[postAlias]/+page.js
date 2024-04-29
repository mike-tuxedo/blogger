/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	// const res = await fetch(`/api/post/${params.postAlias}`);
	// const item = await res.json();

	const post = {
        name: 'Postname',
        alias: params.postAlias,
        published: 1,
        content: '<h1>Post</h1><p>Lorem Ipsum ...</p><!-- divider --><img src="/favicon.png"/><!-- divider --><button>Button</button><!-- divider --><div class="grid col-2"></div>',
    };

	return { post };
}