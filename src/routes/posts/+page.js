/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	// const res = await fetch(`/api/posts`);
	// const posts = await res.json();

	// const response = await fetch("https://blogger-server.mike.fm-media-staging.at/posts");
	// if (response.ok) {
	// 	console.log("post erstellt");
	// } else {
	// 	throw new Error(`Error fetching data: ${response.status}`);
	// }

	const posts = [
		{
			name: 'Post1',
			alias: 'post1',
			published: 1,
			teaserImage: '/favicon.png',
			teaserText: 'Post 1 Teasertext'
		},
		{
			name: 'Post2',
			alias: 'post2',
			published: 1,
			teaserImage: '/favicon.png',
			teaserText: 'Post 2 Teaser Text'
		},
		{
			name: 'Post3',
			alias: 'post3',
			published: 1,
			teaserImage: '/favicon.png',
			teaserText: 'Post 3 Teaser Text'
		},
		{
			name: 'Post4',
			alias: 'post4',
			published: 1,
			teaserImage: '/favicon.png',
			teaserText: 'Post 4 Teaser Text'
		}
	];

	return { posts };
}