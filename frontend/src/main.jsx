import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoadingBarContainer } from "react-top-loading-bar";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingBarContainer>
        <App />
      </LoadingBarContainer>
    </BrowserRouter>
  </StrictMode>,
)
