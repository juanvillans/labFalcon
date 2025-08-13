import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";
import { authAPI } from "../services/api";
import labFalconLogo from "../assets/logoRed.png";
import lab from "../assets/lab.jpg";
import secretariaLogo from "../assets/secretaria_logo.png";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
 
    let emailInput = document.querySelector("#email");
    emailInput.focus()
  }, 300);
});

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
      <div className="min-h-screen overflow-hidden relative flex items-center justify-end  bg-gray-600 bg-cover bg-center">
        <img
          src={lab}
          alt="lab"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-color1 to-transparent opacity-50"></div>
        <div className="bg-black bg-opacity-20 z-50 absolute top-0 left-0 w-full h-full p-10">
          <img
            src={secretariaLogo}
            alt="secretariaLogo"
            className="w-24 mr-auto"
          />
          <h1 className="text-white mt-7 w-2/3 max-w-[800px] text-5xl md:text-6xl lg:text-8xl font-semibold">Sistema de Laboratorio de la Secretaria de Salud de Falcón</h1>
        </div>
        <div className="absolute md:min-w-[400px] z-50 top-6 pt-20 right-10 loginFormContainer  bg-color1 h-[94%] text-gray-50 p-8 rounded-lg  shadow-2xl ">
          <img
            src={labFalconLogo}
            className="logo w-16 mx-auto"
            alt="logo del sistema"
          />
          <h1 className="text-2xl font-bold mb-6 text-center">
            LabFalcon Login
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 mt-10">
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
                Contraseña
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
              className="w-full bg-color4 text-color1 font-bold py-2 px-4 rounded hover:border hover:border-color3 hover:bg-color1 hover:text-color3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
        <div className="gradient-bg absolute w-screen top-0 left-0 bg-opacity-45 opacity-80 z-10">
          <svg xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="goo">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="10"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                  result="goo"
                />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>
          <div className="gradients-container">
            <div className="g1"></div>
            <div className="g2"></div>
            <div className="g3"></div>
            <div className="g4"></div>
            <div className="g5"></div>
            <div className="interactive"></div>
          </div>
        </div>
      </div>
      <footer className="text-color1 text-sm text-center bg-color4 py-3">
        <p className="">
          &copy; {new Date().getFullYear()} LabFalcon. Todos los derechos
          reservados.
        </p>
        <small className="opacity-80 mt-1 block">
          Contacta con los desarrolladores:{" "}
          <a href="mailto:juanvillasmil@gmail.com" className="">
            juanvillasmil@gmail.com
          </a>
        </small>
      </footer>
    </>
  );
}
