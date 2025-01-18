import React from 'react'
import './Navbar.css'
import { Link } from 'react-router-dom'


const Navbar = () => {
  return (
    <nav>
        <div className='logo'>
          <div className='logo1'>AquaGuard</div>
          <div className='logo2'>AquaGuard</div>
        </div>
        <ul>
            <li><Link to='/'> Home</Link></li>
            <li><Link to='/visualize'>Visualize Trends</Link></li>
        </ul>
    </nav>
  )
}

export default Navbar
