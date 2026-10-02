import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import lifeformJson from '../assets/test-data/lifeform.json' with { type: 'json' }
import { updateLifeformAPI } from '../assets/test-data/update-json'

export interface LifeformData {
	id: string
	name: string
	commonNames: string[]
	meaning: string
	characteristics: string
	taxonomy: Taxonomy
	description: string
	parentId: string | null
	wiki: string
}
export type LifeformInput = Omit<LifeformData, 'id'>

export interface NodeData extends LifeformData {
	parent: NodeData | null
	children: NodeData[]
	showChildren: boolean
}

export const Taxonomies = ['life', 'domain', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'] as const
export type Taxonomy = (typeof Taxonomies)[number]

interface LifeStata {
	/** A full list of all lifeforms. */
	lifeNodes: Record<string, NodeData>
	/** Fetch the list of all lifeforms. */
	fetchLifeforms: () => Promise<void>
	addLifeform: (params: LifeformInput) => Promise<boolean>
	updateLifeform: (params: LifeformData) => Promise<boolean>

	rootNode: NodeData | null
	setRootNode: (node: NodeData | null) => void

	selectedNode: NodeData | null
	setSelectedNode: (node: NodeData | null) => void

	/** Change the show children state of the lifeform.
	 *
	 * @param lifeNode The node data for the lifeform.
	 * @param show By default, if not provided, toggles the state of the show
	 * children setting. If provided, then hardcodes the state to the
	 * provided value.
	 * @param all By default, if false, then this will only set the show children
	 * state to the provided lifenode. If set to true, then it will update all
	 * life nodes to the new value.
	 */
	toggleShowChildren: (lifeNode: NodeData, show: boolean, all?: boolean) => void
}

export const useLife = create<LifeStata>((set, get) => {
	const lifeNodes = {} as Record<string, NodeData>

	async function fetchLifeforms() {
		const lifeformData = lifeformJson as LifeformData[]

		const lifeNodes = lifeformData.reduce(
			(acc, data) => {
				acc[data.id] = {
					...data,
					parent: null,
					children: [],
					showChildren: false
				}
				return acc
			},
			{} as Record<string, NodeData>
		)

		Object.values(lifeNodes).forEach((node) => {
			if (node.parentId) {
				const parent = lifeNodes[node.parentId]
				if (parent) {
					node.parent = parent
					parent.children.push(node)
				}
			}
		})

		set({ lifeNodes })
	}

	async function addLifeform(params: LifeformInput): Promise<boolean> {
		const currentLifeNodes = get().lifeNodes

		const newId = uuidv4()
		const newLifeform: LifeformData = { id: newId, ...params }

		// Check for duplicates
		if (Object.values(currentLifeNodes).find((node) => node.name === newLifeform.name)) return false

		// Mutate local array reference
		const lifeformData = lifeformJson as LifeformData[]
		lifeformData.push(newLifeform)

		// Write to disk/API
		await updateLifeformAPI(lifeformData)

		// Re-build tree relationships from the updated JSON module
		await fetchLifeforms()

		return true
	}

	async function updateLifeform(params: LifeformData): Promise<boolean> {
		if (!params.id) throw false

		const currentLifeNodes = get().lifeNodes
		const oldLifeform = currentLifeNodes[params.id]
		if (!oldLifeform) return false

		const newLifeform: LifeformData = { ...params }

		// Check for duplicates
		if (params.name !== oldLifeform.name && Object.values(currentLifeNodes).find((node) => node.name === newLifeform.name)) return false

		// Mutate local array reference
		const lifeformData = lifeformJson as LifeformData[]
		lifeformData[lifeformData.findIndex(lf => lf.id === newLifeform.id)] = newLifeform

		// Write to disk/API
		await updateLifeformAPI(lifeformData)

		// Re-build tree relationships from the updated JSON module
		await fetchLifeforms()

		return true
	}

	const rootNode = null as unknown as NodeData

	function setRootNode(node: NodeData | null) {
		set({ rootNode: node })
	}

	const selectedNode = null as unknown as NodeData

	function setSelectedNode(node: NodeData | null) {
		set({ selectedNode: node })
	}

	function setShowChildren(lifeNode: NodeData, show: boolean | null = null, all: boolean = false) {
		set((state) => {
			const updated = { ...state.lifeNodes }
			const showChildren = show ?? !lifeNode.showChildren

			const toggleNode = (id: string) => {
				const node = updated[id]

				if (!node) return

				updated[id] = { ...node, showChildren }

				if (all && node.children) {
					node.children.forEach((child: NodeData) => toggleNode(child.id))
				}
			}

			toggleNode(lifeNode.id)

			return { lifeNodes: updated }
		})
	}

	return {
		lifeNodes,
		fetchLifeforms,
		addLifeform,
		updateLifeform,
		rootNode,
		setRootNode,
		selectedNode,
		setSelectedNode,
		toggleShowChildren: setShowChildren
	}
})

if (import.meta.hot) {
	import.meta.hot.accept('../assets/test-data/lifeform.json', () => {
		useLife.getState().fetchLifeforms()
	})
}
