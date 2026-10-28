import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Destino.css";
import Mapa, { CentroDoMapa, Marcador, TracadoRota } from "../../components/Mapa/Mapa";
import CampoEndereco from "../../components/CampoEndereco/CampoEndereco";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { calcularRota, distanciaHaversineKm, enderecoDe } from "../../services/geo";
import { useLocalizacao } from "../../hooks/useLocalizacao";
import { mensagemDeErro } from "../../utils/erros";
import { agoraLocal, proximaHoraCheia } from "../../utils/formatar";
import { lugaresRecentes } from "../../utils/lugares";
import { CATEGORIAS } from "../../utils/veiculos";
import {
  co2EvitadoKg,
  compararCorridaECarona,
  estimarCorridaPorCategoria,
  formatarKm,
  formatarMinutos,
  formatarReais,
  minutosAteChegar,
} from "../../utils/estimativas";

const SOROCABA = { lat: -23.5015, lng: -47.4526 };
const COR_ORIGEM = "#036141";
const COR_DESTINO = "#d9480f";
const RAIO_MOTORISTAS_KM = 15;
const DESCRICAO_CATEGORIA = { carro: "Até 3 pessoas", moto: "Só você, chega antes" };

const IconeAlvo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconeTrocar = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      d="M8 4v15m0 0-3-3m3 3 3-3M16 20V5m0 0-3 3m3-3 3 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconeCarro = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path
      d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14a2 2 0 0 1 2 2v4h-2m-14-6a2 2 0 0 0-2 2v4h2m0 0v2h2v-2m-2 0h12m0 0v2h2v-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
  </svg>
);

