const defaultMarkNews = `
# MarkNews

Un outil pour créer un tableau de bord de flux RSS à partir d'un simple fichier en Markdown

## Mastodon <aside>Tags Numérique</aside>

- https://piaille.fr/tags/drane.rss
- https://piaille.fr/tags/num%C3%A9rique.rss
- https://piaille.fr/tags/num%C3%A9riqueeducatif.rss
- https://piaille.fr/tags/Ress_num.rss
- https://piaille.fr/tags/CommunsNum%C3%A9riques.rss
- https://piaille.fr/tags/LaForge.rss
- https://piaille.fr/tags/REL.rss
- https://piaille.fr/tags/LibreEducatif.rss
- https://piaille.fr/tags/%C3%A9du_num.rss

## Mastodon <aside>Tags Educ</aside>
- https://piaille.fr/tags/mastoprof.rss
- https://piaille.fr/tags/teamprof.rss
- https://piaille.fr/tags/teameduc.rss
- https://piaille.fr/tags/prof.rss
- https://piaille.fr/tags/enseignement.rss
- https://piaille.fr/tags/%C3%89ducationNationale.rss

## Vidéos <aside>Philo</aside>

### Monsieur Phi
- https://www.youtube.com/feeds/videos.xml?channel_id=UCqA8H22FwgBVcF3GJpp0MQw

### Philoxime
- https://www.youtube.com/feeds/videos.xml?channel_id=UCdKTlsmvczkdvGjiLinQwmw
`



// Source par défaut
let md = defaultMarkNews;

// On peut définir des raccourcis vers ses markpages (si on veut forker le projet et avoir une URL plus courte à partager)

const shortcuts = [
	["philosophie","https://github.com/eyssette/rss/blob/main/philosophie.md"],
	["edunum","https://github.com/eyssette/rss/blob/main/edunum.md"]
]

// Contenu de Marknews
let markNewsData = {};
let markNewsTabs = [];

const tabInfoMD = `
Ce site a été créé avec [MarkNews](https://eyssette.forge.aeif.fr/marknews), un outil libre et gratuit qui permet de créer un tableau de bord de flux RSS à partir d'un simple fichier en Markdown.

- Auteur : [Cédric Eyssette](https://eyssette.github.io/)
- Sources sur la [Forge des Communs Numériques Éducatifs](https://forge.aeif.fr/eyssette/marknews)

#### Comment créer son propre tableau de bord ?

1. Créez un fichier en Markdown par exemple sur [CodiMD](https://codimd.apps.education.fr/)
2. Respectez la syntaxe de MarkNews pour créer votre tableau de bord
3. Votre tableau de bord est alors disponible à l'adresse suivante : https://eyssette.forge.aeif.fr/marknews/#URL (en remplaçant URL par l'URL de votre fichier en markdown). 

Vous pouvez aussi copier l'URL de votre fichier ci-dessous et cliquer sur "Entrer".

<form onsubmit="goToNewMarkNews()"><input placeholder="URL de votre fichier Markdown" id="mdSource"></form>

#### Syntaxe de Marknews

- Le titre 1 en Markdown définit le titre de votre tableau de bord
- Ce que vous écrivez entre le titre 1 et le premier titre 2 correspond au message initial à côté du titre de votre tableau de bord
- Les titres 2 définissent les onglets de votre tableau de bord
- Les titres 3 (optionnels) permettent de faire des sections dans chaque onglet
- On utilise une liste d'éléments pour indiquer le ou les flux RSS (ou Atom) à regrouper sous chaque onglet ou chaque section

#### Comment trouver le flux RSS d'un site ?

Vous pouvez utiliser cet outil : [Feed finder](./feedfinder/index.html)

Il suffit de copier les adresses des sites qui vous intéressent pour pouvoir retrouver les flux RSS correspondants.

#### Source en Markdown de ce tableau de bord

`

// Variables pour la gestion de l'en-tête YAML
let yamlData;
let yamlStyle;
let yamlFeedTitlesInComments;
let feedTitlesInComments = [];

// Éléments HTML
const bodyElement = document.body;
const titleElement = document.getElementById("title");
const initialMessageElement = document.getElementById("initialMessage");
const tabsElement = document.getElementById("tabs");
const mainElement = document.getElementById("content");