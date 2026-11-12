import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { iniciarPwa } from './services/pwa'

// Antes de montar: captura o evento de instalação e registra o service worker
iniciarPwa()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
