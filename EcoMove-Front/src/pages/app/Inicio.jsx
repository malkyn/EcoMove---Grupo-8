import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Inicio.css";
import api from "../../services/api";
import Mapa, { Marcador } from "../../components/Mapa/Mapa";
import { getUsuarioLogado } from "../../services/auth";
import { useLocalizacao } from "../../hooks/useLocalizacao";
import { useIntervalo } from "../../hooks/useIntervalo";
import { mensagemDeErro } from "../../utils/erros";
import { formatarKm, formatarReais } from "../../utils/estimativas";
import { rotuloStatus } from "../../utils/corridas";
import { agoraLocal } from "../../utils/formatar";
import { montarHistorico, sugerirPeloHistorico } from "../../utils/recomendacao";
import CaronaCard from "../../components/CaronaCard/CaronaCard";

const PERFIL_MOTORISTA = 1;
// Centro de Sorocaba: usado enquanto a localização do celular não chega
const SOROCABA = { lat: -23.5015, lng: -47.4526 };
const COR_MOTORISTA = "#1d4ed8";
const RAIO_PEDIDOS_KM = 10;
const RAIO_MOTORISTAS_KM = 15;

const IconeBusca = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function Inicio() {
  const location = useLocation();
  const navigate = useNavigate();
  const avisoDeRota = location.state?.erro; // ex.: passageiro tentou abrir área de motorista
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;
  const primeiroNome = usuario?.nome ? String(usuario.nome).split(" ")[0] : "";

  const { obter: obterLocalizacao, posicao, erro: erroGps } = useLocalizacao();
  const centro = posicao || SOROCABA;

  const [corridaAtual, setCorridaAtual] = useState(null);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [online, setOnline] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [aceitando, setAceitando] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [reservando, setReservando] = useState(null);

  useEffect(() => {
    obterLocalizacao();
  }, [obterLocalizacao]);

  // Corrida ativa do usuário (como passageiro ou motorista)
  const buscarCorridaAtual = useCallback(async () => {
    if (!idUsuario) return;
    try {
      const resposta = await api.get("/corridas/", { params: { id_usuario: idUsuario, ativas: true } });
      setCorridaAtual(resposta.data[0] || null);
    } catch {
      // silencioso: a tela continua utilizável
    }
  }, [idUsuario]);

  useEffect(() => {
    buscarCorridaAtual();
  }, [buscarCorridaAtual]);
  useIntervalo(buscarCorridaAtual, 5000, Boolean(idUsuario));

  // Passageiro: motoristas online por perto, para mostrar no mapa
  const buscarMotoristas = useCallback(async () => {
    try {
      const resposta = await api.get("/motoristas/online", {
        params: { lat: centro.lat, lng: centro.lng, raio_km: RAIO_MOTORISTAS_KM },
      });
      setMotoristas(resposta.data);
    } catch {
      // silencioso
    }
  }, [centro.lat, centro.lng]);

  useEffect(() => {
    if (!ehMotorista) buscarMotoristas();
  }, [buscarMotoristas, ehMotorista]);
  useIntervalo(buscarMotoristas, 10000, !ehMotorista);

  // Passageiro: sugestões de caronas parecidas com o histórico dele
  const buscarSugestoes = useCallback(async () => {
    if (ehMotorista || !idUsuario) return;
    try {
      const [respReservas, respCorridas, respCandidatas] = await Promise.all([
        api.get(`/usuarios/${idUsuario}/reservas`),
        api.get("/corridas/", { params: { id_usuario: idUsuario } }),
        api.get("/caronas/", {
          params: { com_vagas: true, horario_de: agoraLocal(), excluir_usuario: idUsuario },
        }),
      ]);
      const historico = montarHistorico(respReservas.data, respCorridas.data);
      const jaReservadas = new Set(respReservas.data.map((c) => c.id_carona));
      const candidatas = respCandidatas.data.filter((c) => !jaReservadas.has(c.id_carona));
      setSugestoes(sugerirPeloHistorico(candidatas, historico));
    } catch {
      // silencioso: sem sugestões
    }
  }, [ehMotorista, idUsuario]);

  useEffect(() => {
    buscarSugestoes();
  }, [buscarSugestoes]);

  const reservarSugestao = async (carona) => {
    setErro("");
    setMensagem("");
    setReservando(carona.id_carona);
    try {
      const resposta = await api.post(`/caronas/${carona.id_carona}/reservas`, {
        id_usuario: idUsuario,
      });
      setMensagem(resposta.data?.mensagem || "Vaga reservada com sucesso!");
      setSugestoes((prev) => prev.filter((c) => c.id_carona !== carona.id_carona));
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível reservar a vaga."));
    } finally {
      setReservando(null);
    }
  };

  // Motorista: veículos e estado online
  useEffect(() => {
    if (!ehMotorista || !idUsuario) return undefined;
    let ativo = true;
    Promise.all([
      api.get("/veiculos/", { params: { id_usuario: idUsuario } }),
      api.get("/motoristas/online", { params: { id_usuario: idUsuario } }),
    ])
      .then(([respVeiculos, respOnline]) => {
        if (!ativo) return;
        setVeiculos(respVeiculos.data);
        setOnline(respOnline.data.length > 0);
      })
      .catch((err) => {
        if (ativo) setErro(mensagemDeErro(err, "Não foi possível carregar seus dados."));
      });
    return () => {
      ativo = false;
    };
  }, [ehMotorista, idUsuario]);

  const alternarOnline = async () => {
    setErro("");
    setMensagem("");
    const ponto = posicao || (await obterLocalizacao()) || SOROCABA;
    try {
      const resposta = await api.post("/motoristas/online", {
        id_usuario: idUsuario,
        online: !online,
        lat: ponto.lat,
        lng: ponto.lng,
        id_veiculo: veiculos[0]?.id_veiculo,
      });
      setOnline(resposta.data.online);
      setMensagem(resposta.data.mensagem || "");
      if (!resposta.data.online) setPedidos([]);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível mudar seu estado."));
    }
  };

  // Motorista online: pedidos pendentes por perto
  const buscarPedidos = useCallback(async () => {
    if (!online) return;
    try {
      const resposta = await api.get("/corridas/", {
        params: { status: "pendente", lat: centro.lat, lng: centro.lng, raio_km: RAIO_PEDIDOS_KM },
      });
      setPedidos(resposta.data);
    } catch {
      // silencioso
    }
  }, [online, centro.lat, centro.lng]);

  useEffect(() => {
    buscarPedidos();
  }, [buscarPedidos]);
  useIntervalo(buscarPedidos, 4000, ehMotorista && online);

  const aceitar = async (pedido) => {
    setErro("");
    setAceitando(pedido.id_corrida);
    try {
      await api.post(`/corridas/${pedido.id_corrida}/aceitar`, {
        id_motorista: idUsuario,
        id_veiculo: veiculos[0]?.id_veiculo,
      });
      navigate(`/app/corridas/${pedido.id_corrida}`);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível aceitar o pedido."));
      setAceitando(null);
      buscarPedidos();
    }
  };

  const semVeiculo = ehMotorista && veiculos.length === 0;

  return (
    <div className="inicio">
      <div className="inicio-mapa">
        <Mapa centro={centro} zoom={posicao ? 15 : 13} posicaoUsuario={posicao}>
          {!ehMotorista &&
            motoristas.map((m) => (
              <Marcador
                key={m.id_usuario}
                posicao={m}
                cor={COR_MOTORISTA}
                rotulo={`${m.nome || "Motorista"}${m.veiculo ? ` · ${m.veiculo.modelo}` : ""}`}
              />
            ))}
        </Mapa>
      </div>

      {/* Folha inferior, no padrão dos apps de mobilidade */}
      <section className="inicio-folha" aria-label="Ações rápidas">
        <div className="inicio-alca" aria-hidden="true" />
        {avisoDeRota && (
          <p className="app-alerta app-alerta-aviso" role="alert">
            {avisoDeRota}
          </p>
        )}
        {erroGps && <p className="app-alerta app-alerta-aviso">{erroGps} Mostrando Sorocaba.</p>}
        {erro && (
          <p className="app-alerta app-alerta-erro" role="alert">
            {erro}
          </p>
        )}
        {mensagem && (
          <p className="app-alerta app-alerta-ok" role="status">
            {mensagem}
          </p>
        )}

        {corridaAtual && (
          <Link to={`/app/corridas/${corridaAtual.id_corrida}`} className="inicio-corrida-ativa">
            <span className="inicio-corrida-status">{rotuloStatus(corridaAtual.status)}</span>
            <span className="inicio-corrida-rota">
              {corridaAtual.origem} → {corridaAtual.destino}
            </span>
            <span className="inicio-corrida-acao">Acompanhar ›</span>
          </Link>
        )}

        <p className="inicio-saudacao">
          Olá, {primeiroNome}
          {ehMotorista && (
            <span className={`inicio-estado ${online ? "inicio-estado-online" : ""}`}>
              {online ? "online" : "offline"}
            </span>
          )}
        </p>

        {ehMotorista ? (
          <div className="inicio-acoes">
            {semVeiculo ? (
              <Link to="/app/veiculos" className="app-btn app-btn-primario">
                Cadastre um veículo para começar
              </Link>
            ) : (
              <button
                type="button"
                className={`app-btn ${online ? "app-btn-vazado" : "app-btn-primario"}`}
                onClick={alternarOnline}
                disabled={Boolean(corridaAtual)}
              >
                {online ? "Ficar offline" : "Ficar online para corridas"}
              </button>
            )}
            <Link to="/app/caronas/nova" className="app-btn app-btn-secundario">
              Oferecer carona
            </Link>

            {online && !corridaAtual && (
              <div className="inicio-pedidos">
                <h2>Pedidos próximos</h2>
                {pedidos.length === 0 ? (
                  <p className="inicio-pedidos-vazio">
                    <span className="inicio-pulso" aria-hidden="true" /> Aguardando pedidos em até{" "}
                    {RAIO_PEDIDOS_KM} km...
                  </p>
                ) : (
                  <ul>
                    {pedidos.map((p) => (
                      <li key={p.id_corrida} className="inicio-pedido">
                        <div className="inicio-pedido-rota">
                          {p.origem} → {p.destino}
                        </div>
                        <div className="inicio-pedido-info">
                          <span>{p.passageiro?.nome}</span>
                          <span>a {formatarKm(p.distancia_ate_voce_km)} de você</span>
                          <span>{formatarKm(p.distancia_km)} de corrida</span>
                          <strong>{formatarReais(p.preco_estimado)}</strong>
                        </div>
                        <button
                          type="button"
                          className="app-btn app-btn-primario app-btn-pequeno"
                          onClick={() => aceitar(p)}
                          disabled={aceitando === p.id_corrida}
                        >
                          {aceitando === p.id_corrida ? "Aceitando..." : "Aceitar"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/app/destino" className="inicio-busca">
              <IconeBusca />
              <span>Para onde?</span>
            </Link>
            <p className="inicio-motoristas">
              {motoristas.length === 0
                ? "Nenhum motorista online por perto agora."
                : `${motoristas.length} ${motoristas.length === 1 ? "motorista online" : "motoristas online"} por perto.`}
            </p>

            {sugestoes.length > 0 && (
              <div className="inicio-sugestoes">
                <h2>Sugeridas para você</h2>
                {sugestoes.map((c) => (
                  <CaronaCard key={c.id_carona} carona={c} motivos={c.recomendacao.motivos}>
                    <button
                      type="button"
                      className="app-btn app-btn-primario app-btn-pequeno"
                      onClick={() => reservarSugestao(c)}
                      disabled={reservando === c.id_carona}
                    >
                      {reservando === c.id_carona ? "Reservando..." : "Reservar vaga"}
                    </button>
                  </CaronaCard>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Inicio;
