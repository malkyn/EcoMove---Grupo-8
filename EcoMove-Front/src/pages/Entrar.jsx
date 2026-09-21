import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Entrar.css";
import usuario2 from "./icons/usuario2.svg";
import cadeado from "./icons/cadeado.svg";
import api from "../services/api";

/**
 * Componente de Página de Login
 * Permite que usuários acessem suas contas
 */
function Entrar() {
  // =============================================
  //               ESTADO DO FORMULÁRIO
  // =============================================
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // =============================================
  //               MANIPULAÇÃO DE FORMULÁRIO
  // =============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/usuarios/login", {
        email: email.trim(),
        senha,
      });
      alert(resposta.data.mensagem);
      navigate("/");
    } catch (err) {
      if (err.response) {
        // O servidor respondeu, mas com erro (400, 401, 500...)
        setErro(err.response.data?.erro || "Não foi possível entrar. Tente novamente.");
      } else {
        // A requisição nem chegou: servidor fora do ar, sem rede, timeout
        setErro("Não foi possível conectar ao servidor.");
      }
    } finally {
      setCarregando(false);
    }
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

            {/* Mensagem de erro (só aparece quando existe) */}
            {erro && (
              <p className="form-error" role="alert">
                {erro}
              </p>
            )}

            {/* Campo de Email */}
            <div className="input-container">
              <input
                type="email"
                placeholder="Email"
                required
                aria-label="Endereço de e-mail"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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
            <button className="submit-button" type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>

            {/* Link para Cadastro */}
            <div className="link-registro">
              <p>
                Não está cadastrado?{" "}
                <Link to="/loginForm" className="register-link">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Entrar;
