import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex max-w-6xl mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
