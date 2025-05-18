import React from "react";
import "./footer.css";
import LogoFooter from "../../pages/icons/logo.svg";

const Footer = () => {
  return (
    <footer className="footer bg-gray-900 w-full text-gray-300 py-8">
      <div className="footer-container mx-auto px-6">
        {" "}
        <div className="footer-grid grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Coluna 1: Logo e texto */}
          <div className="logo-texto pl-4">
            {" "}
            <div className="footer-logo flex items-center mb-2">
              <img
                src={LogoFooter}
                className="icon-img mr-3"
                title="EcoMove Logo"
                alt="EcoMove Logo"
              />
              <span className="footer-logo-text text-white font-bold">
                ECO
                <span className="footer-logo-subtext text-white font-normal">
                  {" "}
                  MOVE
                </span>
              </span>
            </div>
            <p className="text">Compartilhe o caminho, conecte pessoas.</p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="title-links">
            <h3 className="footer-column-title">Links Rápidos</h3>
            <ul className="footer-list space-y-2">
              <li className="footer-list-item">
                <a href="/" className="footer-link">
                  Início
                </a>
              </li>
              <li className="footer-list-item">
                <a href="/como-funciona" className="footer-link">
                  Como Funciona
                </a>
              </li>
              <li className="footer-list-item">
                <a href="/cadastro" className="footer-link">
                  Cadastre-se
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Região */}
          <div className="title-links">
            <h3 className="footer-column-title">Região</h3>
            <ul className="footer-list space-y-2">
              <li className="footer-list-item">
                <a href="" className="footer-link">
                  Sorocaba
                </a>
              </li>
              <li className="footer-list-item">
                <a href="" className="footer-link">
                  Votorantim
                </a>
              </li>
              <li className="footer-list-item">
                <a href="" className="footer-link">
                  Itu
                </a>
              </li>
              <li className="footer-list-item">
                <a href="" className="footer-link">
                  Salto
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div className="title-links">
            <h3 className="footer-column-title">Contato</h3>
            <ul className="footer-list space-y-2">
              <li className="footer-list-item">contato@EcoMove.com.br</li>
              <li className="footer-list-item">WhatsApp: (15) 99999-9999</li>
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="footer-copyright">
          © 2025 Eco Move. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
