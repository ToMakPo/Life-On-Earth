import { useEffect, useMemo, useState } from 'react'
import { Taxonomies, useLife, type LifeformData, type Taxonomy, type NodeData } from '../../../store/life'
import BubbleText from '../../../components/bubble-text/bubble-text.component'

type LifeformInput = Omit<LifeformData, 'id'> & { parentName: string; showWiki: boolean }
const getEmptyLifeform = (): LifeformInput => ({
	name: '',
	commonNames: [],
	meaning: '',
	characteristics: '',
	taxonomy: null as unknown as Taxonomy,
	description: '',
	parentId: null,
	parentName: '',
	wiki: '',
	showWiki: false
})

interface AddLifeformModalProps {
	show: boolean
	onClose: (saved: boolean) => void
}

const AddLifeformModal = ({ show, onClose }: AddLifeformModalProps) => {
	const lifeNodes = useLife((state) => state.lifeNodes)
	const addLifeform = useLife((state) => state.addLifeform)

	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const [newLifeform, setNewLifeform] = useState<LifeformInput>(getEmptyLifeform())
	useEffect(() => {
		// Reset the new lifeform state when the modal is shown.
		if (show) setNewLifeform(getEmptyLifeform())
	}, [show])

	useEffect(() => {
		console.log('New lifeform state changed:', newLifeform)
	}, [newLifeform])

	const lifeNames = useMemo(
		() =>
			Object.values(lifeNodes).reduce(
				(acc, node) => {
					acc[node.name] = node
					return acc
				},
				{} as Record<string, NodeData>
			),
		[lifeNodes]
	)

	const taxonomyList = useMemo(() => {
		const maxIndex = Object.values(lifeNodes).reduce((max, node) => {
			const index = Taxonomies.indexOf(node.taxonomy)
			return index > max ? index : max
		}, 0)
		const newList = Taxonomies.slice(0, maxIndex + 1)

		if (!newLifeform.taxonomy || !newList.includes(newLifeform.taxonomy)) {
			newLifeform.taxonomy = newList[newList.length - 1]
		}

		return newList
	}, [lifeNodes])

	/** A list of all existing lifeform names.
	 *
	 * Used to populate parent lifeform names for the parent selection dropdown.
	 */
	const parentNames = useMemo(() => {
		const index = Taxonomies.indexOf(newLifeform.taxonomy)
		const parentTaxonomy = index > 0 ? Taxonomies[index - 1] : null
		if (!parentTaxonomy) return []
		return Object.values(lifeNames)
			.filter((node) => node.taxonomy === parentTaxonomy)
			.map((node) => node.name)
			.sort()
	}, [lifeNames, newLifeform.taxonomy])

	const parentNode: NodeData | null = useMemo(() => {
		const parentNode = lifeNames[newLifeform.parentName] ?? null
		newLifeform.parentId = parentNode?.id ?? null
		return parentNode
	}, [lifeNames, newLifeform.parentName])

	/** Saves the new lifeform.
	 *
	 * Validates the new lifeform data and adds it to the store if valid.
	 *
	 * @returns A promise that resolves to true if the lifeform was saved successfully, false otherwise.
	 */
	async function saveLifeform() {
		setErrorMessage(null)

		if (!validateInputs()) return false

		addLifeform(newLifeform)
		return true
	}

	async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault()
		const saved = await saveLifeform()
		if (saved) handleClose(true)
	}

	function handleClose(saved: boolean) {
		onClose(saved)
	}

	function validateInputs(): boolean {
		setErrorMessage(null)

		// The lifeform has a name.
		if (!newLifeform.name) {
			setErrorMessage('Lifeform name is required.')
			return false
		}

		// The name is unique.
		if (Object.keys(lifeNames).includes(newLifeform.name)) {
			setErrorMessage('Lifeform name must be unique.')
			return false
		}

		// The lifeform has a taxonomy.
		if (newLifeform.taxonomy === null) {
			setErrorMessage('Lifeform taxonomy is required.')
			return false
		}

		// The lifeform has a valid parent if it's not the top-level taxonomy.
		if (newLifeform.taxonomy !== Taxonomies[0] && !parentNode) {
			setErrorMessage('A valid parent lifeform is required.')
			return false
		}

		return true
	}

	/////////////////
	/// RENDERING ///
	/////////////////
	// #region Rendering

	if (!show) return null

	const form = (
		<form id='add-lifeform-form' onSubmit={handleSave}>
			<div id='lifeform-name' className='input-field'>
				<label htmlFor='lifeform-name-input'>Lifeform Name</label>
				<input
					type='text'
					id='lifeform-name-input'
					placeholder='Lifeform Name'
					value={newLifeform?.name ?? ''}
					onChange={(e) => setNewLifeform((prev) => ({ ...prev, name: e.target.value }))}
				/>
			</div>

			<div id='lifeform-common-names' className='input-field'>
				<label htmlFor='lifeform-common-name-input'>Common Names</label>

				<div className='row'>
					<input type='text' id='lifeform-common-name-input' />

					<button
						className='icon-button'
						type='button'
						onClick={() => {
							const input = document.getElementById('lifeform-common-name-input') as HTMLInputElement
							if (!input) return

							const names = input.value
								.split(',')
								.map((s) => s.trim().replace(/[^\w\s\'\-]/g, ''))
								.filter((s) => s)

							input.value = ''
							input.focus()

							const allNames = [...new Set([...newLifeform.commonNames, ...names])]
							setNewLifeform((prev) => ({ ...prev, commonNames: allNames }))
						}}
					>
						+
					</button>
				</div>

				{newLifeform && (
					<div id='bubble-text-container' className='row'>
						{newLifeform.commonNames.map((name, index) => (
							<BubbleText
								key={index}
								text={name}
								color='#485878'
								onClose={() => setNewLifeform((prev) => ({ ...prev, commonNames: prev.commonNames.filter((_, i) => i !== index) }))}
							/>
						))}
					</div>
				)}
			</div>

			<div id='lifeform-meaning' className='input-field'>
				<label htmlFor='lifeform-meaning-input'>Meaning</label>
				<input
					type='text'
					id='lifeform-meaning-input'
					value={newLifeform?.meaning ?? ''}
					onChange={(e) => setNewLifeform((prev) => ({ ...prev, meaning: e.target.value }))}
				/>
			</div>

			<div id='lifeform-characteristics' className='input-field'>
				<label htmlFor='lifeform-characteristics-input'>Characteristics</label>
				<textarea
					id='lifeform-characteristics-input'
					value={newLifeform?.characteristics ?? ''}
					onChange={(e) => setNewLifeform((prev) => ({ ...prev, characteristics: e.target.value }))}
				/>
			</div>

			<div id='lifeform-taxonomy' className='input-field'>
				<label htmlFor='lifeform-taxonomy-input'>Taxonomy</label>
				<select
					id='lifeform-taxonomy-input'
					value={newLifeform?.taxonomy ?? ''}
					onChange={(e) => {
						const value = e.target.value as Taxonomy
						setNewLifeform((prev) => ({ ...prev, taxonomy: value }))
					}}
				>
					<option key='none' value='' disabled>
						-- Select one --
					</option>
					{taxonomyList.map((taxonomy) => (
						<option key={taxonomy} value={taxonomy}>
							{taxonomy.charAt(0).toUpperCase() + taxonomy.slice(1)}
						</option>
					))}
				</select>
			</div>

			<div id='lifeform-parent' className='input-field'>
				<label htmlFor='lifeform-parent-input'>Parent</label>
				<select
					id='lifeform-parent-input'
					value={newLifeform?.parentId ?? ''}
					onChange={(e) => {
						const parentId = e.target.value
						const parentName = lifeNames[parentId]?.name ?? ''

						setNewLifeform((prev) => ({ ...prev, parentName, parentId }))
					}}
				>
					{parentNames.length > 0 ? (
						<>
							<option key='none' value='' disabled>
								-- Select a parent --
							</option>
							{parentNames.map((node) => (
								<option key={lifeNames[node].id} value={lifeNames[node].id}>
									{node}
								</option>
							))}
						</>
					) : newLifeform.taxonomy === Taxonomies[0] ? (
						<option key='none' value='' disabled>
							-- Root lifeform has no parent --
						</option>
					) : newLifeform.taxonomy === null ? (
						<option key='none' value='' disabled>
							-- Select a taxonomy first --
						</option>
					) : (
						<option key='none' value='' disabled>
							-- No parent available --
						</option>
					)}
				</select>
			</div>

			<div id='lifeform-description' className='input-field'>
				<label htmlFor='lifeform-description-input'>Description</label>
				<textarea
					id='lifeform-description-input'
					value={newLifeform?.description ?? ''}
					onChange={(e) => setNewLifeform((prev) => ({ ...prev, description: e.target.value }))}
				/>
			</div>

			<div id='lifeform-wiki-link' className='input-field'>
				<label htmlFor='lifeform-wiki-link-input'>Wiki Link</label>
				<div className='row'>
					<input
						type='url'
						id='lifeform-wiki-link-input'
						placeholder={newLifeform?.name ? `https://en.wikipedia.org/wiki/${newLifeform?.name ?? ''}` : 'Wiki Link'}
						value={newLifeform?.wiki ?? ''}
						onChange={(e) => setNewLifeform((prev) => ({ ...prev, wiki: e.target.value }))}
					/>
					<button
						type='button'
						onClick={() => setNewLifeform((prev) => ({ ...prev, wiki: `https://en.wikipedia.org/wiki/${prev.name ?? ''}` }))}
					>
						&lt;&lt;&lt;
					</button>
					<button
						className={newLifeform?.showWiki ? 'show' : 'hide'}
						type='button'
						onClick={() => setNewLifeform((prev) => ({ ...prev, showWiki: !prev.showWiki }))}
					>
						Show Wiki
					</button>
				</div>
				{newLifeform?.showWiki && (
					<iframe
						src={newLifeform?.wiki ?? `https://en.wikipedia.org/wiki/${newLifeform?.name ?? ''}`}
						title='Wiki Link'
						width='100%'
						height='400px'
					></iframe>
				)}
			</div>

			<div className='action-buttons'>
				<button type='submit'>Add Lifeform</button>
				<button type='button' onClick={() => handleClose(false)}>
					Cancel
				</button>
			</div>

			{errorMessage && <p className='error-message'>{errorMessage}</p>}

			<p>Available Taxonomies: {taxonomyList.join(', ')}</p>
			<p>Available Parents: {parentNames.join(', ')}</p>
		</form>
	)

	return <div className='add-lifeform-modal'>{form}</div>
}

export default AddLifeformModal
