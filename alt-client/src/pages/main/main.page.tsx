import { useEffect, useState } from 'react'

import AddLifeformModal from '../../modals/lifeform-add.modal'

import { useLife, type LifeformData } from '../../store/life'

import './main.styles.scss'

const MainPage = () => {
	const fetchLifeforms = useLife((state) => state.fetchLifeforms)
	const lifeNodes = useLife((state) => state.lifeforms)

	useEffect(() => {
		fetchLifeforms()
	}, [])

	console.log('lifeNodes', lifeNodes)

	const [openAddLifeformModal, setOpenAddLifeformModal] = useState(false)
	const [openEditLifeformModal, setOpenEditLifeformModal] = useState<LifeformData | null>(null)

	const addLifeformButton = (
		<button type='button' onClick={() => setOpenAddLifeformModal(true)}>
			Add New Lifeform
		</button>
	)

	const addLifeformModal = <AddLifeformModal show={openAddLifeformModal} close={() => setOpenAddLifeformModal(false)} />
	// const editLifeformModal = <EditLifeformModal
	// 	show={openEditLifeformModal !== null}
	// 	lifeNode={openEditLifeformModal ?? {} as NodeData}
	// 	onClose={() => setOpenEditLifeformModal(null)}
	// />

	return (
		<div id='main-page'>
			{addLifeformButton}
			{addLifeformModal}
			{/* {editLifeformModal} */}

			<code id='main-page-code'>
				{lifeNodes &&
					Object.values(lifeNodes).map((node) => {
						const recordData = {} as Record<string, any>
						recordData.id = node.id
						recordData.name = node.name
						console.log('recordData', recordData)

						return (
							<div key={recordData.id} onClick={() => setOpenEditLifeformModal(node)}>
								{JSON.stringify(recordData, null, 2)}
							</div>
						)
					})}
			</code>
		</div>
	)
}

export default MainPage
