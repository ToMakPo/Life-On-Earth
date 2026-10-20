import React, { forwardRef, useImperativeHandle, useRef } from 'react'

import type { InputMessageProps } from './message.component'
import InputMessage from './message.component'

interface InputTextProps {
	groupId?: string
	groupClassName?: string

	inputId?: string
	inputClassName?: string

	label?: string
	message?: InputMessageProps

	value: string
	setValue: (value: string) => void

	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void

	required?: boolean
	autoFocus?: boolean
	placeholder?: string
	autoComplete?: string

	list?: ({ label: string; value: string } | string)[]
}

interface TextInputRef {
	focus: () => void
	blur: () => void
	select: () => void
	getNativeInput: () => HTMLInputElement | null
}

const TextInput = forwardRef<TextInputRef, InputTextProps>((props, ref) => {
	const inputRef = useRef<HTMLInputElement>(null)

	const randId = Math.random().toString(36).substring(2, 9)

	const groupId = props.groupId ?? `text-input-group-${randId}`
	const groupClassName = ['input-group', props.groupClassName?.split(' ')].flat().filter(Boolean).join(' ')

	const inputId = props.inputId ?? `text-input-${randId}`
	const inputClassName = ['text-input', props.inputClassName?.split(' ')].flat().filter(Boolean).join(' ')

	const label = props.label && <label htmlFor={inputId}>{props.label}</label>

	const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		props.setValue(event.target.value)
		props.onChange?.(event)
	}

	const input = (
		<input
			id={inputId}
			className={inputClassName}
			value={props.value}
			onChange={handleOnChange}
			onFocus={props.onFocus}
			onBlur={props.onBlur}
			required={props.required}
			autoFocus={props.autoFocus}
			placeholder={props.placeholder}
			autoComplete={props.autoComplete}
			list={props.list ? `datalist-${randId}` : undefined}
			ref={inputRef} // The ref is passed down here
		/>
	)

	const message = props.message && <InputMessage {...props.message} />

	const datalist = props.list && (
		<datalist id={`datalist-${randId}`}>
			{props.list.map((item) => {
				const { label, value } = typeof item === 'string' ? { label: item, value: item } : item

				return (
					<option key={value} value={value}>
						{label}
					</option>
				)
			})}
		</datalist>
	)

	function handleGroupClick(e: React.MouseEvent<HTMLDivElement>) {
		e.stopPropagation()
		focusInput()
	}

	function focusInput() {
		inputRef.current?.focus()
	}

	function blurInput() {
		inputRef.current?.blur()
	}

	function selectInput() {
		inputRef.current?.select()
	}

	// Expose imperative methods for the parent component
	useImperativeHandle(ref, () => ({
		focus: focusInput,
		blur: blurInput,
		select: selectInput,
		getNativeInput: () => inputRef.current
	}))

	return (
		<div id={groupId} className={groupClassName} onClick={handleGroupClick}>
			{label}
			{input}
			{message}
			{datalist}
		</div>
	)
})

// Setting the display name helps with cleaner debugging in React DevTools
TextInput.displayName = 'TextInput'

export default TextInput
