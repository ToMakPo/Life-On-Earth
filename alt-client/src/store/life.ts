import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import lifeformJson from '../assets/data/lifeform.json' with { type: 'json' }
import { updateLifeformAPI } from '../assets/data/update-json'
import { cleanName } from '../utils/global'

export interface LifeformData {
	id: string
	name: string
	tags: string[]
	wikiTitle: string | null
	imageUrl: string | null
	description: string | null
}
export type LifeformInput = Omit<LifeformData, 'id'>

interface LifeState {
	/** A full list of all lifeforms. */
	lifeforms: Record<string, LifeformData>
	/** Fetch the list of all lifeforms. */
	fetchLifeforms: () => Promise<void>
	/** Add a lifeform. */
	addLifeform: (params: LifeformInput) => Promise<boolean>
	/** Update a lifeform. */
	updateLifeform: (params: LifeformData) => Promise<boolean>

	/** Display all lifeforms for this group. */
	showGroup: string | null
	/** Set the  show group. */
	setShowGroup: (group: string | null) => void

	/** Get a list of all of the tags. */
	tagList: string[]
}

function sortLifeforms(items: LifeformData[]): LifeformData[] {
	return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

export const useLife = create<LifeState>((set, get) => {
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
		const currentLifeNodes = get().lifeforms

		const newId = uuidv4()
		const newLifeform: LifeformData = { id: newId, ...params }

		newLifeform.name = cleanName(newLifeform.name)
		newLifeform.tags.map((tag) => cleanName(tag))

		// Check for duplicates
		const foundLifeform = Object.values(currentLifeNodes).find((node) => node.name === newLifeform.name)
		if (foundLifeform) return false

		// Mutate local array reference
		const lifeformData = lifeformJson as LifeformData[]
		lifeformData.push(newLifeform)

		// Sort lifeforms
		const sortedLifeforms = sortLifeforms(lifeformData)

		// Write to disk/API
		await updateLifeformAPI(sortedLifeforms)

		// Re-build tree relationships from the updated JSON module
		await fetchLifeforms()

		return true
	}

	async function updateLifeform(params: LifeformData): Promise<boolean> {
		if (!params.id) throw false

		const currentLifeNodes = get().lifeforms
		const oldLifeform = currentLifeNodes[params.id]
		if (!oldLifeform) return false

		const newLifeform: LifeformData = { ...params }

		newLifeform.name = cleanName(newLifeform.name)

		// Check for duplicates
		const nameUpdated = params.name !== oldLifeform.name
		const foundLifeform = Object.values(currentLifeNodes).find((node) => node.name === newLifeform.name)
		if (nameUpdated && foundLifeform) return false

		// Mutate local array reference
		const lifeformData = lifeformJson as LifeformData[]
		lifeformData[lifeformData.findIndex((lf) => lf.id === newLifeform.id)] = newLifeform

		// Sort lifeforms
		const sortedLifeforms = sortLifeforms(lifeformData)

		// Write to disk/API
		await updateLifeformAPI(sortedLifeforms)

		// Re-build tree relationships from the updated JSON module
		await fetchLifeforms()

		return true
	}

	const showGroup = null

	function setShowGroup(group: string | null) {
		set({ showGroup: group })
	}

	const tagList = [] as string[]

	return {
		lifeforms,
		fetchLifeforms,
		addLifeform,
		updateLifeform,
		showGroup,
		setShowGroup,
		tagList
	}
})

if (import.meta.hot) {
	import.meta.hot.accept('../assets/data/lifeform.json', () => {
		useLife.getState().fetchLifeforms()
	})
}
