import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./NavBar.css";
import Logo from "../../pages/icons/logo.svg";
import UserIcon from "../../pages/icons/usuario2.svg";
import CloseIcon from "../../pages/icons/fechar.svg";

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Fecha o menu ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Efeito de scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha o menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = isMenuOpen ? "auto" : "hidden";
  };

  const navItems = [
    { path: "/", label: "Início" },
    { path: "/como-funciona", label: "Como Funciona" },
    { path: "/loginForm", label: "Cadastre-se" },
  ];

  return (
    <header className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          <img src={Logo} alt="EcoMove" width="40" height="40" />
          <span>Eco Move</span>
        </a>

        {/* Menu Desktop */}
        <nav className="navbar-desktop">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className={location.pathname === item.path ? "active" : ""}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="login-item">
              <a href="/Entrar">
                <img src={UserIcon} alt="Entrar" width="20" height="20" />
                <span>Entrar</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Menu Mobile */}
        <button
          className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMenuOpen ? (
            <img src={CloseIcon} alt="Fechar" width="24" height="24" />
          ) : (
            <>
              <span className="menu-bar"></span>
              <span className="menu-bar"></span>
              <span className="menu-bar"></span>
            </>
          )}
        </button>

        {/* Overlay e Menu Mobile */}
        <div className={`mobile-menu-wrapper ${isMenuOpen ? "open" : ""}`}>
          <div className="mobile-overlay" onClick={toggleMenu}></div>
          <nav className="mobile-menu">
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className={location.pathname === item.path ? "active" : ""}
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="mobile-login">
                <a href="/Entrar" onClick={toggleMenu}>
                  <img src={UserIcon} className="mobile-login-icon" alt="Entrar" width="24" height="24" />
                  <span className="mobile-login-text">Entrar</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
