import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./NavBar.css";
import Logo from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/logo.svg";
import UserIcon from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/usuario2.svg";

function NavBar() {
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShrink(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeMenuOnResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", closeMenuOnResize);
    return () => window.removeEventListener("resize", closeMenuOnResize);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`header ${shrink ? "shrink" : ""}`} role="banner">
      <div className="header-container">
        <div className="logo">
          <img
            src={Logo}
            className="icon-img-navbar"
            alt="EcoMove Logo"
            width="40"
            height="40"
            loading="lazy"
          />
          <span className="logo-text">Eco Move</span>
        </div>

        <nav
          className={`menu ${menuOpen ? "open" : ""}`}
          aria-label="Menu principal"
        >
          <ul>
            <li>
              <a
                href="/"
                aria-current={location.pathname === "/" ? "page" : undefined}
              >
                Início
              </a>
            </li>
            <li>
              <a
                href="/como-funciona"
                aria-current={
                  location.pathname === "/como-funciona" ? "page" : undefined
                }
              >
                Como Funciona
              </a>
            </li>
            <li>
              <a
                href="/Usuarios"
                aria-current={
                  location.pathname === "/cadastro" ? "page" : undefined
                }
              >
                Cadastre-se
              </a>
            </li>
            <li className="menu-login">
              <a
                href="/login"
                className="login-link"
                aria-current={
                  location.pathname === "/login" ? "page" : undefined
                }
              >
                <img
                  src={UserIcon}
                  alt="Ícone de usuário"
                  className="user-icon"
                  width="20"
                  height="20"
                />
                <span>Entrar</span>
              </a>
            </li>
          </ul>
        </nav>

        <div
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Menu mobile"
          aria-expanded={menuOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </header>
  );
}

export default NavBar;