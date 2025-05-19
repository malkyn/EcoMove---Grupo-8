import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./CadastroUsuario.css";
import Info from "./icons/informacoes.svg";
import api from "../services/api";


function CadastroUsuario() {
  // =============================================
  //               ESTADO E ROTEAMENTO
  // =============================================
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    id_perfil: 2,
    cnh: "",
    rg: "",
    cpf: "",
    genero: "",
    data_nascimento: "",
  });

  const [docTipo, setDocTipo] = useState("cpf");
  const location = useLocation();
  const perfilId = location.state?.id_perfil || 2;

  // =============================================
  //               EFEITOS
  // =============================================
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      id_perfil: perfilId,
    }));
  }, [perfilId]);

  // =============================================
  //               MANIPULAÇÃO DE FORMULÁRIO
  // =============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "doctipo") {
      setDocTipo(value);
    } else if (name === "numerodoc") {
      setFormData((prev) => ({
        ...prev,
        [docTipo]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await api.post("/usuarios/", formData);
      alert(resposta.data.mensagem);
      // Limpar formulário ou redirecionar após sucesso
    } catch (err) {
      const errorMessage = err.response?.data?.erro || err.message;
      alert(`Erro ao cadastrar: ${errorMessage}`);
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
          <form onSubmit={handleSubmit}>
            {/* Cabeçalho */}
            <div className="form-header">
              <div className="title">
                <h1>
                  Cadastro de {perfilId === 1 ? "Motorista" : "Passageiro"}
                </h1>
              </div>
              <div className="login-button">
                <button type="button">
                  <a href="#login">Entrar</a>
                </button>
              </div>
            </div>

            {/* Subtítulo */}
            <div className="sub-t">
              <p>Preencha seus dados para começar a usar a plataforma</p>
            </div>

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
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <label htmlFor="numerodata">Data de Nascimento</label>
                <input
                  id="numerodata"
                  type="date"
                  name="data_nascimento"
                  required
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
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="input-box">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  name="telefone"
                  placeholder="(99) 99999-9999"
                  required
                  onChange={handleChange}
                />
              </div>

              {/* Documentos */}
              <div className="input-box">
                <label htmlFor="doctipo">Tipo de Documento</label>
                <select
                  id="doctipo"
                  name="doctipo"
                  value={docTipo}
                  onChange={handleChange}
                  required
                >
                  <option value="cpf">CPF</option>
                  <option value="rg">RG</option>
                  <option value="cnh">CNH</option>
                </select>
              </div>

              <div className="input-box">
                <label htmlFor="numerodoc">Número do Documento</label>
                <input
                  id="numerodoc"
                  type="text"
                  name="numerodoc"
                  placeholder={`Digite o número do ${docTipo.toUpperCase()}`}
                  required
                  value={formData[docTipo]}
                  onChange={handleChange}
                />
              </div>

              {/* Segurança */}
              <div className="input-box">
                <label htmlFor="senha">Digite sua Senha</label>
                <input
                  id="senha"
                  type="password"
                  name="senha"
                  placeholder="Deve conter números/letras/especial"
                  required
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
                  required
                />
              </div>

              {/* Gênero */}
              <div className="input-box">
                <label htmlFor="genero">Gênero</label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero || ""}
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
              <button type="submit">Continuar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastroUsuario;
