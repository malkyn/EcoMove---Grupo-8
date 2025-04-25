import React from "react";
import "./Header.css";
import Logo from "./icons/folha.svg";
function Header() {
  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <img src={Logo} className="icon-img" title="EcoMove Logo" />

          <span className="logo-text">Eco Move</span>
        </div>

        <nav className="menu">
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
              <img src="" alt="Ícone de usuário" className="icon-user" />
            </li>
          </ul>
        </nav>
      </div>

      <div className="header-bottom">
        <img src="" alt="Voltar" className="icon-back" />
        <a href="" className="back-link">
          Voltar para o início
        </a>
      </div>
    </header>
  );
}

export default Header;
