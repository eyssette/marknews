import { getParams } from "../utils/urls";
import { getRSSFeedsFromTab } from "../utils/rss";

// function goToNewMarkNews() {
// 	const src = document.getElementById("mdSource").value;
// 	window.open("https://marknews.forge.apps.education.fr/#" + src);
// }

function showOnlyThisTab(tabID, links) {
	for (const link of links) {
		link.parentNode.classList.remove("active");
	}
	links[tabID].parentNode.classList.add("active");
}

let newURL;

export function handleDashboard(data, markNewsTabs) {
	const links = document.querySelectorAll("nav a");
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
				tabID = links.length - 1;
			}
			if (markNewsTabs[tabID] === undefined) {
				markNewsTabs[tabID] = await getRSSFeedsFromTab(tabID, data);
			}
		}
		document.body.classList.remove("displayLoader");
		mainElement.innerHTML = markNewsTabs[tabID];
		showOnlyThisTab(tabID, links);
		if (param.t === "info") {
			document.body.classList.remove("displaySections");
			document.body.classList.add("displayInfo");
		} else {
			document.body.classList.remove("displayInfo");
			if (data.RSSfeedstitles[tabID].length > 0) {
				document.body.classList.add("displaySections");
			} else {
				document.body.classList.remove("displaySections");
			}
		}
	}

	// On détecte les clics sur les liens
	links.forEach(function (link) {
		let listenerElement = link;
		listenerElement.addEventListener("click", function (event) {
			// Empêche le comportement par défaut d'ouverture du lien et récupère au contraire le contenu du lien
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
