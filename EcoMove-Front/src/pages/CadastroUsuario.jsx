import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./CadastroUsuario.css";
import Info from "./icons/informacoes.svg";
import api from "../services/api";

const PERFIL_MOTORISTA = 1;
const PERFIL_PASSAGEIRO = 2;

const apenasDigitos = (valor) => String(valor || "").replace(/\D/g, "");

/** Valida CPF pelos dígitos verificadores (rejeita sequências repetidas). */
function cpfValido(cpf) {
  const d = apenasDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (tamanho) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

/** Idade em anos completos a partir de uma data ISO (AAAA-MM-DD); null se inválida. */
function calcularIdade(dataISO) {
  const nascimento = new Date(`${dataISO}T00:00:00`);
  if (!dataISO || Number.isNaN(nascimento.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}

const ESTADO_INICIAL = {
  nome: "",
  email: "",
  telefone: "",
  data_nascimento: "",
  cpf: "",
  cnh: "",
  senha: "",
  confirmesenha: "",
  genero: "",
};

function CadastroUsuario() {
  // =============================================
  //               ESTADO E ROTEAMENTO
  // =============================================
  const location = useLocation();
  const navigate = useNavigate();
  const perfilId =
    location.state?.id_perfil === PERFIL_MOTORISTA ? PERFIL_MOTORISTA : PERFIL_PASSAGEIRO;
  const ehMotorista = perfilId === PERFIL_MOTORISTA;

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // =============================================
  //               MANIPULAÇÃO DE FORMULÁRIO
  // =============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validação no cliente: conforto para o usuário. O backend valida de novo.
  const validar = () => {
    if (form.nome.trim().length < 3) return "Informe seu nome completo.";

    const telefone = apenasDigitos(form.telefone);
    if (telefone.length < 10 || telefone.length > 11) {
      return "Telefone inválido. Use DDD e número, por exemplo (15) 99999-9999.";
    }

    const idade = calcularIdade(form.data_nascimento);
    if (idade === null || idade < 0 || idade > 120) return "Data de nascimento inválida.";
    if (ehMotorista && idade < 18) return "Motoristas precisam ter pelo menos 18 anos.";
    if (!ehMotorista && idade < 16) return "É preciso ter pelo menos 16 anos para se cadastrar.";

    if (!cpfValido(form.cpf)) return "CPF inválido.";
    if (ehMotorista && apenasDigitos(form.cnh).length !== 11) {
      return "CNH inválida. Informe os 11 dígitos do número de registro.";
    }

    if (form.senha.length < 8 || !/[A-Za-z]/.test(form.senha) || !/\d/.test(form.senha)) {
      return "A senha deve ter pelo menos 8 caracteres, com letras e números.";
    }
    if (form.senha !== form.confirmesenha) return "As senhas não conferem.";

    if (!form.genero) return "Selecione o gênero.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      await api.post("/usuarios/", {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
        id_perfil: perfilId,
        telefone: form.telefone.trim(),
        cpf: apenasDigitos(form.cpf),
        cnh: ehMotorista ? apenasDigitos(form.cnh) : "",
        rg: "",
        genero: form.genero,
        data_nascimento: form.data_nascimento,
      });

      navigate("/entrar", {
        state: { mensagem: "Cadastro realizado! Entre com seu e-mail e senha." },
      });
    } catch (err) {
      if (err.response && err.response.status < 500) {
        // 4xx: validação ou conflito (e-mail já cadastrado), mensagem feita para o usuário
        setErro(err.response.data?.erro || "Não foi possível cadastrar. Verifique os dados.");
      } else if (err.response) {
        // 5xx: erro interno do servidor, nunca expor detalhes
        setErro("O servidor encontrou um problema. Tente novamente em instantes.");
      } else {
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
    <div className="bodycadastro">
      <div className="container">
        {/* Seção da Imagem */}
        <div className="form-image">
          <img src={Info} alt="Informações do cadastro" />
        </div>

        {/* Seção do Formulário */}
        <div className="form">
          <form onSubmit={handleSubmit} noValidate={false}>
            {/* Cabeçalho */}
            <div className="form-header">
              <div className="title">
                <h1>Cadastro de {ehMotorista ? "Motorista" : "Passageiro"}</h1>
              </div>
              <div className="login-button">
                <Link to="/entrar" className="link-entrar">
                  Entrar
                </Link>
              </div>
            </div>

            {/* Subtítulo */}
            <div className="sub-t">
              <p>
                Preencha seus dados para começar a usar a plataforma.{" "}
                <Link to="/loginForm" className="trocar-perfil">
                  Trocar perfil
                </Link>
              </p>
            </div>

            {/* Mensagem de erro (só aparece quando existe) */}
            {erro && (
              <p className="cadastro-erro" role="alert">
                {erro}
              </p>
            )}

            {/* Grupo de Campos do Formulário */}
            <div className="input-group">
              {/* Dados Pessoais */}
              <div className="input-box">
                <label htmlFor="nome">Nome Completo</label>
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <label htmlFor="data_nascimento">Data de Nascimento</label>
                <input
                  id="data_nascimento"
                  type="date"
                  name="data_nascimento"
                  autoComplete="bday"
                  required
                  value={form.data_nascimento}
                  onChange={handleChange}
                />
              </div>

              {/* Contato */}
              <div className="input-box">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  maxLength={100}
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  name="telefone"
                  placeholder="(15) 99999-9999"
                  autoComplete="tel"
                  maxLength={20}
                  required
                  value={form.telefone}
                  onChange={handleChange}
                />
              </div>

              {/* Documentos */}
              <div className="input-box">
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  name="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  autoComplete="off"
                  maxLength={14}
                  required
                  value={form.cpf}
                  onChange={handleChange}
                />
              </div>

              {ehMotorista && (
                <div className="input-box">
                  <label htmlFor="cnh">CNH (número de registro)</label>
                  <input
                    id="cnh"
                    type="text"
                    name="cnh"
                    inputMode="numeric"
                    placeholder="11 dígitos"
                    autoComplete="off"
                    maxLength={14}
                    required
                    value={form.cnh}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Segurança */}
              <div className="input-box">
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  name="senha"
                  placeholder="Mínimo 8 caracteres, letras e números"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  value={form.senha}
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <label htmlFor="confirmesenha">Confirme sua Senha</label>
                <input
                  id="confirmesenha"
                  type="password"
                  name="confirmesenha"
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  value={form.confirmesenha}
                  onChange={handleChange}
                />
              </div>

              {/* Gênero */}
              <div className="input-box">
                <label htmlFor="genero">Gênero</label>
                <select
                  id="genero"
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione seu gênero</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outros">Outros</option>
                  <option value="nao_informar">Prefiro não informar</option>
                </select>
              </div>
            </div>

            {/* Botão de Submissão */}
            <div className="botao-continue">
              <button type="submit" disabled={carregando}>
                {carregando ? "Cadastrando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastroUsuario;
