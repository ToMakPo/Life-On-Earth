import Tag, { type TagProps } from './tag-element.component'

import './tag-group.styles.scss'

interface TagGroupProps {
	tags: (string | TagProps)[]

	id?: string
	className?: string
	style?: React.CSSProperties

	onRemove?: (tag: string) => void
	onClick?: (tag: string) => void

	tagBgColor?: string
	tagFgColor?: string
	tagStyle?: React.CSSProperties
}

const TagGroup = (props: TagGroupProps) => {
	const tags = props.tags

	const id = props.id
	const className = ['tag-group-component', props.className?.split(' ')].flat().filter(Boolean).join(' ')
	const style = props.style

	if (tags.length === 0) return null

	return (
		<div id={id} className={className} style={style}>
			{tags.map((tag, index) => {
				const tagProps = typeof tag !== 'string' ? tag : { text: tag }
				if (!tagProps.onClick && props.onClick) tagProps.onClick = props.onClick
				if (!tagProps.onRemove && props.onRemove) tagProps.onRemove = props.onRemove
				if (!tagProps.bgColor && props.tagBgColor) tagProps.bgColor = props.tagBgColor
				if (!tagProps.fgColor && props.tagFgColor) tagProps.fgColor = props.tagFgColor
				tagProps.style = { ...tagProps.style, ...props.tagStyle }

				return <Tag key={index} {...tagProps} />
			})}
		</div>
	)
}

export default TagGroup
