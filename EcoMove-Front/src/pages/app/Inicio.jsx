import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Inicio.css";
import api from "../../services/api";
import Mapa, { Enquadrar, Marcador } from "../../components/Mapa/Mapa";
import { getUsuarioLogado } from "../../services/auth";
import { useLocalizacao } from "../../hooks/useLocalizacao";
import { useIntervalo } from "../../hooks/useIntervalo";
import { mensagemDeErro } from "../../utils/erros";
import { formatarKm, formatarReais } from "../../utils/estimativas";
import { distanciaHaversineKm } from "../../services/geo";
import { rotuloStatus } from "../../utils/corridas";
import { agoraLocal } from "../../utils/formatar";
import { montarHistorico, sugerirPeloHistorico } from "../../utils/recomendacao";
import CaronaCard from "../../components/CaronaCard/CaronaCard";
import { useToast } from "../../components/Feedback/FeedbackContext";
import { primeiroNome } from "../../utils/pessoas";
import { rotuloCategoria } from "../../utils/veiculos";
import { avisarPedido, prepararAudio } from "../../utils/aviso";
import { Estrelas } from "../../components/Avaliacao/Avaliacao";

const PERFIL_MOTORISTA = 1;
// Centro de Sorocaba: usado enquanto a localização do celular não chega
const SOROCABA = { lat: -23.5015, lng: -47.4526 };
const COR_MOTORISTA = "#1d4ed8";
const COR_PEDIDO = "#d9480f"; // ponto de embarque dos pedidos, no mapa da motorista
const RAIO_PEDIDOS_KM = 10;
const ENVIO_POSICAO_MS = 15000; // motorista online: manda a posição a cada 15 s ou quando se move
const RAIO_MOTORISTAS_KM = 15;
const TEMPO_OFERTA_S = 20; // quanto tempo um pedido fica na tela do motorista antes de sumir

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
  const meuNome = primeiroNome(usuario?.nome);
  const toast = useToast();

  const { obter: obterLocalizacao, acompanhar, posicao, erro: erroGps } = useLocalizacao();
  const centro = posicao || SOROCABA;

  const [corridaAtual, setCorridaAtual] = useState(null);
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [online, setOnline] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [aceitando, setAceitando] = useState(null);
  // Oferta com relógio: quando cada pedido apareceu aqui, quais foram recusados, e um "agora"
  // que avança a cada segundo para o contador (refs não recriam o buscarPedidos)
  const vistoEm = useRef({});
  const recusados = useRef(new Set());
  const [agora, setAgora] = useState(() => Date.now());
  const audioRef = useRef(null);
  const ultimoEnvio = useRef({ ponto: null, em: 0 }); // última posição enviada ao servidor
  const folhaRef = useRef(null); // a folha cobre a base do mapa; sua altura vira margem do enquadramento
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
    setReservando(carona.id_carona);
    try {
      const resposta = await api.post(`/caronas/${carona.id_carona}/reservas`, {
        id_usuario: idUsuario,
      });
      toast(resposta.data?.mensagem || "Vaga reservada!", {
        acao: { rotulo: "Ver em Viagens", para: "/app/viagens" },
      });
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
    prepararAudio(audioRef); // dentro do toque: é quando o navegador libera o som
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
      if (resposta.data.mensagem) toast(resposta.data.mensagem);
      if (!resposta.data.online) {
        setPedidos([]);
        vistoEm.current = {};
        recusados.current = new Set();
      }
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível mudar seu estado."));
    }
  };

  // Motorista online: segue a posição do aparelho e manda ao servidor quando se move
  // (ou a cada ENVIO_POSICAO_MS), para o passageiro ver o carro no lugar certo
  useEffect(() => {
    if (!ehMotorista || !online) return undefined;
    return acompanhar();
  }, [ehMotorista, online, acompanhar]);

  useEffect(() => {
    if (!ehMotorista || !online || !posicao || !idUsuario) return;
    const { ponto, em } = ultimoEnvio.current;
    const moveu = !ponto || distanciaHaversineKm(ponto, posicao) >= 0.05;
    if (!moveu && Date.now() - em < ENVIO_POSICAO_MS) return;
    ultimoEnvio.current = { ponto: posicao, em: Date.now() };
    api
      .post("/motoristas/online", {
        id_usuario: idUsuario,
        online: true,
        lat: posicao.lat,
        lng: posicao.lng,
        id_veiculo: veiculos[0]?.id_veiculo,
      })
      .catch(() => {
        // silencioso: a próxima leitura tenta de novo
      });
  }, [ehMotorista, online, posicao, idUsuario, veiculos]);

  // Motorista online: pedidos pendentes por perto
  const buscarPedidos = useCallback(async () => {
    if (!online) return;
    try {
      const resposta = await api.get("/corridas/", {
        params: { status: "pendente", lat: centro.lat, lng: centro.lng, raio_km: RAIO_PEDIDOS_KM },
      });
      // Pedido que ainda não tinha aparecido: começa o relógio da oferta e avisa com som e vibração
      const chegou = Date.now();
      const novos = resposta.data.filter((p) => !(p.id_corrida in vistoEm.current));
      novos.forEach((p) => {
        vistoEm.current[p.id_corrida] = chegou;
      });
      setPedidos(resposta.data);
      if (novos.length > 0) {
        setAgora(chegou);
        avisarPedido(audioRef);
      }
    } catch {
      // silencioso
    }
  }, [online, centro.lat, centro.lng]);

  useEffect(() => {
    buscarPedidos();
  }, [buscarPedidos]);
  useIntervalo(buscarPedidos, 4000, ehMotorista && online);

  // Contador da oferta: redesenha a cada segundo enquanto há pedidos na tela
  useEffect(() => {
    if (!online || pedidos.length === 0) return undefined;
    const temporizador = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(temporizador);
  }, [online, pedidos.length]);

  const segundosRestantes = (pedido) => {
    const inicio = vistoEm.current[pedido.id_corrida] || agora;
    return Math.max(0, TEMPO_OFERTA_S - Math.floor((agora - inicio) / 1000));
  };
  // O que o motorista vê: pedidos não recusados e dentro do tempo (os outros seguem para quem está perto)
  const ofertas = pedidos.filter((p) => !recusados.current.has(p.id_corrida) && segundosRestantes(p) > 0);

  const recusar = (pedido) => {
    recusados.current.add(pedido.id_corrida);
    setAgora(Date.now());
  };

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
                rotulo={`${primeiroNome(m.nome) || "Motorista"}${m.veiculo ? ` · ${m.veiculo.modelo}` : ""}`}
              />
            ))}
          {/* Motorista online: onde cada pedido embarca, para decidir pelo mapa */}
          {ehMotorista && online && !corridaAtual && (
            <>
              {ofertas.map((p) => (
                <Marcador
                  key={p.id_corrida}
                  posicao={{ lat: p.origem_lat, lng: p.origem_lng }}
                  cor={COR_PEDIDO}
                  rotulo={`${primeiroNome(p.passageiro?.nome) || "Passageiro"} · a ${formatarKm(p.distancia_ate_voce_km)} · ${formatarReais(p.preco_estimado)}`}
                />
              ))}
              {ofertas.length > 0 && (
                <Enquadrar
                  pontos={[...(posicao ? [posicao] : []), ...ofertas.map((p) => ({ lat: p.origem_lat, lng: p.origem_lng }))]}
                  margemInferior={(folhaRef.current?.offsetHeight || 380) + 24}
                />
              )}
            </>
          )}
        </Mapa>
      </div>

      {/* Folha inferior, no padrão dos apps de mobilidade */}
      <section className="inicio-folha" aria-label="Ações rápidas" ref={folhaRef}>
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
          Olá, {meuNome}
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
              <div className="inicio-pedidos" aria-live="polite">
                <h2>Pedidos próximos</h2>
                {ofertas.length === 0 ? (
                  <p className="inicio-pedidos-vazio">
                    <span className="inicio-pulso" aria-hidden="true" /> Aguardando pedidos em até{" "}
                    {RAIO_PEDIDOS_KM} km...
                  </p>
                ) : (
                  <ul>
                    {ofertas.map((p) => {
                      const restante = segundosRestantes(p);
                      return (
                        <li key={p.id_corrida} className="inicio-pedido">
                          <div className="inicio-pedido-tempo" aria-hidden="true">
                            <span style={{ width: `${(restante / TEMPO_OFERTA_S) * 100}%` }} />
                          </div>
                          <div className="inicio-pedido-rota">
                            {p.origem} → {p.destino}
                          </div>
                          <div className="inicio-pedido-info">
                            <span>
                              {primeiroNome(p.passageiro?.nome)}{" "}
                              <Estrelas
                                media={p.passageiro?.media_avaliacao}
                                total={p.passageiro?.total_avaliacoes}
                              />
                            </span>
                            <span>{rotuloCategoria(p.categoria || "carro")}</span>
                            <span>a {formatarKm(p.distancia_ate_voce_km)} de você</span>
                            <span>{formatarKm(p.distancia_km)} de corrida</span>
                            <strong>{formatarReais(p.preco_estimado)}</strong>
                          </div>
                          <div className="inicio-pedido-acoes">
                            <button
                              type="button"
                              className="app-btn app-btn-primario app-btn-pequeno"
                              onClick={() => aceitar(p)}
                              disabled={aceitando === p.id_corrida}
                            >
                              {aceitando === p.id_corrida ? "Aceitando..." : `Aceitar · ${restante} s`}
                            </button>
                            <button
                              type="button"
                              className="app-btn app-btn-secundario app-btn-pequeno"
                              onClick={() => recusar(p)}
                              disabled={aceitando === p.id_corrida}
                            >
                              Recusar
                            </button>
                          </div>
                        </li>
                      );
                    })}
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
