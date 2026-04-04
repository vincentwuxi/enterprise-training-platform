import React from 'react';
import { Outlet } from 'react-router-dom';
import PlatformNavbar from './PlatformNavbar';
import './PlatformLayout.css';

export default function PlatformLayout() {
  return (
    <div className="platform-layout">
      <PlatformNavbar />
      <main className="platform-main">
        <Outlet />
      </main>
    </div>
  );
}
