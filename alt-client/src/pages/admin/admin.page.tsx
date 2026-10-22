import { useMemo, useState } from 'react'

import { useLife, type LifeformData } from '../../store/lifeforms'

import TagGroup from '../../components/tag-group/tag-group.component'
import LifeformAdminCard from '../../components/lifeform/admin-card.component'
import AddLifeformModal from '../../modals/lifeform-add.modal'
import EditLifeformModal from '../../modals/lifeform-edit.modal'

import './admin.styles.scss'

const AdminPage = () => {
	const lifeforms = useLife((state) => state.lifeforms)
	const tagList = useLife((state) => state.tagList)

	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const selectedLifeforms = useMemo(() => {
		return Object.values(lifeforms).filter((lifeform: LifeformData) => selectedTags.every((tag: string) => lifeform.tags.includes(tag)))
	}, [lifeforms, selectedTags])

	const [openAddLifeformModal, setOpenAddLifeformModal] = useState(false)
	const [openEditLifeformModal, setOpenEditLifeformModal] = useState<LifeformData | null>(null)

	const addLifeformButton = (
		<button type='button' onClick={() => setOpenAddLifeformModal(true)}>
			Add New Lifeform
		</button>
	)

	const tagGroups = useMemo(() => {
		const unselectedTags = tagList.filter((tag: string) => !selectedTags.includes(tag))

		return (
			<>
				<TagGroup tags={selectedTags} onRemove={(tag: string) => setSelectedTags(selectedTags.filter((t) => t !== tag))} />
				<TagGroup tags={unselectedTags} onClick={(tag: string) => setSelectedTags([...selectedTags, tag])} />
			</>
		)
	}, [tagList, selectedTags])

	const lifeformList = useMemo(() => {
		return (
			<div>
				
				{selectedLifeforms.map((lifeform) => (
					<LifeformAdminCard lifeform={lifeform} onEdit={(lifeform) => setOpenEditLifeformModal(lifeform)} />
				))}
			</div>
		)
	}, [selectedLifeforms])

	const addLifeformModal = <AddLifeformModal show={openAddLifeformModal} close={() => setOpenAddLifeformModal(false)} />
	const editLifeformModal = <EditLifeformModal lifeform={openEditLifeformModal} close={() => setOpenEditLifeformModal(null)} />

	return (
		<div id='admin-page'>
			<h1>Admin Page</h1>
			{addLifeformButton}

			{tagGroups}

			{lifeformList}

			{addLifeformModal}
			{editLifeformModal}
		</div>
	)
}

export default AdminPage
