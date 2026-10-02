import { useState } from 'react'

import { useLife } from '../../store/life'

import './main.styles.scss'
import AddLifeformModal from './modals/add-lifeform.modal'

const MainPage = () => {
	const lifeNodes = useLife((state) => state.lifeNodes)

	const [openAddLifeformModal, setOpenAddLifeformModal] = useState(false)

	const addLifeformButton = !openAddLifeformModal && (
		<button type='button' onClick={() => setOpenAddLifeformModal(true)}>
			Add New Lifeform
		</button>
	)

	const addLifeformForm = <AddLifeformModal
		show={openAddLifeformModal}
		onClose={() => setOpenAddLifeformModal(false)}
	/>

	return (
		<div className='main-page'>
			{addLifeformButton}
			{addLifeformForm}

			{Object.keys(lifeNodes).map((node) => (
				<div key={lifeNodes[node].id}>{lifeNodes[node].name}</div>
			))}
		</div>
	)
}

export default MainPage
