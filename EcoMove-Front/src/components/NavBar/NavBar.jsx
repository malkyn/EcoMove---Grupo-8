import React, { useState, useEffect } from "react";
import "./NavBar.css";
import Logo from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/folha.svg";

function NavBar() {
  const [shrink, setShrink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShrink(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`header ${shrink ? "shrink" : ""}`}>
      <div className="header-container">
        <div className="logo">
          <img
            src={Logo}
            className="icon-img"
            title="EcoMove Logo"
            alt="EcoMove Logo"
          />
          <span className="logo-text">Eco Move</span>
        </div>

        <nav className={`menu ${menuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <a href="">Início</a>
            </li>
            <li>
              <a href="">Como Funciona</a>
            </li>
            <li>
              <a href="">Cadastre-se</a>
            </li>
            <li className="menu-login">
              <a href="">Entrar</a>
            </li>
          </ul>
        </nav>

        <div className="menu-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
