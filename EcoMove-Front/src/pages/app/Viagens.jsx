import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Viagens.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import { agoraLocal, formatarDataHora } from "../../utils/formatar";
import { formatarReais } from "../../utils/estimativas";
import { corridaAtiva, rotuloStatus, tomStatus } from "../../utils/corridas";
import CaronaCard from "../../components/CaronaCard/CaronaCard";
import { AvaliacaoForm, Estrelas } from "../../components/Avaliacao/Avaliacao";

const PERFIL_MOTORISTA = 1;

/** Caronas (oferecidas ou reservadas) e corridas (pedidas ou atendidas) do usuário. */
function Viagens() {
  const location = useLocation();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;

  const [caronas, setCaronas] = useState([]);
  const [corridas, setCorridas] = useState([]);
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [processando, setProcessando] = useState(null);
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
    setMensagem(texto || "Avaliação enviada.");
    carregar(); // atualiza as médias mostradas nos cards
  };

  const cancelarCarona = async (carona) => {
    const confirmou = window.confirm(
      `Cancelar a carona ${carona.origem} → ${carona.destino}? Os passageiros perderão a reserva.`
    );
    if (!confirmou) return;
    setProcessando(carona.id_carona);
    setErro("");
    setMensagem("");
    try {
      const resposta = await api.delete(`/caronas/${carona.id_carona}`);
      setMensagem(resposta.data?.mensagem || "Carona cancelada.");
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível cancelar a carona."));
    } finally {
      setProcessando(null);
    }
  };

  const cancelarReserva = async (carona) => {
    const confirmou = window.confirm(`Cancelar sua reserva na carona ${carona.origem} → ${carona.destino}?`);
    if (!confirmou) return;
    setProcessando(carona.id_carona);
    setErro("");
    setMensagem("");
    try {
      const resposta = await api.delete(`/caronas/${carona.id_carona}/reservas/${idUsuario}`);
      setMensagem(resposta.data?.mensagem || "Reserva cancelada.");
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
      return <span className="app-chip app-chip-ok">Você avaliou {pessoa.nome}</span>;
    }
    if (estaAvaliando(tipo, id, pessoa.id_usuario)) {
      return (
        <AvaliacaoForm
          viagem={tipo === "carona" ? { id_carona: id } : { id_corrida: id }}
          idAvaliador={idUsuario}
          idAvaliado={pessoa.id_usuario}
          nomeAvaliado={pessoa.nome}
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
        Avaliar {pessoa.nome.split(" ")[0]}
      </button>
    );
  };

  const agora = agoraLocal();

  return (
    <div className="viagens">
      <h1 className="app-titulo">{ehMotorista ? "Minhas caronas" : "Minhas viagens"}</h1>

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

      {carregando ? (
        <p className="app-vazio">Carregando...</p>
      ) : (
        <>
          <section className="viagens-secao">
            <h2 className="app-subtitulo">
              {ehMotorista ? "Caronas oferecidas" : "Caronas reservadas"}
            </h2>
            {caronas.length === 0 ? (
              <div className="app-vazio">
                <p>
                  {ehMotorista
                    ? "Você ainda não ofereceu nenhuma carona."
                    : "Você ainda não reservou nenhuma carona."}
                </p>
                <Link to={ehMotorista ? "/app/caronas/nova" : "/app/destino"} className="app-btn app-btn-primario app-btn-pequeno">
                  {ehMotorista ? "Oferecer carona" : "Buscar carona"}
                </Link>
              </div>
            ) : (
              <div className="viagens-lista">
                {caronas.map((c) => {
                  const jaAconteceu = c.horario <= agora;
                  return (
                    <CaronaCard key={c.id_carona} carona={c}>
                      {ehMotorista && c.passageiros?.length > 0 && (
                        <span className="viagens-passageiros">
                          Passageiros:{" "}
                          {c.passageiros.map((p) => (
                            <span key={p.id_usuario} className="viagens-passageiro">
                              {p.nome}{" "}
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
            )}
          </section>

          <section className="viagens-secao">
            <h2 className="app-subtitulo">Corridas</h2>
            {corridas.length === 0 ? (
              <p className="app-vazio">
                {ehMotorista
                  ? "Nenhuma corrida atendida ainda. Fique online no Início para receber pedidos."
                  : "Nenhuma corrida pedida ainda."}
              </p>
            ) : (
              <div className="viagens-lista">
                {corridas.map((c) => {
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
                            {ehMotorista ? "Passageiro" : "Motorista"}: {outraPessoa.nome}{" "}
                            <Estrelas
                              media={outraPessoa.media_avaliacao}
                              total={outraPessoa.total_avaliacoes}
                            />
                          </span>
                        )}
                      </div>
                      {corridaAtiva(c) && (
                        <Link to={`/app/corridas/${c.id_corrida}`} className="app-btn app-btn-primario app-btn-pequeno">
                          Acompanhar
                        </Link>
                      )}
                      {c.status === "concluida" && renderAvaliacao("corrida", c.id_corrida, outraPessoa)}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Viagens;
