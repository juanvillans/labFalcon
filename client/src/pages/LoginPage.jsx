import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";
import { authAPI } from "../services/api";
import labFalconLogo from "../assets/logoBlue.webp";
import lab from "../assets/lab.webp";
import secretariaLogo from "../assets/secretaria_logo.png";
import { Icon } from "@iconify/react";
import cintilloCorto from "../assets/cintilloCorto.png";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    let emailInput = document.querySelector("#email");
    emailInput?.focus();
  }, 300);
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Add state for showPassword
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

  const handleForgotPsw = async (e) => {
    if (!email) {
      showError("Por favor ingrese su correo electrónico");
      return;
    }
    try {
      await authAPI.forgotPassword(email);
      showSuccess("Se ha enviado un enlace para restablecer la contraseña");
    } catch (err) {
      showError(err.message);
    }
  };

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
      <div className="md:min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>Iniciar Sesión - LabFalcón</title>
      <div className="min-h-screen overflow-hidden relative  bg-gray-600 bg-cover bg-center">
        <img
          src={lab}
          alt="lab"
          className="absolute  left-0 w-full h-full object-cover "
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-color1 to-transparent opacity-10"></div>
        <div
          className="fadeInUp absolute w-[300px] md:min-w-[400px] md:w-[450px] pb-3 top-20 z-50 md:top-12 px-5 pt-4 md:pt-10 sm:pt-20 left-1/2 transform -translate-x-1/2 md:left-auto md:transform-none md:right-20 text-color1 md:p-16 rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="mx-auto bg-color1 fadeInUp-delay-1 fadeInUp   backdrop-blur-none w-16 h-16 md:w-20 md:h-20 flex items-center justify-center aspect-square rounded-full p-2.5 md:p-4">
            <img
              src={labFalconLogo}
              className="logo inline-block mx-auto  "
              alt="logo del sistema"
            />
          </div>
          <h1 className="text-lg md:text-2xl font-bold  mt-4 text-center ">
            BIENVENIDO A LABFALCON
          </h1>
          <p className="text-dark text-xs md:text-md text-center">
            Sistema de Laboratorio de la Secretaria de Salud de Falcón
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 mt-4 md:mt-10">
              <label className="block  text-sm  mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-color4 text-gray-800 px-2 py-2 text-sm sm:px-3 sm:py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative mb-1 ">
              <label className="block  text-sm  mb-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-color4  text-gray-800 px-2 py-2 text-sm sm:px-3 sm:py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              {showPassword ? (
                <Icon
                  onClick={() => setShowPassword(!showPassword)}
                  icon="majesticons:eye-line"
                  className=" w-5 h-5  absolute right-3 top-8 font-bold text-gray-900 cursor-pointer"
                />
              ) : (
                <Icon
                  onClick={() => setShowPassword(!showPassword)}
                  icon="mdi:eye-off-outline"
                  className=" w-5 h-5  absolute right-3 top-8 font-bold text-gray-900 cursor-pointer"
                />
              )}
            </div>
            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={handleForgotPsw}
                className="text-sm hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mb-4 md:mb-0 bg-color1 text-color4 font-bold py-2 px-4 rounded hover:border hover:border-color3 hover:bg-color1 hover:text-color3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "INGRESAR"}
            </button>
          </form>
        </div>
      </div>
      <header className="flex gap-1 md:gap-4 flex-col md:flex-row items-center px-10 text-color1 text-sm z-40 w-full relative md:absolute  top-0 text-center -100 py-2 lg:py-5">
        <img
          src={secretariaLogo}
          alt="secretariaLogo"
          className="w-12 h-12  aspect-square  "
        />
        <img
          src={cintilloCorto}
          alt=""
          className="max-w-[240px] h-min rounded-xl "
        />

      </header>
      <footer className="flex gap-1 flex-col md:flex-row items-center px-10 justify-between text-dark text-sm z-40 w-full relative md:absolute bottom-0 text-center -100 py-1">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} LabFalcon. Todos los derechos
          reservados.
        </p>
        <a
          href="https://www.linkedin.com/in/juan-francisco-villasmil-tovar-50a3a1161/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-100 text-xs opacity-65 cursor-pointer"
        >
          Desarrollado por Juan Villasmil
        </a>
      </footer>
    </>
  );
}
