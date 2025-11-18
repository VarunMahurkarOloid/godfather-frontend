import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

function Navbar({ onLogout, isAdmin }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b-2 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="mafia-title text-xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              The Godfather
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link
              to="/"
              className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition"
              style={{
                backgroundColor: isActive('/') ? 'var(--accent-primary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/')) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/')) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Dashboard
            </Link>

            <Link
              to="/missions"
              className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition"
              style={{
                backgroundColor: isActive('/missions') ? 'var(--accent-primary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/missions')) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/missions')) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Missions
            </Link>

            <Link
              to="/trade"
              className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition"
              style={{
                backgroundColor: isActive('/trade') ? 'var(--accent-primary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/trade')) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/trade')) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Market
            </Link>

            <Link
              to="/family"
              className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition"
              style={{
                backgroundColor: isActive('/family') ? 'var(--accent-primary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/family')) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/family')) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Family
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition"
                style={{
                  backgroundColor: isActive('/admin') ? 'var(--accent-primary)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/admin')) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/admin')) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Admin
              </Link>
            )}

            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>

            <button
              onClick={onLogout}
              className="ml-2 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition"
              style={{ color: 'var(--accent-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-lg text-base font-medium transition"
                style={{
                  backgroundColor: isActive('/') ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                Dashboard
              </Link>

              <Link
                to="/missions"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-lg text-base font-medium transition"
                style={{
                  backgroundColor: isActive('/missions') ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                Missions
              </Link>

              <Link
                to="/trade"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-lg text-base font-medium transition"
                style={{
                  backgroundColor: isActive('/trade') ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                Black Market
              </Link>

              <Link
                to="/family"
                onClick={closeMobileMenu}
                className="px-4 py-3 rounded-lg text-base font-medium transition"
                style={{
                  backgroundColor: isActive('/family') ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                Family
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-lg text-base font-medium transition"
                  style={{
                    backgroundColor: isActive('/admin') ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Admin
                </Link>
              )}

              <div className="flex items-center justify-between px-4 py-3">
                <span style={{ color: 'var(--text-primary)' }} className="text-base font-medium">
                  Theme
                </span>
                <ThemeToggle />
              </div>

              <button
                onClick={() => {
                  closeMobileMenu();
                  onLogout();
                }}
                className="px-4 py-3 rounded-lg text-base font-medium transition text-left"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-secondary)' }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
