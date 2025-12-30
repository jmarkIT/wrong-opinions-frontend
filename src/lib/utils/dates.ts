/**
 * Get the start date (Monday) and end date (Sunday) for an ISO week
 */
export function getISOWeekDates(year: number, week: number): { start: Date; end: Date } {
	// January 4 is always in week 1
	const jan4 = new Date(year, 0, 4);
	const jan4DayOfWeek = jan4.getDay() || 7; // Convert Sunday (0) to 7

	// Find Monday of week 1
	const week1Monday = new Date(jan4);
	week1Monday.setDate(jan4.getDate() - jan4DayOfWeek + 1);

	// Calculate the Monday of the target week
	const start = new Date(week1Monday);
	start.setDate(week1Monday.getDate() + (week - 1) * 7);

	// Calculate Sunday (6 days after Monday)
	const end = new Date(start);
	end.setDate(start.getDate() + 6);

	return { start, end };
}

/**
 * Format a date as "Mon DD"
 */
function formatShortDate(date: Date): string {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format an ISO week as "Week N, YYYY (Mon DD - Mon DD)"
 */
export function formatWeekRange(year: number, weekNumber: number): string {
	const { start, end } = getISOWeekDates(year, weekNumber);
	return `Week ${weekNumber}, ${year} (${formatShortDate(start)} - ${formatShortDate(end)})`;
}

/**
 * Format an ISO week as a short string "Week N, YYYY"
 */
export function formatWeekShort(year: number, weekNumber: number): string {
	return `Week ${weekNumber}, ${year}`;
}

/**
 * Get the current ISO week number and year
 */
export function getCurrentISOWeek(): { year: number; week: number } {
	const now = new Date();
	const jan4 = new Date(now.getFullYear(), 0, 4);
	const jan4DayOfWeek = jan4.getDay() || 7;
	const week1Monday = new Date(jan4);
	week1Monday.setDate(jan4.getDate() - jan4DayOfWeek + 1);

	// Calculate days since week 1 Monday
	const diff = now.getTime() - week1Monday.getTime();
	const daysSinceWeek1Monday = Math.floor(diff / (1000 * 60 * 60 * 24));
	const week = Math.floor(daysSinceWeek1Monday / 7) + 1;

	// Handle year boundary cases
	let year = now.getFullYear();
	if (week < 1) {
		// We're in the last week of the previous year
		year--;
		return { year, week: getWeeksInYear(year) };
	}

	const weeksInYear = getWeeksInYear(year);
	if (week > weeksInYear) {
		// We're in week 1 of the next year
		return { year: year + 1, week: 1 };
	}

	return { year, week };
}

/**
 * Get the number of ISO weeks in a year (52 or 53)
 */
function getWeeksInYear(year: number): number {
	const dec31 = new Date(year, 11, 31);
	const jan1 = new Date(year, 0, 1);

	// If Dec 31 is Thursday, or Jan 1 is Thursday, it's a 53-week year
	const dec31Day = dec31.getDay();
	const jan1Day = jan1.getDay();

	if (dec31Day === 4 || jan1Day === 4) {
		return 53;
	}
	return 52;
}

/**
 * Format a release date string (handles partial dates from MusicBrainz)
 */
export function formatReleaseDate(dateString: string | null): string {
	if (!dateString) return 'Unknown';

	// Handle partial dates (YYYY, YYYY-MM, YYYY-MM-DD)
	const parts = dateString.split('-');

	if (parts.length === 1) {
		return parts[0]; // Just year
	}

	if (parts.length === 2) {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const monthIndex = parseInt(parts[1], 10) - 1;
		return `${months[monthIndex]} ${parts[0]}`;
	}

	// Full date
	const date = new Date(dateString);
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Extract just the year from a release date string
 */
export function extractYear(dateString: string | null): string {
	if (!dateString) return '';
	return dateString.split('-')[0];
}
