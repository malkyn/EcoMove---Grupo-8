import React from "react";
import { Link } from "react-router-dom";
import "./EmConstrucao.css";

/** Marcador temporário para telas planejadas nos próximos PRs. */
function EmConstrucao({ titulo, descricao }) {
  return (
    <div className="em-construcao">
      <h1>{titulo}</h1>
      <p>{descricao || "Esta tela está em desenvolvimento e chega em breve."}</p>
      <Link to="/app" className="em-construcao-botao">
        Voltar ao início
      </Link>
    </div>
  );
}

export default EmConstrucao;
