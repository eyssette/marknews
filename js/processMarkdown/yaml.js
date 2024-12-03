import { load as loadYAML } from "../externals/js-yaml.js";
export let yaml;

export function processYAML(markdownContent) {
	if (
		markdownContent.split("---").length > 2 &&
		markdownContent.startsWith("---")
	) {
		try {
			// Traitement des propriétés dans le YAML
			yaml = loadYAML(markdownContent.split("---")[1]);
			// Gestion des styles personnalisés en CSS
			if (yaml.style) {
				const styleElement = document.createElement("style");
				styleElement.innerHTML = yaml.style.replaceAll("\\", "");
				document.body.appendChild(styleElement);
			}
		} catch (e) {
			console.log("erreur processYAML : " + e);
		}
	}
}
