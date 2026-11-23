import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { SystemProvider } from './context/SystemContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RoomDetail from './pages/RoomDetail'
import Sensors from './pages/Sensors'
import History from './pages/History'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SystemProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SystemProvider>
  </BrowserRouter>
)
