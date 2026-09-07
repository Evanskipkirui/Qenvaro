// ============================================================
// MAIN LAYOUT
// ============================================================
// A layout is a wrapper component that defines the common
// structure shared across multiple pages.
//
// Instead of putting Navbar + Footer in every page component,
// we put them here once. Then every page just renders inside
// the <main> tag via React Router's <Outlet />.
//
// <Outlet /> is a placeholder — React Router fills it with
// whatever page matches the current URL.
// ============================================================

import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        {/* The current page renders here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
