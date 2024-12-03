/* eslint-disable indent */
import { corsProxy } from "../config";
import { compareByDate, CSSclassDependingOnPublishedDate } from "./dates";
import { yaml } from "../processMarkdown/yaml";

// Fonction pour ne garder qu'un extrait d'un texte
function extract(txt) {
	const maxWords = 30;
	const words = txt.split(/\s+/);
	const firstNwords = words.slice(0, maxWords).join(" ");
	const firstNwordsWithoutHTMLtags = firstNwords
		.replaceAll(/<.*?>/g, " ")
		.replaceAll(/<\/.*?>/g, "")
		.replaceAll(/<.*?\/>/g, " ")
		.replaceAll(/<.*?$/g, "");
	const endCharacter = words.length > 30 ? " …" : "";
	return firstNwordsWithoutHTMLtags + endCharacter;
}

function getExtractFirstLine(text) {
	let index = text.indexOf("\n") > -1 ? text.indexOf("\n") : undefined;
	return extract(text.substring(0, index));
}

export async function getRSSFeed(url) {
	// Pour éviter les erreurs CORS
	const urlFeed = corsProxy + encodeURIComponent(url);
	try {
		// On récupère le contenu de l'URL
		const response = await fetch(urlFeed);
		if (!response.ok) {
			console.log(`${response.status} ${response.statusText}`);
		}
		// On convertit le flux RSS en objet DOM
		let xmlString = await response.text();
		if (xmlString.includes("iso-8859-1")) {
			const response2 = await fetch(urlFeed);
			let decoder = new TextDecoder("ISO-8859-1");
			const buffer = await response2.arrayBuffer();
			xmlString = decoder.decode(buffer);
		}
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlString, "text/xml");
		// On extrait les informations du flux RSS
		const items = xmlDoc.querySelectorAll("item");
		const feedTitle = xmlDoc.querySelector("title");
		let feedData;
		if (items.length > 0) {
			// Flux RSS
			feedData = Array.from(items).map((item) => ({
				initialURL: url,
				source: feedTitle ? feedTitle.textContent : "",
				title: item.querySelector("title")
					? getExtractFirstLine(item.querySelector("title").textContent)
					: "",
				link: item.querySelector("link")
					? item.querySelector("link").textContent
					: "",
				pubDate: item.querySelector("pubDate")
					? item.querySelector("pubDate").textContent
					: items[0].innerHTML.match(/<dc:date.*>.*<\/dc:date>/gs)
						? items[0].innerHTML
								.match(/<dc:date.*>.*<\/dc:date>/gs)[0]
								.match(/>.*</)[0]
								.replace("<", "")
								.replace(">", "")
						: "",
				description: item.querySelector("description")
					? item
							.querySelector("description")
							.textContent.replace(/<img.*?>/, "")
					: "",
			}));
		} else {
			// Flux ATOM
			const entries = xmlDoc.querySelectorAll("entry");
			feedData = Array.from(entries).map((entry) => ({
				initialURL: url,
				source: feedTitle ? feedTitle.textContent : "",
				title: entry.querySelector("title")
					? getExtractFirstLine(entry.querySelector("title").textContent)
					: "",
				link: entry.querySelector("link")
					? entry.querySelectorAll("link").length > 1
						? entry.querySelector('link[rel="alternate"]')
							? entry
									.querySelector('link[rel="alternate"]')
									.getAttribute("href")
							: entry.querySelector("link").getAttribute("href")
						: entry.querySelector("link").getAttribute("href")
					: "",
				pubDate: entry.querySelector("published")
					? entry.querySelector("published").textContent
					: "",
				description: entry.innerHTML.match(
					/<media:description>.*<\/media:description>/gs,
				)
					? entry.innerHTML
							.match(/<media:description>.*<\/media:description>/gs)[0]
							.replace("<media:description>", "")
							.replace("</media:description>", "")
							.replace(/Profitez de .*/, "")
							.replace(/.*nordvpn.*/, "")
					: entry.querySelector("content")
						? entry.querySelector("content").textContent.replace(/<img.*?>/, "")
						: "",
			}));
		}
		return feedData;
	} catch (error) {
		console.log(
			`Erreur lors de la récupération du flux RSS : ${error.message}`,
		);
	}
}

async function RSStoHTML(RSSfeeds, { displaySource: displaySource }) {
	let dataHTML = "";
	let RSSfeedsContent = [];
	for (const RSSfeed of RSSfeeds) {
		let RSSfeedContent;
		try {
			RSSfeedContent = await getRSSFeed(RSSfeed);
			RSSfeedsContent.push(...RSSfeedContent);
			// Tri selon la date de publication
			RSSfeedsContent.sort(compareByDate);
		} catch (e) {
			console.log("Problème avec ce feed :" + RSSfeedContent);
			console.log(e);
		}
	}
	// On supprime les doublons
	RSSfeedsContent = [
		...new Map(RSSfeedsContent.map((v) => [v.link, v])).values(),
	];

	for (const RSSfeedElement of RSSfeedsContent) {
		if (yaml && yaml.hasFeedTitlesInComments) {
			for (const feed of yaml.hasFeedTitlesInComments) {
				const feedURL = feed[0];
				const feedTitle = feed[1];
				if (RSSfeedElement.initialURL == feedURL) {
					RSSfeedElement.source =
						feedTitle.length > 0 ? feedTitle : RSSfeedElement.source;
				}
			}
		}
		const displaySourceHTML = displaySource
			? RSSfeedElement.source + " / "
			: "";
		// Récupération de la date de publication
		const pubDate = new Date(RSSfeedElement.pubDate);
		const pubDateToLocaleString =
			pubDate.toLocaleString() == "Invalid Date"
				? ""
				: pubDate.toLocaleString();
		// Création de l'élément RSS
		dataHTML =
			dataHTML +
			'<div class="rss-element ' +
			CSSclassDependingOnPublishedDate(pubDate) +
			'">';
		// Ajout du titre et du lien vers l'article
		// s'il n'y a pas de titre, on met l'URL comme titre
		const RSSfeedElementTitle = RSSfeedElement.title
			? RSSfeedElement.title
			: RSSfeedElement.link;
		dataHTML =
			dataHTML +
			'<h4 class="rss-title">' +
			displaySourceHTML +
			'<a href="' +
			RSSfeedElement.link +
			'">' +
			RSSfeedElementTitle +
			"</a></h4>";
		// Ajout du contenu de l'article
		dataHTML =
			dataHTML +
			'<div class="rss-description">' +
			extract(RSSfeedElement.description) +
			"</div>";
		// Ajout de la date
		dataHTML =
			dataHTML +
			'<small class="rss-publicationDate">' +
			pubDateToLocaleString +
			"</small></div>";
	}
	return dataHTML;
}

export async function getRSSFeedsFromTab(tabID, data) {
	let dataHTML = "";
	if (data.RSSfeedstitles[tabID].length > 0) {
		for (let i = 0; i < data.RSSfeedstitles[tabID].length; i++) {
			const title = data.RSSfeedstitles[tabID][i];
			dataHTML = dataHTML + "<h3>" + title + "</h3><div>";
			dataHTML =
				dataHTML + (await RSStoHTML(data.RSSfeeds[tabID][i], {})) + "</div>";
		}
	} else {
		dataHTML = RSStoHTML(data.RSSfeeds[tabID], {
			displaySource: true,
		});
	}
	return dataHTML;
}
