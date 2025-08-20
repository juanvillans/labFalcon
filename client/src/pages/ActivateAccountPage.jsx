import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useFeedback } from '../context/FeedbackContext';
import { Icon } from '@iconify/react';

export default function ActivateAccountPage() {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useFeedback();

  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  // Verify token on component mount
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        showError('Token de activación no proporcionado');
        setVerifying(false);
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.verifyInvitationToken(token);
        console.log(response.data)
        setUserData(response.data.user);
        setVerifying(false);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying token:', error);
        showError(error.message || 'Token inválido o expirado');
        setVerifying(false);
        setLoading(false);
      }
    }

    verifyToken();
  }, [token, showError]);

  // Validate password
  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await authAPI.activateAccount(token, password);
      showSuccess('Cuenta activada con éxito. Ahora puedes iniciar sesión.');
      navigate('/');
    } catch (error) {
      console.error('Error activating account:', error);
      showError(error.message || 'Error al activar la cuenta');
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error if token verification failed
  if (verifying || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Icon icon="heroicons:exclamation-triangle" className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">Enlace Inválido</h1>
            <p className="text-gray-600 mt-2">
              El enlace de activación es inválido o ha expirado. Por favor, contacta al administrador para solicitar un nuevo enlace.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 bg-color1 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Show activation form
  return (
    <>
      <title>Activar Cuenta - LabFalcón</title>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Icon icon="heroicons:user" className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800">Activar Cuenta</h1>
            <p className="text-gray-600 mt-2">
              !Hola {userData.name}!, establece tu contraseña para activar tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={userData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-color1 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Activando...' : 'Activar Cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
