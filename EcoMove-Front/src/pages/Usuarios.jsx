import React from "react";
import "./Usuarios.css";
import usuario2 from "./icons/usuario2.svg";
import cadeado from "./icons/cadeado.svg";
function Usuarios() {
  return (
    <body>
      <div className="container">
        <form action="">
          <h1>Entrar na plataforma</h1>
          <div>
            <input placeholder="Email" type="email" required/>
             <img src={usuario2} alt="icone de usuario" />
          </div>
          <div>
            <input placeholder="Senha" type="password" required/>
             <img src={cadeado} alt="icone de usuario" />
             <a href="#">Esqueci minha senha</a>
          </div>
          
          <button type="submit">Entrar</button>

          <div>
            <p> Não está cadastrado ? <a href="#">Cadastrar</a> </p> 
          </div>
          

        </form>
      </div>
    </body>
    

  );
}

export default Usuarios;
