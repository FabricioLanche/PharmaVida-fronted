import { Link } from 'react-router-dom'

export default function Home() {
	return (
		<div>
			<h1>Home</h1>
			<nav>
				<ul>
					<li><Link to="/product/1">Product Details (example)</Link></li>
					<li><Link to="/user/1">User Details (example)</Link></li>
					<li><Link to="/cart">Cart Details</Link></li>
					<li><Link to="/cart/transaction">Shop Transaction</Link></li>
					<li><Link to="/search">Product Search</Link></li>
					<li><Link to="/admin/products">Product Admin</Link></li>
					<li><Link to="/prescription">Prescription</Link></li>
					<li><Link to="/doctors">Doctors</Link></li>
					<li><Link to="/admin/users">Users Admin</Link></li>
					<li><Link to="/admin/shop">Shop Admin</Link></li>
				</ul>
			</nav>
		</div>
	)
}
