import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OferecerCarona.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { calcularRota, enderecoDe } from "../../services/geo";
import { useLocalizacao } from "../../hooks/useLocalizacao";
import { mensagemDeErro } from "../../utils/erros";
import { agoraLocal, proximaHoraCheia } from "../../utils/formatar";
import { estimarCarona, formatarKm, formatarMinutos, formatarReais } from "../../utils/estimativas";
import { rotuloPropulsao } from "../../utils/veiculos";
import CampoEndereco from "../../components/CampoEndereco/CampoEndereco";
import Mapa, { Marcador, TracadoRota } from "../../components/Mapa/Mapa";

const SOROCABA = { lat: -23.5015, lng: -47.4526 };
const COR_ORIGEM = "#036141";
const COR_DESTINO = "#d9480f";

const IconeAlvo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

function OferecerCarona() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const localizacao = useLocalizacao();

  const [veiculos, setVeiculos] = useState([]);
  const [carregandoVeiculos, setCarregandoVeiculos] = useState(true);
  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [dataHora, setDataHora] = useState(proximaHoraCheia);
  const [idVeiculo, setIdVeiculo] = useState("");
  const [vagas, setVagas] = useState(2);
  const [rota, setRota] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Veículos do motorista (o primeiro fica pré-selecionado)
  useEffect(() => {
    if (!idUsuario) return undefined;
    let ativo = true;
    api
      .get("/veiculos/", { params: { id_usuario: idUsuario } })
      .then((resposta) => {
        if (!ativo) return;
        setVeiculos(resposta.data);
        if (resposta.data.length > 0) setIdVeiculo(String(resposta.data[0].id_veiculo));
      })
      .catch((err) => {
        if (ativo) setErro(mensagemDeErro(err, "Não foi possível carregar seus veículos."));
      })
      .finally(() => {
        if (ativo) setCarregandoVeiculos(false);
      });
    return () => {
      ativo = false;
    };
  }, [idUsuario]);

  // Rota entre origem e destino
  useEffect(() => {
    if (!origem || !destino) {
      setRota(null);
      return undefined;
    }
    const ctrl = new AbortController();
    setCalculando(true);
    calcularRota(origem, destino, ctrl.signal)
      .then((resultado) => setRota(resultado))
      .catch((err) => {
        if (err.name !== "AbortError") setErro("Não foi possível calcular a rota.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCalculando(false);
      });
    return () => ctrl.abort();
  }, [origem, destino]);

  const veiculoSelecionado = veiculos.find((v) => String(v.id_veiculo) === String(idVeiculo));
  const ehMoto = veiculoSelecionado?.categoria === "moto";
  const maxVagas = ehMoto ? 1 : 8;

  // Moto: só 1 passageiro
  useEffect(() => {
    if (ehMoto && vagas > 1) setVagas(1);
  }, [ehMoto, vagas]);

  const usarMinhaLocalizacao = async () => {
    setErro("");
    const ponto = await localizacao.obter();
    if (!ponto) {
      setErro("Sem acesso à sua localização. Digite o endereço de origem.");
      return;
    }
    setOrigem({ id: "gps", nome: "Minha localização", ...ponto });
    try {
      const nome = await enderecoDe(ponto.lat, ponto.lng);
      setOrigem({ id: "gps", nome: `Minha localização · ${nome}`, ...ponto });
    } catch {
      // mantém "Minha localização"
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!origem || !destino) {
      setErro("Escolha a origem e o destino nas sugestões.");
      return;
    }
    if (!veiculoSelecionado) {
      setErro("Selecione um veículo.");
      return;
    }
    if (!dataHora || dataHora <= agoraLocal()) {
      setErro("A data e hora precisam ser no futuro.");
      return;
    }
    const vagasNum = Number(vagas);
    if (!Number.isInteger(vagasNum) || vagasNum < 1 || vagasNum > maxVagas) {
      setErro(`Informe de 1 a ${maxVagas} vaga(s).`);
      return;
    }

    setEnviando(true);
    try {
      await api.post("/caronas/", {
        id_usuario: idUsuario,
        id_veiculo: veiculoSelecionado.id_veiculo,
        origem: origem.nome.replace(/^Minha localização · /, ""),
        destino: destino.nome,
        origem_lat: origem.lat,
        origem_lng: origem.lng,
        destino_lat: destino.lat,
        destino_lng: destino.lng,
        horario: dataHora,
        vagas_disponiveis: vagasNum,
        distancia_km: rota ? Math.round(rota.distanciaKm * 10) / 10 : null,
      });
      navigate("/app/viagens", {
        replace: true,
        state: { mensagem: "Carona publicada! Ela já aparece para passageiros com trajeto parecido." },
      });
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível publicar a carona."));
    } finally {
      setEnviando(false);
    }
  };

  const centro = origem || localizacao.posicao || SOROCABA;
  const semVeiculos = !carregandoVeiculos && veiculos.length === 0;

  return (
    <div className="oferecer">
      <h1 className="app-titulo">Oferecer carona</h1>

      {erro && (
        <p className="app-alerta app-alerta-erro" role="alert">
          {erro}
        </p>
      )}

      {semVeiculos ? (
        <div className="app-cartao oferecer-sem-veiculo">
          <p>Você precisa cadastrar um veículo elétrico ou híbrido antes de oferecer caronas.</p>
          <Link to="/app/veiculos" className="app-btn app-btn-primario">
            Cadastrar veículo
          </Link>
        </div>
      ) : (
        <form className="app-cartao oferecer-form" onSubmit={handleSubmit}>
          <CampoEndereco
            id="carona-origem"
            rotulo="Saída"
            placeholder="De onde você sai?"
            valor={origem}
            onSelecionar={setOrigem}
            acaoExtra={
              <button
                type="button"
                className="app-gps"
                onClick={usarMinhaLocalizacao}
                disabled={localizacao.buscando}
                aria-label="Usar minha localização"
                title="Usar minha localização"
              >
                <IconeAlvo />
              </button>
            }
          />
          <CampoEndereco
            id="carona-destino"
            rotulo="Destino"
            placeholder="Para onde você vai?"
            valor={destino}
            onSelecionar={setDestino}
          />

          {(origem || destino) && (
            <div className="oferecer-mapa">
              <Mapa centro={centro} zoom={13} posicaoUsuario={localizacao.posicao}>
                {origem && origem.id !== "gps" && (
                  <Marcador posicao={origem} cor={COR_ORIGEM} rotulo={origem.nome} />
                )}
                {destino && <Marcador posicao={destino} cor={COR_DESTINO} rotulo={destino.nome} />}
                {rota && <TracadoRota pontos={rota.pontos} margemInferior={20} />}
              </Mapa>
            </div>
          )}

          {calculando && <p className="oferecer-dica">Calculando rota...</p>}
          {rota && !calculando && (
            <p className="oferecer-resumo">
              <strong>{formatarKm(rota.distanciaKm)}</strong> · {formatarMinutos(rota.duracaoMin)} ·
              contribuição sugerida por passageiro:{" "}
              <strong>{formatarReais(estimarCarona(rota.distanciaKm))}</strong>
            </p>
          )}

          <label className="app-campo">
            <span>Data e hora da saída</span>
            <input
              type="datetime-local"
              value={dataHora}
              min={agoraLocal()}
              onChange={(e) => setDataHora(e.target.value)}
              required
            />
          </label>

          <div className="oferecer-linha">
            <label className="app-campo">
              <span>Veículo</span>
              <select
                value={idVeiculo}
                onChange={(e) => setIdVeiculo(e.target.value)}
                disabled={carregandoVeiculos}
                required
              >
                {veiculos.map((v) => (
                  <option key={v.id_veiculo} value={v.id_veiculo}>
                    {v.modelo} · {v.placa} · {rotuloPropulsao(v.propulsao)}
                  </option>
                ))}
              </select>
            </label>

            <label className="app-campo oferecer-campo-vagas">
              <span>Vagas</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={maxVagas}
                value={vagas}
                onChange={(e) => setVagas(e.target.value)}
                required
              />
            </label>
          </div>
          {ehMoto && <p className="oferecer-dica">Moto: 1 passageiro por carona.</p>}

          <button type="submit" className="app-btn app-btn-primario" disabled={enviando || calculando}>
            {enviando ? "Publicando..." : "Publicar carona"}
          </button>
          <p className="oferecer-nota">
            Passageiros com saída e destino próximos, no mesmo horário, verão sua carona e poderão
            reservar uma vaga.
          </p>
        </form>
      )}
    </div>
  );
}

export default OferecerCarona;
