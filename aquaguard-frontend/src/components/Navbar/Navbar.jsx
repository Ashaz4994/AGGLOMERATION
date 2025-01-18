import React from 'react'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav>
        <div className='logo'>
          <div className='logo1'>AquaGuard</div>
          <div className='logo2'>AquaGuard</div>
        </div>
        <ul>
            <li>Home</li>
            <li>Visualize Trends</li>
        </ul>
    </nav>
  )
}

export default Navbar
