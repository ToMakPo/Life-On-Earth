import { useEffect, useState } from 'react'

import AddLifeformModal from '../../modals/lifeform-add.modal'
import EditLifeformModal from '../../modals/lifeform-edit.modal'

import { useLife, type LifeformData } from '../../store/life'

import './main.styles.scss'

const MainPage = () => {
	const fetchLifeforms = useLife((state) => state.fetchLifeforms)
	const lifeforms = useLife((state) => state.lifeforms)

	useEffect(() => {
		fetchLifeforms()
	}, [])

	const [openAddLifeformModal, setOpenAddLifeformModal] = useState(false)
	const [openEditLifeformModal, setOpenEditLifeformModal] = useState<LifeformData | null>(null)

	const addLifeformButton = (
		<button type='button' onClick={() => setOpenAddLifeformModal(true)}>
			Add New Lifeform
		</button>
	)

	const addLifeformModal = <AddLifeformModal show={openAddLifeformModal} close={() => setOpenAddLifeformModal(false)} />
	const editLifeformModal = (
		<EditLifeformModal
			lifeform={openEditLifeformModal}
			close={() => setOpenEditLifeformModal(null)}
		/>
	)

	return (
		<div id='main-page'>
			{addLifeformButton}

			<code id='main-page-code'>
				{lifeforms &&
					Object.values(lifeforms).map((lifeform) => {
						return (
							<div key={lifeform.id} onClick={() => setOpenEditLifeformModal(lifeform)} style={{ cursor: 'pointer' }}>
								{JSON.stringify(lifeform, null, 2)}
							</div>
						)
					})}
			</code>
			
			{addLifeformModal}
			{editLifeformModal}
		</div>
	)
}

export default MainPage
