import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Viagens.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import { formatarDataHora } from "../../utils/formatar";
import { formatarReais } from "../../utils/estimativas";
import { corridaAtiva, rotuloStatus, tomStatus } from "../../utils/corridas";
import CaronaCard from "../../components/CaronaCard/CaronaCard";

const PERFIL_MOTORISTA = 1;

/** Caronas (oferecidas ou reservadas) e corridas (pedidas ou atendidas) do usuário. */
function Viagens() {
  const location = useLocation();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;

  const [caronas, setCaronas] = useState([]);
  const [corridas, setCorridas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [processando, setProcessando] = useState(null);

  const carregar = useCallback(async () => {
    if (!idUsuario) return;
    setCarregando(true);
    setErro("");
    try {
      const [respCaronas, respCorridas] = await Promise.all([
        ehMotorista
          ? api.get("/caronas/", { params: { id_usuario: idUsuario } })
          : api.get(`/usuarios/${idUsuario}/reservas`),
        api.get("/corridas/", { params: { id_usuario: idUsuario } }),
      ]);
      setCaronas(respCaronas.data);
      setCorridas(respCorridas.data);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível carregar suas viagens."));
    } finally {
      setCarregando(false);
    }
  }, [idUsuario, ehMotorista]);

  useEffect(() => {
    carregar();
  }, [carregar]);

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

  return (
    <div className="viagens">
      <h1 className="viagens-titulo">{ehMotorista ? "Minhas caronas" : "Minhas viagens"}</h1>

      {erro && (
        <p className="viagens-msg viagens-erro" role="alert">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="viagens-msg viagens-sucesso" role="status">
          {mensagem}
        </p>
      )}

      {carregando ? (
        <p className="viagens-vazio">Carregando...</p>
      ) : (
        <>
          <section className="viagens-secao">
            <h2 className="viagens-subtitulo">
              {ehMotorista ? "Caronas oferecidas" : "Caronas reservadas"}
            </h2>
            {caronas.length === 0 ? (
              <div className="viagens-vazio">
                <p>
                  {ehMotorista
                    ? "Você ainda não ofereceu nenhuma carona."
                    : "Você ainda não reservou nenhuma carona."}
                </p>
                <Link to={ehMotorista ? "/app/caronas/nova" : "/app/destino"} className="viagens-botao">
                  {ehMotorista ? "Oferecer carona" : "Buscar carona"}
                </Link>
              </div>
            ) : (
              <div className="viagens-lista">
                {caronas.map((c) => (
                  <CaronaCard key={c.id_carona} carona={c}>
                    {ehMotorista && c.passageiros?.length > 0 && (
                      <span className="viagens-passageiros">
                        Passageiros: {c.passageiros.map((p) => p.nome).join(", ")}
                      </span>
                    )}
                    <button
                      type="button"
                      className="viagens-cancelar"
                      onClick={() => (ehMotorista ? cancelarCarona(c) : cancelarReserva(c))}
                      disabled={processando === c.id_carona}
                    >
                      {processando === c.id_carona
                        ? "..."
                        : ehMotorista
                          ? "Cancelar carona"
                          : "Cancelar reserva"}
                    </button>
                  </CaronaCard>
                ))}
              </div>
            )}
          </section>

          <section className="viagens-secao">
            <h2 className="viagens-subtitulo">Corridas</h2>
            {corridas.length === 0 ? (
              <p className="viagens-vazio">
                {ehMotorista
                  ? "Nenhuma corrida atendida ainda. Fique online no Início para receber pedidos."
                  : "Nenhuma corrida pedida ainda."}
              </p>
            ) : (
              <div className="viagens-lista">
                {corridas.map((c) => (
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
                      {ehMotorista && c.passageiro && <span>Passageiro: {c.passageiro.nome}</span>}
                      {!ehMotorista && c.motorista && <span>Motorista: {c.motorista.nome}</span>}
                    </div>
                    {corridaAtiva(c) && (
                      <Link to={`/app/corridas/${c.id_corrida}`} className="viagens-botao">
                        Acompanhar
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Viagens;
