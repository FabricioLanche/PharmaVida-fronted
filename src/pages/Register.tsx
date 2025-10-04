import { Link } from 'react-router-dom'

export default function Register() {
	return (
		<div>
			<h1>Register</h1>
			<Link to="/login">Login</Link>
			<br />
			<Link to="/">Back to Home</Link>
		</div>
	)
}
