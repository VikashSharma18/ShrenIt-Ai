import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../../pages/Login/AuthContext";
import logo from "../../assets/default.png";
import Logo from "/logo/logo/Logoo.png";

const Header = () => {
  const { student, admin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMobileOpen(!isMobileOpen);
    document.body.style.overflow = isMobileOpen ? "auto" : "hidden";
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Dynamic navigation items based on auth state
  const baseNavItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "About Us", path: "/aboutus" },
    { name: "FAQ", path: "/faq" },
    { name: "Admin", path: "/admin" },
  ];

  const authNavItem = admin
    ? { name: admin.name || "Admin", path: "/admin" } // Show admin's name
    : student
    ? { name: student.name || "Profile", path: "/profile" }
    : { name: "Login", path: "/login" };

  const navItems = [...baseNavItems, authNavItem];

  const handleScrollTo = (path) => {
    if (path.startsWith("/")) {
      // If the path is a route, navigate to it
      navigate(path);
    } else {
      // If the path is a section id, scroll to it
      const section = document.getElementById(path);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setIsMobileOpen(false); // Close mobile menu after navigation
      }
    }
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <NavLink to="/" className="logo">
          <div className="logo-icon">
            <img
              // src={logo}
              src={Logo}
              alt="Shrenit AI"
              classname="logo"
              style={{ width: "200px", maxHeight: "100px" }}
            />
          </div>
        </NavLink>

        <nav className={`nav-menu ${isMobileOpen ? "active" : ""}`}>
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activeSection === item.path.slice(1) ? "active" : ""
              }`}
              onClick={() =>
                handleScrollTo(
                  item.path.startsWith("/") ? item.path : item.path.slice(1)
                )
              }
            >
              {item.name}
            </button>
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
