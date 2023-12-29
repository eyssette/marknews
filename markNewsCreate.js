function getMarkdownContent() {
	// Récupération du markdown externe
	let urlMD = window.location.hash.substring(1); // Récupère l'URL du hashtag sans le #
	if (urlMD !== "") {
		// Gestion des fichiers hébergés sur github
		if (urlMD.startsWith("https://github.com")) {
			urlMD = urlMD.replace(
				"https://github.com",
				"https://raw.githubusercontent.com"
			);
			urlMD = urlMD.replace("/blob/", "/");
		}
		// Gestion des fichiers hébergés sur codiMD
		if (
			urlMD.startsWith("https://codimd") &&
			urlMD.indexOf("download") === -1
		) {
			urlMD =
				urlMD.replace("?edit", "").replace("?both", "").replace("?view", "").replace(/#$/, "") +
				"/download";
		}
		// Vérification de la présence d'un raccourci
		shortcut = shortcuts.find(element => element[0]==urlMD)
		if (shortcut) {
			urlMD = shortcut[1]
		}

		// Récupération du contenu du fichier
		fetch(urlMD)
			.then((response) => response.text())
			.then((data) => {
				md = data;
				markNewsData = parseMarkdown(md);
				createMarkNews(markNewsData);
			})
			.catch((error) => {
				markNewsData = parseMarkdown(defaultMarkpage);
				createMarkNews(markNewsData);
				alert("Il y a une erreur dans l'URL ou dans la syntaxe du fichier source")
				console.log(error);
			});
	} else {
		markNewsData = parseMarkdown(md);
		createMarkNews(markNewsData);
	}
}

getMarkdownContent()

// Filtre pour supprimer des éléments inutiles
function filterElementWithNoContent(element) {
	value = element.trim().replace('\n','') === '' ? false : true; 
	return value;
}

// Fonction pour récupérer une liste d'éléments markdown
function getElementsFromMarkdownList(txt) {
	return txt.match(/- .*/g).map(item => item.slice(2))
}

// Fonction pour ne garder qu'un extrait d'un texte
function extract(txt) {
	const maxWords = 30;
	const firstNwords = txt.split(/\s+/).slice(0,maxWords).join(' ');
	const firstNwordsWithoutHTMLtags =  firstNwords.replaceAll(/<.*?>/g," ").replaceAll(/<\/.*?>/g,"").replaceAll(/<.*?\/>/g," ").replaceAll(/<.*?$/g,"");
	return firstNwordsWithoutHTMLtags + ' …';
}


function parseMarkdown(markdownContent) {

	// Gestion de la conversion du markdown en HTML
	const converter = new showdown.Converter({
		emoji: true,
		parseImgDimensions: true,
		simplifiedAutoLink: true,
	});
	function markdownToHTML(text) {
		const html = converter.makeHtml(text);
		return html;
	}

  // Gestion de l'en-tête YAML
	if (markdownContent.split("---").length > 2 && markdownContent.startsWith("---")) {
		yamlPart = markdownContent.split("---")[1]
		try {
			yamlData = jsyaml.load(yamlPart);
			for (const property in yamlData) {
				// Gestion des styles personnalisés
				if (property == "style") {
					yamlStyle = yamlData[property];
					const styleElement = document.createElement("style");
					styleElement.innerHTML = yamlStyle.replaceAll("\\","");
					document.body.appendChild(styleElement);
				}
			}
		} catch (e) {}
	}

	// On distingue le header et le contenu
	const indexfirstH2title = markdownContent.indexOf("## ");
	const header = markdownContent.substring(0,indexfirstH2title);
	const mainContent = markdownContent.substring(indexfirstH2title);

	// Dans le header, on distingue le titre (défini par un titre h1) et le message initial
	const markNewsTitle = header.match(/# .*/)[0].replace('# ','')
	const indexStartTitle = header.indexOf(markNewsTitle);
	const initialMessageContent = header.substring(indexStartTitle+markNewsTitle.length+2);

	// Dans le contenu, on distingue chaque onglet (qui commence par un titre h2)
	const tabs = mainContent.split(/(?<!#)## /).filter(Boolean);
	let tabsTitles = [];
	let RSSfeeds= [];
	let RSSfeedstitles = [];

	for (let i = 0; i < tabs.length; i++) {
		const tab = tabs[i];
		// Dans chaque onglet, on distingue le titre et le contenu
		const indexEndTitle = tab.indexOf('\n');
		const tabTitle = tab.substring(0,indexEndTitle);
		const tabTitleHTML = '<h2><a href="?t='+(i+1)+'">'+tabTitle+'</a></h2>'
		const tabContent = tab.substring(indexEndTitle);
		tabsTitles.push(tabTitleHTML);

		let RSSfeed = [];
		let RSStitles = [];
		// On regarde s'il y a des sections à l'intérieur d'un onglet
		const sections = tabContent.split(/### /).filter(filterElementWithNoContent);
		if (sections.length>1) {
			for (const section of sections) {
				const indexEndTitleSection = section.indexOf('\n');
				const sectionRSStitle = section.substring(0,indexEndTitleSection);
				const sectionRSSfeed = getElementsFromMarkdownList(section);
				RSStitles.push(sectionRSStitle);
				RSSfeed.push(sectionRSSfeed);
			}
		} else {
			RSSfeed = getElementsFromMarkdownList(tabContent);
		}
		RSSfeedstitles.push(RSStitles)
		RSSfeeds.push(RSSfeed);
	}

	markNewsData = {
		title: markNewsTitle,
		initialMessage: markdownToHTML(initialMessageContent),
		tabsTitles: tabsTitles,
		RSSfeedstitles: RSSfeedstitles,
		RSSfeeds: RSSfeeds
	};

	return markNewsData
}

const now = new Date()
function CSSclassDependingOnPublishedDate(day) {
	timeDifference = Math.abs((day - now)/(1000 * 60 * 60))
	if (timeDifference < 24) {
		return 'fewHoursAgo'
	} else if (timeDifference < (24 * 3)) {
		return 'fewDaysAgo'
	} else if (timeDifference < (24 * 7)) {
		return 'someDaysAgo'
	} else {
		return 'later';
	}
}


async function createMarkNews(data) {
	


	titleElement.innerHTML = data.title;

	if (data.initialMessage.length>0) {
		initialMessageElement.innerHTML = data.initialMessage;
		initialMessageElement.style.display = "block";
	}
	else {
		initialMessageElement.style.display = "none";
	}

	markNewsTabs[0] = await getData(0, data);


	tabsElement.innerHTML = data.tabsTitles.join('')
	tabsElement.firstChild.classList.add("active");
	mainElement.innerHTML = markNewsTabs[0];
	handleMarkNews()
}

async function getRSSFeed(url) {
  // Pour éviter les erreurs CORS
  const corsProxy = "https://corsproxy.io/?";
  const urlFeed = corsProxy + encodeURIComponent(url);
  try {
    // On récupère le contenu de l'URL
    const response = await fetch(urlFeed);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    // On convertit le flux RSS en objet DOM
    const xmlString = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    // On extrait les informations du flux RSS
    const items = xmlDoc.querySelectorAll('item');
	const feedTitle = xmlDoc.querySelector('title');
	let feedData
	if (items.length > 0) {
		feedData = Array.from(items).map((item) => ({
			source: feedTitle ? feedTitle.textContent : "",
			title: item.querySelector('title') ? item.querySelector('title').textContent : "",
			link: item.querySelector('link') ? item.querySelector('link').textContent : "",
			pubDate: item.querySelector('pubDate') ? item.querySelector('pubDate').textContent : "",
			description: item.querySelector('description') ? item.querySelector('description').textContent : "",
		  }));
	} else {
		// Cas des vidéos Youtube
		const entries = xmlDoc.querySelectorAll('entry');
		feedData = Array.from(entries).map((entry) => ({
			source: feedTitle ? feedTitle.textContent : "",
			title: entry.querySelector('title') ? entry.querySelector('title').textContent : "",
			link: entry.querySelector('link') ? entry.querySelector('link').getAttribute("href") : "",
			pubDate: entry.querySelector('published') ? entry.querySelector('published').textContent : "",
			description: entry.innerHTML.match(/<media:description>.*<\/media:description>/sg) ? entry.innerHTML.match(/<media:description>.*<\/media:description>/sg)[0].replace("<media:description>","").replace("</media:description>","").replace(/Profitez de .*/,"").replace(/.*nordvpn.*/,"") : "",
		  }));
	}
    return feedData;
  } catch (error) {
    // On gère les erreurs de connexion ou de traitement
    throw new Error(`Erreur lors de la récupération du flux RSS : ${error.message}`);
  }
}