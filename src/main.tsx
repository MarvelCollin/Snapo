import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts'
import './index.css'
import './styles/ui.css'
import './styles/app.css'
import './styles/shoot.css'
import './styles/decorate.css'
import './styles/save.css'
import './styles/home.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
