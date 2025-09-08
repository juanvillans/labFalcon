import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FeedbackProvider } from './context/FeedbackContext';
import ProtectedRoute from './components/auth/ProtectedRoute'
import PermissionGate from './components/auth/PermissionGate';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/dashboard/HomePage';
import ExamenesPage from './pages/dashboard/ExamenesPage';
import UsuariosPage from './pages/dashboard/UsuariosPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
import ExamResultsPage from './pages/ExamResultsPage';

function App() {
  // Get user from localStorage (instead of useAuth)

  return (
    <AuthProvider>
      <FeedbackProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/activar-cuenta" element={<ActivateAccountPage />} />
            <Route path="/results/:token" element={<ExamResultsPage />} />

            {/* Protected dashboard routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="examenes" element={<ExamenesPage />} />
              {/* Only show "usuarios" if user has permission */}
              <Route 
                path="usuarios" 
                element={
                  <PermissionGate requiredPermission="allow_handle_users">
                    <UsuariosPage />
                  </PermissionGate>
                } 
              />
              {/* Fallback route */}
            </Route>
          </Routes>
        </BrowserRouter>
      </FeedbackProvider>
    </AuthProvider>
  );
}

export default App;