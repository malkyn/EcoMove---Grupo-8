import React, { useState } from "react";
import "./CadastroUsuario.css";
import Info from "./icons/informacoes.svg";
import api from "../services/api";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function CadastroUsuario() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    id_perfil: 2,
    cnh: "",
    rg: "",
    cpf: "",
  });

  const location = useLocation();
  const perfilId = location.state?.id_perfil || 2;

  useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    id_perfil: perfilId,
    }));
  }, [perfilId]);

  const [docTipo, setDocTipo] = useState("cpf");

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
      console.log(api.defaults.baseURL)
      alert(resposta.data.mensagem);
    } catch (err) {
      alert("Erro ao cadastrar: " + err.response?.data?.erro || err.message);
    }
  };

  return (
    <div className="body">
      <div className="container">
        <div className="form-image">
          <img src={Info} alt="Informações" />
        </div>
        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="form-header">
              <div className="title">
                <h1>Cadastro de {perfilId === 1 ? "Motorista" : "Passageiro"}</h1>
              </div>
              <div className="login-button">
                <button type="button">
                  <a href="#">Entrar</a>
                </button>
              </div>
            </div>

            <div className="sub-t">
              <p>Preencha seus dados para começar a usar a plataforma</p>
            </div>

            <div className="input-group">
              <div className="input-box">
                <label htmlFor="nome">Nome Completo</label>
                <input id="nome" type="text" name="nome" placeholder="Seu nome completo" required onChange={handleChange} />
              </div>

              <div className="input-box">
                <label htmlFor="numerodata">Data de Nascimento</label>
                <input id="numerodata" type="date" name="data_nascimento" required />
              </div>

              <div className="input-box">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" name="email" placeholder="seuemail@exemplo.com" required onChange={handleChange} />
              </div>

              <div className="input-box">
                <label htmlFor="telefone">Telefone</label>
                <input id="telefone" type="tel" name="telefone" placeholder="(99) 99999-9999" required />
              </div>

              <div className="input-box">
                <label htmlFor="doctipo">Tipo de Documento</label>
                <select id="doctipo" name="doctipo" value={docTipo} onChange={handleChange} required>
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

              <div className="input-box">
                <label htmlFor="senha">Digite sua Senha</label>
                <input id="senha" type="password" name="senha" placeholder="Deve conter números/letras/especial" required onChange={handleChange} />
              </div>

              <div className="input-box">
                <label htmlFor="confirmesenha">Confirme sua Senha</label>
                <input id="confirmesenha" type="password" name="confirmesenha" placeholder="Repita sua senha" required />
              </div>
            </div>

            <div className="genero-inputs">
              <div className="titulo-genero">
                <h4>Gênero</h4>
              </div>
              <div className="grupo-generos">
                <div className="input-genero">
                  <input type="radio" id="masculino" name="genero" />
                  <label htmlFor="masculino">Masculino</label>
                </div>
                <div className="input-genero">
                  <input type="radio" id="feminino" name="genero" />
                  <label htmlFor="feminino">Feminino</label>
                </div>
                <div className="input-genero">
                  <input type="radio" id="outros" name="genero" />
                  <label htmlFor="outros">Outros</label>
                </div>
                <div className="input-genero">
                  <input type="radio" id="naodizer" name="genero" />
                  <label htmlFor="naodizer">Prefiro não dizer</label>
                </div>
              </div>
            </div>

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
