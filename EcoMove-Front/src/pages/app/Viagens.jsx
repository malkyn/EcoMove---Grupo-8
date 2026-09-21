import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Viagens.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import CaronaCard from "../../components/CaronaCard/CaronaCard";

const PERFIL_MOTORISTA = 1;

/** Motorista: caronas que ofereceu. Passageiro: caronas que reservou. */
function Viagens() {
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;

  const [caronas, setCaronas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!idUsuario) return undefined;
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = ehMotorista
          ? await api.get("/caronas/", { params: { id_usuario: idUsuario } })
          : await api.get(`/usuarios/${idUsuario}/reservas`);
        if (ativo) setCaronas(resposta.data);
      } catch (err) {
        if (ativo) setErro(mensagemDeErro(err, "Não foi possível carregar suas viagens."));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [idUsuario, ehMotorista]);

  return (
    <div className="viagens">
      <h1 className="viagens-titulo">{ehMotorista ? "Minhas caronas" : "Minhas viagens"}</h1>

      {erro && (
        <p className="viagens-erro" role="alert">
          {erro}
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
            <CaronaCard key={c.id_carona} carona={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Viagens;
