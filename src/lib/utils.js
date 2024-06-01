import { cubicOut } from 'svelte/easing';

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

export function customSlide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y', opacity = 0 } = {}) {
	const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
	const od = target_opacity * (1 - opacity);
	const primary_property = axis === 'y' ? 'height' : 'width';
	const primary_property_value = parseFloat(style[primary_property]);
	const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
	const capitalized_secondary_properties = secondary_properties.map(
		(e) => `${e[0].toUpperCase()}${e.slice(1)}`
	);
	const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
	const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
	const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
	const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
	const border_width_start_value = parseFloat(
		style[`border${capitalized_secondary_properties[0]}Width`]
	);
	const border_width_end_value = parseFloat(
		style[`border${capitalized_secondary_properties[1]}Width`]
	);
	return {
		delay,
		duration,
		easing,
		css: (t, u) =>
			'overflow: hidden;' +
			`opacity: ${target_opacity - od * u};` +
			`${primary_property}: ${t * primary_property_value}px;` +
			`padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
			`padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
			`margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
			`margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
			`border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
			`border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
	};
}