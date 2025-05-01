import React from "react";
import "./CadastroUsuario.css";
import Logo from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/seguro-de-automovel.svg";
import Info from "./icons/informacoes.svg";
function CadastroUsuario(){
    return(
        <body className="body">
         <div className="container">
            <div className="form-image">
               <img src={Info} alt="logo"/>
            </div>
            <div className="form">
                <form action="#">
                    <div className="form-header">
                        <div className="title">
                            <h1>Cadastro de Passageiro</h1>
                        </div>

                        <div className="login-button">
                            <button><a href="#">Entrar</a></button>
                        </div>
                    </div>
                    
                    <div className="sub-t">
                        <p>Preencha seus dados para comçar a usar a plataforma</p>
                    </div>

                <div className="imput-group">
                    <div className="imput-box">
                        <label htmlFor="nome">Nome Completo</label>
                        <input id="nome" type="text" name="nome" placeholder="Seu nome completo" required />
                    </div>

                    <div className="imput-box">
                        <label htmlFor="numerodata">Data de Nascimento</label>
                        <input id="numerodata" type="data" name="numerodata" placeholder="Sua Data de Nascimento" required />
                    </div>

                    <div className="imput-box">
                        <label htmlFor="email">E-mail</label>
                        <input id="email" type="email" name="email" placeholder="Seu email@exemplo.com" required />
                    </div>

                    <div className="imput-box">
                        <label htmlFor="telefone">Telefone</label>
                        <input id="telefone" type="tell" name="telefone" placeholder="Seu nome completo" required />
                    </div>

                    <div className="imput-box">
                        <label htmlFor="doctipo">Tipo de Documento</label>
                        <input id="doctipo" type="documento" name="doctipo" placeholder="Seu nome completo" required />
                    </div>

                    <div className="imput-box">
                        <label htmlFor="numerodoc">Numero do Documento</label>
                        <input id="numerodoc" type="num" name="numerodoc" placeholder="Seu nome completo" required />
                    </div>

                    <div className="imput-box">
                        <label htmlFor="senha">Digite sua Senha</label>
                        <input id="senha" type="senha" name="senha" placeholder="Deve conter numeros/letras/espeial" required />
                    </div>

                    <div className="imput-box">
                        <label htmlFor=" comfimesenha">Confirme sua Senha</label>
                        <input id="comfirmesenha" type="senha" name="comfirmesenha" placeholder="Senha deve ser igual a anteriior" required />
                    </div>
                </div>
                <div className="genero-imputs">
                    <div className="titulo-genero">
                        <h4>Genero</h4>
                    </div>
                    <div className="grupo-generos">
                        <div className="imput-genero">
                            <input type="radio" id="masculino" name="genero" />
                            <label htmlFor="masculino">Masculino</label>
                        </div>

                        <div className="imput-genero">
                            <input type="radio" id="feminino" name="genero" />
                            <label htmlFor="feminino">Feminino</label>
                        </div>

                        <div className="imput-genero">
                            <input type="radio" id="outros" name="genero" />
                            <label htmlFor="outros">Outros</label>
                        </div>

                        <div className="imput-genero">
                            <input type="radio" id="naodizer" name="genero" />
                            <label htmlFor="naodizer">Prefiro não dizer</label>
                        </div>
                    </div>
                </div>
                <div className="botao-continue">
                    <button><a href="#">Continuar</a></button>
                </div>
                </form>
            </div>
    
         </div>
        </body>
    );
}
export default CadastroUsuario;