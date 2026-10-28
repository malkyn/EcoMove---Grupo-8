import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Feedback.css";
import { FeedbackContext } from "./FeedbackContext";

const DURACAO_TOAST_MS = 4000;
const SAIDA_TOAST_MS = 180;
const MAX_TOASTS = 3;
const FOCAVEIS = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Dono da folha de confirmação e dos toasts da área logada. Fica dentro do .app-shell,
 * então as camadas são posicionadas sobre a casca (e respeitam a largura de 480 px no desktop).
 */
export function FeedbackProvider({ children }) {
  const [confirmacao, setConfirmacao] = useState(null);
  const resolverRef = useRef(null);
  const [toasts, setToasts] = useState([]);
  const proximoId = useRef(1);

  const confirmar = useCallback(
    (opcoes) =>
      new Promise((resolver) => {
        // Uma folha de cada vez: a anterior, se houver, é fechada como "não"
        resolverRef.current?.(false);
        resolverRef.current = resolver;
        setConfirmacao(typeof opcoes === "string" ? { titulo: opcoes } : opcoes);
      }),
    []
  );

  const fecharConfirmacao = useCallback((resultado) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setConfirmacao(null);
    resolver?.(resultado);
  }, []);

  const fecharToast = useCallback((id) => {
    setToasts((lista) => lista.map((t) => (t.id === id ? { ...t, saindo: true } : t)));
    setTimeout(() => setToasts((lista) => lista.filter((t) => t.id !== id)), SAIDA_TOAST_MS);
  }, []);

  const toast = useCallback((texto, opcoes = {}) => {
    const id = proximoId.current++;
    const novo = {
      id,
      texto,
      tipo: opcoes.tipo || "ok",
      acao: opcoes.acao || null,
      duracao: opcoes.duracao ?? DURACAO_TOAST_MS,
      saindo: false,
    };
    setToasts((lista) => [...lista.slice(-(MAX_TOASTS - 1)), novo]);
    return id;
  }, []);

  const valor = useMemo(() => ({ confirmar, toast }), [confirmar, toast]);

  return (
    <FeedbackContext.Provider value={valor}>
      {children}
      {confirmacao && <FolhaConfirmacao {...confirmacao} onFechar={fecharConfirmacao} />}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onFechar={fecharToast} />
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

/** Folha que sobe de baixo com a pergunta, a ação principal e "voltar". */
function FolhaConfirmacao({ titulo, mensagem, confirmar = "Confirmar", cancelar = "Voltar", perigo = false, onFechar }) {
  const folhaRef = useRef(null);
  const tituloId = useId();
  const mensagemId = useId();

  useEffect(() => {
    const anterior = document.activeElement;
    const folha = folhaRef.current;
    // Ação destrutiva começa com o foco em "voltar": Enter sem querer não cancela nada
    const botoes = folha.querySelectorAll("button");
    (perigo ? botoes[1] : botoes[0])?.focus();

    const aoTeclar = (evento) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onFechar(false);
        return;
      }
      if (evento.key !== "Tab") return;
      // Foco preso na folha enquanto ela está aberta
      const focaveis = [...folha.querySelectorAll(FOCAVEIS)];
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      anterior?.focus?.();
    };
  }, [onFechar, perigo]);

  return (
    <div className="folha-fundo" onClick={() => onFechar(false)}>
      <div
        ref={folhaRef}
        className="folha"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={mensagem ? mensagemId : undefined}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="folha-alca" aria-hidden="true" />
        <h2 id={tituloId} className="folha-titulo">
          {titulo}
        </h2>
        {mensagem && (
          <p id={mensagemId} className="folha-mensagem">
            {mensagem}
          </p>
        )}
        <div className="folha-acoes">
          <button
            type="button"
            className={`app-btn ${perigo ? "app-btn-perigo" : "app-btn-primario"}`}
            onClick={() => onFechar(true)}
          >
            {confirmar}
          </button>
          <button type="button" className="app-btn app-btn-secundario" onClick={() => onFechar(false)}>
            {cancelar}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ id, texto, tipo, acao, duracao, saindo, onFechar }) {
  useEffect(() => {
    if (!duracao) return undefined;
    const temporizador = setTimeout(() => onFechar(id), duracao);
    return () => clearTimeout(temporizador);
  }, [id, duracao, onFechar]);

  return (
    <div className={`toast toast-${tipo} ${saindo ? "toast-saindo" : ""}`} role={tipo === "erro" ? "alert" : undefined}>
      <span className="toast-texto">{texto}</span>
      {acao && (
        <Link to={acao.para} className="toast-acao" onClick={() => onFechar(id)}>
          {acao.rotulo}
        </Link>
      )}
      <button type="button" className="toast-fechar" aria-label="Fechar aviso" onClick={() => onFechar(id)}>
        ×
      </button>
    </div>
  );
}
