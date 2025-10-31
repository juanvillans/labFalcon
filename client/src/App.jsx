import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FeedbackProvider } from './context/FeedbackContext';
import ProtectedRoute from './components/auth/ProtectedRoute'
import PermissionGate from './components/auth/PermissionGate';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginPage from './pages/LoginPage';
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const HomePage = lazy(() => import(/* webpackChunkName: "home" */ './pages/dashboard/HomePage'));
const ExamenesPage = lazy(() => import(/* webpackChunkName: "examenes" */ './pages/dashboard/ExamenesPage'));
import UsuariosPage from './pages/dashboard/UsuariosPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
const ExamResultsPage = lazy(() => import(/* webpackChunkName: "results" */ './pages/ExamResultsPage'));

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
  </div>
);

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
            <Route path="/olvide-contraseña?" element={<ActivateAccountPage />} />

            <Route path="/results/:token" element={
              <Suspense fallback={<PageLoader />}>
                <ExamResultsPage />
              </Suspense>
            } />

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
              <Route path="examenes" element={
                  <Suspense fallback={<PageLoader />}>
                    <ExamenesPage />
                  </Suspense>
                } 
                />
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
