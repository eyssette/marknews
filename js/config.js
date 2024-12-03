// On peut définir des raccourcis vers ses dashboards (si on veut forker le projet et avoir une URL plus courte à partager)

export const shortcuts = [
	["philosophie", "https://github.com/eyssette/rss/blob/main/philosophie.md"],
	["edunum", "https://github.com/eyssette/rss/blob/main/edunum.md"],
];

export const corsProxy = "https://corsproxy.io/?";

export const tabInfoMD = `
Ce site a été créé avec [MarkNews](https://marknews.forge.apps.education.fr), un outil libre et gratuit qui permet de créer un tableau de bord de flux RSS à partir d'un simple fichier en Markdown.

- Auteur : [Cédric Eyssette](https://eyssette.forge.apps.education.fr/)
- Sources sur la [Forge des Communs Numériques Éducatifs](https://forge.apps.education.fr/marknews/marknews.forge.apps.education.fr)

#### Comment créer son propre tableau de bord ?

1. Créez un fichier en Markdown par exemple sur [CodiMD](https://codimd.apps.education.fr/)
2. Respectez la syntaxe de MarkNews pour créer votre tableau de bord
3. Votre tableau de bord est alors disponible à l'adresse suivante : https://marknews.forge.apps.education.fr/#URL (en remplaçant URL par l'URL de votre fichier en markdown). 

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

`;
