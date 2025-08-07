import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";
import { authAPI } from "../services/api";
import labFalconLogo from "../assets/logoRed.png";
import lab from "../assets/lab.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useFeedback();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the authAPI.login method instead of fetch
      const data = await authAPI.login({ email, password });

      // Login successful
      login(data.data.user, data.data.token);
      navigate("/dashboard");
    } catch (err) {
      showError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen flex items-center justify-end pr-4 md:pr-10 bg-gray-600 bg-cover bg-center">
      <img src={lab} alt="lab" className="absolute top-0 left-0 w-full h-full object-cover" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-color1 to-transparent opacity-50"></div>
      <div className="relative  loginFormContainer bg-color1 h- text-gray-50 p-8 rounded-lg  shadow-2xl  w-fit">
        
        <img src={labFalconLogo} className="logo w-16 mx-auto" alt="logo del sistema" />
        <h1 className="text-2xl font-bold mb-6 text-center">LabFalcon Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-200 text-sm  mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-200 text-sm  mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-color4 text-color1 font-bold py-2 px-4 rounded hover:bg-color1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
      <footer className="text-gray-300 text-sm text-center bg-color1 py-3">
        <p className="">
          &copy; {new Date().getFullYear()} LabFalcon. Todos los derechos
          reservados.
        </p>
        <small className="opacity-80 mt-1 block">
          Contacta con los desarrolladores:{" "}
          <a href="mailto:juanvillasmil@gmail.com" className="text-blue-100">juanvillasmil@gmail.com</a>
        </small>
      </footer>
    </>
  );
}
