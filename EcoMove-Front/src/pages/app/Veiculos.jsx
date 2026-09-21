import React, { useCallback, useEffect, useState } from "react";
import "./Veiculos.css";
import api from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import {
  CATEGORIAS,
  PROPULSOES,
  normalizarPlaca,
  placaValida,
  propulsaoSustentavel,
  rotuloCategoria,
  rotuloPropulsao,
} from "../../utils/veiculos";

const FORM_INICIAL = { categoria: "carro", modelo: "", placa: "", cor: "", propulsao: "eletrico" };

const IconeCarro = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path
      d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14a2 2 0 0 1 2 2v4h-2m-14-6a2 2 0 0 0-2 2v4h2m0 0v2h2v-2m-2 0h12m0 0v2h2v-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
  </svg>
);

const IconeMoto = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <circle cx="5.5" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="18.5" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M5.5 16l3-6h4l2 3h4M12.5 10l-1.5-3h-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Veiculos() {
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;

  const [veiculos, setVeiculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [removendo, setRemovendo] = useState(null);

  const carregar = useCallback(async () => {
    if (!idUsuario) return;
    setCarregando(true);
    try {
      const resposta = await api.get("/veiculos/", { params: { id_usuario: idUsuario } });
      setVeiculos(resposta.data);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível carregar seus veículos."));
    } finally {
      setCarregando(false);
    }
  }, [idUsuario]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "placa" ? value.toUpperCase() : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (form.modelo.trim().length < 2) {
      setErro("Informe o modelo do veículo.");
      return;
    }
    if (!placaValida(form.placa)) {
      setErro("Placa inválida. Use o formato ABC1D23 (Mercosul) ou ABC1234.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await api.post("/veiculos/", {
        id_usuario: idUsuario,
        categoria: form.categoria,
        modelo: form.modelo.trim(),
        placa: normalizarPlaca(form.placa),
        cor: form.cor.trim(),
        propulsao: form.propulsao,
      });
      setSucesso(resposta.data?.mensagem || "Veículo cadastrado com sucesso!");
      setForm(FORM_INICIAL);
      setMostrarForm(false);
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível cadastrar o veículo."));
    } finally {
      setEnviando(false);
    }
  };

  const remover = async (veiculo) => {
    const confirmou = window.confirm(`Remover ${veiculo.modelo} (${veiculo.placa})?`);
    if (!confirmou) return;
    setErro("");
    setSucesso("");
    setRemovendo(veiculo.id_veiculo);
    try {
      const resposta = await api.delete(`/veiculos/${veiculo.id_veiculo}`);
      setSucesso(resposta.data?.mensagem || "Veículo removido.");
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível remover o veículo."));
    } finally {
      setRemovendo(null);
    }
  };

  return (
    <div className="veiculos">
      <header className="veiculos-cabecalho">
        <h1 className="app-titulo">Meus veículos</h1>
        <span className="veiculos-contador">{veiculos.length}</span>
      </header>

      {erro && (
        <p className="app-alerta app-alerta-erro" role="alert">
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="app-alerta app-alerta-ok" role="status">
          {sucesso}
        </p>
      )}

      {carregando ? (
        <p className="app-vazio">Carregando...</p>
      ) : veiculos.length === 0 ? (
        <p className="app-vazio">
          Nenhum veículo cadastrado. Você precisa de um para oferecer caronas.
        </p>
      ) : (
        <ul className="veiculos-lista">
          {veiculos.map((v) => (
            <li key={v.id_veiculo} className="veiculo-card">
              <div className="veiculo-icone" aria-label={rotuloCategoria(v.categoria)}>
                {v.categoria === "moto" ? <IconeMoto /> : <IconeCarro />}
              </div>
              <div className="veiculo-dados">
                <strong>{v.modelo}</strong>
                <div className="veiculo-detalhes">
                  <span className="veiculo-placa">{v.placa}</span>
                  {v.cor && <span>{v.cor}</span>}
                  <span
                    className={`veiculo-badge ${propulsaoSustentavel(v.propulsao) ? "veiculo-badge-verde" : ""}`}
                  >
                    {rotuloPropulsao(v.propulsao)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="app-btn app-btn-perigo app-btn-pequeno"
                onClick={() => remover(v)}
                disabled={removendo === v.id_veiculo}
              >
                {removendo === v.id_veiculo ? "..." : "Remover"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!mostrarForm ? (
        <button type="button" className="app-btn app-btn-primario" onClick={() => setMostrarForm(true)}>
          Adicionar veículo
        </button>
      ) : (
        <form className="app-cartao veiculos-form" onSubmit={handleSubmit}>
          <h2>Novo veículo</h2>

          <fieldset className="veiculos-categoria">
            <legend>Tipo</legend>
            {CATEGORIAS.map((c) => (
              <label
                key={c.valor}
                className={`veiculos-opcao ${form.categoria === c.valor ? "selecionada" : ""}`}
              >
                <input
                  type="radio"
                  name="categoria"
                  value={c.valor}
                  checked={form.categoria === c.valor}
                  onChange={handleChange}
                />
                {c.valor === "moto" ? <IconeMoto /> : <IconeCarro />}
                <span>{c.rotulo}</span>
              </label>
            ))}
          </fieldset>

          <label className="app-campo">
            <span>Modelo</span>
            <input
              type="text"
              name="modelo"
              placeholder={form.categoria === "moto" ? "Ex.: Honda PCX Elétrica" : "Ex.: Chevrolet Bolt EV"}
              maxLength={100}
              required
              value={form.modelo}
              onChange={handleChange}
            />
          </label>

          <label className="app-campo">
            <span>Placa</span>
            <input
              type="text"
              name="placa"
              placeholder="ABC1D23"
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              required
              value={form.placa}
              onChange={handleChange}
            />
          </label>

          <label className="app-campo">
            <span>Cor</span>
            <input
              type="text"
              name="cor"
              placeholder="Ex.: Branco"
              maxLength={30}
              value={form.cor}
              onChange={handleChange}
            />
          </label>

          <label className="app-campo">
            <span>Propulsão</span>
            <select name="propulsao" value={form.propulsao} onChange={handleChange} required>
              {PROPULSOES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </label>

          <p className="veiculos-dica">
            O EcoMove aceita apenas veículos 100% elétricos ou híbridos.
            {form.categoria === "moto" && " Motos levam 1 passageiro por carona."}
          </p>

          <div className="veiculos-form-acoes">
            <button
              type="button"
              className="app-btn app-btn-secundario"
              onClick={() => {
                setMostrarForm(false);
                setForm(FORM_INICIAL);
                setErro("");
              }}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button type="submit" className="app-btn app-btn-primario" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar veículo"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Veiculos;
