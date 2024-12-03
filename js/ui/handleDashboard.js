import { getParams } from "../utils/urls";
import { getRSSFeedsFromTab } from "../utils/rss";

function goToNewDashboard(URL) {
	window.open("https://marknews.forge.apps.education.fr/#" + URL);
}

function showOnlyThisTab(tabID, tabsLinks) {
	for (const link of tabsLinks) {
		link.parentNode.classList.remove("active");
	}
	tabsLinks[tabID].parentNode.classList.add("active");
}

let newURL;

export function handleDashboard(data, markNewsTabs) {
	const tabsLinks = document.querySelectorAll("nav a");
	const mainElement = document.getElementById("content");
	const hash = window.location.hash.substring(1);
	const actualURL = window.location.search;
	const baseURL = window.location.origin + window.location.pathname;
	let params = getParams(actualURL);

	changeDisplayBasedOnParams(params);

	async function changeDisplayBasedOnParams(param) {
		document.body.classList.add("displayLoader");
		mainElement.innerHTML =
			'<p>Le chargement des flux RSS peut prendre du temps. Merci de patienter.</p><span id="loader"></span>';
		let tabID = 0;
		if (param) {
			tabID = param.t - 1 > -1 ? param.t - 1 : 0;
			if (param.t == "info") {
				tabID = tabsLinks.length - 1;
			}
			if (markNewsTabs[tabID] === undefined) {
				markNewsTabs[tabID] = await getRSSFeedsFromTab(tabID, data);
			}
		}
		document.body.classList.remove("displayLoader");
		mainElement.innerHTML = markNewsTabs[tabID];
		showOnlyThisTab(tabID, tabsLinks);
		if (param.t === "info") {
			document.body.classList.remove("displaySections");
			document.body.classList.add("displayInfo");
			const input = document.getElementById("gotoNewDashboard");
			input.addEventListener("keydown", (event) => {
				if (event.key === "Enter") {
					// Vérifie si la touche appuyée est Entrée
					event.preventDefault(); // Empêche le comportement par défaut si nécessaire
					goToNewDashboard(input.value);
				}
			});
		} else {
			document.body.classList.remove("displayInfo");
			if (data.RSSfeedstitles[tabID].length > 0) {
				document.body.classList.add("displaySections");
			} else {
				document.body.classList.remove("displaySections");
			}
		}
		// Forcer l'ouverture dans un nouvel onglet des liens issus des flux RSS
		const linksFromRSSFeeds = document.querySelectorAll("main a");
		linksFromRSSFeeds.forEach((link) => {
			link.setAttribute("target", "_blank");
		});
	}

	// On détecte les clics sur les onglets
	tabsLinks.forEach(function (link) {
		link.addEventListener("click", function (event) {
			// Empêche le comportement par défaut d'ouverture du lien et récupère au contraire le contenu de l'onglet
			event.preventDefault();
			const linkURL = link.href;
			if (linkURL == baseURL || linkURL + "index.html" == baseURL) {
				newURL = baseURL;
				params = undefined;
			} else {
				params = getParams(linkURL);
				// Redirection en fonction des paramètres dans l'URL
				newURL =
					baseURL +
					"?" +
					Object.keys(params)
						.map(function (key) {
							return key + "=" + encodeURIComponent(params[key]);
						})
						.join("&");
			}

			// On change l'affichage de l'URL sans recharger la page
			history.pushState({ path: newURL + "#" + hash }, "", newURL + "#" + hash);
			changeDisplayBasedOnParams(params);
		});
	});

	window.addEventListener("popstate", function () {
		let actualURL = window.location.search;
		params = getParams(actualURL);
		// Redirection en fonction des paramètres dans l'URL
		newURL =
			baseURL +
			"?" +
			Object.keys(params)
				.map(function (key) {
					return key + "=" + encodeURIComponent(params[key]);
				})
				.join("&");

		if (actualURL == "") {
			params = "undefined";
		}
		// On change l'affichage de l'URL sans recharger la page
		changeDisplayBasedOnParams(params);
	});
}
