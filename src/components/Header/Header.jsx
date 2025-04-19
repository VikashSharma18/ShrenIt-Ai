import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileOpen(!isMobileOpen);
    document.body.style.overflow = isMobileOpen ? 'auto' : 'hidden';
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Login', path: '/login' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <NavLink to="/" className="logo">
          <span className="logo-text">EduAI Suite</span>
          <div className="logo-pulse"></div>
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