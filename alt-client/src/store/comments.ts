import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import commentsJson from '../assets/data/db-comments.json' with { type: 'json' }
import { FileNames, updateJson } from '../assets/data/update-json'

FileNames.add('comments')

interface CommentData {
	id: string
	lifeformId: string
	userId: string
	parentId: string | null
	message: string
	timestamp: Date
	updated: Date | null
}
export type CommentInput = Omit<CommentData, 'id'>

// wiki list: https://en.wikipedia.org/wiki/List_of_mammals

interface CommentState {
	/** A full list of all comments. */
	comments: Record<string, CommentData>
	/** Fetch the list of all comments. */
	fetchComments: () => Promise<void>
	/** Add a comment to the list.
	 *
	 * @param params The params of the new comment.
	 */
	addComment: (params: CommentInput) => Promise<boolean>
	/** Update a comment.
	 *
	 * @param params The updated params of the comment.
	 */
	updateComment: (params: CommentData) => Promise<boolean>
	/** Remove a comment from the list.
	 *
	 * @param params Either the comment being removed or just the id.
	 */
	removeComment: (params: CommentData | string) => Promise<boolean>
}

function sortComments(items: CommentData[]): CommentData[] {
	return [...items].sort((a, b) => {
		// Sort by userId
		const userCompare = a.userId.localeCompare(b.userId)
		if (userCompare !== 0) return userCompare

		// Sort by lifeformId
		const rankCompare = a.lifeformId.localeCompare(b.lifeformId)
		if (rankCompare !== 0) return rankCompare

		// Sort by timestamp oldest to newest
		const scoreCompare = +a.timestamp - +b.timestamp
		return scoreCompare
	})
}

async function updateFile(data: CommentData[]) {
	return updateJson<CommentData>('comment', data)
}

export const useLife = create<CommentState>((set, get) => {
	const comments = {} as Record<string, CommentData>

	async function fetchComments() {
		const commentData = commentsJson as CommentData[]

		const comments = commentData.reduce(
			(acc, data) => {
				acc[data.id] = { ...data }
				return acc
			},
			{} as Record<string, CommentData>
		)

		set({ comments })
	}

	async function addComment(params: CommentInput): Promise<boolean> {
		const currentComments = get().comments

		const newId = uuidv4()
		const newComment: CommentData = { ...params, id: newId, updated: null }

		// Check for duplicates
		const foundComment = Object.values(currentComments).find(
			(comment) => comment.userId === newComment.userId && comment.lifeformId === newComment.lifeformId
		)
		if (foundComment) return false

		// Mutate local array reference
		const commentData = commentsJson as CommentData[]
		commentData.push(newComment)

		// Sort comments
		const sortedComments = sortComments(commentData)

		// Write to disk/API
		await updateFile(sortedComments)

		// Re-build tree relationships from the updated JSON module
		await fetchComments()

		return true
	}

	async function updateComment(params: CommentData): Promise<boolean> {
		if (!params.id) throw false

		const currentComments = get().comments
		const oldComment = currentComments[params.id]
		if (!oldComment) return false

		const newComment: CommentData = {
			...params,
			id: oldComment.id,
			lifeformId: oldComment.lifeformId,
			userId: oldComment.userId,
			parentId: oldComment.parentId,
			timestamp: oldComment.timestamp,
			updated: new Date()
		}

		// Mutate local array reference
		const commentData = commentsJson as CommentData[]
		const index = commentData.findIndex((lf) => lf.id === newComment.id)
		commentData[index] = newComment

		// Sort comments
		const sortedComments = sortComments(commentData)

		// Write to disk/API
		await updateFile(sortedComments)

		// Re-build tree relationships from the updated JSON module
		await fetchComments()

		return true
	}

	async function removeComment(params: CommentData | string) {
		const id = typeof params === 'string' ? params : params.id

		// Check if the id is in the list.
		const commentData = commentsJson as CommentData[]
		const index = commentData.findIndex((lf) => lf.id === id)

		if (index === -1) return false

		// Remove the comment from the list.
		commentData.splice(index, 1)

		// Sort comments
		const sortedComments = sortComments(commentData)

		// Write to disk/API
		await updateFile(sortedComments)

		// Re-build tree relationships from the updated JSON module
		await fetchComments()

		return true
	}

	return {
		comments,
		fetchComments,
		addComment,
		updateComment,
		removeComment
	}
})

if (import.meta.hot) {
	import.meta.hot.accept('../assets/data/db-comment.json', () => {
		useLife.getState().fetchComments()
	})
}
