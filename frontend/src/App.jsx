import React from 'react'
import { BrowserRouter,HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  )
}
