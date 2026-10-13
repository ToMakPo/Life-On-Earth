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
