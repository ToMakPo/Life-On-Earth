import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { useLife } from './store/lifeforms'

import MainPage from './pages/main/main.page'
import AdminPage from './pages/admin/admin.page'
import Navbar from './layout/navbar.layout'

function App() {
	const fetchLifeforms = useLife((state) => state.fetchLifeforms)

	useEffect(() => {
		fetchLifeforms()
	}, [])

	return (
		<Router>
			<Navbar />
			
			<Routes>
				{/* Main Application View */}
				<Route path='/' element={<MainPage />} />

				{/* Administration View */}
				<Route path='/admin' element={<AdminPage />} />

				{/* Fallback to redirect any unknown paths to main */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Router>
	)
}

export default App
