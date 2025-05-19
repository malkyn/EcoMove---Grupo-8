import React from "react";
import "./Entrar.css";
import usuario2 from "./icons/usuario2.svg";
import cadeado from "./icons/cadeado.svg";

/**
 * Componente de Página de Login
 * Permite que usuários acessem suas contas
 */
function Entrar() {
  // =============================================
  //               MANIPULAÇÃO DE FORMULÁRIO
  // =============================================
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de autenticação será implementada aqui
    console.log("Formulário submetido");
  };

  // =============================================
  //               RENDERIZAÇÃO
  // =============================================
  return (
    <div className="bodyentrar">
      {/* Container da Imagem de Fundo */}
      <div className="imagem">
        {/* Card do Formulário */}
        <div className="box">
          <form onSubmit={handleSubmit}>
            {/* Título */}
            <h1>Entrar</h1>

            {/* Campo de Email */}
            <div className="input-container">
              <input
                type="email"
                placeholder="Email"
                required
                aria-label="Endereço de e-mail"
              />
              <img
                src={usuario2}
                width={20}
                height={15}
                alt="Ícone de usuário"
                className="input-icon"
              />
            </div>

            {/* Campo de Senha */}
            <div className="input-container">
              <input
                type="password"
                placeholder="Senha"
                required
                aria-label="Senha"
              />
              <img
                src={cadeado}
                width={20}
                height={15}
                alt="Ícone de cadeado"
                className="input-icon"
              />
              <a href="#recuperar-senha" className="forgot-password">
                Esqueci minha senha
              </a>
            </div>

            {/* Botão de Submit */}
            <button className="submit-button" type="submit">
              Entrar
            </button>

            {/* Link para Cadastro */}
            <div className="link-registro">
              <p>
                Não está cadastrado?{" "}
                <a href="./loginForm" className="register-link">
                  Cadastre-se
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Entrar;
