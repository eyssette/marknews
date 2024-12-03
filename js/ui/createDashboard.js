import { handleDashboard } from "./handleDashboard";
import { getRSSFeedsFromTab } from "../utils/rss";

export async function createDashboard(data) {
	const markNewsTabs = [];
	const mainElement = document.getElementById("content");
	const titleElement = document.getElementById("title");
	const tabsElement = document.getElementById("tabs");
	const initialMessageElement = document.getElementById("initialMessage");

	titleElement.innerHTML = data.title;
	const tabsElementInitialHTML = tabsElement.innerHTML;

	if (data.initialMessage.length > 0) {
		initialMessageElement.innerHTML = data.initialMessage;
		initialMessageElement.style.display = "block";
	} else {
		initialMessageElement.style.display = "none";
	}

	markNewsTabs[0] = await getRSSFeedsFromTab(0, data);

	// Dans la barre de navigation, le dernier onglet est un onglet d'information
	markNewsTabs[data.tabsTitles.length] = data.infoTab;

	tabsElement.innerHTML = data.tabsTitles.join("") + tabsElementInitialHTML;
	tabsElement.firstChild.classList.add("active");
	document.body.classList.remove("displayLoader");
	mainElement.innerHTML = markNewsTabs[0];
	handleDashboard(data, markNewsTabs);
}
