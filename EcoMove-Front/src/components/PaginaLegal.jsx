import React from "react";
import { Link } from "react-router-dom";
import "./PaginaLegal.css";

/**
 * Página de documento (Termos de Uso, Política de Privacidade).
 * Recebe o conteúdo como dados para as duas páginas terem o mesmo desenho.
 *
 * secoes: [{ id, titulo, itens: [ "parágrafo" | { lista: ["...", "..."] } ] }]
 */
function PaginaLegal({ chapeu, titulo, atualizadoEm, resumo, secoes, outro, nota }) {
  return (
    <article className="legal">
      <div className="legal-wrap">
        <header className="legal-topo">
          <p className="legal-chapeu">{chapeu}</p>
          <h1>{titulo}</h1>
          <p className="legal-data">Atualizado em {atualizadoEm}</p>
        </header>

        <section className="legal-resumo" aria-labelledby="legal-resumo-titulo">
          <h2 id="legal-resumo-titulo">O essencial</h2>
          <ul>
            {resumo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <nav className="legal-indice" aria-label="Seções do documento">
          <ol>
            {secoes.map((secao) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`}>{secao.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        {secoes.map((secao, indice) => (
          <section key={secao.id} id={secao.id} className="legal-secao">
            <h2>
              <span className="legal-numero">{indice + 1}.</span> {secao.titulo}
            </h2>
            {secao.itens.map((item, i) =>
              typeof item === "string" ? (
                <p key={i}>{item}</p>
              ) : (
                <ul key={i}>
                  {item.lista.map((linha) => (
                    <li key={linha}>{linha}</li>
                  ))}
                </ul>
              )
            )}
          </section>
        ))}

        {nota && <p className="legal-nota">{nota}</p>}

        {outro && (
          <Link to={outro.to} className="legal-outro">
            <span>Leia também</span>
            <strong>{outro.rotulo}</strong>
          </Link>
        )}
      </div>
    </article>
  );
}

export default PaginaLegal;
