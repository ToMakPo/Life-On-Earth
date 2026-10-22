export const FileNames = new Set()

export async function updateJson<T>(fileName: string, data: T[]) {
	try {
		const response = await fetch(`/api/save-${fileName}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
		if (!response.ok) {
			throw new Error(`Server middleware failed to update the ${fileName} JSON file.`)
		}
		console.info(`Successfully saved ${fileName}`)
	} catch (error) {
		console.error(`Error saving ${fileName} JSON:`, error)
	}
}
