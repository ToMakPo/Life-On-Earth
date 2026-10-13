import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import lifeformJson from '../assets/test-data/lifeform.json' with { type: 'json' }
import { updateLifeformAPI } from '../assets/test-data/update-json'
import { cleanName } from '../utils/global'

export interface LifeformData {
	id: string
	name: string
	description: string | null
	groupId: string | null
	wiki: string
	imageId: string | null
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

	/** Display all lifeforms that have a group with this id. */
	showGroup: string | null
	/** Set the show group id. */
	setShowGroup: (id: string | null) => void
}

function sortLifeforms(items: LifeformData[]) {
	const childrenByGroup = new Map<string | null, LifeformData[]>()

	// Group items by groupId.
	for (const item of items) {
		const groupId = item.groupId
		if (!childrenByGroup.has(groupId)) {
			childrenByGroup.set(groupId, [])
		}
		childrenByGroup.get(groupId)?.push(item)
	}

	// Sort siblings alphabetically by name at each level.
	for (const [, children] of childrenByGroup) {
		children.sort((a, b) => a.name.localeCompare(b.name))
	}

	const sorted: LifeformData[] = []

	// Perform depth-first traversal
	function traversal(groupId: string | null) {
		const children = childrenByGroup.get(groupId)
		if (!children) return

		for (const child of children) {
			sorted.push(child)
			traversal(child.id)
		}
	}

	traversal(null)

	return sorted
}

export const useLife = create<LifeState>((set, get) => {
	const lifeNodes = {} as Record<string, LifeformData>

	async function fetchLifeforms() {
		const lifeformData = lifeformJson as LifeformData[]

		const lifeNodes = lifeformData.reduce(
			(acc, data) => {
				acc[data.id] = { ...data }
				return acc
			},
			{} as Record<string, LifeformData>
		)

		set({ lifeforms: lifeNodes })
	}

	async function addLifeform(params: LifeformInput): Promise<boolean> {
		const currentLifeNodes = get().lifeforms

		const newId = uuidv4()
		const newLifeform: LifeformData = { id: newId, ...params }

		newLifeform.name = cleanName(newLifeform.name)

		// Check for duplicates
		if (Object.values(currentLifeNodes).find((node) => node.name === newLifeform.name && node.groupId === newLifeform.groupId)) return false

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
		if (params.name !== oldLifeform.name && Object.values(currentLifeNodes).find((node) => node.name === newLifeform.name)) return false

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

	function setShowGroup(id: string | null) {
		set({ showGroup: id })
	}

	return {
		lifeforms: lifeNodes,
		fetchLifeforms,
		addLifeform,
		updateLifeform,
		showGroup,
		setShowGroup
	}
})

if (import.meta.hot) {
	import.meta.hot.accept('../assets/test-data/lifeform.json', () => {
		useLife.getState().fetchLifeforms()
	})
}
