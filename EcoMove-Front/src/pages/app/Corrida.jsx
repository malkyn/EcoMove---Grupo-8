import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Corrida.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { calcularRota } from "../../services/geo";
import { useIntervalo } from "../../hooks/useIntervalo";
import { mensagemDeErro } from "../../utils/erros";
import { formatarDataHora } from "../../utils/formatar";
import { co2EvitadoKg, formatarKm, formatarMinutos, formatarReais } from "../../utils/estimativas";
import { corridaAtiva, rotuloStatus, tomStatus } from "../../utils/corridas";
import { rotuloPropulsao } from "../../utils/veiculos";
import Mapa, { Marcador, TracadoRota } from "../../components/Mapa/Mapa";
import { AvaliacaoFeita, AvaliacaoForm, Estrelas } from "../../components/Avaliacao/Avaliacao";

const COR_ORIGEM = "#036141";
const COR_DESTINO = "#d9480f";
const INTERVALO_MS = 3000;

/** Acompanhamento de uma corrida, para passageiro e motorista. */
function Corrida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;

  const [corrida, setCorrida] = useState(null);
  const [rota, setRota] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [acao, setAcao] = useState(false);
  const [avaliacaoFeita, setAvaliacaoFeita] = useState(null);
  const [avaliacaoVerificada, setAvaliacaoVerificada] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const resposta = await api.get(`/corridas/${id}`);
      setCorrida(resposta.data);
      setErro("");
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível carregar a corrida."));
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Enquanto a corrida estiver ativa, consulta o servidor periodicamente
  useIntervalo(carregar, INTERVALO_MS, corridaAtiva(corrida));

  // Traçado no mapa (uma vez, quando a corrida chega)
  useEffect(() => {
    if (!corrida || rota) return undefined;
    const ctrl = new AbortController();
    calcularRota(
      { lat: corrida.origem_lat, lng: corrida.origem_lng },
      { lat: corrida.destino_lat, lng: corrida.destino_lng },
      ctrl.signal
    )
      .then(setRota)
      .catch(() => {});
    return () => ctrl.abort();
  }, [corrida, rota]);

  // Corrida concluída: verifica se este usuário já avaliou a outra pessoa
  useEffect(() => {
    if (!corrida || corrida.status !== "concluida" || avaliacaoVerificada || !idUsuario) {
      return undefined;
    }
    let ativo = true;
    api
      .get("/avaliacoes/", { params: { id_avaliador: idUsuario, id_corrida: corrida.id_corrida } })
      .then((resposta) => {
        if (ativo) setAvaliacaoFeita(resposta.data[0] || null);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setAvaliacaoVerificada(true);
      });
    return () => {
      ativo = false;
    };
  }, [corrida, idUsuario, avaliacaoVerificada]);

  const mudarStatus = async (status, confirmacao) => {
    if (confirmacao && !window.confirm(confirmacao)) return;
    setAcao(true);
    setErro("");
    try {
      const resposta = await api.post(`/corridas/${id}/status`, { status, id_usuario: idUsuario });
      setCorrida(resposta.data.corrida);
      setMensagem(resposta.data.mensagem || "");
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível atualizar a corrida."));
    } finally {
      setAcao(false);
    }
  };

  if (carregando) return <p className="corrida-carregando">Carregando corrida...</p>;
  if (!corrida) {
    return (
      <div className="corrida">
        <p className="corrida-msg corrida-erro">{erro || "Corrida não encontrada."}</p>
        <Link to="/app" className="corrida-botao">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const souMotorista = corrida.id_motorista === idUsuario;
  const souPassageiro = corrida.id_passageiro === idUsuario;
  const ativa = corridaAtiva(corrida);
  const outraPessoa = souPassageiro ? corrida.motorista : souMotorista ? corrida.passageiro : null;
  const origem = { lat: corrida.origem_lat, lng: corrida.origem_lng };
  const destino = { lat: corrida.destino_lat, lng: corrida.destino_lng };
  const pontos = rota?.pontos || [
    [origem.lat, origem.lng],
    [destino.lat, destino.lng],
  ];

  return (
    <div className="corrida">
      <header className="corrida-cabecalho">
        <Link to="/app" className="corrida-voltar">
          ‹ Início
        </Link>
        <div className="corrida-titulo-linha">
          <h1>Corrida #{corrida.id_corrida}</h1>
          <span className={`corrida-status corrida-status-${tomStatus(corrida.status)}`}>
            {rotuloStatus(corrida.status)}
          </span>
        </div>
      </header>

      <div className="corrida-mapa">
        <Mapa centro={origem} zoom={13}>
          <Marcador posicao={origem} cor={COR_ORIGEM} rotulo={corrida.origem} />
          <Marcador posicao={destino} cor={COR_DESTINO} rotulo={corrida.destino} />
          <TracadoRota pontos={pontos} margemInferior={20} />
        </Mapa>
      </div>

      {erro && (
        <p className="corrida-msg corrida-erro" role="alert">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="corrida-msg corrida-sucesso" role="status">
          {mensagem}
        </p>
      )}

      {/* Situação atual */}
      <section className="corrida-cartao" aria-live="polite">
        {corrida.status === "pendente" && (
          <div className="corrida-aguardando">
            <span className="corrida-pulso" aria-hidden="true" />
            <p>
              {souPassageiro
                ? "Procurando um motorista próximo. Você será avisado assim que alguém aceitar."
                : "Aguardando um motorista aceitar."}
            </p>
          </div>
        )}
        {corrida.status === "aceita" && souPassageiro && (
          <p>Seu motorista está a caminho do ponto de encontro.</p>
        )}
        {corrida.status === "aceita" && souMotorista && (
          <p>Vá até o passageiro. Quando ele embarcar, toque em Iniciar corrida.</p>
        )}
        {corrida.status === "em_andamento" && <p>Corrida em andamento. Boa viagem!</p>}
        {corrida.status === "concluida" && (
          <div className="corrida-resumo-final">
            <p>
              Corrida concluída. Distância de <strong>{formatarKm(corrida.distancia_km)}</strong>,
              valor estimado <strong>{formatarReais(corrida.preco_estimado)}</strong>.
            </p>
            {corrida.veiculo && (
              <p className="corrida-co2">
                Em um {rotuloPropulsao(corrida.veiculo.propulsao).toLowerCase()}, esta viagem evitou
                cerca de{" "}
                <strong>
                  {co2EvitadoKg(corrida.distancia_km, corrida.veiculo.propulsao)} kg de CO₂
                </strong>{" "}
                em relação a um carro a combustão.
              </p>
            )}
            <p className="corrida-nota">Sem cobrança nesta versão: o valor é apenas estimativa.</p>

            {outraPessoa && avaliacaoVerificada && (
              avaliacaoFeita ? (
                <AvaliacaoFeita avaliacao={avaliacaoFeita} nomeAvaliado={outraPessoa.nome} />
              ) : (
                <AvaliacaoForm
                  viagem={{ id_corrida: corrida.id_corrida }}
                  idAvaliador={idUsuario}
                  idAvaliado={outraPessoa.id_usuario}
                  nomeAvaliado={outraPessoa.nome}
                  onEnviada={(avaliacao, texto) => {
                    setAvaliacaoFeita(avaliacao);
                    setMensagem(texto || "Avaliação enviada.");
                  }}
                />
              )
            )}
          </div>
        )}
        {corrida.status === "cancelada" && <p>Esta corrida foi cancelada.</p>}
      </section>

      {/* Trajeto e pessoas */}
      <section className="corrida-cartao">
        <dl className="corrida-info">
          <div>
            <dt>Origem</dt>
            <dd>{corrida.origem}</dd>
          </div>
          <div>
            <dt>Destino</dt>
            <dd>{corrida.destino}</dd>
          </div>
          <div>
            <dt>Distância</dt>
            <dd>
              {formatarKm(corrida.distancia_km)} · {formatarMinutos(corrida.duracao_min)}
            </dd>
          </div>
          <div>
            <dt>Valor estimado</dt>
            <dd className="corrida-preco">{formatarReais(corrida.preco_estimado)}</dd>
          </div>
          <div>
            <dt>Pedida em</dt>
            <dd>{formatarDataHora(corrida.criada_em)}</dd>
          </div>
          {souPassageiro && corrida.motorista && (
            <div>
              <dt>Motorista</dt>
              <dd>
                {corrida.motorista.nome}{" "}
                <Estrelas
                  media={corrida.motorista.media_avaliacao}
                  total={corrida.motorista.total_avaliacoes}
                />
                {corrida.motorista.telefone && <small> · {corrida.motorista.telefone}</small>}
              </dd>
            </div>
          )}
          {souPassageiro && corrida.veiculo && (
            <div>
              <dt>Veículo</dt>
              <dd>
                {corrida.veiculo.modelo} · {corrida.veiculo.placa}
                {corrida.veiculo.cor && ` · ${corrida.veiculo.cor}`}
                <span className="badge-eletrico">{rotuloPropulsao(corrida.veiculo.propulsao)}</span>
              </dd>
            </div>
          )}
          {souMotorista && corrida.passageiro && (
            <div>
              <dt>Passageiro</dt>
              <dd>
                {corrida.passageiro.nome}{" "}
                <Estrelas
                  media={corrida.passageiro.media_avaliacao}
                  total={corrida.passageiro.total_avaliacoes}
                />
                {corrida.passageiro.telefone && <small> · {corrida.passageiro.telefone}</small>}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Ações */}
      <div className="corrida-acoes">
        {souMotorista && corrida.status === "aceita" && (
          <button
            type="button"
            className="corrida-botao"
            onClick={() => mudarStatus("em_andamento")}
            disabled={acao}
          >
            Iniciar corrida
          </button>
        )}
        {souMotorista && corrida.status === "em_andamento" && (
          <button
            type="button"
            className="corrida-botao"
            onClick={() => mudarStatus("concluida")}
            disabled={acao}
          >
            Concluir corrida
          </button>
        )}
        {souPassageiro && (corrida.status === "pendente" || corrida.status === "aceita") && (
          <button
            type="button"
            className="corrida-botao corrida-botao-perigo"
            onClick={() => mudarStatus("cancelada", "Cancelar esta corrida?")}
            disabled={acao}
          >
            Cancelar corrida
          </button>
        )}
        {souMotorista && corrida.status === "aceita" && (
          <button
            type="button"
            className="corrida-botao corrida-botao-secundario"
            onClick={() =>
              mudarStatus("cancelada", "Sair desta corrida? O passageiro voltará a procurar motorista.")
            }
            disabled={acao}
          >
            Sair da corrida
          </button>
        )}
        {!ativa && (
          <button type="button" className="corrida-botao" onClick={() => navigate("/app")}>
            Voltar ao início
          </button>
        )}
      </div>
    </div>
  );
}

export default Corrida;
