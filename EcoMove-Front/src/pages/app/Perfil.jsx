import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Perfil.css";
import api from "../../services/api";
import { atualizarUsuarioLogado, getUsuarioLogado, logout } from "../../services/auth";
import { mensagemDeErro } from "../../utils/erros";
import { apenasDigitos, mascaraTelefone } from "../../utils/validacao";
import { useInstalarApp } from "../../hooks/useInstalarApp";
import { formatarData } from "../../utils/formatar";
import { Estrelas } from "../../components/Avaliacao/Avaliacao";
import { useConfirmacao, useToast } from "../../components/Feedback/FeedbackContext";
import { primeiroNome } from "../../utils/pessoas";
import { rotuloChip } from "../../utils/avaliacoes";
import { TIPOS_SALVOS, lerLugaresSalvos, lugaresRecentes, removerLugar, salvarLugar } from "../../utils/lugares";
import { IconeCasa, IconeMaleta } from "../../components/Icones";
import CampoEndereco from "../../components/CampoEndereco/CampoEndereco";

const PERFIL_MOTORISTA = 1;

function Perfil() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const idUsuario = usuario?.id_usuario;
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;
  const { jaInstalado, podeInstalar, precisaDeInstrucaoIOS, instalar } = useInstalarApp();
  const confirmar = useConfirmacao();
  const toast = useToast();

  const [avaliacoes, setAvaliacoes] = useState({ media: null, total: 0, avaliacoes: [] });
  const [erro, setErro] = useState("");
  // Lugares salvos (Casa e Trabalho) ficam no aparelho; os recentes ajudam a escolher
  const [salvos, setSalvos] = useState(() => lerLugaresSalvos(idUsuario));
  const [editandoLugar, setEditandoLugar] = useState(null);
  const [recentes, setRecentes] = useState([]);
  // Editar dados: nome e telefone, salvos com PUT /usuarios/{id}
  const [nomeExibido, setNomeExibido] = useState(usuario?.nome || "");
  const [editandoDados, setEditandoDados] = useState(false);
  const [formDados, setFormDados] = useState({ nome: "", telefone: "" });
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroDados, setErroDados] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  const abrirEdicao = async () => {
    setErroDados("");
    setEditandoDados(true);
    setFormDados({ nome: nomeExibido, telefone: "" });
    try {
      const resposta = await api.get(`/usuarios/${idUsuario}`);
      setFormDados({ nome: resposta.data.nome || nomeExibido, telefone: mascaraTelefone(resposta.data.telefone || "") });
    } catch {
      // sem o telefone atual, a pessoa digita de novo se quiser
    }
  };

  const salvarDados = async (e) => {
    e.preventDefault();
    const nome = formDados.nome.trim();
    const digitos = apenasDigitos(formDados.telefone);
    if (nome.length < 2) {
      setErroDados("Informe seu nome completo.");
      return;
    }
    if (digitos && digitos.length < 10) {
      setErroDados("Telefone incompleto: informe o DDD e o número.");
      return;
    }
    setErroDados("");
    setSalvandoDados(true);
    try {
      const resposta = await api.put(`/usuarios/${idUsuario}`, { nome, telefone: formDados.telefone });
      const salvo = resposta.data?.usuario?.nome || nome;
      atualizarUsuarioLogado({ nome: salvo });
      setNomeExibido(salvo);
      setEditandoDados(false);
      toast(resposta.data?.mensagem || "Dados atualizados.");
    } catch (err) {
      setErroDados(mensagemDeErro(err, "Não foi possível salvar seus dados."));
    } finally {
      setSalvandoDados(false);
    }
  };

  const excluirConta = async () => {
    const confirmou = await confirmar({
      titulo: "Excluir sua conta?",
      mensagem: "Seus dados, veículos, caronas e reservas são apagados. Isso não tem volta.",
      confirmar: "Excluir conta",
      cancelar: "Manter conta",
      perigo: true,
    });
    if (!confirmou) return;
    setExcluindo(true);
    try {
      await api.delete(`/usuarios/${idUsuario}`);
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível excluir a conta."));
      setExcluindo(false);
    }
  };

  useEffect(() => {
    if (!idUsuario) return undefined;
    let ativo = true;
    Promise.all([
      api.get(`/usuarios/${idUsuario}/reservas`).catch(() => ({ data: [] })),
      api.get("/corridas/", { params: { id_usuario: idUsuario } }).catch(() => ({ data: [] })),
    ]).then(([respReservas, respCorridas]) => {
      if (ativo) setRecentes(lugaresRecentes(respReservas.data, respCorridas.data));
    });
    return () => {
      ativo = false;
    };
  }, [idUsuario]);

  const salvar = (tipo, lugar) => {
    if (!lugar) return;
    setSalvos(salvarLugar(idUsuario, tipo, lugar));
    setEditandoLugar(null);
    toast(`${TIPOS_SALVOS.find((t) => t.tipo === tipo).rotulo} salvo: ${lugar.nome}`);
  };

  const remover = (tipo) => {
    setSalvos(removerLugar(idUsuario, tipo));
    toast(`${TIPOS_SALVOS.find((t) => t.tipo === tipo).rotulo} removido dos atalhos.`);
  };

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

  const sair = async () => {
    const confirmou = await confirmar({
      titulo: "Sair da conta?",
      mensagem: "Você pode entrar de novo a qualquer momento.",
      confirmar: "Sair",
      cancelar: "Ficar",
    });
    if (!confirmou) return;
    logout();
    navigate("/", { replace: true });
  };

  if (!usuario) return null;

  const iniciais = String(nomeExibido || "?")
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
          <h1>{nomeExibido}</h1>
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
        <li>
          <button
            type="button"
            className="perfil-item"
            onClick={() => (editandoDados ? setEditandoDados(false) : abrirEdicao())}
            aria-expanded={editandoDados}
          >
            <span>Editar dados</span>
            <span className="perfil-seta" aria-hidden="true">
              {editandoDados ? "‹" : "›"}
            </span>
          </button>
        </li>
        {editandoDados && (
          <li>
            <form className="perfil-form" onSubmit={salvarDados} noValidate>
              <label className="app-campo">
                <span>Nome completo</span>
                <input
                  type="text"
                  name="nome"
                  autoComplete="name"
                  maxLength={100}
                  value={formDados.nome}
                  onChange={(e) => setFormDados((f) => ({ ...f, nome: e.target.value }))}
                />
              </label>
              <label className="app-campo">
                <span>Celular</span>
                <input
                  type="tel"
                  name="telefone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(15) 99999-0000"
                  value={formDados.telefone}
                  onChange={(e) => setFormDados((f) => ({ ...f, telefone: mascaraTelefone(e.target.value) }))}
                />
              </label>
              {erroDados && (
                <p className="app-alerta app-alerta-erro" role="alert">
                  {erroDados}
                </p>
              )}
              <div className="perfil-form-acoes">
                <button
                  type="button"
                  className="app-btn app-btn-secundario app-btn-pequeno"
                  onClick={() => setEditandoDados(false)}
                  disabled={salvandoDados}
                >
                  Cancelar
                </button>
                <button type="submit" className="app-btn app-btn-primario app-btn-pequeno" disabled={salvandoDados}>
                  {salvandoDados ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </li>
        )}
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
        <li>
          <button type="button" className="perfil-item perfil-excluir" onClick={excluirConta} disabled={excluindo}>
            <span>{excluindo ? "Excluindo..." : "Excluir minha conta"}</span>
          </button>
        </li>
      </ul>

      <section className="perfil-lugares" aria-label="Lugares salvos">
        <h2>Lugares salvos</h2>
        <p className="perfil-lugares-dica">
          Casa e Trabalho viram atalhos no Início e nos campos de endereço. Ficam só neste aparelho.
        </p>
        {TIPOS_SALVOS.map((t) => {
          const lugar = salvos[t.tipo];
          const editando = editandoLugar === t.tipo;
          const Icone = t.tipo === "casa" ? IconeCasa : IconeMaleta;
          return (
            <div key={t.tipo} className="perfil-lugar">
              <div className="perfil-lugar-linha">
                <span className="perfil-lugar-icone" aria-hidden="true">
                  <Icone />
                </span>
                <span className="perfil-lugar-dados">
                  <strong>{t.rotulo}</strong>
                  <small>{lugar ? lugar.nome : "Não definido"}</small>
                </span>
                <div className="perfil-lugar-acoes">
                  <button
                    type="button"
                    className="app-btn app-btn-vazado app-btn-pequeno"
                    onClick={() => setEditandoLugar(editando ? null : t.tipo)}
                    aria-expanded={editando}
                  >
                    {editando ? "Fechar" : lugar ? "Trocar" : "Definir"}
                  </button>
                  {lugar && !editando && (
                    <button
                      type="button"
                      className="app-btn app-btn-secundario app-btn-pequeno"
                      onClick={() => remover(t.tipo)}
                      aria-label={`Remover ${t.rotulo.toLowerCase()} dos atalhos`}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
              {editando && (
                <CampoEndereco
                  id={`lugar-${t.tipo}`}
                  rotulo={`Endereço de ${t.rotulo.toLowerCase()}`}
                  placeholder="Rua, número e bairro"
                  valor={null}
                  onSelecionar={(l) => salvar(t.tipo, l)}
                  sugestoesIniciais={recentes}
                />
              )}
            </div>
          );
        })}
      </section>

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
                  <span>{primeiroNome(a.avaliador)}</span>
                  <small>{formatarData(a.criada_em)}</small>
                </div>
                {a.tags?.length > 0 && (
                  <p className="perfil-avaliacao-tags">{a.tags.map(rotuloChip).join(" · ")}</p>
                )}
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
