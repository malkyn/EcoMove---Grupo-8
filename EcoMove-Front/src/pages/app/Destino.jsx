import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Destino.css";
import Mapa, { Marcador, TracadoRota } from "../../components/Mapa/Mapa";
import CampoEndereco from "../../components/CampoEndereco/CampoEndereco";
import { calcularRota, enderecoDe } from "../../services/geo";
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

const pad = (n) => String(n).padStart(2, "0");
/** Data/hora local no formato do input datetime-local (AAAA-MM-DDTHH:MM). */
function paraInputLocal(data) {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`;
}
function daquiAUmaHora() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return paraInputLocal(d);
}

const IconeAlvo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

function Destino() {
  const navigate = useNavigate();

  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [quando, setQuando] = useState("agora"); // "agora" | "agendar"
  const [dataHora, setDataHora] = useState(daquiAUmaHora);

  const [rota, setRota] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [erro, setErro] = useState("");

  // Localização atual como origem (com nome da rua via geocodificação reversa)
  const usarMinhaLocalizacao = () => {
    if (!("geolocation" in navigator)) {
      setErro("Seu navegador não oferece localização.");
      return;
    }
    setBuscandoGps(true);
    setErro("");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const ponto = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPosicaoUsuario(ponto);
        setOrigem({ id: "gps", nome: "Minha localização", ...ponto });
        try {
          const nome = await enderecoDe(ponto.lat, ponto.lng);
          setOrigem({ id: "gps", nome: `Minha localização · ${nome}`, ...ponto });
        } catch {
          // mantém "Minha localização" sem o nome da rua
        } finally {
          setBuscandoGps(false);
        }
      },
      () => {
        setBuscandoGps(false);
        setErro("Sem acesso à sua localização. Digite o endereço de origem.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Tenta a localização atual só na abertura da tela
  useEffect(() => {
    usarMinhaLocalizacao();
  }, []);

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
              className="destino-gps"
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
              min={paraInputLocal(new Date())}
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
          <p className="destino-erro" role="alert">
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
              <button type="button" className="destino-botao" onClick={verCaronas}>
                Ver caronas compatíveis
              </button>
              <button type="button" className="destino-botao destino-botao-secundario" disabled>
                Pedir corrida agora (em breve)
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
