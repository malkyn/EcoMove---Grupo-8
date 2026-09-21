import React, { useEffect, useRef, useState } from "react";
import "./CampoEndereco.css";
import { buscarEnderecos } from "../../services/geo";

const ESPERA_MS = 600; // aguarda o usuário parar de digitar (respeita o limite do Nominatim)

/**
 * Campo de endereço com sugestões do OpenStreetMap.
 * `valor` é um lugar { nome, lat, lng } ou null; `onSelecionar` recebe o lugar escolhido
 * (ou null quando o usuário volta a editar o texto).
 */
function CampoEndereco({ id, rotulo, placeholder, valor, onSelecionar, acaoExtra }) {
  const [texto, setTexto] = useState(valor?.nome || "");
  const [sugestoes, setSugestoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const controle = useRef(null);

  // Quando o lugar vem de fora (ex.: localização atual), mostra o nome dele
  useEffect(() => {
    if (valor) setTexto(valor.nome);
  }, [valor]);

  useEffect(() => {
    if (!aberto || valor || texto.trim().length < 3) {
      setSugestoes([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      controle.current?.abort();
      const ctrl = new AbortController();
      controle.current = ctrl;
      setBuscando(true);
      try {
        setSugestoes(await buscarEnderecos(texto, ctrl.signal));
      } catch (err) {
        if (err.name !== "AbortError") setSugestoes([]);
      } finally {
        if (!ctrl.signal.aborted) setBuscando(false);
      }
    }, ESPERA_MS);
    return () => clearTimeout(timer);
  }, [texto, aberto, valor]);

  const escolher = (lugar) => {
    onSelecionar(lugar);
    setTexto(lugar.nome);
    setSugestoes([]);
    setAberto(false);
  };

  const aoDigitar = (e) => {
    setTexto(e.target.value);
    setAberto(true);
    if (valor) onSelecionar(null); // texto mudou: o lugar anterior não vale mais
  };

  const mostrarLista = aberto && !valor && (buscando || sugestoes.length > 0);

  return (
    <div className="campo-endereco">
      <label htmlFor={id} className="campo-endereco-rotulo">
        {rotulo}
      </label>
      <div className="campo-endereco-linha">
        <input
          id={id}
          type="text"
          value={texto}
          placeholder={placeholder}
          autoComplete="off"
          onChange={aoDigitar}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
        />
        {acaoExtra}
      </div>

      {mostrarLista && (
        <ul className="campo-endereco-lista" role="listbox">
          {buscando && sugestoes.length === 0 && (
            <li className="campo-endereco-info">Buscando endereços...</li>
          )}
          {sugestoes.map((s) => (
            <li key={s.id} role="option" aria-selected="false">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(s)}
              >
                <strong>{s.nome}</strong>
                <small>{s.descricao}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CampoEndereco;
