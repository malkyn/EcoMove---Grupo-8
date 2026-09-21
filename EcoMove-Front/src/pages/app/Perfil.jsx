import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Perfil.css";
import api from "../../services/api";
import { getUsuarioLogado, logout } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import { useInstalarApp } from "../../hooks/useInstalarApp";
import { formatarData } from "../../utils/formatar";
import { Estrelas } from "../../components/Avaliacao/Avaliacao";

const PERFIL_MOTORISTA = 1;

function Perfil() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;
  const { jaInstalado, podeInstalar, precisaDeInstrucaoIOS, instalar } = useInstalarApp();

  const [avaliacoes, setAvaliacoes] = useState({ media: null, total: 0, avaliacoes: [] });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!idUsuario) return undefined;
    let ativo = true;
    api
      .get(`/usuarios/${idUsuario}/avaliacoes`)
      .then((resposta) => {
        if (ativo) setAvaliacoes(resposta.data);
      })
      .catch((err) => {
        if (ativo) setErro(mensagemDeErro(err, "Não foi possível carregar suas avaliações."));
      });
    return () => {
      ativo = false;
    };
  }, [idUsuario]);

  const sair = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (!usuario) return null;

  const iniciais = String(usuario.nome || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

  return (
    <div className="perfil">
      <header className="perfil-cabecalho">
        <div className="perfil-avatar" aria-hidden="true">
          {iniciais}
        </div>
        <div className="perfil-dados">
          <h1>{usuario.nome}</h1>
          <p>{usuario.email}</p>
          <span className="perfil-tipo">{ehMotorista ? "Motorista" : "Passageiro"}</span>
        </div>
        <div className="perfil-nota" aria-label="Sua avaliação média">
          <strong>{avaliacoes.media === null ? "–" : avaliacoes.media.toFixed(1)}</strong>
          <small>
            {avaliacoes.total === 0
              ? "sem avaliações"
              : `${avaliacoes.total} ${avaliacoes.total === 1 ? "avaliação" : "avaliações"}`}
          </small>
        </div>
      </header>

      {erro && (
        <p className="app-alerta app-alerta-erro" role="alert">
          {erro}
        </p>
      )}

      <ul className="perfil-menu">
        {ehMotorista && (
          <li>
            <Link to="/app/veiculos" className="perfil-item">
              <span>Meus veículos</span>
              <span className="perfil-seta" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        )}

        {!jaInstalado && podeInstalar && (
          <li>
            <button type="button" className="perfil-item" onClick={instalar}>
              <span>Instalar o app no celular</span>
              <span className="perfil-seta" aria-hidden="true">
                ›
              </span>
            </button>
          </li>
        )}

        {precisaDeInstrucaoIOS && (
          <li className="perfil-dica">
            No iPhone: toque em <strong>Compartilhar</strong> e depois em{" "}
            <strong>Adicionar à Tela de Início</strong> para instalar o app.
          </li>
        )}

        {jaInstalado && <li className="perfil-dica">App instalado neste aparelho.</li>}

        <li>
          <button type="button" className="perfil-item perfil-sair" onClick={sair}>
            <span>Sair</span>
          </button>
        </li>
      </ul>

      <section className="perfil-avaliacoes" aria-label="Avaliações recebidas">
        <h2>
          Avaliações recebidas{" "}
          <Estrelas media={avaliacoes.media} total={avaliacoes.total} />
        </h2>
        {avaliacoes.total === 0 ? (
          <p className="perfil-avaliacoes-vazio">
            Você ainda não recebeu avaliações. Elas aparecem aqui depois das suas viagens.
          </p>
        ) : (
          <ul className="perfil-avaliacoes-lista">
            {(avaliacoes.avaliacoes || []).slice(0, 5).map((a) => (
              <li key={a.id_avaliacao}>
                <div className="perfil-avaliacao-topo">
                  <Estrelas media={a.nota} total={1} semTotal />
                  <span>{a.avaliador}</span>
                  <small>{formatarData(a.criada_em)}</small>
                </div>
                {a.comentario && <p>“{a.comentario}”</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="perfil-rodape">EcoMove · projeto UPX V · FACENS 2026</p>
    </div>
  );
}

export default Perfil;
