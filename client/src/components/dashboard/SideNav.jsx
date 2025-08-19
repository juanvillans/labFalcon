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

  const { user } = useAuth();

  return (
    <nav
      className="flex w-full bg-color1 h-full flex-col px-3 pr-1 py-1 md:py-4 md:px-4"
      onMouseEnter={() => props.handleSidebarToggle()}
      onMouseLeave={() => props.handleSidebarToggle()}
    >
      <Link
        className={`duration-150 hidden  mb-4 font-exo2 md:flex h-20 items-end justify-end rounded-md bg-white bg-opacity-5   md:h-28 ${props.isSidebarOpen ? 'p-4' : 'p-1'}`}
        href="/"
      >
        <div className="w-32 relative duration-150 text-white md:w-40 flex flex-row justify-between items-end">
          <img
            src={labFalconLogo}
            className="logo w-12 duration-150"
            alt="logo del sistema"
          />
          
            <p className={ props.isSidebarOpen ? "block duration-300  absolute -bottom-1 right-1 font-semibold self-end opacity-100" : "opacity-0 absolute"}>
              LabFalcón
            </p>
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
                  `flex h-[48px] hover:text-color3 grow items-center relative justify-between gap-2  text-sm font-medium hover:bg-sky-100 md:flex-none md:justify-between pl-2 ${
                    isActive
                      ? "bg-gray-50 activeLink text-color1 rounded-2xl md:rounded-none  md:rounded-l-2xl"
                      : "text-gray-50"
                  }`
                }
              >
                <div className="grid grid-cols-12  items-center">
                    <Icon className={` col-span-3 z-10`} icon={eachLink.icon} width={24} height={24} />
                    <span className={props.isSidebarOpen ? "opacity-100" : "opacity-0" + " duration-200 z-0"}>
                      {eachLink.name}
                    </span>

                </div>
              </NavLink>
            );
          }
        })}
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <div className="grid grid-cols-12 gap-2 ">
        
        
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="col-span-3 flex text-white text-opacity-50 h-[48px] w-full grow items-center justify-center gap-2 rounded-md  text-sm font-medium hover:bg-sky-100 hover:text-white md:flex-none md:justify-start md:p-2 md:px-1"
          >
            <Icon icon="tabler:logout" width="24" height="24" />
            {props.isSidebarOpen ? (
              <span className="sr-only">Cerrar sesión</span>
            ) : null}
          </button>
          <p className="text-xs col-auto text-opacity-55  text-white ">
            {props.isSidebarOpen ? user?.first_name : null}
          </p>
        </div>
      </div>
    </nav>
  );
}
