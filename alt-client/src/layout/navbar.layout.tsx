import './navbar.styles.scss'

const Navbar = () => {
	const active = window.location.pathname

	const buildButton = (text: string, path: string) => {
		const isActive = active === path
		return (
			<a href={path} className={isActive ? 'active' : ''}>
				{text}
			</a>
		)
	}

	return (
		<nav>
			{buildButton('Home', '/')}
			{buildButton('Admin', '/admin')}
		</nav>
	)
}

export default Navbar
