import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Usuarios from './pages/Usuarios.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Usuarios />
  </StrictMode>,
)
