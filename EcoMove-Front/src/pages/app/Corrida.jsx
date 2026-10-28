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
import { useConfirmacao, useToast } from "../../components/Feedback/FeedbackContext";
import { Carregando, Esqueleto, EsqueletoCartao } from "../../components/Feedback/Esqueleto";
import { linksDeContato, primeiroNome } from "../../utils/pessoas";

const COR_ORIGEM = "#036141";
const COR_DESTINO = "#d9480f";
const INTERVALO_MS = 3000;

const IconeTelefone = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5a2 2 0 0 1 2-2z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const IconeMensagem = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      d="M4 5h16v11H9l-5 4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

/** Acompanhamento de uma corrida, para passageiro e motorista. */
function Corrida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const confirmar = useConfirmacao();
  const toast = useToast();

  const [corrida, setCorrida] = useState(null);
  const [rota, setRota] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
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
    if (confirmacao && !(await confirmar(confirmacao))) return;
    setAcao(true);
    setErro("");
    try {
      const resposta = await api.post(`/corridas/${id}/status`, { status, id_usuario: idUsuario });
      setCorrida(resposta.data.corrida);
      if (resposta.data.mensagem) toast(resposta.data.mensagem);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível atualizar a corrida."));
    } finally {
      setAcao(false);
    }
  };

  if (carregando) {
    return (
      <Carregando rotulo="Carregando corrida" className="corrida">
        <Esqueleto altura="200px" raio="16px" />
        <EsqueletoCartao linhas={2} acao={false} />
        <EsqueletoCartao linhas={5} acao={false} />
      </Carregando>
    );
  }
  if (!corrida) {
    return (
      <div className="corrida">
        <p className="app-alerta app-alerta-erro">{erro || "Corrida não encontrada."}</p>
        <Link to="/app" className="app-btn app-btn-primario">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const souMotorista = corrida.id_motorista === idUsuario;
  const souPassageiro = corrida.id_passageiro === idUsuario;
  const ativa = corridaAtiva(corrida);
  const outraPessoa = souPassageiro ? corrida.motorista : souMotorista ? corrida.passageiro : null;
  const nomeOutra = primeiroNome(outraPessoa?.nome);
  // Ligar e mandar mensagem só enquanto a corrida está combinada ou em andamento
  const contato =
    outraPessoa && (corrida.status === "aceita" || corrida.status === "em_andamento")
      ? linksDeContato(outraPessoa.telefone, {
          mensagem: `Oi, ${nomeOutra}! Sou ${primeiroNome(usuario?.nome)}, da corrida pelo EcoMove.`,
        })
      : null;
  const origem = { lat: corrida.origem_lat, lng: corrida.origem_lng };
  const destino = { lat: corrida.destino_lat, lng: corrida.destino_lng };
  const pontos = rota?.pontos || [
    [origem.lat, origem.lng],
    [destino.lat, destino.lng],
  ];

  return (
    <div className="corrida">
      <header className="corrida-cabecalho">
        <span className={`corrida-status corrida-status-${tomStatus(corrida.status)}`}>
          {rotuloStatus(corrida.status)}
        </span>
      </header>

      <div className="corrida-mapa">
        <Mapa centro={origem} zoom={13}>
          <Marcador posicao={origem} cor={COR_ORIGEM} rotulo={corrida.origem} />
          <Marcador posicao={destino} cor={COR_DESTINO} rotulo={corrida.destino} />
          <TracadoRota pontos={pontos} margemInferior={20} />
        </Mapa>
      </div>

      {erro && (
        <p className="app-alerta app-alerta-erro" role="alert">
          {erro}
        </p>
      )}
      {/* Situação atual */}
      <section className="app-cartao" aria-live="polite">
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
        {contato && (
          <div className="corrida-contato">
            <a className="app-btn app-btn-vazado" href={contato.ligar} aria-label={`Ligar para ${nomeOutra}`}>
              <IconeTelefone /> Ligar
            </a>
            <a className="app-btn app-btn-vazado" href={contato.whatsapp} target="_blank" rel="noopener noreferrer">
              <IconeMensagem /> Mensagem
            </a>
          </div>
        )}
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
                <AvaliacaoFeita avaliacao={avaliacaoFeita} nomeAvaliado={nomeOutra} />
              ) : (
                <AvaliacaoForm
                  viagem={{ id_corrida: corrida.id_corrida }}
                  idAvaliador={idUsuario}
                  idAvaliado={outraPessoa.id_usuario}
                  nomeAvaliado={nomeOutra}
                  onEnviada={(avaliacao, texto) => {
                    setAvaliacaoFeita(avaliacao);
                    toast(texto || "Avaliação enviada.");
                  }}
                />
              )
            )}
          </div>
        )}
        {corrida.status === "cancelada" && <p>Esta corrida foi cancelada.</p>}
      </section>

      {/* Trajeto e pessoas */}
      <section className="app-cartao">
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
                {primeiroNome(corrida.motorista.nome)}{" "}
                <Estrelas
                  media={corrida.motorista.media_avaliacao}
                  total={corrida.motorista.total_avaliacoes}
                />
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
                {primeiroNome(corrida.passageiro.nome)}{" "}
                <Estrelas
                  media={corrida.passageiro.media_avaliacao}
                  total={corrida.passageiro.total_avaliacoes}
                />
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
            className="app-btn app-btn-primario"
            onClick={() => mudarStatus("em_andamento")}
            disabled={acao}
          >
            Iniciar corrida
          </button>
        )}
        {souMotorista && corrida.status === "em_andamento" && (
          <button
            type="button"
            className="app-btn app-btn-primario"
            onClick={() => mudarStatus("concluida")}
            disabled={acao}
          >
            Concluir corrida
          </button>
        )}
        {souPassageiro && (corrida.status === "pendente" || corrida.status === "aceita") && (
          <button
            type="button"
            className="app-btn app-btn-perigo"
            onClick={() =>
              mudarStatus("cancelada", {
                titulo: "Cancelar esta corrida?",
                mensagem: "Se um motorista já aceitou, ele será avisado.",
                confirmar: "Cancelar corrida",
                cancelar: "Manter corrida",
                perigo: true,
              })
            }
            disabled={acao}
          >
            Cancelar corrida
          </button>
        )}
        {souMotorista && corrida.status === "aceita" && (
          <button
            type="button"
            className="app-btn app-btn-secundario"
            onClick={() =>
              mudarStatus("cancelada", {
                titulo: "Sair desta corrida?",
                mensagem: "O passageiro volta a procurar outro motorista.",
                confirmar: "Sair da corrida",
                cancelar: "Continuar na corrida",
                perigo: true,
              })
            }
            disabled={acao}
          >
            Sair da corrida
          </button>
        )}
        {!ativa && (
          <button type="button" className="app-btn app-btn-primario" onClick={() => navigate("/app")}>
            Voltar ao início
          </button>
        )}
      </div>
    </div>
  );
}

export default Corrida;
