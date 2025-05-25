import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Balão.css";
import CloseIcon from "../../pages/icons/fechar.svg";

const Balão = ({ hiddenPages = ["/Entrar"], autoCloseDelay = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const balaoRef = useRef(null);

  // Verifica se deve ocultar com base na página atual
  const shouldHide = hiddenPages.includes(location.pathname);

  /* Função para fechar o balão com animação*/
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  // Fechamento automático
  useEffect(() => {
    if (autoCloseDelay && !shouldHide) {
      const timer = setTimeout(handleClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, shouldHide]);

  if (!isVisible || shouldHide) return null;

  return (
    <aside
      ref={balaoRef}
      className={`login-flutuante-direita ${isClosing ? "fechando" : ""}`}
      role="complementary"
      aria-label="Notificação de login"
    >
      <button
        className="fechar-botao"
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        <img src={CloseIcon} alt="" aria-hidden="true" width="16" height="16" />
      </button>

      <div className="conteudo-login">
        <p className="texto-login">
          Já possui uma conta?{" "}
          <a href="/Entrar" className="link-destaque">
            Entrar
          </a>
        </p>
        <p className="texto-termos">
          Ao se cadastrar, você concorda com nossos{" "}
          <a href="/termos" className="link-secundario">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="link-secundario">
            Política de Privacidade
          </a>
        </p>
      </div>
    </aside>
  );
};

export default Balão;
