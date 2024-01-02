function filterURLs(element) {
	element = element.replace(/^- /,"")
	return element
}

function checkKnownTypes(url) {
	const youtubePlaylist = 'https://www.youtube.com/playlist?list='
	if (url.includes(youtubePlaylist)) {
		url = "https://www.youtube.com/feeds/videos.xml?playlist_id=" + url.replace(youtubePlaylist,'')
		return [url,false]
	}
	const youtubeChannel = 'https://www.youtube.com/channel/'
	if (url.includes(youtubeChannel) && !url.includes('@')) {
		url = "https://www.youtube.com/feeds/videos.xml?channel_id=" + url.replace(youtubeChannel,'')
		return [url,false]
	}
	return false;
}

const corsProxyList = ["https://corsproxy.io/?", "https://api.allorigins.win/raw?url="];

async function fetchURLS(urls) {
	let URLSsuccess = []
	let URLSerrors = [];
	for (const url of urls) {
		const checkKnownTypesResult = checkKnownTypes(url)
		if (checkKnownTypesResult === false) {
			for (const corsProxy of corsProxyList) {
				try {
					const response = await fetch(corsProxy+url);
					const responseString = await response.text();
					if (responseString) {
						const parser = new DOMParser();
						const html = parser.parseFromString(responseString, 'text/html');
						URLSsuccess.push([url, html]);
					}
					break;
				} catch (error) {
					URLSerrors.push([url,'<span class="error-type">error: fetch</span>']);
					break;
				}
			}
		} else {
			URLSsuccess.push(checkKnownTypesResult);
		}
	}
	return {success: URLSsuccess, errors: URLSerrors}
}

async function getFeed(fetchObject) {
	let URLSsuccess = fetchObject.success;
	let URLSerrors = fetchObject.errors;
	let RSSsuccess = [];
	for (const URLandHTML of URLSsuccess) {
		const url = URLandHTML[0];
		const html = URLandHTML[1];
		if (html) {
			const linkToRSS = html.querySelector('link[type$=xml][rel="alternate"]');
			const RSS = linkToRSS.href
			if (RSS) {
				RSSsuccess.push(RSS)
			} else {
				URLSerrors.push([url,'<span class="error-type">error: parse</span>'])
			}
		} else {
			RSSsuccess.push(url)
		}
	}
	return {success: RSSsuccess, errors: URLSerrors}
}

const resultsElement = document.getElementById('rss-feeds')

function printResults(getFeedObject) {
	const success = getFeedObject.success.length > 0 ? getFeedObject.success.join('<br>- ') : "Aucun flux RSS récupéré";
	const errors = getFeedObject.errors.length > 0 ? getFeedObject.errors.join('<br>- ').replaceAll(',',"") : "Aucune erreur !";
	const html = `
	<h3>Succès</h3>
	<p>
		- ${success}
	<p>
	<h3>Erreurs</h3>
	<p>
		- ${errors}
	</p>
	`
	resultsElement.innerHTML = html;
}

document.getElementById('search-rss').addEventListener('click', async function() {
	// Récupère le contenu de textarea
	const textareaSrc = document.getElementById('urls').value;
	// Divise le contenu par ligne et place chaque ligne dans un tableau (en supprimant les lignes vides et les éventuels tirets)
	const urls = textareaSrc.split('\n').filter(el => el).map(filterURLs);

	
	fetchURLSobject = await fetchURLS(urls);
	getFeedObject = await getFeed(fetchURLSobject)
	printResults(getFeedObject)
});