import React, { useState } from "react";
import "./Balão.css";
import CloseIcon from "../../pages/icons/fechar.svg";

const BalãoFlutuante = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="login-flutuante-direita">
      <button className="fechar-botao" onClick={() => setIsVisible(false)}>
        <img src={CloseIcon} alt="Fechar" />
      </button>
      <div className="conteudo-login">
        <p className="texto-login">
          Já possui uma conta? <a href="/login">Entrar</a>
        </p>
        <p className="texto-termos">
          Ao se cadastrar, você concorda com nossos{" "}
          <a href="/termos">Termos de Uso</a> e{" "}
          <a href="/privacidade">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
};

export default BalãoFlutuante;
