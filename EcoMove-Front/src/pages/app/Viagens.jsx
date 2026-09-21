import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Viagens.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import CaronaCard from "../../components/CaronaCard/CaronaCard";

const PERFIL_MOTORISTA = 1;

/** Motorista: caronas que ofereceu. Passageiro: caronas que reservou. */
function Viagens() {
  const location = useLocation();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;

  const [caronas, setCaronas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");
  const [processando, setProcessando] = useState(null);

  const carregar = useCallback(async () => {
    if (!idUsuario) return;
    setCarregando(true);
    setErro("");
    try {
      const resposta = ehMotorista
        ? await api.get("/caronas/", { params: { id_usuario: idUsuario } })
        : await api.get(`/usuarios/${idUsuario}/reservas`);
      setCaronas(resposta.data);
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
      ) : caronas.length === 0 ? (
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
    </div>
  );
}

export default Viagens;
