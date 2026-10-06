import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/fonts'
import './styles/base.css'
import './styles/ui.css'
import './styles/app.css'
import './styles/shoot.css'
import './styles/edit.css'
import './styles/decorate.css'
import './styles/save.css'
import './styles/home.css'
import './store/customFrames'
import { useLang } from './i18n'
import App from './App.tsx'

const syncLang = () => {
  document.documentElement.lang = useLang.getState().lang
}
syncLang()
useLang.subscribe(syncLang)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
