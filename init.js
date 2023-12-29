const defaultMarkNews = `
# MarkNews

Un outil pour créer un tableau de bord de flux RSS à partir d'un simple fichier en Markdown

## Youtube <aside>Philo FR</aside>
- https://www.youtube.com/feeds/videos.xml?channel_id=UCqA8H22FwgBVcF3GJpp0MQw
- https://www.youtube.com/feeds/videos.xml?channel_id=UCdKTlsmvczkdvGjiLinQwmw

## Mastodon <aside>Tags Educ</aside>
- https://scholar.social/tags/mastoprof.rss
- https://scholar.social/tags/teamprof.rss
- https://scholar.social/tags/teameduc.rss
- https://scholar.social/tags/prof.rss
- https://scholar.social/tags/enseignement.rss

## Pédagogie

### Par temps clair
- https://par-temps-clair.blogspot.com/feeds/posts/default?alt=rss

### Eduscol
- https://eduscol.education.fr/sites/default/files/rss/rss_rid271_13.xml

`



// Source par défaut
let md = defaultMarkNews;

// On peut définir des raccourcis vers ses markpages (si on veut forker le projet et avoir une URL plus courte à partager)

const shortcuts = [
	["myMarkNews","URL"],
]

// Contenu de Marknews
let markNewsData = {};
let markNewsTabs = [];

// Variables pour la gestion de l'en-tête YAML
let yamlData;
let yamlStyle;

// Éléments HTML
const bodyElement = document.body;
const titleElement = document.getElementById("title");
const initialMessageElement = document.getElementById("initialMessage");
const tabsElement = document.getElementById("tabs");
const mainElement = document.getElementById("content");