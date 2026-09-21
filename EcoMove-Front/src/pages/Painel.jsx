import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Painel.css";
import api from "../services/api";
import { getUsuarioLogado } from "../services/auth";
import { mensagemDeErro } from "../utils/erros";
import CaronaCard from "../components/CaronaCard/CaronaCard";

const PERFIL_MOTORISTA = 1;
const LIMITE_LISTA = 3;

function Painel() {
  const location = useLocation();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;

  const [veiculos, setVeiculos] = useState([]);
  const [caronas, setCaronas] = useState([]); // motorista: caronas oferecidas; passageiro: reservas
  const [avaliacoes, setAvaliacoes] = useState({ media: null, total: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!idUsuario) return undefined;
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const requisicoes = [
          api.get(`/usuarios/${idUsuario}/avaliacoes`),
          ehMotorista
            ? api.get("/caronas/", { params: { id_usuario: idUsuario } })
            : api.get(`/usuarios/${idUsuario}/reservas`),
        ];
        if (ehMotorista) {
          requisicoes.push(api.get("/veiculos/", { params: { id_usuario: idUsuario } }));
        }
        const [respAvaliacoes, respCaronas, respVeiculos] = await Promise.all(requisicoes);
        if (!ativo) return;
        setAvaliacoes(respAvaliacoes.data);
        setCaronas(respCaronas.data);
        if (respVeiculos) setVeiculos(respVeiculos.data);
      } catch (err) {
        if (ativo) setErro(mensagemDeErro(err, "Não foi possível carregar seus dados."));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [idUsuario, ehMotorista]);

  if (!usuario) return null; // RotaProtegida já redireciona; evita piscar conteúdo

  const avisoDeRota = location.state?.erro;

  return (
    <div className="painel">
      <div className="painel-conteudo">
        <header className="painel-cabecalho">
          <div>
            <h1>Olá, {usuario.nome}</h1>
            <p className="painel-subtitulo">
              <span className="painel-perfil">{ehMotorista ? "Motorista" : "Passageiro"}</span>
              <span className="painel-email">{usuario.email}</span>
            </p>
          </div>
          <div className="painel-avaliacao" aria-label="Sua avaliação média">
            <span className="painel-nota">
              {avaliacoes.media === null ? "–" : avaliacoes.media.toFixed(1)}
            </span>
            <span className="painel-nota-legenda">
              {avaliacoes.total === 0
                ? "sem avaliações"
                : `${avaliacoes.total} ${avaliacoes.total === 1 ? "avaliação" : "avaliações"}`}
            </span>
          </div>
        </header>

        {avisoDeRota && (
          <p className="painel-aviso" role="alert">
            {avisoDeRota}
          </p>
        )}
        {erro && (
          <p className="painel-erro" role="alert">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="painel-carregando">Carregando seus dados...</p>
        ) : (
          <div className="painel-grade">
            {ehMotorista && (
              <section className="painel-cartao">
                <div className="painel-cartao-topo">
                  <h2>Meus veículos</h2>
                  <span className="painel-contador">{veiculos.length}</span>
                </div>
                {veiculos.length === 0 ? (
                  <p className="painel-vazio">
                    Você ainda não cadastrou nenhum veículo. Ele é necessário para oferecer caronas.
                  </p>
                ) : (
                  <ul className="painel-lista-veiculos">
                    {veiculos.slice(0, LIMITE_LISTA).map((v) => (
                      <li key={v.id_veiculo}>
                        <strong>{v.modelo}</strong>
                        <span className="painel-placa">{v.placa}</span>
                        {v.eletrico && <span className="badge-eletrico">Elétrico</span>}
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/veiculos" className="painel-botao">
                  Gerenciar veículos
                </Link>
              </section>
            )}

            <section className="painel-cartao painel-cartao-largo">
              <div className="painel-cartao-topo">
                <h2>{ehMotorista ? "Minhas caronas" : "Minhas reservas"}</h2>
                <span className="painel-contador">{caronas.length}</span>
              </div>
              {caronas.length === 0 ? (
                <p className="painel-vazio">
                  {ehMotorista
                    ? "Você ainda não ofereceu nenhuma carona."
                    : "Você ainda não reservou nenhuma carona."}
                </p>
              ) : (
                <div className="painel-lista-caronas">
                  {caronas.slice(0, LIMITE_LISTA).map((c) => (
                    <CaronaCard key={c.id_carona} carona={c} />
                  ))}
                  {caronas.length > LIMITE_LISTA && (
                    <p className="painel-vazio">e mais {caronas.length - LIMITE_LISTA}...</p>
                  )}
                </div>
              )}
              <Link to={ehMotorista ? "/caronas/nova" : "/caronas"} className="painel-botao">
                {ehMotorista ? "Oferecer carona" : "Buscar caronas"}
              </Link>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Painel;
