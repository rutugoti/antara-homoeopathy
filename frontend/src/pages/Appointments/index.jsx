import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { cn } from '../../lib/utils';

export default function Appointments() {
  const location = useLocation();

  const tabs = [
    { path: '/appointments/details', label: 'Appointment Details' },
    { path: '/appointments/book', label: 'Book Appointment' },
    { path: '/appointments/settings', label: 'Settings' },
  ];

  return (
    <PageWrapper title="Appointment">
      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)] overflow-hidden">
        <div className="flex border-b border-[var(--color-border-main)] bg-[#f8fafc]">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => cn(
                "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                isActive 
                  ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-white" 
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)] hover:bg-slate-50"
              )}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </PageWrapper>
  );
}
