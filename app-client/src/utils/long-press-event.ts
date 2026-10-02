/**
 * Attaches a custom long-press event listener to any HTML element.
 * @param element - The target HTML element.
 * @param callback - The function to run on a successful long press. Receives the original MouseEvent or TouchEvent.
 * @param duration - Optional hold time in milliseconds (default is 800ms).
 */
export function registerLongPress(
	element: HTMLElement,
	callback: (event: MouseEvent | TouchEvent) => void,
	duration: number = 800
): () => void {
	let timer: ReturnType<typeof setTimeout> | null = null

	// Starts the countdown
	const start = (e: MouseEvent | TouchEvent): void => {
		// Avoid running twice if device triggers both touch and mouse events
		if (e.type === 'touchstart') {
			// Prevents mobile scrolling and context menus during the hold
			if (e.cancelable) e.preventDefault()
		}

		// Set the timer
		timer = setTimeout(() => {
			callback(e)
		}, duration)
	}

	// Cancels the countdown if the user releases or moves away
	const cancel = (): void => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
	}

	// Mouse Events (Desktop)
	element.addEventListener('mousedown', start)
	element.addEventListener('mouseup', cancel)
	element.addEventListener('mouseleave', cancel)

	// Touch Events (Mobile)
	element.addEventListener('touchstart', start, { passive: false })
	element.addEventListener('touchend', cancel)
	element.addEventListener('touchcancel', cancel)

	// Return a cleanup function to prevent memory leaks if the element is removed
	return function cleanup(): void {
		element.removeEventListener('mousedown', start)
		element.removeEventListener('mouseup', cancel)
		element.removeEventListener('mouseleave', cancel)
		element.removeEventListener('touchstart', start)
		element.removeEventListener('touchend', cancel)
		element.removeEventListener('touchcancel', cancel)
	}
}
