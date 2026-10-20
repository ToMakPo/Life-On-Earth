/** Sanitizes a string that is meant to be a name.
 *
 * Do so by removing invalid characters and converting it to Title Case.
 * Keeps alphanumeric characters, spaces, underscores, hyphens, and apostrophes.
 *
 * @param name - The raw input string to clean and format.
 * @returns The sanitized, title-cased string.
 */
export function cleanName(name: string): string {
	return name
		.trim()
		.replace(/[^a-z0-9\s_\-']/gi, '')
		.split(/\s+/) // Splits on one or more spaces to prevent empty string bugs
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

/** Calculates the estimated reading duration for a given text.
 *
 * @param text The text to calculate the reading duration for.
 * @returns The estimated reading duration in milliseconds.
 */
export const calculateReadingDuration = (text: string, wordsPerMinute: number = 160): number => {
	const wordCount = text.split(' ').length
	return (wordCount / wordsPerMinute) * 60 * 1000 // returns milliseconds
}

