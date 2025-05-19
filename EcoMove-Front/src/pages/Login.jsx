import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import UserIcon from "../pages/icons/usuario2.svg";
import CarIcon from "../pages/icons/seguro-de-automovel.svg";

const Login = ({ headerHeight = 100 }) => {
  // Hook para navegação entre rotas
  const navigate = useNavigate();

  const handleNavigate = (perfilId) => {
    navigate("/cadastrousuario", { state: { id_perfil: perfilId } });
  };

  // Constantes para os perfis (evitar "magic numbers")
  const PROFILES = {
    DRIVER: 1,
    PASSENGER: 2,
  };

  return (
    /* Container principal com padding ajustável baseado na altura do header */
    <div
      className="eco-move-container"
      style={{ paddingTop: `${headerHeight}px` }}
    >
      {/* Seção de cabeçalho e título */}
      <header className="login-header">
        <h1 className="eco-move-logo">ECOMOVE</h1>
        <h2 className="selection-subtitle">
          Selecione como você deseja se cadastrar na plataforma para iniciar sua
          jornada de compartilhamento de caronas
        </h2>
      </header>

      {/* Seção de cards de seleção de perfil */}
      <section className="selection-cards">
        {/* Card de Passageiro */}
        <article className="selection-card passenger-card">
          <img
            src={UserIcon}
            alt="Ícone de passageiro"
            className="card-icon"
            aria-hidden="true"
          />
          <h3>Passageiro</h3>
          <p>
            Cadastre-se para encontrar carros disponíveis em sua região e entrar
            em contato com motoristas confiáveis.
          </p>
          <button
            className="continue-button"
            onClick={() => handleNavigate(PROFILES.PASSENGER)}
            aria-label="Continuar como Passageiro"
          >
            Continuar como Passageiro
          </button>
        </article>

        {/* Card de Motorista */}
        <article className="selection-card driver-card">
          <img
            src={CarIcon}
            alt="Ícone de motorista"
            className="card-icon"
            aria-hidden="true"
          />
          <h3>Motorista</h3>
          <p>
            Ofereça caronas, compartilhe suas trajetórias e ajude a comunidade,
            conhecendo novas pessoas no percurso.
          </p>
          <button
            className="continue-button"
            onClick={() => handleNavigate(PROFILES.DRIVER)}
            aria-label="Continuar como Motorista"
          >
            Continuar como Motorista
          </button>
        </article>
      </section>
    </div>
  );
};

export default Login;
