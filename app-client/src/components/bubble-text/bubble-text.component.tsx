import './bubble-text.styles.scss'

interface BubbleTextProps {
	text: string
	color?: string
	onClose?: () => void
}

const BubbleText = (props: BubbleTextProps) => {
	const { text, color, onClose } = props
	if (!text) return null

	return (
		<div className='bubble-text' style={{ '--color': color } as React.CSSProperties}>
			<span className='text'>{text}</span>

			{onClose && (
				<button type='button' onClick={onClose}>
					×
				</button>
			)}
		</div>
	)
}

export default BubbleText
