import React, { useState } from "react";
import "./Avaliacao.css";
import api from "../../services/api";
import { mensagemDeErro } from "../../utils/erros";

const NOTAS = [1, 2, 3, 4, 5];
const ROTULOS = { 1: "Ruim", 2: "Regular", 3: "Bom", 4: "Muito bom", 5: "Excelente" };

const Estrela = ({ cheia }) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path
      d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"
      fill={cheia ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/** Média em estrelas, compacta: "★ 4,8 (3)". Sem avaliações, mostra "novo". */
export function Estrelas({ media, total, semTotal = false }) {
  if (!total) return <span className="estrelas estrelas-vazio">novo</span>;
  return (
    <span className="estrelas" aria-label={`Média ${media} de 5 em ${total} avaliações`}>
      <Estrela cheia />
      <strong>{Number(media).toFixed(1).replace(".", ",")}</strong>
      {!semTotal && <small>({total})</small>}
    </span>
  );
}

/**
 * Formulário de avaliação de uma viagem.
 * `viagem` é { id_carona } ou { id_corrida }; `onEnviada` recebe a avaliação criada.
 */
export function AvaliacaoForm({ viagem, idAvaliador, idAvaliado, nomeAvaliado, onEnviada, onCancelar }) {
  const [nota, setNota] = useState(0);
  const [passando, setPassando] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nota) {
      setErro("Escolha de 1 a 5 estrelas.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const resposta = await api.post("/avaliacoes/", {
        ...viagem,
        id_avaliador: idAvaliador,
        id_avaliado: idAvaliado,
        nota,
        comentario: comentario.trim(),
      });
      onEnviada?.(resposta.data.avaliacao, resposta.data.mensagem);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível enviar a avaliação."));
    } finally {
      setEnviando(false);
    }
  };

  const destaque = passando || nota;

  return (
    <form className="avaliacao-form" onSubmit={handleSubmit}>
      <p className="avaliacao-titulo">Como foi a viagem com {nomeAvaliado}?</p>

      <div className="avaliacao-estrelas" role="radiogroup" aria-label="Nota de 1 a 5">
        {NOTAS.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={nota === n}
            aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}: ${ROTULOS[n]}`}
            className={`avaliacao-estrela ${n <= destaque ? "ativa" : ""}`}
            onClick={() => setNota(n)}
            onMouseEnter={() => setPassando(n)}
            onMouseLeave={() => setPassando(0)}
          >
            <Estrela cheia={n <= destaque} />
          </button>
        ))}
        <span className="avaliacao-rotulo">{destaque ? ROTULOS[destaque] : ""}</span>
      </div>

      <textarea
        className="avaliacao-comentario"
        placeholder="Comentário (opcional)"
        maxLength={300}
        rows={2}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      {erro && (
        <p className="avaliacao-erro" role="alert">
          {erro}
        </p>
      )}

      <div className="avaliacao-acoes">
        {onCancelar && (
          <button
            type="button"
            className="avaliacao-botao avaliacao-botao-secundario"
            onClick={onCancelar}
            disabled={enviando}
          >
            Agora não
          </button>
        )}
        <button type="submit" className="avaliacao-botao" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar avaliação"}
        </button>
      </div>
    </form>
  );
}

/** Cartão com a nota já dada. */
export function AvaliacaoFeita({ avaliacao, nomeAvaliado }) {
  return (
    <p className="avaliacao-feita">
      Você avaliou {nomeAvaliado} com{" "}
      <strong>
        {avaliacao.nota} {avaliacao.nota === 1 ? "estrela" : "estrelas"}
      </strong>
      .{avaliacao.comentario && ` "${avaliacao.comentario}"`}
    </p>
  );
}
