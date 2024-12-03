import { markdownToHTML } from "./markdownToHTML";
import { processYAML } from "./yaml";
import { tabInfoMD } from "../config";

// Filtre pour supprimer des éléments inutiles
function filterElementWithNoContent(element) {
	const value = element.trim().replace("\n", "") === "" ? false : true;
	return value;
}

// Fonction pour récupérer une liste d'éléments markdown
function getElementsFromMarkdownList(txt) {
	const src = txt.match(/- .*/g);
	const urls = src.map((item) => item.split(" ")[1]);
	const feedTitlesInCommentsToAdd = src.map((item) => [
		item.split(" ")[1],
		item
			.split(" ")
			.slice(2)
			.join(" ")
			.replace("<!--", "")
			.replace("-->", "")
			.trim(),
	]);
	return { urls: urls, feedTitlesInCommentsToAdd: feedTitlesInCommentsToAdd };
}

export function parseMarkdown(markdownContent) {
	// Gestion de l'en-tête YAML
	processYAML(markdownContent);

	// On distingue le header et le contenu
	const indexfirstH2title = markdownContent.search(/(?<!- )## /);
	const header = markdownContent.substring(0, indexfirstH2title);
	const mainContent = markdownContent.substring(indexfirstH2title);

	// Dans le header, on distingue le titre (défini par un titre h1) et le message initial
	const markNewsTitle = header.match(/# .*/)[0].replace("# ", "");
	const indexStartTitle = header.indexOf(markNewsTitle);
	const initialMessageContent = header.substring(
		indexStartTitle + markNewsTitle.length + 2,
	);

	// Dans le contenu, on distingue chaque onglet (qui commence par un titre h2)
	const tabs = mainContent.split(/(?<!#)## /).filter(Boolean);
	let tabsTitles = [];
	let RSSfeeds = [];
	let RSSfeedstitles = [];
	let feedTitlesInComments = [];

	for (let i = 0; i < tabs.length; i++) {
		const tab = tabs[i];
		// Dans chaque onglet, on distingue le titre et le contenu
		const indexEndTitle = tab.indexOf("\n");
		const tabTitle = tab.substring(0, indexEndTitle);
		const tabTitleHTML =
			'<h2><a href="?t=' + (i + 1) + '">' + tabTitle + "</a></h2>";
		const tabContent = tab.substring(indexEndTitle);
		tabsTitles.push(tabTitleHTML);

		let RSSfeed = [];
		let RSStitles = [];
		// On regarde s'il y a des sections à l'intérieur d'un onglet
		const sections = tabContent
			.split(/### /)
			.filter(filterElementWithNoContent);
		if (sections.length > 1) {
			for (const section of sections) {
				const indexEndTitleSection = section.indexOf("\n");
				const sectionRSStitle = section.substring(0, indexEndTitleSection);
				const sectionRSScontent = section.substring(indexEndTitleSection);
				const {
					urls: sectionRSSfeed,
					feedTitlesInCommentsToAdd: feedTitlesInCommentsToAdd,
				} = getElementsFromMarkdownList(sectionRSScontent);
				feedTitlesInComments.push(...feedTitlesInCommentsToAdd);
				RSStitles.push(sectionRSStitle);
				RSSfeed.push(sectionRSSfeed);
			}
		} else {
			const {
				urls: tabFeed,
				feedTitlesInCommentsToAdd: feedTitlesInCommentsToAdd,
			} = getElementsFromMarkdownList(tabContent);
			RSSfeed = tabFeed;
			feedTitlesInComments.push(...feedTitlesInCommentsToAdd);
		}
		RSSfeedstitles.push(RSStitles);
		RSSfeeds.push(RSSfeed);
	}

	const markNewsData = {
		title: markNewsTitle,
		initialMessage: markdownToHTML(initialMessageContent),
		tabsTitles: tabsTitles,
		RSSfeedstitles: RSSfeedstitles,
		RSSfeeds: RSSfeeds,
		infoTab: markdownToHTML(tabInfoMD + "```\n" + markdownContent + "\n```"),
		feedTitlesInComments: feedTitlesInComments,
	};

	return markNewsData;
}
