import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0A1F44',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: {
              primary: '#C8A951',
              secondary: '#0A1F44',
            },
          },
        }}
      />
      <App />
    </BrowserRouter>
  </StrictMode>
)
