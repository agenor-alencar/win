import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

export const AdminHeader: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Here you would typically clear authentication tokens
    console.log("Logging out...");
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Busca global..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-[#111827] transition-colors">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
            <div className="text-left">
              <div className="text-sm font-medium text-[#111827]">
                Admin User
              </div>
              <div className="text-xs text-gray-500">admin@win.com</div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <Link
                to="/admin/profile"
                onClick={() => setShowUserMenu(false)}
                className="block px-4 py-2 text-sm text-[#111827] hover:bg-gray-100 transition-colors"
              >
                Meu Perfil
              </Link>
              <Link
                to="/admin/settings"
                onClick={() => setShowUserMenu(false)}
                className="block px-4 py-2 text-sm text-[#111827] hover:bg-gray-100 transition-colors"
              >
                Configurações
              </Link>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
