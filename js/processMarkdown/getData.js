import defaultMD from "../../content.md";
import { createDashboard } from "../ui/createDashboard";
import { handleURL } from "../utils/urls";
import { parseMarkdown } from "./parseMarkdown";

let dashboardData;
let md = defaultMD;

export function getMarkdownContentAndCreateDashboard() {
	// On récupère l'URL du hashtag sans le #
	const url = window.location.hash.substring(1).replace(/\?.*/, "");
	// On traite l'URL pour pouvoir récupérer correctement la source
	const source = handleURL(url);
	if (source !== "") {
		fetch(source)
			.then((response) => response.text())
			.then((data) => {
				md = data;
				dashboardData = parseMarkdown(md);
				createDashboard(dashboardData);
			})
			.catch((error) => console.error(error));
	} else {
		dashboardData = parseMarkdown(md);
		createDashboard(dashboardData);
	}
}
