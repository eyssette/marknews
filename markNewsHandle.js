function compareByDate(a, b) {
	const dateA = new Date(a.pubDate);
	const dateB = new Date(b.pubDate);
  
	// Vérifier si les dates sont valides
	const isValidDateA = !isNaN(dateA.getTime());
	const isValidDateB = !isNaN(dateB.getTime());
  
	// Gérer les cas où au moins l'une des dates est invalide
	if (!isValidDateA && !isValidDateB) {
	  return 0; // Les deux dates sont invalides, pas de changement d'ordre
	} else if (!isValidDateA) {
	  return 1; // La date A est invalide, placer B en premier
	} else if (!isValidDateB) {
	  return -1; // La date B est invalide, placer A en premier
	}
  
	// Comparer les dates normalement si les deux sont valides
	return dateB - dateA;
  }

async function RSStoHTML(RSSfeeds, displaySource) {
	let dataHTML = '';
	let RSSfeedsContent = []
		for (const RSSfeed of RSSfeeds) {
			const RSSfeedContent = await getRSSFeed(RSSfeed);
			RSSfeedsContent.push(...RSSfeedContent);
			// Tri selon la date de publication
			RSSfeedsContent.sort(compareByDate);
		}
		// On supprime les doublons
		RSSfeedsContent = [...new Map(RSSfeedsContent.map(v => [v.link, v])).values()]

		for (const RSSfeedElement of RSSfeedsContent) {
			if (yamlFeedTitlesInComments) {
				for (const feed of feedTitlesInComments) {
					const feedURL = feed[0];
					const feedTitle = feed[1];
					if (RSSfeedElement.initialURL == feedURL) {
						RSSfeedElement.source = feedTitle.length > 0 ? feedTitle : RSSfeedElement.source;
					}
				}
			}
			const displaySourceHTML = displaySource ? RSSfeedElement.source+" / " : "";
			// Récupération de la date de publication
			const pubDate = new Date(RSSfeedElement.pubDate);
			const pubDateToLocaleString = pubDate.toLocaleString();
			// Création de l'élément RSS
			dataHTML = dataHTML + '<div class="rss-element '+CSSclassDependingOnPublishedDate(pubDate)+'">'
			// Ajout du titre et du lien vers l'article
			// s'il n'y a pas de titre, on met l'URL comme titre
			const RSSfeedElementTitle = RSSfeedElement.title ? RSSfeedElement.title : RSSfeedElement.link;
			dataHTML = dataHTML + '<h4 class="rss-title">'+displaySourceHTML+'<a href="' + RSSfeedElement.link + '">' + RSSfeedElementTitle + '</a></h4>';
			// Ajout du contenu de l'article
			dataHTML = dataHTML + '<div class="rss-description">' + extract(RSSfeedElement.description) + '</div>';
			// Ajout de la date
			dataHTML = dataHTML + '<small class="rss-publicationDate">' + pubDateToLocaleString + '</small></div>';
		}
	return dataHTML;
}

async function getData(tabID, data) {
	let dataHTML = '';
	if (data.RSSfeedstitles[tabID].length>0) {
		for (let i = 0; i < data.RSSfeedstitles[tabID].length; i++) {
			const title = data.RSSfeedstitles[tabID][i];
			dataHTML = dataHTML + '<h3>'+title+'</h3><div>'
			dataHTML = dataHTML + await RSStoHTML(data.RSSfeeds[tabID][i]) + '</div>'
		}
	} else {
		dataHTML = RSStoHTML(data.RSSfeeds[tabID], true)
	}
	return dataHTML;
}

function handleMarkNews(){

	const links = document.querySelectorAll('nav a');
	
	function showOnlyThisTab(tabID) {
		for (const link of links) {
			link.parentNode.classList.remove("active");
		}
		links[tabID].parentNode.classList.add("active")
	}

	const hash = window.location.hash.substring(1);
	// Pour récupérer les paramètres de navigation dans l'URL
	function getParams(URL) {
		urlSearchParams = new URLSearchParams(URL.split('?')[1]);
		const paramsObject = {};
		urlSearchParams.forEach(function(value, key) {
				paramsObject[key] = value;
		});
		return paramsObject;
	}
	
	const actualURL = window.location.search;
	const baseURL = window.location.origin + window.location.pathname;
	let params = getParams(actualURL);

	changeDisplayBasedOnParams(params);

	async function changeDisplayBasedOnParams(param) {
		bodyElement.classList.add("displayLoader")
		mainElement.innerHTML='<span id="loader"></span>'
		let tabID = 0
		if (param) {
			tabID = param.t - 1 > -1 ? param.t - 1 : 0;
			if (param.t == "info") {tabID = links.length - 1}
			if (markNewsTabs[tabID] === undefined) {
				markNewsTabs[tabID] = await getData(tabID, markNewsData)
			}
		}
		bodyElement.classList.remove("displayLoader")
		mainElement.innerHTML = markNewsTabs[tabID];
		showOnlyThisTab(tabID)
		if (param.t === "info") {
			bodyElement.classList.remove("displaySections")
			bodyElement.classList.add("displayInfo");
		  } else {
			bodyElement.classList.remove("displayInfo");
			if (markNewsData.RSSfeedstitles[tabID].length>0) {
				bodyElement.classList.add("displaySections")
			} else {
				bodyElement.classList.remove("displaySections")
			}
		}
	}

	// On détecte les clics sur les liens
	links.forEach(function(link) {
		let listenerElement = link;
		listenerElement.addEventListener('click', function(event) {
			// Empêche le comportement par défaut d'ouverture du lien et récupère au contraire le contenu du lien
			event.preventDefault();
			const linkURL = link.href;
			let newURL;
			if (linkURL == baseURL || linkURL+'index.html' == baseURL) {
				newURL = baseURL;
				params = undefined;
			} else {
				params = getParams(linkURL);
				// Redirection en fonction des paramètres dans l'URL
				newURL = baseURL + '?' + Object.keys(params).map(function(key) {
					return key + '=' + encodeURIComponent(params[key]);
				}).join('&');
			}
			
			// On change l'affichage de l'URL sans recharger la page
			history.pushState({path: newURL + '#'+ hash}, '', newURL + '#'+ hash);
			changeDisplayBasedOnParams(params);
		});
	});

	window.addEventListener('popstate', function(event) {
		let actualURL = window.location.search;
		params = getParams(actualURL);
		// Redirection en fonction des paramètres dans l'URL
		newURL = baseURL + '?' + Object.keys(params).map(function(key) {
			return key + '=' + encodeURIComponent(params[key]);
		}).join('&');

		if(actualURL == '') {
			params="undefined";
			// showOnlyThisElement(undefined, 'sections');
			// showOnlyThisElement(undefined, 'subsections');
		}
		// On change l'affichage de l'URL sans recharger la page
		changeDisplayBasedOnParams(params);
	});
	


}

function goToNewMarkNews() {
	const src = document.getElementById('mdSource').value;
	window.open('https://eyssette.forge.aeif.fr/marknews/#'+src)
}