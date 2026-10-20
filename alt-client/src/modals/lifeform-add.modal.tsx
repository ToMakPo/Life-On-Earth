import { useCallback, useEffect, useMemo, useState } from 'react'

import Form from '../components/form/form.component'
import TextInput from '../components/form/input.text.component'
import Modal from '../components/modal/modal.component'

import { useLife, type LifeformInput } from '../store/life'
import { fetchWikiData, type WikiData } from '../utils/wiki'
import { cleanName } from '../utils/global'
import type { InputMessageProps } from '../components/form/message.component'
import TagGroup from '../components/tag-group/tag-group.component'
import InputMessage from '../components/form/message.component'

interface AddLifeformModalProps {
	show: boolean
	close: () => void
}

const EmptyValues: LifeformInput = {
	name: '',
	tags: [],
	wikiTitle: '',
	imageUrl: '',
	description: ''
}

type Errors = Partial<Record<keyof LifeformInput, string>>

const AddLifeformModal = (props: AddLifeformModalProps) => {
	const { show, close } = props

	const [values, setValues] = useState({ ...EmptyValues })
	const [errors, setErrors] = useState<Errors>({})
	const [imageError, setImageError] = useState(false)
	const [tagInput, setTagInput] = useState('')

	const addLifeform = useLife((state) => state.addLifeform)
	const tagList = useLife((state) => state.tagList)

	const unusedTags = useMemo(() => {
		return tagList.filter((tag) => !values.tags.includes(tag))
	}, [tagList, values.tags])

	useEffect(() => {
		const storedTags = localStorage.getItem('last-tag-list')
		if (!show) setValues({ ...EmptyValues, tags: storedTags ? JSON.parse(storedTags) : [] })
	}, [show])

	useEffect(() => {
		console.log('Updating last tag list in localStorage', values.tags)
		localStorage.setItem('last-tag-list', JSON.stringify(values.tags))
	}, [JSON.stringify(values.tags)])

	const [wikiData, setWikiData] = useState<WikiData | null>(null)

	useEffect(() => {
		const wikiTitle = values.wikiTitle || values.name

		fetchWikiData(wikiTitle.toLocaleLowerCase()).then(setWikiData)
	}, [values.name, values.wikiTitle])

	const image = useMemo(() => {
		const imageUrl = values.imageUrl || wikiData?.imageUrl || ''
		if (!imageUrl) return null

		const styles = {
			objectFit: 'contain',
			height: 'auto',
			width: 'auto',
			maxHeight: '500px',
			maxWidth: '50%'
		} as React.CSSProperties

		return (
			<img
				src={imageUrl}
				alt={`Image of ${values.name}`}
				style={styles}
				onLoad={(e) => {
					e.currentTarget.style.display = 'block'
					setImageError(false)
				}}
				onError={(e) => {
					e.currentTarget.style.display = 'none'
					setImageError(true)
				}}
			/>
		)
	}, [values.imageUrl, wikiData])

	const description = useMemo(() => {
		const text = values.description || wikiData?.summary || ''

		if (!text) return null

		return <div className='wiki-summary' dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br /><br />') }} />
	}, [values.description, wikiData?.summary])

	async function saveLifeform(lifeform: LifeformInput) {
		if (!validateInputs()) return false

		await addLifeform(lifeform)
		return true
	}

	function validateInputs(): boolean {
		const errors: Errors = {}

		if (!values.name && !errors.name) {
			errors.name = 'Lifeform name is required.'
		}

		if (values.tags.length === 0 && !errors.tags) {
			errors.tags = 'Lifeform must have at least one tag.'
		}

		if (values.imageUrl && imageError && !errors.imageUrl) {
			errors.imageUrl = 'Invalid image URL.'
		}

		setErrors(errors)

		const errorList = Object.entries(errors).filter(([_, value]) => !!value)
		if (errorList.length > 0) return false

		return true
	}

	async function handleSave(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault()

		const saved = await saveLifeform(values)
		if (saved) close()
	}

	const message = useCallback(
		(field: keyof Errors): InputMessageProps | undefined => {
			return errors[field]
				? {
						message: errors[field]!,
						messageType: 'error',
						setMessage(message: string | null) {
							setErrors((prev) => ({ ...prev, [field]: message }))
						}
					}
				: undefined
		},
		[errors]
	)

	const form = (
		<Form className='column'>
			<h2>Add Lifeform</h2>

			<TextInput
				groupId='lifeform-name'
				value={values.name}
				setValue={(v) => setValues((prev) => ({ ...prev, name: v }))}
				label='Name'
				placeholder='Enter lifeform name'
				onBlur={(e) => {
					const name = cleanName(e.target.value)
					setValues((prev) => ({ ...prev, name }))
				}}
				message={message('name')}
			/>

			<div className='column'>
				<TextInput
					groupId='lifeform-add-tags'
					label='New Tags'
					value={tagInput}
					setValue={(v) => setTagInput(v)}
					onBlur={(e) => {
						const tags = e.target.value
							.split(',')
							.map((tag) => cleanName(tag.trim()))
							.filter(Boolean)
						const uniqueTags = [...new Set([...values.tags, ...tags])]
						setValues((prev) => ({ ...prev, tags: uniqueTags }))
						setTagInput('')
					}}
					placeholder='Enter tags separated by commas'
				/>
				<TagGroup
					id='user-tags'
					// tags={values.tags.sort().map((tag) => ({ text: tag, className: tagList.includes(tag) ? 'existing' : 'new' }))}
					tags={values.tags.sort().map((tag) => ({
						text: tag
					}))}
					onRemove={(tag) => setValues((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
					tagBgColor='light-dark(red, green)'
				/>
				<TagGroup
					id='unused-tags'
					tags={unusedTags.sort()}
					onClick={(tag) => setValues((prev) => ({ ...prev, tags: [...prev.tags, tag] }))}
					tagBgColor='light-dark(yellow, blue)'
				/>
				{message('tags') && <InputMessage {...message('tags')!} />}
			</div>

			<TextInput
				groupId='lifeform-wiki-link'
				value={values.wikiTitle!}
				setValue={(v) => setValues((prev) => ({ ...prev, wikiTitle: v }))}
				label='Wiki Title'
				placeholder='Custom wiki title if different from lifeform name.'
				message={message('wikiTitle')}
			/>

			<TextInput
				groupId='lifeform-image-url'
				value={values.imageUrl!}
				setValue={(v) => setValues((prev) => ({ ...prev, imageUrl: v }))}
				label='Image URL'
				placeholder='Custom image URL if different from the wiki image URL.'
				message={message('imageUrl')}
			/>

			<TextInput
				groupId='lifeform-description'
				value={values.description!}
				setValue={(v) => setValues((prev) => ({ ...prev, description: v }))}
				label='Description'
				placeholder='Custom description if different from the wiki summary.'
				message={message('description')}
			/>

			<div className='row'>
				{image}
				{description}
			</div>

			<div className='row'>
				<button type='submit' onClick={handleSave}>
					Add Lifeform
				</button>
				<button type='button' onClick={close}>
					Cancel
				</button>
			</div>
		</Form>
	)

	return (
		<Modal show={show} close={close} size='fs'>
			{form}
		</Modal>
	)
}

export default AddLifeformModal
