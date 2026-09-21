import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Destino.css";
import Mapa, { Marcador, TracadoRota } from "../../components/Mapa/Mapa";
import CampoEndereco from "../../components/CampoEndereco/CampoEndereco";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { calcularRota, enderecoDe } from "../../services/geo";
import { useLocalizacao } from "../../hooks/useLocalizacao";
import { mensagemDeErro } from "../../utils/erros";
import { agoraLocal, proximaHoraCheia } from "../../utils/formatar";
import {
  co2EvitadoKg,
  compararCorridaECarona,
  formatarKm,
  formatarMinutos,
  formatarReais,
} from "../../utils/estimativas";

const SOROCABA = { lat: -23.5015, lng: -47.4526 };
const COR_ORIGEM = "#036141";
const COR_DESTINO = "#d9480f";

const IconeAlvo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
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
  const usuario = getUsuarioLogado();

  // Localização atual como origem (com nome da rua via geocodificação reversa)
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

  // Tenta a localização atual na abertura da tela
  useEffect(() => {
    usarMinhaLocalizacao();
  }, [usarMinhaLocalizacao]);

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

  // Corrida sob demanda: cria o pedido e vai para a tela de acompanhamento
  const pedirCorrida = async () => {
    if (!origem || !destino || !rota) return;
    setPedindo(true);
    setErro("");
    try {
      const resposta = await api.post("/corridas/", {
        id_passageiro: usuario?.id_usuario,
        origem: origem.nome.replace(/^Minha localização · /, ""),
        destino: destino.nome,
        origem_lat: origem.lat,
        origem_lng: origem.lng,
        destino_lat: destino.lat,
        destino_lng: destino.lng,
        distancia_km: Math.round(rota.distanciaKm * 10) / 10,
        duracao_min: Math.round(rota.duracaoMin),
      });
      navigate(`/app/corridas/${resposta.data.corrida.id_corrida}`);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível pedir a corrida."));
    } finally {
      setPedindo(false);
    }
  };

  const centro = origem || posicaoUsuario || SOROCABA;

  return (
    <div className="destino">
      {/* Formulário de trajeto */}
      <section className="destino-formulario" aria-label="Trajeto">
        <CampoEndereco
          id="origem"
          rotulo="Origem"
          placeholder="De onde você sai?"
          valor={origem}
          onSelecionar={setOrigem}
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
          id="destino"
          rotulo="Destino"
          placeholder="Para onde você vai?"
          valor={destino}
          onSelecionar={setDestino}
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

      {/* Mapa com o traçado */}
      <div className="destino-mapa">
        <Mapa centro={centro} zoom={14} posicaoUsuario={posicaoUsuario}>
          {origem && origem.id !== "gps" && (
            <Marcador posicao={origem} cor={COR_ORIGEM} rotulo={origem.nome} />
          )}
          {destino && <Marcador posicao={destino} cor={COR_DESTINO} rotulo={destino.nome} />}
          {rota && <TracadoRota pontos={rota.pontos} margemInferior={40} />}
        </Mapa>
      </div>

      {/* Resultado */}
      <section className="destino-folha" aria-live="polite">
        {erro && (
          <p className="app-alerta app-alerta-erro" role="alert">
            {erro}
          </p>
        )}

        {!destino && !erro && (
          <p className="destino-dica">Informe o destino para ver o trajeto e as opções.</p>
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
              <button
                type="button"
                className="app-btn app-btn-secundario"
                onClick={pedirCorrida}
                disabled={quando !== "agora" || pedindo}
              >
                {pedindo
                  ? "Solicitando..."
                  : quando === "agora"
                    ? "Pedir corrida agora"
                    : "Corrida só está disponível para agora"}
              </button>
            </div>
            <p className="destino-nota">Valores estimados para comparação. Sem cobrança nesta versão.</p>
          </>
        )}
      </section>
    </div>
  );
}

export default Destino;
