import labFalconLogo from "../../assets/logoRed.png";
import { useAuth } from '../../context/AuthContext';

import { NavLink, Link } from "react-router-dom";
import { Icon } from "@iconify/react"; 

const links = [
  { name: 'Inicio', href: '/dashboard', icon: "hugeicons:home-09" },
  {
    name: 'Exámenes',
    href: '/dashboard/examenes',
    icon: "hugeicons:labs",
  },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: "solar:user-linear" },
];

export default function SideNav() {

  const { user } = useAuth();

  return (
    <nav className="flex bg-color1 h-full flex-col px-3 py-4 md:px-4">
      <Link
        className="mb-4 font-exo2 flex h-20 items-end justify-end rounded-md bg-white bg-opacity-5 p-4 md:h-28"
        href="/"
      >
        <div className="w-32  text-white md:w-40 flex flex-row justify-between items-end">
          <img
            src={labFalconLogo}
            className="logo w-12"
            alt="logo del sistema"
          />
          <p className={` relative top-1.5 font-semibold self-end`}>
            LabFalcón
          </p>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {links.map(eachLink => {
          return (
          <NavLink
            to={eachLink.href}
            end 
            key={eachLink.href}
            className={({ isActive }) =>
              `flex h-[48px]  grow items-center relative justify-center gap-2   p-3 text-sm font-medium hover:bg-sky-100 md:flex-none md:justify-start md:p-2 md:px-3 ${
                isActive
                  ? "bg-gray-50 activeLink text-color1 rounded-l-2xl"
                  : "text-gray-50"
              }`
            }
          >
            <Icon icon={eachLink.icon} width="24" height="24" />
            {eachLink.name}
          </NavLink>

          )
        })}
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <form>
          <p>{user?.name}</p>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <div className="hidden md:block">Cerrar sesión</div>
          </button>
        </form>
      </div>
    </nav>
  );
}
