import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import lifeformJson from '../assets/data/lifeform.json' with { type: 'json' }
import { FileNames, updateJson } from '../assets/data/update-json'

import { cleanName } from '../utils/global'
import { fetchWikiData } from '../utils/wiki'

FileNames.add('lifeform')

export interface LifeformData {
	id: string
	name: string
	tags: string[]
	wikiTitle: string | null
	imageUrl: string | null
	description: string | null
}
export type LifeformInput = Omit<LifeformData, 'id'>

// wiki list: https://en.wikipedia.org/wiki/List_of_mammals

interface LifeformState {
	/** A full list of all lifeforms. */
	lifeforms: Record<string, LifeformData>
	/** Fetch the list of all lifeforms. */
	fetchLifeforms: () => Promise<void>
	/** Add a lifeform to the list.
	 *
	 * @param params The params of the new lifeform.
	 */
	addLifeform: (params: LifeformInput) => Promise<boolean>
	/** Update a lifeform.
	 *
	 * @param params The updated params of the lifeform.
	 */
	updateLifeform: (params: LifeformData) => Promise<boolean>
	/** Remove a lifeform from the list.
	 *
	 * @param params Either the lifeform being removed or just the id.
	 */
	removeLifeform: (params: LifeformData | string) => Promise<boolean>

	/** Display all lifeforms for this group. */
	showGroup: string | null
	/** Set the  show group. */
	setShowGroup: (group: string | null) => void

	/** Get a list of all of the tags. */
	tagList: string[]

	getDetails(lifeform: Partial<LifeformData>): Promise<LifeDetails>
}

export interface LifeDetails {
	imageUrl: string | null
	description: string | null
}

function sortLifeforms(items: LifeformData[]): LifeformData[] {
	return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

async function updateFile(data: LifeformData[]) {
	return updateJson<LifeformData>('lifeform', data)
}

export const useLife = create<LifeformState>((set, get) => {
	const lifeforms = {} as Record<string, LifeformData>

	async function fetchLifeforms() {
		const lifeformData = lifeformJson as LifeformData[]

		const lifeforms = lifeformData.reduce(
			(acc, data) => {
				acc[data.id] = { ...data }
				return acc
			},
			{} as Record<string, LifeformData>
		)

		const tagList = [...new Set(Object.values(lifeforms).flatMap((lf) => lf.tags))]

		set({ lifeforms, tagList })
	}

	async function addLifeform(params: LifeformInput): Promise<boolean> {
		const currentLifeforms = get().lifeforms

		const newId = uuidv4()
		const newLifeform: LifeformData = { ...params, id: newId }

		newLifeform.name = cleanName(newLifeform.name)
		newLifeform.tags.map((tag) => cleanName(tag))

		// Check for duplicates
		const foundLifeform = Object.values(currentLifeforms).find((lifeform) => lifeform.name === newLifeform.name)
		if (foundLifeform) return false

		// Mutate local array reference
		const lifeformData = lifeformJson as LifeformData[]
		lifeformData.push(newLifeform)

		// Sort lifeforms
		const sortedLifeforms = sortLifeforms(lifeformData)

		// Write to disk/API
		await updateFile(sortedLifeforms)

		// Re-build tree relationships from the updated JSON module
		await fetchLifeforms()

		return true
	}

	async function updateLifeform(params: LifeformData): Promise<boolean> {
		if (!params.id) throw false

		const currentLifeforms = get().lifeforms
		const oldLifeform = currentLifeforms[params.id]
		if (!oldLifeform) return false

		const newLifeform: LifeformData = { ...params, id: oldLifeform.id }

		newLifeform.name = cleanName(newLifeform.name)
		newLifeform.tags.map((tag) => cleanName(tag))

		// Check for duplicates
		const nameUpdated = params.name !== oldLifeform.name
		const foundLifeform = Object.values(currentLifeforms).find((lifeform) => lifeform.name === newLifeform.name)
		if (nameUpdated && foundLifeform) return false

		// Mutate local array reference
		const lifeformData = lifeformJson as LifeformData[]
		const index = lifeformData.findIndex((lf) => lf.id === newLifeform.id)
		lifeformData[index] = newLifeform

		// Sort lifeforms
		const sortedLifeforms = sortLifeforms(lifeformData)

		// Write to disk/API
		await updateFile(sortedLifeforms)
		
		// Re-build tree relationships from the updated JSON module
		await fetchLifeforms()

		return true
	}

	async function removeLifeform(params: LifeformData | string) {
		const id = typeof params === 'string' ? params : params.id

		// Check if the id is in the list.
		const lifeformData = lifeformJson as LifeformData[]
		const index = lifeformData.findIndex((lf) => lf.id === id)

		if (index === -1) return false

		// Remove the lifeform from the list.
		lifeformData.splice(index, 1)

		// Sort lifeforms
		const sortedLifeforms = sortLifeforms(lifeformData)

		// Write to disk/API
		await updateFile(sortedLifeforms)

		// Re-build tree relationships from the updated JSON module
		await fetchLifeforms()

		return true
	}

	const showGroup = null

	function setShowGroup(group: string | null) {
		set({ showGroup: group })
	}

	const tagList = [] as string[]

	async function getDetails(lifeform: Partial<LifeformData>) {
		const wikiData = await fetchWikiData(lifeform.wikiTitle || lifeform.name!)

		const imageUrl = lifeform.imageUrl || wikiData?.imageUrl || null
		const description = lifeform.description || wikiData?.summary || null

		return { imageUrl, description }
	}

	return {
		lifeforms,
		fetchLifeforms,
		addLifeform,
		updateLifeform,
		removeLifeform,

		showGroup,
		setShowGroup,
		tagList,
		getDetails
	}
})

if (import.meta.hot) {
	import.meta.hot.accept('../assets/data/lifeform.json', () => {
		useLife.getState().fetchLifeforms()
	})
}

