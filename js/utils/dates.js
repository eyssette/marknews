export function CSSclassDependingOnPublishedDate(day) {
	const now = new Date();
	const timeDifference = Math.abs((day - now) / (1000 * 60 * 60));
	if (timeDifference < 24) {
		return "fewHoursAgo";
	} else if (timeDifference < 24 * 3) {
		return "fewDaysAgo";
	} else if (timeDifference < 24 * 7) {
		return "someDaysAgo";
	} else if (timeDifference < 24 * 7 * 4) {
		return "fewWeeksAgo";
	} else {
		return "later";
	}
}

export function compareByDate(a, b) {
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
