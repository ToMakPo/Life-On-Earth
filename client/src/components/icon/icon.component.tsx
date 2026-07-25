import { forwardRef } from 'react'
import './icon.style.scss'

type MaterialSymbolVariant = 'outlined' | 'rounded' | 'sharp'

interface IconProps {
	/** The name of the icon to display, e.g., 'search', 'home', 'settings' */
	name: string
	/** The size of the icon. Can be a number (in pixels) or a string (e.g., '2rem', '24px'). Defaults to '1.5rem' */
	size?: number | string
	/** The variant of the Material Symbol to use. Can be 'outlined', 'rounded', or 'sharp'. Defaults to 'outlined' */
	variant?: MaterialSymbolVariant

	id?: string
	className?: string
	style?: React.CSSProperties
	onClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
	disabled?: boolean
}

const Icon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
	const variant = props.variant ?? 'outlined'
	const size = props.size === undefined ? '1.5rem' : typeof props.size === 'number' ? `${props.size}px` : props.size

	const classes = [
		'icon-component',
		props.onClick ? 'clickable' : '', // Add 'clickable' class if onClick is provided
		props.disabled ? 'disabled' : '', // Add 'disabled' class if disabled is true
		props.className ?? '' // Preserve any additional classes passed via props
	]
		.filter(Boolean)
		.join(' ')
	const styles = {
		'--size': size, // Custom CSS variable setting the size of the icon.
		...props.style // Spread any additional styles passed via props.
	} as React.CSSProperties
	// Extract any data attributes from props to pass them down to the span element.
	const dataProps = Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('data-')))

	return (
		<span id={props.id} className={classes} style={styles} onClick={props.onClick} {...dataProps} ref={ref} aria-disabled={props.disabled}>
			<span className={`material-symbols-${variant} material-symbols`}>{props.name}</span>
		</span>
	)
})

Icon.displayName = 'Icon'

export default Icon
