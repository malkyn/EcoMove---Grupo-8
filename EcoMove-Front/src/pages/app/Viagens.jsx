import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Viagens.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import { agoraLocal, formatarDataHora } from "../../utils/formatar";
import { formatarReais } from "../../utils/estimativas";
import { corridaAtiva, rotuloStatus, tomStatus } from "../../utils/corridas";
import CaronaCard from "../../components/CaronaCard/CaronaCard";
import { AvaliacaoForm, Estrelas } from "../../components/Avaliacao/Avaliacao";
import { useConfirmacao, useToast } from "../../components/Feedback/FeedbackContext";
import { EsqueletoLista } from "../../components/Feedback/Esqueleto";
import { primeiroNome } from "../../utils/pessoas";

const PERFIL_MOTORISTA = 1;

/** Caronas (oferecidas ou reservadas) e corridas (pedidas ou atendidas) do usuário. */
function Viagens() {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmar = useConfirmacao();
  const toast = useToast();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;

  const [caronas, setCaronas] = useState([]);
  const [corridas, setCorridas] = useState([]);
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(null);
  const avisoMostrado = useRef(false);
  const [aba, setAba] = useState("proximas"); // "proximas" | "passadas"
  const abaEscolhida = useRef(false); // depois que a pessoa escolhe, a tela não troca sozinha
  // Quem está sendo avaliado agora: { tipo: "carona" | "corrida", id, idAvaliado, nome }
  const [avaliando, setAvaliando] = useState(null);

  const carregar = useCallback(async () => {
    if (!idUsuario) return;
    setCarregando(true);
    setErro("");
    try {
      const [respCaronas, respCorridas, respAvaliacoes] = await Promise.all([
        ehMotorista
          ? api.get("/caronas/", { params: { id_usuario: idUsuario } })
          : api.get(`/usuarios/${idUsuario}/reservas`),
        api.get("/corridas/", { params: { id_usuario: idUsuario } }),
        api.get("/avaliacoes/", { params: { id_avaliador: idUsuario } }),
      ]);
      setCaronas(respCaronas.data);
      setCorridas(respCorridas.data);
      setMinhasAvaliacoes(respAvaliacoes.data);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível carregar suas viagens."));
    } finally {
      setCarregando(false);
    }
  }, [idUsuario, ehMotorista]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Aviso trazido por outra tela (ex.: "Carona publicada"). Limpa o estado da rota para
  // não repetir ao voltar; a ref evita o toast em dobro no modo estrito do React.
  useEffect(() => {
    const aviso = location.state?.mensagem;
    if (!aviso || avisoMostrado.current) return;
    avisoMostrado.current = true;
    toast(aviso);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, toast]);

  const jaAvaliei = (tipo, id, idAvaliado) =>
    minhasAvaliacoes.some(
      (a) =>
        a.id_avaliado === idAvaliado && (tipo === "carona" ? a.id_carona === id : a.id_corrida === id)
    );

  const estaAvaliando = (tipo, id, idAvaliado) =>
    avaliando && avaliando.tipo === tipo && avaliando.id === id && avaliando.idAvaliado === idAvaliado;

  const aoEnviarAvaliacao = (avaliacao, texto) => {
    setMinhasAvaliacoes((prev) => [...prev, avaliacao]);
    setAvaliando(null);
    toast(texto || "Avaliação enviada.");
    carregar(); // atualiza as médias mostradas nos cards
  };

  const cancelarCarona = async (carona) => {
    const confirmou = await confirmar({
      titulo: "Cancelar esta carona?",
      mensagem: `${carona.origem} → ${carona.destino}. Quem já reservou perde a vaga.`,
      confirmar: "Cancelar carona",
      cancelar: "Manter carona",
      perigo: true,
    });
    if (!confirmou) return;
    setProcessando(carona.id_carona);
    setErro("");
    try {
      const resposta = await api.delete(`/caronas/${carona.id_carona}`);
      toast(resposta.data?.mensagem || "Carona cancelada.");
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível cancelar a carona."));
    } finally {
      setProcessando(null);
    }
  };

  const cancelarReserva = async (carona) => {
    const confirmou = await confirmar({
      titulo: "Cancelar sua reserva?",
      mensagem: `${carona.origem} → ${carona.destino}. A vaga volta para outras pessoas.`,
      confirmar: "Cancelar reserva",
      cancelar: "Manter reserva",
      perigo: true,
    });
    if (!confirmou) return;
    setProcessando(carona.id_carona);
    setErro("");
    try {
      const resposta = await api.delete(`/caronas/${carona.id_carona}/reservas/${idUsuario}`);
      toast(resposta.data?.mensagem || "Reserva cancelada.");
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível cancelar a reserva."));
    } finally {
      setProcessando(null);
    }
  };

  /** Botão "Avaliar" ou o formulário aberto, para uma pessoa em uma viagem. */
  const renderAvaliacao = (tipo, id, pessoa) => {
    if (!pessoa || pessoa.id_usuario === idUsuario) return null;
    if (jaAvaliei(tipo, id, pessoa.id_usuario)) {
      return <span className="app-chip app-chip-ok">Você avaliou {primeiroNome(pessoa.nome)}</span>;
    }
    if (estaAvaliando(tipo, id, pessoa.id_usuario)) {
      return (
        <AvaliacaoForm
          viagem={tipo === "carona" ? { id_carona: id } : { id_corrida: id }}
          idAvaliador={idUsuario}
          idAvaliado={pessoa.id_usuario}
          nomeAvaliado={primeiroNome(pessoa.nome)}
          papelAvaliado={ehMotorista ? "passageiro" : "motorista"}
          onEnviada={aoEnviarAvaliacao}
          onCancelar={() => setAvaliando(null)}
        />
      );
    }
    return (
      <button
        type="button"
        className="avaliar-botao"
        onClick={() => setAvaliando({ tipo, id, idAvaliado: pessoa.id_usuario, nome: pessoa.nome })}
      >
        Avaliar {primeiroNome(pessoa.nome)}
      </button>
    );
  };

  const agora = agoraLocal();

  // Próximas: caronas ainda por vir e corridas ativas. Passadas: o resto.
  const caronasProximas = caronas.filter((c) => c.horario > agora);
  const caronasPassadas = caronas.filter((c) => c.horario <= agora);
  const corridasProximas = corridas.filter((c) => corridaAtiva(c));
  const corridasPassadas = corridas.filter((c) => !corridaAtiva(c));
  const totalProximas = caronasProximas.length + corridasProximas.length;
  const totalPassadas = caronasPassadas.length + corridasPassadas.length;
  const mostrarProximas = aba === "proximas";
  const caronasDaAba = mostrarProximas ? caronasProximas : caronasPassadas;
  const corridasDaAba = mostrarProximas ? corridasProximas : corridasPassadas;
  const abaVazia = caronasDaAba.length === 0 && corridasDaAba.length === 0;

  // Sem nada à frente, abre direto em Passadas (só até a pessoa escolher uma aba)
  useEffect(() => {
    if (carregando || abaEscolhida.current) return;
    if (totalProximas === 0 && totalPassadas > 0) setAba("passadas");
  }, [carregando, totalProximas, totalPassadas]);

  const escolherAba = (nova) => {
    abaEscolhida.current = true;
    setAba(nova);
  };

  // Repete uma corrida encerrada: abre o "Para onde?" já com o trajeto
  const pedirDeNovo = (c) =>
    navigate("/app/destino", {
      state: {
        origem: { id: `corrida-${c.id_corrida}-origem`, nome: c.origem, lat: c.origem_lat, lng: c.origem_lng },
        destino: { id: `corrida-${c.id_corrida}-destino`, nome: c.destino, lat: c.destino_lat, lng: c.destino_lng },
      },
    });

  return (
    <div className="viagens">
      <h1 className="app-titulo">{ehMotorista ? "Minhas caronas" : "Minhas viagens"}</h1>

      <div className="app-segmentado viagens-abas" aria-label="Período">
        <button
          type="button"
          className={mostrarProximas ? "ativo" : ""}
          aria-pressed={mostrarProximas}
          onClick={() => escolherAba("proximas")}
        >
          Próximas{totalProximas > 0 && ` · ${totalProximas}`}
        </button>
        <button
          type="button"
          className={!mostrarProximas ? "ativo" : ""}
          aria-pressed={!mostrarProximas}
          onClick={() => escolherAba("passadas")}
        >
          Passadas{totalPassadas > 0 && ` · ${totalPassadas}`}
        </button>
      </div>

      {erro && (
        <p className="app-alerta app-alerta-erro" role="alert">
          {erro}
        </p>
      )}
      {carregando ? (
        <EsqueletoLista itens={2} rotulo="Carregando suas viagens" />
      ) : abaVazia ? (
        <div className="app-vazio">
          <p>
            {mostrarProximas
              ? ehMotorista
                ? "Nenhuma carona marcada nem corrida em andamento."
                : "Nenhuma viagem marcada por enquanto."
              : "Nenhuma viagem realizada ainda."}
          </p>
          {mostrarProximas && (
            <Link to={ehMotorista ? "/app/caronas/nova" : "/app/destino"} className="app-btn app-btn-primario app-btn-pequeno">
              {ehMotorista ? "Oferecer carona" : "Para onde?"}
            </Link>
          )}
        </div>
      ) : (
        <>
          {caronasDaAba.length > 0 && (
          <section className="viagens-secao">
            <h2 className="app-subtitulo">
              {ehMotorista ? "Caronas oferecidas" : "Caronas reservadas"}
            </h2>
              <div className="viagens-lista">
                {caronasDaAba.map((c) => {
                  const jaAconteceu = c.horario <= agora;
                  return (
                    <CaronaCard key={c.id_carona} carona={c}>
                      {ehMotorista && c.passageiros?.length > 0 && (
                        <span className="viagens-passageiros">
                          Passageiros:{" "}
                          {c.passageiros.map((p) => (
                            <span key={p.id_usuario} className="viagens-passageiro">
                              {primeiroNome(p.nome)}{" "}
                              <Estrelas media={p.media_avaliacao} total={p.total_avaliacoes} />
                            </span>
                          ))}
                        </span>
                      )}

                      {jaAconteceu ? (
                        <>
                          <span className="app-chip">Realizada</span>
                          {ehMotorista
                            ? c.passageiros?.map((p) => (
                                <React.Fragment key={p.id_usuario}>
                                  {renderAvaliacao("carona", c.id_carona, p)}
                                </React.Fragment>
                              ))
                            : renderAvaliacao("carona", c.id_carona, c.motorista)}
                        </>
                      ) : (
                        <button
                          type="button"
                          className="app-btn app-btn-perigo app-btn-pequeno"
                          onClick={() => (ehMotorista ? cancelarCarona(c) : cancelarReserva(c))}
                          disabled={processando === c.id_carona}
                        >
                          {processando === c.id_carona
                            ? "..."
                            : ehMotorista
                              ? "Cancelar carona"
                              : "Cancelar reserva"}
                        </button>
                      )}
                    </CaronaCard>
                  );
                })}
              </div>
          </section>
          )}

          {corridasDaAba.length > 0 && (
          <section className="viagens-secao">
            <h2 className="app-subtitulo">Corridas</h2>
              <div className="viagens-lista">
                {corridasDaAba.map((c) => {
                  const outraPessoa = ehMotorista ? c.passageiro : c.motorista;
                  return (
                    <article key={c.id_corrida} className="corrida-resumo">
                      <div className="corrida-resumo-topo">
                        <span className={`corrida-resumo-status tom-${tomStatus(c.status)}`}>
                          {rotuloStatus(c.status)}
                        </span>
                        <span className="corrida-resumo-data">{formatarDataHora(c.criada_em)}</span>
                      </div>
                      <div className="corrida-resumo-rota">
                        {c.origem} → {c.destino}
                      </div>
                      <div className="corrida-resumo-info">
                        <strong>{formatarReais(c.preco_estimado)}</strong>
                        {outraPessoa && (
                          <span>
                            {ehMotorista ? "Passageiro" : "Motorista"}: {primeiroNome(outraPessoa.nome)}{" "}
                            <Estrelas
                              media={outraPessoa.media_avaliacao}
                              total={outraPessoa.total_avaliacoes}
                            />
                          </span>
                        )}
                      </div>
                      {corridaAtiva(c) ? (
                        <Link to={`/app/corridas/${c.id_corrida}`} className="app-btn app-btn-primario app-btn-pequeno">
                          Acompanhar
                        </Link>
                      ) : (
                        <div className="viagens-acoes">
                          <Link to={`/app/corridas/${c.id_corrida}`} className="app-btn app-btn-vazado app-btn-pequeno">
                            Ver detalhes
                          </Link>
                          {!ehMotorista && c.status === "concluida" && (
                            <button
                              type="button"
                              className="app-btn app-btn-secundario app-btn-pequeno"
                              onClick={() => pedirDeNovo(c)}
                            >
                              Pedir de novo
                            </button>
                          )}
                        </div>
                      )}
                      {c.status === "concluida" && renderAvaliacao("corrida", c.id_corrida, outraPessoa)}
                    </article>
                  );
                })}
              </div>
          </section>
          )}
        </>
      )}
    </div>
  );
}

export default Viagens;
