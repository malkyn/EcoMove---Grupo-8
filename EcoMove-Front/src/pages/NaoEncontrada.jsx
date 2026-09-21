import React from "react";
import { Link } from "react-router-dom";
import "./NaoEncontrada.css";

function NaoEncontrada() {
  return (
    <div className="nao-encontrada">
      <h1>Página não encontrada</h1>
      <p>O endereço que você acessou não existe ou foi movido.</p>
      <Link to="/" className="nao-encontrada-botao">
        Voltar para o início
      </Link>
    </div>
  );
}

export default NaoEncontrada;
