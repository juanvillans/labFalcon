import labFalconLogo from "../../assets/logoRed.png";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

import { NavLink, Link } from "react-router-dom";
import { Icon } from "@iconify/react";

const links = [
  {
    permission: true,
    name: "Inicio",
    href: "/dashboard",
    icon: "hugeicons:home-09",
  },
  {
    permission: true,
    name: "Exámenes",
    href: "/dashboard/examenes",
    icon: "hugeicons:labs",
  },
  {
    permission: "allow_handle_users",
    name: "Usuarios",
    href: "/dashboard/usuarios",
    icon: "solar:user-linear",
  },
];

export default function SideNav(props) {
  const { logout } = useAuth();
  function handleLogout() {
    logout();
  }
  console.log(props.isSidebarOpen);

  const { user } = useAuth();

  return (
    <nav
      className="flex bg-color1 h-full flex-col px-3 pr-1 py-4 md:px-4"
      onMouseEnter={() => props.handleSidebarToggle()}
      onMouseLeave={() => props.handleSidebarToggle()}
    >
      <Link
        className={`mb-4 font-exo2 flex h-20 items-end justify-end rounded-md bg-white bg-opacity-5  md:h-28 ${props.isSidebarOpen ? 'p-4' : 'p-1'}`}
        href="/"
      >
        <div className="w-32  text-white md:w-40 flex flex-row justify-between items-end">
          <img
            src={labFalconLogo}
            className="logo w-12"
            alt="logo del sistema"
          />
          {props.isSidebarOpen ? (
            <p className={` relative top-1.5 font-semibold self-end`}>
              LabFalcón
            </p>
          ) : null}
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {links.map((eachLink) => {
          if (eachLink.permission === true || user?.[eachLink?.permission]) {
            return (
              <NavLink
                to={eachLink.href}
                end
                key={eachLink.href}
                className={({ isActive }) =>
                  `flex h-[48px]  grow items-center relative justify-center gap-2  text-sm font-medium hover:bg-sky-100 md:flex-none md:justify-start pl-2 ${
                    isActive
                      ? "bg-gray-50 activeLink text-color1 rounded-l-2xl"
                      : "text-gray-50"
                  }`
                }
              >
                <Icon icon={eachLink.icon} width={24} height={24} />
                {props.isSidebarOpen ? eachLink.name : null}
              </NavLink>
            );
          }
        })}
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <div>
          <p className="text-xs text-opacity-55 text-white ml-2.5">
            {props.isSidebarOpen ? user?.first_name : null}
          </p>
          <button
            onClick={handleLogout}
            className="flex text-white text-opacity-50 h-[48px] w-full grow items-center justify-center gap-2 rounded-md  text-sm font-medium hover:bg-sky-100 hover:text-white md:flex-none md:justify-start md:p-2 md:px-1"
          >
            <Icon icon="tabler:logout" width="24" height="24" />
            {props.isSidebarOpen ? (
              <span className="sr-only">Cerrar sesión</span>
            ) : null}
          </button>
        </div>
      </div>
    </nav>
  );
}
