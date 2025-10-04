import { Link } from 'react-router-dom'

export default function Prescription() {
	return (
		<div>
			<h1>Prescription</h1>
			<Link to="/prescription/1">View Prescription Details (example)</Link>
			<br />
			<Link to="/">Back to Home</Link>
		</div>
	)
}
