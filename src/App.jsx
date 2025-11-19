import React from 'react'
import './App.css'
import NavBar from './components/NavBar'
import { Routes, Route } from 'react-router-dom'
import Home from './screens/Home'
import Tutorial from './screens/Tutorial'
import Datasets from './screens/Datasets'

function App() {
  return (
    <>
      <NavBar />
      <div className="app-inner">
        <Routes>
          <Route path="*" element={<Home />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/datasets" element={<Datasets />} />
        </Routes>
      </div>
    </>
  )
}

export default App
