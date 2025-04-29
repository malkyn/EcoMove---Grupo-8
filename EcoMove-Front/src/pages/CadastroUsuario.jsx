import React from "react";
import "./CadastroUsuario.css";
import Logo from "/EcoMove---Grupo-8/EcoMove-Front/src/pages/icons/seguro-de-automovel.svg";
function FormPass(){
    return(
        <body>
         <div className="container">
            <div className="form-image">
               <img src={Logo} alt="logo" />
            </div>
            <div className="form">
                <form action="#">
                    <div className="form-header">
                        <div className="title">
                            <h1>Cadastro de Passageiro</h1>
                        </div>
                        <div className="sub-t">
                            <p>Preencha seus dados para comçar a usar a plataforma</p>
                        </div>
                    </div>
                <div className="imput-group">
                    <div className="imput-box">

                    </div>
                </div>
                </form>
            </div>
            
    
         </div>
        </body>
    );
}
export default FormPass;