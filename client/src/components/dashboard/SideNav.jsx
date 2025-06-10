
import  labFalconLogo  from "../../assets/logoRed.png";
import { NavLink, Link } from "react-router-dom";


export default function SideNav() {
  return (
    <nav className="flex bg-color1 h-full flex-col px-3 py-4 md:px-4">
      <Link
        className="mb-4 flex h-20 items-end justify-end rounded-md bg-white bg-opacity-5 p-4 md:h-28"
        href="/"
      >
        <div className="w-32  text-white md:w-40 flex flex-row justify-between items-end">
        <img
              src={labFalconLogo}
              className="logo w-6"
              alt="logo del sistema"
            />
          <p className={` relative top-1.5 font-semibold self-end`}>
            LabFalcón
          </p>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
      <NavLink>
        examenes
      </NavLink>
        <div className="hidden h-auto w-full grow rounded-md md:block"></div>
        <form>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
          
            <div className="hidden md:block">Cerrar sesión</div>
          </button>
        </form>
      </div>
    </nav>
  );
}
