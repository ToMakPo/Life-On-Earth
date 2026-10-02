import type { LifeformData } from '../../store/life'

export const updateLifeform = async (updatedData: LifeformData[]) => {
	try {
		const response = await fetch('/api/save-life-form', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(updatedData)
		})

		if (!response.ok) {
			throw new Error('Server middleware failed to update the JSON file.')
		}

		console.log('Successfully saved to client/src/assets/test-data/life-form.json')
	} catch (error) {
		console.error('Error saving JSON:', error)
	}
}
