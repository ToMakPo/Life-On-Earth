import { useState } from 'react'

import AddLifeformModal from './modals/add-lifeform.modal'

import { useLife } from '../../store/life'

import './main.styles.scss'

const MainPage = () => {
	const lifeNodes = useLife((state) => state.lifeNodes)

	const [openAddLifeformModal, setOpenAddLifeformModal] = useState(false)

	const addLifeformButton = !openAddLifeformModal && (
		<button type='button' onClick={() => setOpenAddLifeformModal(true)}>
			Add New Lifeform
		</button>
	)

	const addLifeformForm = <AddLifeformModal show={openAddLifeformModal} onClose={() => setOpenAddLifeformModal(false)} />

	return (
		<div className='main-page'>
			{addLifeformButton}
			{addLifeformForm}

			<code>
				{Object.values(lifeNodes).map((node) => {
					const recordData = { } as Record<string, any>
					recordData.id = node.id
					recordData.name = node.name
					recordData.parentId = node.parentId
					recordData.childCount = node.children.length
					
					return <div key={recordData.id}>{JSON.stringify(recordData, null, 2)}</div>
				})}
			</code>
		</div>
	)
}

export default MainPage
