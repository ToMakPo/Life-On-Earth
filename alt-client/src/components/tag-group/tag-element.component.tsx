import Icon from '../icon/icon.component'

import './tag-group.styles.scss'

export interface TagProps {
	text: string

	onRemove?: (tag: string) => void
	onClick?: (tag: string) => void

	bgColor?: string
	fgColor?: string

	id?: string
	className?: string
	style?: React.CSSProperties
}

const Tag = (props: TagProps) => {
	const text = props.text
	const onRemove = props.onRemove
	const onClick = props.onClick

	const bgColor = props.bgColor
	const fgColor = props.fgColor

	const id = props.id ?? `tag-${Math.random().toString(36).substring(2, 9)}`
	const className = ['tag-component', props.className?.split(' '), onClick && 'clickable', onRemove && 'removable']
		.flat()
		.filter(Boolean)
		.join(' ')
	const style = {
		...props.style,
		...(bgColor && { '--bg': bgColor }),
		...(fgColor && { '--fg': fgColor })
	} as React.CSSProperties

	function handleOnClick(e: React.MouseEvent<HTMLSpanElement>) {
		e.stopPropagation()
		onClick?.(props.text)
	}
	function handleOnRemove(e: React.MouseEvent<HTMLSpanElement>) {
		e.stopPropagation()
		onRemove?.(props.text)
	}

	return (
		<span id={id} className={className} style={style} onClick={handleOnClick}>
			{text}
			{onRemove && <Icon className='tag-remove-icon' name='close' onClick={handleOnRemove} />}
		</span>
	)
}

export default Tag
