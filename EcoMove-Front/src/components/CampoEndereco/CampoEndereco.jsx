import React, { useEffect, useId, useRef, useState } from "react";
import "./CampoEndereco.css";
import { buscarEnderecos } from "../../services/geo";

const ESPERA_MS = 600; // aguarda o usuário parar de digitar (respeita o limite do Nominatim)
const MIN_LETRAS = 3;

const IconeLimpar = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Campo de endereço com sugestões do OpenStreetMap.
 * `valor` é um lugar { nome, lat, lng } ou null; `onSelecionar` recebe o lugar escolhido
 * (ou null quando o usuário volta a editar o texto). Com o campo vazio, a lista mostra
 * `sugestoesSalvas` (Casa, Trabalho) e `sugestoesIniciais` (recentes). Setas, Enter e Esc
 * funcionam na lista.
 */
function CampoEndereco({
  id,
  rotulo,
  placeholder,
  valor,
  onSelecionar,
  acaoExtra,
  sugestoesIniciais = [],
  sugestoesSalvas = [],
}) {
  const [texto, setTexto] = useState(valor?.nome || "");
  const [sugestoes, setSugestoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [buscou, setBuscou] = useState(false); // a busca do texto atual já respondeu
  const [ativa, setAtiva] = useState(-1); // opção realçada pelo teclado
  const controle = useRef(null);
  const entradaRef = useRef(null);
  const idLista = useId();

  // Quando o lugar vem de fora (ex.: localização atual), mostra o nome dele
  useEffect(() => {
    if (valor) setTexto(valor.nome);
  }, [valor]);

  const textoCurto = texto.trim().length < MIN_LETRAS;

  useEffect(() => {
    if (!aberto || valor || textoCurto) {
      setSugestoes([]);
      setBuscou(false);
      return undefined;
    }
    setBuscou(false);
    const timer = setTimeout(async () => {
      controle.current?.abort();
      const ctrl = new AbortController();
      controle.current = ctrl;
      setBuscando(true);
      try {
        setSugestoes(await buscarEnderecos(texto, ctrl.signal));
        if (!ctrl.signal.aborted) setBuscou(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          setSugestoes([]);
          setBuscou(true);
        }
      } finally {
        if (!ctrl.signal.aborted) setBuscando(false);
      }
    }, ESPERA_MS);
    return () => clearTimeout(timer);
  }, [texto, aberto, valor, textoCurto]);

  // Com o campo vazio, a lista mostra salvos e recentes; depois de digitar, os resultados da busca
  // Um lugar salvo não repete nos recentes
  const grupos = [
    { titulo: "Salvos", itens: sugestoesSalvas },
    {
      titulo: "Recentes",
      itens: sugestoesIniciais.filter(
        (r) => !sugestoesSalvas.some((s) => s.nome.trim().toLowerCase() === r.nome.trim().toLowerCase())
      ),
    },
  ];
  const iniciais = grupos.flatMap((g) => g.itens);
  const mostrandoIniciais = !valor && textoCurto && iniciais.length > 0;
  const opcoes = mostrandoIniciais ? iniciais : sugestoes;
  const semResultado = !valor && !textoCurto && buscou && !buscando && sugestoes.length === 0;
  const mostrarLista =
    aberto && !valor && (mostrandoIniciais || buscando || sugestoes.length > 0 || semResultado);

  useEffect(() => {
    setAtiva(-1);
  }, [opcoes.length, texto]);

  const escolher = (lugar) => {
    onSelecionar(lugar);
    setTexto(lugar.nome);
    setSugestoes([]);
    setAberto(false);
    setAtiva(-1);
  };

  const limpar = () => {
    setTexto("");
    setSugestoes([]);
    setBuscou(false);
    if (valor) onSelecionar(null);
    setAberto(true);
    entradaRef.current?.focus();
  };

  const aoDigitar = (e) => {
    setTexto(e.target.value);
    setAberto(true);
    if (valor) onSelecionar(null); // texto mudou: o lugar anterior não vale mais
  };

  const aoTeclar = (e) => {
    if (e.key === "Escape") {
      setAberto(false);
      setAtiva(-1);
      return;
    }
    if (!mostrarLista || opcoes.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtiva((i) => (i + 1) % opcoes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtiva((i) => (i <= 0 ? opcoes.length - 1 : i - 1));
    } else if (e.key === "Enter" && ativa >= 0) {
      e.preventDefault();
      escolher(opcoes[ativa]);
    }
  };

  const idOpcao = (i) => `${idLista}-opcao-${i}`;

  const renderOpcao = (s, i) => (
    <li
      key={s.id}
      id={idOpcao(i)}
      role="option"
      aria-selected={ativa === i}
      className={ativa === i ? "ativa" : ""}
    >
      <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => escolher(s)}>
        <strong>{s.nome}</strong>
        <small>{s.descricao}</small>
      </button>
    </li>
  );

  return (
    <div className="campo-endereco">
      <label htmlFor={id} className="campo-endereco-rotulo">
        {rotulo}
      </label>
      <div className="campo-endereco-linha">
        <div className="campo-endereco-entrada">
          <input
            id={id}
            ref={entradaRef}
            type="text"
            value={texto}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={mostrarLista}
            aria-controls={idLista}
            aria-autocomplete="list"
            aria-activedescendant={ativa >= 0 ? idOpcao(ativa) : undefined}
            onChange={aoDigitar}
            onKeyDown={aoTeclar}
            onFocus={() => setAberto(true)}
            onBlur={() => setTimeout(() => setAberto(false), 150)}
          />
          {texto && (
            <button
              type="button"
              className="campo-endereco-limpar"
              onMouseDown={(e) => e.preventDefault()}
              onClick={limpar}
              aria-label={`Limpar ${rotulo.toLowerCase()}`}
            >
              <IconeLimpar />
            </button>
          )}
        </div>
        {acaoExtra}
      </div>

      {mostrarLista && (
        <ul
          id={idLista}
          className="campo-endereco-lista"
          role="listbox"
          aria-label={mostrandoIniciais ? "Lugares salvos e recentes" : "Endereços encontrados"}
        >
          {mostrandoIniciais &&
            grupos.map(
              (g) =>
                g.itens.length > 0 && (
                  <React.Fragment key={g.titulo}>
                    <li className="campo-endereco-grupo" role="presentation">
                      {g.titulo}
                    </li>
                    {g.itens.map((s) => renderOpcao(s, iniciais.indexOf(s)))}
                  </React.Fragment>
                )
            )}
          {buscando && sugestoes.length === 0 && !mostrandoIniciais && (
            <li className="campo-endereco-info" role="presentation">
              Buscando endereços...
            </li>
          )}
          {semResultado && (
            <li className="campo-endereco-info" role="presentation">
              Nenhum endereço encontrado. Tente incluir o bairro ou a cidade.
            </li>
          )}
          {!mostrandoIniciais && opcoes.map((s, i) => renderOpcao(s, i))}
        </ul>
      )}
    </div>
  );
}

export default CampoEndereco;
