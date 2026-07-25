import { forwardRef } from 'react'
import './icon.style.scss'

type MaterialSymbolVariant = 'outlined' | 'rounded' | 'sharp'

interface IconProps {
	name: string // e.g., 'search', 'home', 'settings'
	size?: number | string
	variant?: MaterialSymbolVariant

	id?: string
	className?: string
	onClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
	disabled?: boolean
}

const Icon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
	const variant = props.variant ?? 'outlined'
	const size = props.size ?? '24px'
	const data = Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('data-')))

	return (
		<span
			id={props.id}
			className={['icon-component', props.className ?? '', props.onClick ? 'clickable' : '', props.disabled ? 'disabled' : '']
				.filter(Boolean)
				.join(' ')}
			{...data}
			onClick={props.onClick}
			ref={ref}
			aria-disabled={props.disabled}
		>
			<span className={`material-symbols-${variant}`} style={{ fontSize: size }}>
				{props.name}
			</span>
		</span>
	)
})

Icon.displayName = 'Icon'

export default Icon
