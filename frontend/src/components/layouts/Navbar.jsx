import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import ReadingProgressTracker from "../ReadingProgressTracker";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive
      ? "bg-indigo-100 text-indigo-800"
      : "text-gray-600 hover:bg-gray-100"
  }`;

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/dashboard"
            className="font-bold text-indigo-700 text-lg tracking-tight"
          >
            EduAssistAI
          </Link>
          <ReadingProgressTracker />
        </div>

        <nav className="flex items-center gap-1 flex-1 justify-center min-w-0">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/upload" className={linkClass}>
            Upload
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {user?.username && (
            <span className="text-sm text-gray-500 hidden sm:inline max-w-[120px] truncate">
              {user.username}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="text-sm font-medium text-gray-600 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
