import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  
  return (
    <div className="w-64 bg-blue-800 text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">LabFalcon</h1>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) => 
                `block p-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/examinations" 
              className={({ isActive }) => 
                `block p-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
              }
            >
              Examinations
            </NavLink>
          </li>
          {user?.allow_handle_users && (
            <li>
              <NavLink 
                to="/dashboard/users" 
                className={({ isActive }) => 
                  `block p-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-blue-700'}`
                }
              >
                Users
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}