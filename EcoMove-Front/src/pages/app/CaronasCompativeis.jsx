import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import "./CaronasCompativeis.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import { agoraLocal, formatarDataHora, somarMinutos } from "../../utils/formatar";
import { LIMIAR_RECOMENDADA, montarHistorico, recomendar } from "../../utils/recomendacao";
import CaronaCard from "../../components/CaronaCard/CaronaCard";

const RAIO_KM = 3; // distância máxima entre o seu ponto e o da carona
const JANELA_AGENDAR_MIN = 90; // tolerância de horário ao agendar
const JANELA_AGORA_MIN = 24 * 60; // "agora": caronas nas próximas 24 h

/** Lista de caronas compatíveis com o trajeto vindo da tela "Para onde?", ordenada pela recomendação. */
function CaronasCompativeis() {
  const location = useLocation();
  const trajeto = location.state;
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;

  const [caronas, setCaronas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [reservando, setReservando] = useState(null);
  const [reservadas, setReservadas] = useState([]);

  const origem = trajeto?.origem;
  const destino = trajeto?.destino;
  const quando = trajeto?.quando || "agora";
  const dataHora = trajeto?.dataHora;

  useEffect(() => {
    if (!origem || !destino || !idUsuario) return undefined;
    let ativo = true;

    const inicio = quando === "agendar" && dataHora ? somarMinutos(dataHora, -JANELA_AGENDAR_MIN) : agoraLocal();
    const fim =
      quando === "agendar" && dataHora
        ? somarMinutos(dataHora, JANELA_AGENDAR_MIN)
        : somarMinutos(agoraLocal(), JANELA_AGORA_MIN);

    setCarregando(true);
    setErro("");
    Promise.all([
      api.get("/caronas/", {
        params: {
          origem_lat: origem.lat,
          origem_lng: origem.lng,
          destino_lat: destino.lat,
          destino_lng: destino.lng,
          raio_km: RAIO_KM,
          horario_de: inicio < agoraLocal() ? agoraLocal() : inicio,
          horario_ate: fim,
          com_vagas: true,
          excluir_usuario: idUsuario,
        },
      }),
      // Histórico do passageiro alimenta a recomendação; se falhar, segue sem ele
      api.get(`/usuarios/${idUsuario}/reservas`).catch(() => ({ data: [] })),
      api.get("/corridas/", { params: { id_usuario: idUsuario } }).catch(() => ({ data: [] })),
    ])
      .then(([respCaronas, respReservas, respCorridas]) => {
        if (!ativo) return;
        const historico = montarHistorico(respReservas.data, respCorridas.data);
        setCaronas(
          recomendar(respCaronas.data, {
            origem,
            destino,
            quando,
            dataHora,
            historico,
          })
        );
      })
      .catch((err) => {
        if (ativo) setErro(mensagemDeErro(err, "Não foi possível buscar caronas."));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [origem, destino, quando, dataHora, idUsuario]);

  if (!origem || !destino) return <Navigate to="/app/destino" replace />;

  const reservar = async (carona) => {
    setErro("");
    setMensagem("");
    setReservando(carona.id_carona);
    try {
      const resposta = await api.post(`/caronas/${carona.id_carona}/reservas`, {
        id_usuario: idUsuario,
      });
      setReservadas((prev) => [...prev, carona.id_carona]);
      if (resposta.data?.carona) {
        setCaronas((prev) =>
          prev.map((c) => (c.id_carona === carona.id_carona ? { ...c, ...resposta.data.carona } : c))
        );
      }
      setMensagem(resposta.data?.mensagem || "Vaga reservada com sucesso!");
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível reservar a vaga."));
    } finally {
      setReservando(null);
    }
  };

  const descricaoQuando =
    quando === "agendar" && dataHora
      ? `por volta de ${formatarDataHora(dataHora)}`
      : "nas próximas 24 horas";

  return (
    <div className="compativeis">
      <header className="compativeis-cabecalho">
        <Link to="/app/destino" className="app-voltar">
          ‹ Trajeto
        </Link>
        <h1 className="app-titulo">Caronas compatíveis</h1>
        <p className="compativeis-trajeto">
          <span>{origem.nome}</span>
          <span className="compativeis-seta" aria-hidden="true">
            →
          </span>
          <span>{destino.nome}</span>
        </p>
        <p className="compativeis-quando">
          Saída e destino até {RAIO_KM} km dos seus, {descricaoQuando}. Ordenadas pela nossa
          recomendação.
        </p>
      </header>

      {erro && (
        <p className="app-alerta app-alerta-erro" role="alert">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="app-alerta app-alerta-ok" role="status">
          {mensagem} <Link to="/app/viagens">Ver em Viagens</Link>
        </p>
      )}

      {carregando ? (
        <p className="app-vazio">Procurando caronas...</p>
      ) : caronas.length === 0 ? (
        <div className="app-vazio">
          <p>Nenhuma carona compatível por enquanto.</p>
          <p>Tente outro horário, um raio maior de partida, ou volte mais tarde.</p>
          <Link to="/app/destino" className="app-btn app-btn-secundario app-btn-pequeno">
            Ajustar trajeto
          </Link>
        </div>
      ) : (
        <div className="compativeis-lista">
          {caronas.map((c, indice) => {
            const jaReservada =
              reservadas.includes(c.id_carona) ||
              (c.passageiros || []).some((p) => p.id_usuario === idUsuario);
            const recomendada = indice === 0 && c.recomendacao.pontuacao >= LIMIAR_RECOMENDADA;
            return (
              <CaronaCard
                key={c.id_carona}
                carona={c}
                recomendada={recomendada}
                motivos={c.recomendacao.motivos}
              >
                {jaReservada ? (
                  <span className="app-chip app-chip-ok">Vaga reservada</span>
                ) : (
                  <button
                    type="button"
                    className="app-btn app-btn-primario app-btn-pequeno"
                    onClick={() => reservar(c)}
                    disabled={reservando === c.id_carona || c.vagas_restantes === 0}
                  >
                    {reservando === c.id_carona ? "Reservando..." : "Reservar vaga"}
                  </button>
                )}
              </CaronaCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CaronasCompativeis;
