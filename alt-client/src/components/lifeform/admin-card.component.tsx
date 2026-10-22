import { useEffect, useState } from 'react'
import { useLife, type LifeDetails, type LifeformData } from '../../store/lifeforms'

import './admin-card.styles.scss'

interface AdminCardProps {
	lifeform: Partial<LifeformData>
	onEdit?: (lifeform: LifeformData) => void
}

const LifeformAdminCard = (props: AdminCardProps) => {
	const lifeform = props.lifeform
	const onEdit = props.onEdit

	if (!lifeform.name) return null

	const [lifeDetails, setLifeDetails] = useState<LifeDetails | null>(null)
	const getDetails = useLife((state) => state.getDetails)
	useEffect(() => {
		getDetails(lifeform).then(setLifeDetails)
	}, [lifeform])

	return (
		<div key={lifeform.id} className='lifeform-card' onClick={() => onEdit?.(lifeform as LifeformData)}>
			<h3 className='lifeform-name'>{lifeform.name}</h3>

			{lifeDetails?.imageUrl && <img className='lifeform-image' src={lifeDetails.imageUrl} alt={lifeform.name} />}
			{lifeDetails?.description && (
				<p className='lifeform-description' dangerouslySetInnerHTML={{ __html: lifeDetails.description.replace(/\n/g, '<br /><br />') }} />
			)}
		</div>
	)
}

export default LifeformAdminCard
