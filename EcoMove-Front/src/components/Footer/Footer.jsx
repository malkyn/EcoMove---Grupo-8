import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import LogoFooter from "../../pages/icons/logo.webp";
import { IconeEscudo, IconeFolha, IconePessoas } from "../Icones";

const ANO = new Date().getFullYear();

const navegacao = [
  { rotulo: "Carona ou corrida", href: "/#modos" },
  { rotulo: "Por que ir de EcoMove", href: "/#funcionalidades" },
  { rotulo: "Como funciona", href: "/#como-funciona" },
  { rotulo: "Sustentabilidade", href: "/#sustentabilidade" },
  { rotulo: "Perguntas frequentes", href: "/#perguntas" },
];

const ods = [
  { numero: "7", nome: "Energia limpa" },
  { numero: "9", nome: "Inovação" },
  { numero: "12", nome: "Consumo responsável" },
  { numero: "13", nome: "Ação climática" },
];

function Footer() {
  const voltarAoTopo = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Marca */}
          <div className="footer-marca">
            <div className="footer-logo">
              <img src={LogoFooter} alt="" width="40" height="40" />
              <span>
                Eco<strong>Move</strong>
              </span>
            </div>
            <p>
              Compartilhe o caminho, conecte pessoas. Caronas agendadas e corridas agora, só em
              veículos elétricos e híbridos.
            </p>
            <ul className="footer-selos">
              <li>
                <IconeFolha tamanho={16} /> 100% elétrico ou híbrido
              </li>
              <li>
                <IconeEscudo tamanho={16} /> CNH e placa validadas no cadastro
              </li>
              <li>
                <IconePessoas tamanho={16} /> Avaliações entre motoristas e passageiros
              </li>
            </ul>
          </div>

          {/* Navegação */}
          <nav aria-label="Seções do site">
            <h3 className="footer-titulo">Navegação</h3>
            <ul className="footer-lista">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.rotulo}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Conta */}
          <div>
            <h3 className="footer-titulo">Conta</h3>
            <ul className="footer-lista">
              <li>
                <Link to="/loginForm">Criar conta</Link>
              </li>
              <li>
                <Link to="/entrar">Entrar</Link>
              </li>
              <li>
                <Link to="/app">Abrir o app</Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="footer-contato">
            <h3 className="footer-titulo">Contato</h3>
            <ul className="footer-lista footer-lista-texto">
              <li>
                <a href="mailto:contato@ecomove.com.br">contato@ecomove.com.br</a>
              </li>
              <li>WhatsApp: (15) 99824-3110</li>
              <li>Sorocaba, Votorantim, Itu e Salto</li>
            </ul>
          </div>
        </div>

        <div className="footer-base">
          {/* Linha 1: copyright e documentos */}
          <div className="footer-base-linha">
            <p className="footer-base-texto">
              © {ANO} EcoMove · Projeto de extensão UPX V, Centro Universitário FACENS, Sorocaba, SP.
            </p>
            <nav className="footer-base-links" aria-label="Documentos e créditos">
              <Link to="/termos">Termos de Uso</Link>
              <Link to="/privacidade">Privacidade</Link>
              <span>
                Fotos:{" "}
                <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
                  Unsplash
                </a>
              </span>
            </nav>
          </div>
          {/* Linha 2: ODS e voltar ao topo */}
          <div className="footer-base-linha">
            <ul className="footer-ods" aria-label="Objetivos de Desenvolvimento Sustentável da ONU">
              {ods.map((item) => (
                <li key={item.numero}>
                  <strong>{item.numero}</strong> {item.nome}
                </li>
              ))}
            </ul>
            <button type="button" className="footer-topo" onClick={voltarAoTopo}>
              Voltar ao topo
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
