export function transformTextToURL(text) {
    // Convert text to lowercase
    let url = text.toLowerCase();

    // Replace spaces with dashes
    url = url.replace(/\s+/g, '-');

    // Remove non-URL compatible characters
    url = url.replace(/[^\w\-]+/g, '');

    // Ensure the length is no more than 100 characters
    if (url.length > 100) {
        url = url.substring(0, 100);
    }

    // Remove any trailing dashes
    url = url.replace(/\-+$/, '');

    return url;
}

export function toReadableDate(timestamp) {
    const date = new Date(timestamp);
    const readableDate = date.toLocaleDateString();
    return readableDate;
}