import React from "react";
import "./Entrar.css";
import usuario2 from "./icons/usuario2.svg";
import cadeado from "./icons/cadeado.svg";
function Entrar() {
  return (
        <div className="body">
         <div className="imagem">
            <div className="box">
            <form action="">
                <h1>Entrar</h1>
                <div className="input-container">
                    <input type="email" placeholder="Email" required/>
                    <img width={20} height={15} src={usuario2} alt="img user" className="" />
                </div>

                <div className="input-container">
                    <input type="password" placeholder="Senha" required/>
                    <img width={20} height={15} src={cadeado} alt="cadeado" />
                    <a href="#">Esqueci minha senha</a>
                
                </div>

                <button className="submit-button" type="submit">Entrar</button>

                <div className="link-registro">
                    <p>Nao esta cadastrado ? <a href="./loginForm">Cadastre-se</a></p>
                </div>

            </form>
            </div>
         </div>
        </div>
  );
}

export default Entrar;
