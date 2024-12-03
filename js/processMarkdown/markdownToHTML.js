import Showdown from "../externals/showdown.js";

// Gestion de la conversion du markdown en HTML
const converter = new Showdown.Converter({
	emoji: true,
	parseImgDimensions: true,
	simplifiedAutoLink: true,
	simpleLineBreaks: true,
});

export function markdownToHTML(text) {
	let html = converter.makeHtml(text);
	// Optimisation de l'affichage des images
	html = html.replaceAll("<img ", '<img loading="lazy" ');
	return html;
}
