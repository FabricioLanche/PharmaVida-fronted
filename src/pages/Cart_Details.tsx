import { Link } from 'react-router-dom'

export default function Cart_Details() {
	return (
		<div>
			<h1>Cart Details</h1>
			<Link to="/cart/transaction">Proceed to Shop Transaction</Link>
			<br />
			<Link to="/">Back to Home</Link>
		</div>
	)
}
