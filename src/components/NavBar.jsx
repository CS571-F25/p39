import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavBar() {
  const linkClass = ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">Ranker.io</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink to="/" className={linkClass} end>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/tutorial" className={linkClass}>Tutorial</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/datasets" className={linkClass}>Datasets</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
