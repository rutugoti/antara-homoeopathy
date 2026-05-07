import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SplashScreen } from '../shared/SplashScreen';

export function AppLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <div className="min-h-screen bg-[var(--color-bg-light)]">
        <Sidebar />
        <Navbar />
        <main className="pl-60 pt-14">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
