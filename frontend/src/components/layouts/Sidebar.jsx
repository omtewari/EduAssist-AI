import { NavLink } from "react-router-dom";

const item = ({ isActive }) =>
  `block px-4 py-2 rounded-lg text-sm font-medium ${
    isActive
      ? "bg-indigo-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
  }`;

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-52 shrink-0 border-r border-gray-200 bg-gray-50/80 min-h-[calc(100vh-3.5rem)] p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Menu
      </p>
      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" className={item}>
          Documents
        </NavLink>
        <NavLink to="/upload" className={item}>
          New upload
        </NavLink>
        <NavLink to="/profile" className={item}>
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}
