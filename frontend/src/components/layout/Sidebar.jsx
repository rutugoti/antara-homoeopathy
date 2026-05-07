import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileText, BookOpen,
  CalendarDays, FlaskConical, Building2, Phone, Bell, Image, BookMarked, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import logoUrl from '../../assets/logo.svg';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Patient', icon: Users },
  {
    path: '/appointments', label: 'Appointment', icon: Calendar,
    subItems: [
      { path: '/appointments/details', label: 'Appointment Details' },
      { path: '/appointments/book', label: 'Book Appointment' },
      { path: '/appointments/settings', label: 'Settings' },
    ]
  },
  { path: '/prescriptions', label: 'Prescription', icon: FileText },
  { path: '/materia-medica', label: 'Materia Medica', icon: BookOpen },
  { path: '/events', label: 'Event', icon: CalendarDays },
  { path: '/research-dev', label: 'R&D', icon: FlaskConical },
  { path: '/clinics', label: 'Clinic Information', icon: Building2 },
  { path: '/contact', label: 'Contact Us', icon: Phone },
  { path: '/subscribers', label: 'Subscribers', icon: Bell },
  { path: '/gallery', label: 'Gallery', icon: Image },
  { path: '/book-management', label: 'Book Management', icon: BookMarked },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRouteActive = (path) => {
    if (path === '/appointments') {
      return location.pathname.startsWith('/appointments');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-60 bg-[#1a2d5a] flex flex-col transition-all duration-300">
      <div className="flex flex-col items-center justify-center h-40 shrink-0 border-b border-[#2c4a8e]">
        <div className="bg-white rounded-full p-2 w-24 h-24 flex items-center justify-center overflow-hidden">
          <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.path);

            return (
              <div key={item.path}>
                <NavLink
                  to={item.subItems ? item.subItems[0].path : item.path}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-white transition-colors",
                    active ? "bg-[#2c4a8e] border-l-4 border-[#4a9d8e]" : "hover:bg-[#2c4a8e] border-l-4 border-transparent"
                  )}
                >
                  <Icon className={cn("mr-3 h-5 w-5 shrink-0", active ? "text-white" : "text-slate-300 group-hover:text-white")} />
                  {item.label}
                </NavLink>
                {item.subItems && active && (
                  <div className="mt-1 space-y-1 pl-11">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) => cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 transition-colors",
                          isActive ? "text-white font-semibold" : "hover:text-white hover:bg-[#2c4a8e]"
                        )}
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-[#2c4a8e]">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-[#2c4a8e] transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 shrink-0 text-slate-300 group-hover:text-white" />
          Logout
        </button>
      </div>
    </div>
  );
}
