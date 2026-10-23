import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import rankingsJson from '../assets/data/db-rankings.json' with { type: 'json' }
import { FileNames, updateJson } from '../assets/data/update-json'

FileNames.add('rankings')

interface RankingData {
	id: string
	lifeformId: string
	userId: string
	rank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
	score: number
}
export type RankingInput = Omit<RankingData, 'id'>

// wiki list: https://en.wikipedia.org/wiki/List_of_mammals

interface RankingState {
	/** A full list of all rankings. */
	rankings: Record<string, RankingData>
	/** Fetch the list of all rankings. */
	fetchRankings: () => Promise<void>
	/** Add a ranking to the list.
	 *
	 * @param params The params of the new ranking.
	 */
	addRanking: (params: RankingInput) => Promise<boolean>
	/** Update a ranking.
	 *
	 * @param params The updated params of the ranking.
	 */
	updateRanking: (params: RankingData) => Promise<boolean>
	/** Remove a ranking from the list.
	 *
	 * @param params Either the ranking being removed or just the id.
	 */
	removeRanking: (params: RankingData | string) => Promise<boolean>
}

function sortRankings(items: RankingData[]): RankingData[] {
	return [...items].sort((a, b) => {
		// Sort by userId
		const userCompare = a.userId.localeCompare(b.userId)
		if (userCompare !== 0) return userCompare

		// Sort by score 10 to 0
		const rankCompare = b.rank - a.rank
		if (rankCompare !== 0) return rankCompare

		// Sort by score 1 to 0
		const scoreCompare = b.score - a.score
		return scoreCompare
	})
}

async function updateFile(data: RankingData[]) {
	return updateJson<RankingData>('ranking', data)
}

export const useLife = create<RankingState>((set, get) => {
	const rankings = {} as Record<string, RankingData>

	async function fetchRankings() {
		const rankingData = rankingsJson as RankingData[]

		const rankings = rankingData.reduce(
			(acc, data) => {
				acc[data.id] = { ...data }
				return acc
			},
			{} as Record<string, RankingData>
		)

		set({ rankings })
	}

	async function addRanking(params: RankingInput): Promise<boolean> {
		const currentRankings = get().rankings

		const newId = uuidv4()
		const newRanking: RankingData = { ...params, id: newId }

		// Check for duplicates
		const foundRanking = Object.values(currentRankings).find(
			(ranking) => ranking.userId === newRanking.userId && ranking.lifeformId === newRanking.lifeformId
		)
		if (foundRanking) return false

		// Mutate local array reference
		const rankingData = rankingsJson as RankingData[]
		rankingData.push(newRanking)

		// Sort rankings
		const sortedRankings = sortRankings(rankingData)

		// Write to disk/API
		await updateFile(sortedRankings)

		// Re-build tree relationships from the updated JSON module
		await fetchRankings()

		return true
	}

	async function updateRanking(params: RankingData): Promise<boolean> {
		if (!params.id) throw false

		const currentRankings = get().rankings
		const oldRanking = currentRankings[params.id]
		if (!oldRanking) return false

		const newRanking: RankingData = { ...params, id: oldRanking.id, lifeformId: oldRanking.lifeformId, userId: oldRanking.userId }

		// Mutate local array reference
		const rankingData = rankingsJson as RankingData[]
		const index = rankingData.findIndex((lf) => lf.id === newRanking.id)
		rankingData[index] = newRanking

		// Sort rankings
		const sortedRankings = sortRankings(rankingData)

		// Write to disk/API
		await updateFile(sortedRankings)

		// Re-build tree relationships from the updated JSON module
		await fetchRankings()

		return true
	}

	async function removeRanking(params: RankingData | string) {
		const id = typeof params === 'string' ? params : params.id

		// Check if the id is in the list.
		const rankingData = rankingsJson as RankingData[]
		const index = rankingData.findIndex((lf) => lf.id === id)

		if (index === -1) return false

		// Remove the ranking from the list.
		rankingData.splice(index, 1)

		// Sort rankings
		const sortedRankings = sortRankings(rankingData)

		// Write to disk/API
		await updateFile(sortedRankings)

		// Re-build tree relationships from the updated JSON module
		await fetchRankings()

		return true
	}

	return {
		rankings,
		fetchRankings,
		addRanking,
		updateRanking,
		removeRanking
	}
})

if (import.meta.hot) {
	import.meta.hot.accept('../assets/data/db-ranking.json', () => {
		useLife.getState().fetchRankings()
	})
}
