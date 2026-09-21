import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";
import Logo from "../../pages/icons/logo.webp";
import UserIcon from "../../pages/icons/usuario2.svg";
import CloseIcon from "../../pages/icons/fechar.svg";
import { getUsuarioLogado, logout } from "../../services/auth";

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(() => getUsuarioLogado());
  const location = useLocation();
  const navigate = useNavigate();

  // Fecha o menu e relê a sessão ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
    setUsuario(getUsuarioLogado());
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

  const handleLogout = () => {
    logout();
    setUsuario(null);
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
    navigate("/");
  };

  // Primeiro nome para a saudação; tolera sessão sem nome (valor alterado à mão)
  const primeiroNome = usuario?.nome ? String(usuario.nome).split(" ")[0] : "usuário";

  const itensPublicos = [
    { path: "/", label: "Início" },
    { path: "/#como-funciona", label: "Como Funciona" },
    { path: "/loginForm", label: "Cadastre-se" },
  ];
  // Logado: "Cadastre-se" dá lugar a "Abrir app"
  const navItems = usuario
    ? [...itensPublicos.filter((item) => item.path !== "/loginForm"), { path: "/app", label: "Abrir app" }]
    : itensPublicos;

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
            {usuario ? (
              <li className="user-item">
                <img src={UserIcon} alt="" width="20" height="20" />
                <span>Olá, {primeiroNome}</span>
                <button type="button" className="logout-button" onClick={handleLogout}>
                  Sair
                </button>
              </li>
            ) : (
              <li className="login-item">
                <Link to="/entrar">
                  <img src={UserIcon} alt="Entrar" width="20" height="20" />
                  <span>Entrar</span>
                </Link>
              </li>
            )}
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
              {usuario ? (
                <li className="mobile-user">
                  <span className="mobile-login-text">Olá, {primeiroNome}</span>
                  <button type="button" className="logout-button" onClick={handleLogout}>
                    Sair
                  </button>
                </li>
              ) : (
                <li className="mobile-login">
                  <Link to="/entrar" onClick={toggleMenu}>
                    <img src={UserIcon} className="mobile-login-icon" alt="Entrar" width="24" height="24" />
                    <span className="mobile-login-text">Entrar</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
