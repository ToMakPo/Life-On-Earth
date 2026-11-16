import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

import usersJson from '../assets/data/db-users.json' with { type: 'json' }
import { FileNames, updateJson } from '../assets/data/update-json'

FileNames.add('users')

interface UserData {
	id: string
	username: string
	hash: string
	/** The user is marked as an admin.
	 *
	 * As an admin, they are able to mark users as experts, block toxic users,
	 * edit comments, activate inactive user profiles, and update lifeform
	 * information.
	 */
	isAdmin: boolean
	/** The user has expertise in biology or related field.
	 *
	 * In order for a person to be set as an expert, they need to show they are
	 * a trustworthy source. If so, they will be able to edit the liferform
	 * information.
	 */
	isExpert: boolean
	/** Blocked is meant to prevent the user from commenting.
	 *
	 * A user would be blocked if they have been shown to be toxic or can not be
	 * trusted to play nice.
	 */
	isBlocked: boolean
	/** Indicates if the user profile is active.
	 *
	 * Users are not able to be deleted in order to preserve comments and rating.
	 * If a user requests profile deletion, their profile will instead be set as
	 * inactive.
	 *
	 * User profiles can become reactivated.
	 */
	active: boolean
	created: Date
}

type UserValues = Omit<UserData, 'hash'>

type UserInput = Pick<UserData, 'id' | 'username' | 'isAdmin'> & {
	// The password used to login.
	password: string
}

type UserUpdate = Pick<UserData, 'id'> & Partial<Omit<UserValues, 'id' | 'create'> & Pick<UserInput, 'password'>>

// wiki list: https://en.wikipedia.org/wiki/List_of_mammals

interface UserState {
	activeUser: UserValues | null

	/** A full list of all user values. */
	userValues: Record<string, UserValues>
	/** Fetch the list of all users. */
	fetchUsers: () => Promise<void>
	/** Add a user to the list.
	 *
	 * @param params The params of the new user.
	 */
	addUser: (params: UserInput) => Promise<boolean>
	/** Update a user.
	 *
	 * @param params The updated params of the user.
	 */
	updateUser: (params: UserUpdate) => Promise<boolean>
	/** Remove a user from the list.
	 *
	 * @param params Either the user being removed or just the id.
	 */
	removeUser: (params: UserValues | string) => Promise<boolean>

	/** Log a given user into the application.
	 *
	 * @param username The username for the account.
	 * @param password The password for the account.
	 * @returns True if the user was logged in. False if there was an issue.
	 */
	login: (username: string, password: string) => Promise<boolean>
	/** Log the active user out of the application.
	 *
	 * @returns True if the user was logged out. False if there was an issue.
	 */
	logout: () => Promise<boolean>
}

function sortUsers(items: UserData[]): UserData[] {
	return [...items].sort((a, b) => {
		// Sort by username
		const userCompare = a.username.localeCompare(b.username)
		return userCompare
	})
}

async function updateFile(data: UserData[]) {
	return updateJson<UserData>('user', data)
}

export const useUsers = create<UserState>((set, get) => {
	let userData = {} as Record<string, UserData>

	const activeUser = null as UserValues | null

	const userValues = {} as Record<string, UserValues>

	async function fetchUsers() {
		const userDataList = usersJson as UserData[]
		const userValues = {} as Record<string, UserValues>
		userData = {}

		userDataList.forEach((data) => {
			userData[data.id] = data
			userValues[data.id] = cleanUser(data)
		})

		set({ userValues })
	}

	async function addUser(params: UserInput): Promise<boolean> {
		const newId = uuidv4()
		const hash = '12345' // For now, just use a fake hash.

		const newUser: UserData = {
			id: newId,
			username: params.username.trim(),
			hash,
			isAdmin: !!params.isAdmin,
			isExpert: false,
			isBlocked: false,
			active: true,
			created: new Date()
		}

		// Check for duplicates
		const foundUser = Object.values(userData).find((user) => user.username === newUser.username)
		if (foundUser) return false

		// Mutate local array reference
		const data = usersJson as UserData[]
		data.push(newUser)

		// Sort users
		const sortedUsers = sortUsers(data)

		// Write to disk/API
		await updateFile(sortedUsers)

		// Re-build tree relationships from the updated JSON module
		await fetchUsers()

		return true
	}

	async function updateUser(params: UserUpdate): Promise<boolean> {
		if (!params.id) throw false

		const oldUser = userData[params.id]
		if (!oldUser) return false

		const newHash = params.password ? await hashPassword(params.password) : null

		const newUser: UserData = {
			...params,
			id: oldUser.id,
			username: params.username?.trim() ?? oldUser.username,
			hash: newHash ?? oldUser.hash,
			isAdmin: params.isAdmin ?? oldUser.isAdmin,
			isExpert: params.isExpert ?? oldUser.isExpert,
			isBlocked: params.isBlocked ?? oldUser.isBlocked,
			active: params.active ?? oldUser.active,
			created: oldUser.created
		}

		// Check for duplicates
		const usernameChanged = newUser.username !== oldUser.username
		const foundUser = usernameChanged && Object.values(userData).find((user) => user.username === newUser.username)
		if (foundUser) return false

		// Mutate local array reference
		const data = usersJson as UserData[]
		const index = data.findIndex((user) => user.id === newUser.id)
		data[index] = newUser

		// Sort users
		const sortedUsers = sortUsers(data)

		// Write to disk/API
		await updateFile(sortedUsers)

		// Re-build tree relationships from the updated JSON module
		await fetchUsers()

		return true
	}

	async function removeUser(params: UserValues | string) {
		const id = typeof params === 'string' ? params : params.id

		// Set the user as inactive.
		return updateUser({ id, active: false })
	}

	async function login(username: string, password: string) {
		// Check if the username exists.
		const user = await getUser(username)
		if (!user) return false

		const passwordIsCorrect = await checkHash(password, user.hash)
		if (!passwordIsCorrect) return false

		set({ activeUser: cleanUser(user) })

		return true
	}

	async function logout() {
		if (!get().activeUser) return false

		set({ activeUser: null })

		return true
	}

	async function getUser(username: string) {
		const un = username.trim().toLocaleLowerCase()
		return Object.values(userData).find((user) => user.username.toLocaleLowerCase() === un) || null
	}

	async function hashPassword(_password: string) {
		// For now, don't bother hashing the password.
		return '12345'
	}

	async function checkHash(_password: string, _hash: string) {
		// For now, just always return true since we aren't even hashing the passwords.
		return true
	}

	function cleanUser(user: UserData): UserValues {
		const { hash, ...rest } = user
		return rest
	}

	return {
		activeUser,
		userData,
		userValues,
		fetchUsers,
		addUser,
		updateUser,
		removeUser,
		login,
		logout
	}
})

if (import.meta.hot) {
	import.meta.hot.accept('../assets/data/db-user.json', () => {
		useUsers.getState().fetchUsers()
	})
}
