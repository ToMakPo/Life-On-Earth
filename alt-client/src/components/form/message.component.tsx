import { calculateReadingDuration } from '../../utils/global'

import Icon from '../icon/icon.component'

export const MessageTypes = ['success', 'error', 'warning', 'info'] as const
export type MessageType = (typeof MessageTypes)[number]

export interface InputMessageProps {
	message: string
	setMessage: (message: string | null) => void

	messageType?: MessageType

	iconName?: string
	bgColor?: string
	fgColor?: string

	/** The duration that the message will be displaied.
	 *
	 * This is looking for the a number representing the duration in milliseconds.
	 *
	 * At the end of the duration, the message will be automatically dismissed.
	 *
	 * If 0, the message will not be automatically dismissed. (default)
	 *
	 * If -1, the duration will be calculated based on the length of the message.
	 */
	duration?: number
}

type MessageSettings = {
	iconName: string
	bgColor: string
	fgColor: string
}

const DefaultSettings: Record<MessageType, MessageSettings> = {
	success: { iconName: 'check-circle', bgColor: 'green', fgColor: 'white' },
	error: { iconName: 'exclamation-circle', bgColor: 'red', fgColor: 'white' },
	warning: { iconName: 'exclamation-triangle', bgColor: 'yellow', fgColor: 'black' },
	info: { iconName: 'info-circle', bgColor: 'blue', fgColor: 'white' }
}

const InputMessage = (props: InputMessageProps) => {
	const className = ['input-message', props.messageType?.split(' ')].flat().filter(Boolean).join(' ')

	const message = props.message

	const messageType = props.messageType ?? 'info'

	const duration =
		props.duration === undefined ? 0 : props.duration > 0 ? props.duration : props.duration === -1 ? calculateReadingDuration(message) : 0
	if (duration !== 0) setTimeout(() => props.setMessage(null), duration)

	const iconName = props.iconName ?? DefaultSettings[messageType].iconName

	const bgColor = props.bgColor ?? DefaultSettings[messageType].bgColor
	const fgColor = props.fgColor ? props.fgColor : props.bgColor ? `contrast-color(${bgColor})` : DefaultSettings[messageType].fgColor

	const style = { backgroundColor: bgColor, color: fgColor }

	if (!message) return null

	const icon = <Icon name={iconName} />

	return (
		<div className={className} style={style}>
			{icon}
			{message}
		</div>
	)
}

export default InputMessage
