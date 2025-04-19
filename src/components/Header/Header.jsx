import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../pages/Login/AuthContext';

const Header = () => {
  const { student } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMobileOpen(!isMobileOpen);
    document.body.style.overflow = isMobileOpen ? 'auto' : 'hidden';
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic navigation items based on auth state
  const baseNavItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Blogs', path: '/blogs' },
  ];

  const authNavItem = student
    ? { name: student.name || 'Profile', path: '/profile' }
    : { name: 'Login', path: '/login' };

  const navItems = [...baseNavItems, authNavItem];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <NavLink to="/" className="logo">
          <div className="logo-icon">
            <div className="ai-particle"></div>
            <div className="ai-particle delay-1"></div>
            <div className="ai-particle delay-2"></div>
          </div>
          <span className="logo-text">EduAI Suite</span>
        </NavLink>

        <nav className={`nav-menu ${isMobileOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setIsMobileOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default Header;