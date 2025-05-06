import React from "react";
import "./Login.css";
import UserIcon from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/usuario2.svg";
import CarIcon from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/seguro-de-automovel.svg";
import CloseIcon from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/fechar.svg";

const Login = ({ headerHeight = 100 }) => {
  return (
    <div
      className="eco-move-container"
      style={{ paddingTop: `${headerHeight}px` }}
    >
      <h1 className="eco-move-logo">ECOMOVE</h1>

      <h2 className="selection-subtitle">
        Selecione como você deseja se cadastrar na plataforma para iniciar sua
        jornada de compartilhamento de caronas
      </h2>

      <div className="selection-cards">
        {/* Passageiro */}
        <div className="selection-card passenger-card">
          <img src={UserIcon} alt="Passageiro" className="card-icon" />
          <h3>Passageiro</h3>
          <p>
            Cadastre-se para encontrar carros disponíveis em sua região e entrar
            em contato com motoristas confiáveis.
          </p>
          <a className="continue-button" href="./cadastrousuario">Continuar como Passageiro</a>
          </div>

        {/* Motorista */}
        <div className="selection-card driver-card">
          <img src={CarIcon} alt="Motorista" className="card-icon" />
          <h3>Motorista</h3>
          <p>
            Ofereça caronas, compartilhe suas trajetórias e ajude a comunidade,
            conhecendo novas pessoas no percurso.
          </p>
          <button className="continue-button">Continuar como Motorista</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
