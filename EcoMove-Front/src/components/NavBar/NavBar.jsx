import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";
import Logo from "../../pages/icons/logo.webp";
import { getUsuarioLogado, logout } from "../../services/auth";
import { IconeSair, IconeUsuario } from "../Icones";

// Seções da landing. Como o href leva a "/#...", funciona de qualquer página.
const secoes = [
  { hash: "#funcionalidades", label: "Vantagens" },
  { hash: "#modos", label: "Carona ou corrida" },
  { hash: "#como-funciona", label: "Como funciona" },
  { hash: "#perguntas", label: "Perguntas" },
];

function NavBar() {
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState(() => getUsuarioLogado());
  const location = useLocation();
  const navigate = useNavigate();

  // Fecha o menu e relê a sessão ao mudar de rota
  useEffect(() => {
    setMenuAberto(false);
    setUsuario(getUsuarioLogado());
  }, [location]);

  // Sombra na barra depois que a página rola
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Com o menu do celular aberto: trava a rolagem do fundo e fecha com Esc
  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    if (!menuAberto) return undefined;
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") setMenuAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  // Fecha o menu ao alargar a janela para o layout de desktop
  useEffect(() => {
    const aoRedimensionar = () => {
      if (window.innerWidth > 900) setMenuAberto(false);
    };
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

  const fecharMenu = () => setMenuAberto(false);

  const sair = () => {
    logout();
    setUsuario(null);
    setMenuAberto(false);
    navigate("/");
  };

  // Primeiro nome para a saudação; tolera sessão sem nome (valor alterado à mão)
  const primeiroNome = usuario?.nome ? String(usuario.nome).split(" ")[0] : "usuário";
  const naLanding = location.pathname === "/";
  const estaAtiva = (secao) => naLanding && location.hash === secao.hash;

  const linksSecoes = secoes.map((secao) => (
    <li key={secao.hash}>
      <a href={`/${secao.hash}`} className={estaAtiva(secao) ? "ativo" : ""} onClick={fecharMenu}>
        {secao.label}
      </a>
    </li>
  ));

  return (
    <header className={`navbar ${rolou ? "navbar-rolada" : ""} ${menuAberto ? "navbar-aberta" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={fecharMenu}>
          <img src={Logo} alt="" width="36" height="36" />
          <span>
            Eco<strong>Move</strong>
          </span>
        </Link>

        {/* Desktop: seções no centro, ações à direita */}
        <nav className="navbar-links" aria-label="Seções do site">
          <ul>{linksSecoes}</ul>
        </nav>

        <div className="navbar-acoes">
          {usuario ? (
            <>
              <span className="navbar-usuario">
                <IconeUsuario tamanho={18} /> Olá, {primeiroNome}
              </span>
              <Link to="/app" className="navbar-btn navbar-btn-cheio">
                Abrir o app
              </Link>
              <button type="button" className="navbar-btn navbar-btn-fantasma" onClick={sair}>
                <IconeSair tamanho={18} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/entrar"
                className={`navbar-btn navbar-btn-fantasma ${location.pathname === "/entrar" ? "ativo" : ""}`}
              >
                Entrar
              </Link>
              <Link to="/loginForm" className="navbar-btn navbar-btn-cheio">
                Criar conta
              </Link>
            </>
          )}
        </div>

        {/* Celular: botão hambúrguer que vira um X */}
        <button
          type="button"
          className="navbar-hamburguer"
          aria-expanded={menuAberto}
          aria-controls="menu-celular"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Celular: folha que desce abaixo da barra */}
      <div className={`navbar-celular ${menuAberto ? "aberto" : ""}`} id="menu-celular">
        <div className="navbar-celular-fundo" onClick={fecharMenu} aria-hidden="true" />
        <nav className="navbar-celular-folha" aria-label="Menu">
          <ul>{linksSecoes}</ul>
          <div className="navbar-celular-acoes">
            {usuario ? (
              <>
                <span className="navbar-celular-usuario">
                  <IconeUsuario tamanho={18} /> Olá, {primeiroNome}
                </span>
                <Link to="/app" className="navbar-btn navbar-btn-cheio" onClick={fecharMenu}>
                  Abrir o app
                </Link>
                <button type="button" className="navbar-btn navbar-btn-fantasma" onClick={sair}>
                  <IconeSair tamanho={18} /> Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/loginForm" className="navbar-btn navbar-btn-cheio" onClick={fecharMenu}>
                  Criar conta grátis
                </Link>
                <Link to="/entrar" className="navbar-btn navbar-btn-fantasma" onClick={fecharMenu}>
                  Já tenho conta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default NavBar;
