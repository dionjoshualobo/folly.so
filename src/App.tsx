import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import PublicForm from './pages/PublicForm'
import Submissions from './pages/Submissions'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/forms" element={<Dashboard />} />
      <Route path="/editor/:formId" element={<Editor />} />
      <Route path="/r/:formId" element={<PublicForm />} />
      <Route path="/f/:formId" element={<PublicForm />} />
      <Route path="/forms/:formId/submissions" element={<Submissions />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}