const IconeMoto = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <circle cx="5.5" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="18.5" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M5.5 16l3-6h4l2 3h4M12.5 10l-1.5-3h-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Destino() {
  const navigate = useNavigate();
  const { obter: obterLocalizacao, posicao: posicaoUsuario, buscando: buscandoGps } = useLocalizacao();

  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [quando, setQuando] = useState("agora"); // "agora" | "agendar"
  const [dataHora, setDataHora] = useState(proximaHoraCheia);

  const [rota, setRota] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState("");
  const [pedindo, setPedindo] = useState(false);
  const [recentes, setRecentes] = useState([]);
  const [trocas, setTrocas] = useState(0); // remonta os campos ao trocar origem e destino

  // Etapa de confirmação da corrida: ponto de encontro ajustável no mapa e categoria
  const [etapa, setEtapa] = useState("trajeto"); // "trajeto" | "confirmar"
  const [categoria, setCategoria] = useState("carro");
  const [embarque, setEmbarque] = useState(null);
  const [centroConfirmacao, setCentroConfirmacao] = useState(null);
  const [motoristasOnline, setMotoristasOnline] = useState([]);
  const origemConfirmada = useRef(null);
  const geocodificando = useRef(null);

  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;

  // Lugares recentes (reservas e corridas) aparecem nos campos antes de digitar
  useEffect(() => {
    if (!idUsuario) return undefined;
    let ativo = true;
    Promise.all([
      api.get(`/usuarios/${idUsuario}/reservas`).catch(() => ({ data: [] })),
      api.get("/corridas/", { params: { id_usuario: idUsuario } }).catch(() => ({ data: [] })),
    ]).then(([respReservas, respCorridas]) => {
      if (ativo) setRecentes(lugaresRecentes(respReservas.data, respCorridas.data));
    });
    return () => {
      ativo = false;
    };
  }, [idUsuario]);

  // Localização atual como origem (com nome da rua via geocodificação reversa).
  // Só no toque do botão: pedir permissão ao abrir a tela assusta e costuma ser negado.
  const usarMinhaLocalizacao = useCallback(async () => {
    setErro("");
    const ponto = await obterLocalizacao();
    if (!ponto) {
      setErro("Sem acesso à sua localização. Digite o endereço de origem.");
      return;
    }
    setOrigem({ id: "gps", nome: "Minha localização", ...ponto });
    try {
      const nome = await enderecoDe(ponto.lat, ponto.lng);
      setOrigem({ id: "gps", nome: `Minha localização · ${nome}`, ...ponto });
    } catch {
      // mantém "Minha localização" sem o nome da rua
    }
  }, [obterLocalizacao]);

  const trocar = () => {
    setOrigem(destino);
    setDestino(origem);
    setTrocas((n) => n + 1);
  };

  // Recalcula a rota sempre que origem e destino estiverem definidos
  useEffect(() => {
    if (!origem || !destino) {
      setRota(null);
      return undefined;
    }
    const ctrl = new AbortController();
    setCalculando(true);
    setErro("");
    calcularRota(origem, destino, ctrl.signal)
      .then((resultado) => setRota(resultado))
      .catch((err) => {
        if (err.name !== "AbortError") setErro("Não foi possível calcular a rota.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCalculando(false);
      });
    return () => ctrl.abort();
  }, [origem, destino]);

  const comparativo = useMemo(
    () => (rota ? compararCorridaECarona(rota.distanciaKm, rota.duracaoMin) : null),
    [rota]
  );

  // Preço de cada categoria e em quantos minutos alguém chega, pelos motoristas online
  const precos = useMemo(() => {
    if (!rota) return {};
    // Mesmo arredondamento que vai no pedido, para o botão mostrar o valor que a corrida terá
    const km = Math.round(rota.distanciaKm * 10) / 10;
    const min = Math.round(rota.duracaoMin);
    return Object.fromEntries(
      CATEGORIAS.map((c) => [c.valor, estimarCorridaPorCategoria(km, min, c.valor)])
    );
  }, [rota]);

  const chegada = useMemo(() => {
    const ponto = embarque || origem;
    return Object.fromEntries(
      CATEGORIAS.map((c) => {
        const distancias = ponto
          ? motoristasOnline
              .filter((m) => m.veiculo?.categoria === c.valor)
              .map((m) => distanciaHaversineKm(ponto, m))
          : [];
        return [c.valor, distancias.length ? minutosAteChegar(Math.min(...distancias)) : null];
      })
    );
  }, [motoristasOnline, embarque, origem]);

  const verCaronas = () => {
    navigate("/app/caronas", {
      state: {
        origem,
        destino,
        quando,
        dataHora: quando === "agendar" ? dataHora : null,
        rota: rota ? { distanciaKm: rota.distanciaKm, duracaoMin: rota.duracaoMin } : null,
      },
    });
  };

  // Entra na confirmação: o pino do embarque começa na origem escolhida
  const irParaConfirmacao = async () => {
    if (!origem || !destino || !rota) return;
    setErro("");
    origemConfirmada.current = origem;
    setEmbarque(origem);
    setCentroConfirmacao({ lat: origem.lat, lng: origem.lng });
    setEtapa("confirmar");
    try {
      const resposta = await api.get("/motoristas/online", {
        params: { lat: origem.lat, lng: origem.lng, raio_km: RAIO_MOTORISTAS_KM },
      });
      setMotoristasOnline(resposta.data);
    } catch {
      setMotoristasOnline([]);
    }
  };

  const voltarAoTrajeto = () => {
    geocodificando.current?.abort();
    setEtapa("trajeto");
    setEmbarque(null);
  };

  // Arrastou o mapa: o ponto de encontro passa a ser o centro, com o nome da rua
  const aoMoverMapa = useCallback((ponto) => {
    const original = origemConfirmada.current;
    if (original && distanciaHaversineKm(ponto, original) < 0.02) {
      geocodificando.current?.abort();
      setEmbarque(original);
      return;
    }
    setEmbarque({ id: "embarque", nome: "Ajustando o ponto de encontro...", ...ponto });
    geocodificando.current?.abort();
    const ctrl = new AbortController();
    geocodificando.current = ctrl;
    enderecoDe(ponto.lat, ponto.lng, ctrl.signal)
      .then((nome) => setEmbarque({ id: "embarque", nome, ...ponto }))
      .catch((err) => {
        if (err.name !== "AbortError") setEmbarque({ id: "embarque", nome: "Ponto marcado no mapa", ...ponto });
      });
  }, []);

  // Corrida sob demanda: cria o pedido e vai para a tela de acompanhamento
  const pedirCorrida = async () => {
    const ponto = embarque || origem;
    if (!ponto || !destino || !rota) return;
    setPedindo(true);
    setErro("");
    try {
      const resposta = await api.post("/corridas/", {
        id_passageiro: idUsuario,
        origem: ponto.nome.replace(/^Minha localização · /, ""),
        destino: destino.nome,
        origem_lat: ponto.lat,
        origem_lng: ponto.lng,
        destino_lat: destino.lat,
        destino_lng: destino.lng,
        distancia_km: Math.round(rota.distanciaKm * 10) / 10,
        duracao_min: Math.round(rota.duracaoMin),
        categoria,
      });
      navigate(`/app/corridas/${resposta.data.corrida.id_corrida}`);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível pedir a corrida."));
    } finally {
      setPedindo(false);
    }
  };

  const confirmando = etapa === "confirmar";
  const centro = confirmando ? centroConfirmacao : origem || posicaoUsuario || SOROCABA;

  return (
    <div className="destino">
      {confirmando ? (
        <section className="destino-formulario destino-trajeto-escolhido" aria-label="Trajeto escolhido">
          <p className="destino-trajeto-linha">
            <span>{origem.nome.replace(/^Minha localização · /, "")}</span>
            <span className="destino-trajeto-seta" aria-hidden="true">
              →
            </span>
            <span>{destino.nome}</span>
          </p>
          <button type="button" className="app-voltar" onClick={voltarAoTrajeto}>
            ‹ Editar trajeto
          </button>
        </section>
      ) : (
        <section className="destino-formulario" aria-label="Trajeto">
          <CampoEndereco
            key={`origem-${trocas}`}
            id="origem"
            rotulo="Origem"
            placeholder="De onde você sai?"
            valor={origem}
            onSelecionar={setOrigem}
            sugestoesIniciais={recentes}
            acaoExtra={
              <button
                type="button"
                className="app-gps"
                onClick={usarMinhaLocalizacao}
                disabled={buscandoGps}
                aria-label="Usar minha localização"
                title="Usar minha localização"
              >
                <IconeAlvo />
              </button>
            }
          />
          <CampoEndereco
            key={`destino-${trocas}`}
            id="destino"
            rotulo="Destino"
            placeholder="Para onde você vai?"
            valor={destino}
            onSelecionar={setDestino}
            sugestoesIniciais={recentes}
            acaoExtra={
              <button
                type="button"
                className="app-gps"
                onClick={trocar}
                disabled={!origem && !destino}
                aria-label="Trocar origem e destino"
                title="Trocar origem e destino"
              >
                <IconeTrocar />
              </button>
            }
          />

          <div className="destino-quando">
            <div className="destino-segmentado" role="radiogroup" aria-label="Quando">
              <button
                type="button"
                className={quando === "agora" ? "ativo" : ""}
                onClick={() => setQuando("agora")}
                role="radio"
                aria-checked={quando === "agora"}
              >
                Agora
              </button>
              <button
                type="button"
                className={quando === "agendar" ? "ativo" : ""}
                onClick={() => setQuando("agendar")}
                role="radio"
                aria-checked={quando === "agendar"}
              >
                Agendar
              </button>
            </div>
            {quando === "agendar" && (
              <input
                type="datetime-local"
                className="destino-data"
                value={dataHora}
                min={agoraLocal()}
                onChange={(e) => setDataHora(e.target.value)}
                aria-label="Data e hora da viagem"
              />
            )}
          </div>
        </section>
      )}

      {/* Mapa com o traçado; na confirmação, o pino fixo marca o ponto de encontro */}
      <div className="destino-mapa">
        <Mapa centro={centro} zoom={confirmando ? 16 : 14} posicaoUsuario={posicaoUsuario}>
          {!confirmando && origem && origem.id !== "gps" && (
            <Marcador posicao={origem} cor={COR_ORIGEM} rotulo={origem.nome} />
          )}
          {destino && <Marcador posicao={destino} cor={COR_DESTINO} rotulo={destino.nome} />}
          {!confirmando && rota && <TracadoRota pontos={rota.pontos} margemInferior={40} />}
          {confirmando && <CentroDoMapa onMover={aoMoverMapa} />}
        </Mapa>
        {confirmando && (
          <div className="destino-pino" aria-hidden="true">
            <span className="destino-pino-cabeca" />
            <span className="destino-pino-haste" />
          </div>
        )}
      </div>

      {/* Resultado */}
      <section className="destino-folha" aria-live="polite">
        {erro && (
          <p className="app-alerta app-alerta-erro" role="alert">
            {erro}
          </p>
        )}

        {confirmando ? (
          <>
            <h2 className="app-subtitulo">Confirme o embarque</h2>
            <p className="destino-embarque">
              <span className="destino-embarque-rotulo">Ponto de encontro</span>
              {embarque?.nome.replace(/^Minha localização · /, "")}
            </p>
            <p className="destino-dica">Arraste o mapa para ajustar onde a motorista vai te encontrar.</p>

            <div className="destino-categorias" role="radiogroup" aria-label="Tipo de corrida">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.valor}
                  type="button"
                  role="radio"
                  aria-checked={categoria === c.valor}
                  className={`destino-categoria ${categoria === c.valor ? "ativa" : ""}`}
                  onClick={() => setCategoria(c.valor)}
                >
                  {c.valor === "moto" ? <IconeMoto /> : <IconeCarro />}
                  <span className="destino-categoria-nome">{c.rotulo}</span>
                  <span className="destino-categoria-descricao">{DESCRICAO_CATEGORIA[c.valor]}</span>
                  <strong>{formatarReais(precos[c.valor])}</strong>
                  <small>
                    {chegada[c.valor] ? `chega em ${chegada[c.valor]} min` : "ninguém por perto agora"}
                  </small>
                </button>
              ))}
            </div>

            <div className="destino-acoes">
              <button type="button" className="app-btn app-btn-primario" onClick={pedirCorrida} disabled={pedindo}>
                {pedindo ? "Solicitando..." : `Confirmar corrida · ${formatarReais(precos[categoria])}`}
              </button>
            </div>
            <p className="destino-nota">Valor estimado, sem cobrança nesta versão.</p>
          </>
        ) : (
          <>
            {!origem && !erro && (
              <p className="destino-dica">
                Digite de onde você sai, ou toque no alvo para usar sua localização.
              </p>
            )}
            {origem && !destino && !erro && (
              <p className="destino-dica">Agora o destino: o trajeto e os preços aparecem aqui.</p>
            )}

            {calculando && <p className="destino-dica">Calculando rota...</p>}

            {rota && comparativo && !calculando && (
              <>
                <p className="destino-resumo">
                  <strong>{formatarKm(rota.distanciaKm)}</strong> · {formatarMinutos(rota.duracaoMin)}
                  {rota.estimada && <span className="destino-estimada"> (estimativa)</span>}
                </p>

                <div className="destino-comparativo">
                  <div className="destino-opcao">
                    <span className="destino-opcao-titulo">Corrida individual</span>
                    <strong>{formatarReais(comparativo.corrida)}</strong>
                    <small>sozinho no veículo</small>
                  </div>
                  <div className="destino-opcao destino-opcao-destaque">
                    <span className="destino-opcao-titulo">Carona EcoMove</span>
                    <strong>{formatarReais(comparativo.carona)}</strong>
                    <small>
                      economize {formatarReais(comparativo.economia)} ({comparativo.percentual}%)
                    </small>
                  </div>
                </div>

                <p className="destino-co2">
                  De carona em veículo elétrico, você evita cerca de{" "}
                  <strong>{co2EvitadoKg(rota.distanciaKm, "eletrico")} kg de CO₂</strong> neste
                  trajeto.
                </p>

                <div className="destino-acoes">
                  <button type="button" className="app-btn app-btn-primario" onClick={verCaronas}>
                    Ver caronas compatíveis
                  </button>
                  {quando === "agora" && (
                    <button type="button" className="app-btn app-btn-secundario" onClick={irParaConfirmacao}>
                      Pedir corrida agora
                    </button>
                  )}
                </div>
                {quando === "agendar" && (
                  <p className="destino-nota">
                    Corrida sob demanda só para agora; para o horário agendado, as caronas.
                  </p>
                )}
                <p className="destino-nota">Valores estimados para comparação. Sem cobrança nesta versão.</p>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Destino;
