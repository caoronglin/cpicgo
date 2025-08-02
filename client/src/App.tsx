import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Gallery from './pages/Gallery'
import Settings from './pages/Settings'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App