import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Conta.css";
import FotoLateral from "./icons/hero-carona.webp";
import api, { usandoMock } from "../services/api";
import { salvarUsuario } from "../services/auth";
import { mensagemDeErro } from "../utils/erros";
import { emailValido } from "../utils/validacao";
import { IconeOlho, IconeOlhoFechado, IconeRaio, IconeRelogio, IconeFolha } from "../components/Icones";

/** Contas prontas do modo demonstração (VITE_USE_MOCK=true). Não existem no backend real. */
const CONTAS_DEMO = [
  { rotulo: "Camila (motorista)", email: "camila@exemplo.com", senha: "123456" },
  { rotulo: "Lucas (passageiro)", email: "lucas@exemplo.com", senha: "123456" },
];

function Entrar() {
  const location = useLocation();
  const navigate = useNavigate();

  // E-mail e mensagem vindos do cadastro recém-concluído
  const [email, setEmail] = useState(location.state?.email || "");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const sucesso = location.state?.mensagem || "";

  const validar = () => {
    const proximos = {};
    if (!emailValido(email)) proximos.email = "Informe um e-mail válido.";
    if (!senha) proximos.senha = "Informe sua senha.";
    return proximos;
  };

  const aoEnviar = async (evento) => {
    evento.preventDefault();
    setErroGeral("");

    const problemas = validar();
    setErros(problemas);
    const primeiro = Object.keys(problemas)[0];
    if (primeiro) {
      document.getElementById(primeiro)?.focus();
      return;
    }

    setCarregando(true);
    try {
      const resposta = await api.post("/usuarios/login", {
        email: email.trim().toLowerCase(),
        senha,
      });

      if (!resposta.data?.usuario) {
        setErroGeral("Resposta inesperada do servidor. Tente novamente.");
        return;
      }

      salvarUsuario(resposta.data.usuario);
      // Volta para a página que exigiu login, ou vai ao app
      navigate(location.state?.de || "/app", { replace: true });
    } catch (err) {
      setErroGeral(mensagemDeErro(err, "Não foi possível entrar. Verifique os dados."));
    } finally {
      setCarregando(false);
    }
  };

  const usarContaDemo = (conta) => {
    setEmail(conta.email);
    setSenha(conta.senha);
    setErros({});
    setErroGeral("");
  };

  const renderErro = (nome) =>
    erros[nome] ? (
      <p className="conta-erro" id={`erro-${nome}`} role="alert">
        {erros[nome]}
      </p>
    ) : null;

  const propsInvalido = (nome) => ({
    "aria-invalid": erros[nome] ? "true" : undefined,
    "aria-describedby": erros[nome] ? `erro-${nome}` : undefined,
  });

  return (
    <div className="conta">
      {/* Lateral: foto com argumento (só em telas largas) */}
      <aside className="conta-lateral" aria-hidden="true">
        <img src={FotoLateral} alt="" width="1600" height="1067" />
        <div className="conta-lateral-texto">
          <p className="conta-lateral-chapeu">Bem-vindo de volta</p>
          <h2>Seu próximo trajeto está a um toque</h2>
          <ul>
            <li>
              <IconeRelogio tamanho={18} /> Caronas agendadas no seu horário
            </li>
            <li>
              <IconeRaio tamanho={18} /> Corrida agora com quem está por perto
            </li>
            <li>
              <IconeFolha tamanho={18} /> CO₂ evitado em cada viagem
            </li>
          </ul>
        </div>
      </aside>

      {/* Formulário */}
      <main className="conta-conteudo">
        <form className="conta-form" onSubmit={aoEnviar} noValidate>
          <header className="conta-topo">
            <h1>Entrar</h1>
            <p>
              Não tem conta? <Link to="/loginForm">Criar conta</Link>
            </p>
          </header>

          {sucesso && !erroGeral && (
            <p className="conta-sucesso" role="status">
              {sucesso}
            </p>
          )}

          {erroGeral && (
            <p className="conta-alerta" role="alert">
              {erroGeral}
            </p>
          )}

          <div className="conta-campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={100}
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(evento) => {
                setEmail(evento.target.value);
                if (erros.email) setErros((anterior) => ({ ...anterior, email: "" }));
              }}
              {...propsInvalido("email")}
            />
            {renderErro("email")}
          </div>

          <div className="conta-campo">
            <div className="conta-campo-topo">
              <label htmlFor="senha">Senha</label>
              <button
                type="button"
                className="conta-esqueci"
                onClick={() => setMostrarAjuda((aberto) => !aberto)}
                aria-expanded={mostrarAjuda}
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="conta-senha">
              <input
                id="senha"
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                maxLength={72}
                placeholder="Sua senha"
                value={senha}
                onChange={(evento) => {
                  setSenha(evento.target.value);
                  if (erros.senha) setErros((anterior) => ({ ...anterior, senha: "" }));
                }}
                {...propsInvalido("senha")}
              />
              <button
                type="button"
                className="conta-senha-olho"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={mostrarSenha}
              >
                {mostrarSenha ? <IconeOlhoFechado tamanho={20} /> : <IconeOlho tamanho={20} />}
              </button>
            </div>
            {renderErro("senha")}
            {mostrarAjuda && (
              <p className="conta-ajuda">
                A recuperação de senha por e-mail ainda não está disponível nesta versão. Fale com a
                gente em <a href="mailto:contato@ecomove.com.br">contato@ecomove.com.br</a> que
                ajudamos a recuperar o acesso.
              </p>
            )}
          </div>

          <div className="conta-acoes">
            <button type="submit" className="conta-btn" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </div>

          {usandoMock && (
            <div className="conta-demo">
              <p>Modo demonstração: use uma conta pronta (senha 123456).</p>
              <div className="conta-demo-botoes">
                {CONTAS_DEMO.map((conta) => (
                  <button
                    key={conta.email}
                    type="button"
                    className="conta-demo-btn"
                    onClick={() => usarContaDemo(conta)}
                  >
                    {conta.rotulo}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

export default Entrar;
