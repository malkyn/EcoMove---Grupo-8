import React from "react";
import "./CadastroUsuario.css";
import Info from "./icons/informacoes.svg";

function CadastroUsuario() {
  return (
    <div className="body">
      <div className="container">
        <div className="form-image">
          <img src={Info} alt="Informações" />
        </div>
        <div className="form">
          <form action="#">
            <div className="form-header">
              <div className="title">
                <h1>Cadastro de Passageiro</h1>
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
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="input-box">
                <label htmlFor="numerodata">Data de Nascimento</label>
                <input
                  id="numerodata"
                  type="date"
                  name="numerodata"
                  required
                />
              </div>

              <div className="input-box">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="seuemail@exemplo.com"
                  required
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
                />
              </div>

              <div className="input-box">
                <label htmlFor="doctipo">Tipo de Documento</label>
                <input
                  id="doctipo"
                  type="text"
                  name="doctipo"
                  placeholder="RG, CPF, etc."
                  required
                />
              </div>

              <div className="input-box">
                <label htmlFor="numerodoc">Número do Documento</label>
                <input
                  id="numerodoc"
                  type="text"
                  name="numerodoc"
                  placeholder="Digite o número"
                  required
                />
              </div>

              <div className="input-box">
                <label htmlFor="senha">Digite sua Senha</label>
                <input
                  id="senha"
                  type="password"
                  name="senha"
                  placeholder="Deve conter números/letras/especial"
                  required
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
