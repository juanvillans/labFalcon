import { Outlet } from "react-router-dom";
import Sidebar from "./SideNav";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-color1 ">
      <div className="w-full flex-none md:w-48">
        <Sidebar />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 md:pt-8 bg-gray-50 rounded-2xl">
        <Outlet />
      </div>
    </div>
  );
}
