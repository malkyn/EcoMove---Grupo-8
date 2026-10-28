import React from "react";
import "./Feedback.css";

/** Um retângulo cinza que brilha enquanto o conteúdo real não chega. */
export function Esqueleto({ largura = "100%", altura = "1rem", raio = "8px", className = "" }) {
  return (
    <span
      className={`esqueleto ${className}`.trim()}
      style={{ width: largura, height: altura, borderRadius: raio }}
      aria-hidden="true"
    />
  );
}

const LARGURAS = ["100%", "86%", "62%", "74%", "50%"];

/** Cartão com um título, algumas linhas e, opcionalmente, o lugar de um botão. */
export function EsqueletoCartao({ linhas = 3, acao = true }) {
  return (
    <div className="app-cartao esqueleto-cartao" aria-hidden="true">
      <Esqueleto largura="58%" altura="1.15rem" />
      {Array.from({ length: linhas }, (_, i) => (
        <Esqueleto key={i} largura={LARGURAS[i % LARGURAS.length]} altura="0.85rem" />
      ))}
      {acao && <Esqueleto largura="128px" altura="40px" raio="999px" className="esqueleto-acao" />}
    </div>
  );
}

/**
 * Envelope acessível de qualquer esqueleto: o leitor de tela ouve o rótulo,
 * e as formas cinzas ficam só para quem enxerga.
 */
export function Carregando({ rotulo = "Carregando", className = "", children }) {
  return (
    <div className={className} role="status" aria-busy="true" aria-label={rotulo}>
      {children}
    </div>
  );
}

/** Lista de cartões-esqueleto, no espaçamento das listas do app. */
export function EsqueletoLista({ itens = 2, linhas = 3, acao = true, rotulo = "Carregando" }) {
  return (
    <Carregando rotulo={rotulo} className="esqueleto-lista">
      {Array.from({ length: itens }, (_, i) => (
        <EsqueletoCartao key={i} linhas={linhas} acao={acao} />
      ))}
    </Carregando>
  );
}
