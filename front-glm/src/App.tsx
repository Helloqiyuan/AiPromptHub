import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import PromptDetailPage from './pages/PromptDetailPage'

function App() {
  return (
    <div className="min-h-screen bg-beige-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/prompt/:id" element={<PromptDetailPage />} />
      </Routes>
    </div>
  )
}

export default App
