import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app.tsx'

import './index.scss'
import 'material-symbols'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)
