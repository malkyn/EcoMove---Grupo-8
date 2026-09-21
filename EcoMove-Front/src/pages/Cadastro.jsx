import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Conta.css";
import FotoLateral from "./icons/fundologin.webp";
import api from "../services/api";
import { mensagemDeErro } from "../utils/erros";
import {
  apenasDigitos,
  calcularIdade,
  cpfValido,
  emailValido,
  forcaSenha,
  hojeISO,
  mascaraCNH,
  mascaraCPF,
  mascaraTelefone,
  senhaValida,
} from "../utils/validacao";
import {
  IconeCarro,
  IconeCheck,
  IconeFolha,
  IconeMoeda,
  IconeOlho,
  IconeOlhoFechado,
  IconePessoas,
} from "../components/Icones";

const PERFIL_MOTORISTA = 1;
const PERFIL_PASSAGEIRO = 2;

const ESTADO_INICIAL = {
  nome: "",
  email: "",
  telefone: "",
  data_nascimento: "",
  cpf: "",
  cnh: "",
  senha: "",
  confirmesenha: "",
  genero: "",
};

const MASCARAS = {
  cpf: mascaraCPF,
  telefone: mascaraTelefone,
  cnh: mascaraCNH,
};

const ROTULOS_FORCA = ["Fraca", "Média", "Forte"];

/** Três passos, cada um cabendo na tela sem rolagem. */
const PASSOS = [
  { titulo: "Como você quer usar o EcoMove?", campos: [] },
  { titulo: "Seus dados", campos: ["nome", "email", "telefone", "data_nascimento"] },
  { titulo: "Documentos e senha", campos: ["cpf", "cnh", "senha", "confirmesenha"] },
];

/**
 * Valida um campo. Devolve a mensagem de erro ou "" se estiver certo.
 * Recebe o formulário inteiro porque alguns campos dependem de outros
 * (confirmação de senha, idade mínima por perfil).
 */
function validarCampo(campo, form, perfil) {
  const ehMotorista = perfil === PERFIL_MOTORISTA;
  const valor = form[campo];

  switch (campo) {
    case "nome": {
      const partes = valor.trim().split(/\s+/).filter(Boolean);
      if (valor.trim().length < 3) return "Informe seu nome.";
      if (partes.length < 2) return "Informe nome e sobrenome.";
      return "";
    }
    case "email":
      return emailValido(valor) ? "" : "Informe um e-mail válido.";
    case "telefone": {
      const d = apenasDigitos(valor);
      return d.length >= 10 && d.length <= 11 ? "" : "Use DDD e número, como (15) 99999-9999.";
    }
    case "data_nascimento": {
      const idade = calcularIdade(valor);
      if (idade === null || idade < 0 || idade > 120) return "Informe uma data válida.";
      if (ehMotorista && idade < 18) return "Motoristas precisam ter 18 anos ou mais.";
      if (idade < 16) return "É preciso ter 16 anos ou mais.";
      return "";
    }
    case "cpf":
      return cpfValido(valor) ? "" : "CPF inválido. Confira os 11 dígitos.";
    case "cnh":
      if (!ehMotorista) return "";
      return apenasDigitos(valor).length === 11 ? "" : "Informe os 11 dígitos do registro da CNH.";
    case "senha":
      return senhaValida(valor) ? "" : "Mínimo de 8 caracteres, com letras e números.";
    case "confirmesenha":
      return valor === form.senha ? "" : "As senhas não conferem.";
    default:
      return "";
  }
}

function Cadastro() {
  const location = useLocation();
  const navigate = useNavigate();

  const perfilInicial =
    location.state?.id_perfil === PERFIL_MOTORISTA || location.state?.id_perfil === PERFIL_PASSAGEIRO
      ? location.state.id_perfil
      : null;

  const [passo, setPasso] = useState(perfilInicial ? 1 : 0);
  const [perfil, setPerfil] = useState(perfilInicial);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const formRef = useRef(null);

  const ehMotorista = perfil === PERFIL_MOTORISTA;
  const forca = forcaSenha(form.senha);
  const ultimoPasso = passo === PASSOS.length - 1;

  // Ao trocar de passo, leva o foco ao primeiro campo e volta o painel ao topo
  useEffect(() => {
    const painel = formRef.current?.closest(".conta-conteudo");
    if (painel) painel.scrollTop = 0;
    if (passo > 0) formRef.current?.querySelector("input, select")?.focus();
  }, [passo]);

  const aoMudar = (evento) => {
    const { name, value } = evento.target;
    const valor = MASCARAS[name] ? MASCARAS[name](value) : value;
    setForm((anterior) => ({ ...anterior, [name]: valor }));
    // Some o erro do campo assim que a pessoa volta a digitar nele
    if (erros[name]) setErros((anterior) => ({ ...anterior, [name]: "" }));
  };

  const aoSair = (evento) => {
    const { name } = evento.target;
    if (!form[name]) return; // não acusa erro em campo que ainda não foi preenchido
    setErros((anterior) => ({ ...anterior, [name]: validarCampo(name, form, perfil) }));
  };

  const escolherPerfil = (novoPerfil) => {
    setPerfil(novoPerfil);
    setErroGeral("");
    setErros((anterior) => ({ ...anterior, perfil: "", cnh: "" }));
  };

  /** Erros do passo atual (ou de todos, para o envio final). */
  const validarPasso = (indice) => {
    const proximos = {};
    if (indice === 0) {
      if (!perfil) proximos.perfil = "Escolha como você quer usar o EcoMove.";
      return proximos;
    }
    PASSOS[indice].campos.forEach((campo) => {
      const mensagem = validarCampo(campo, form, perfil);
      if (mensagem) proximos[campo] = mensagem;
    });
    return proximos;
  };

  const focarPrimeiroErro = (problemas) => {
    const primeiro = Object.keys(problemas)[0];
    const alvo = formRef.current?.querySelector(`[name="${primeiro}"], [data-campo="${primeiro}"]`);
    alvo?.focus?.();
  };

  const avancar = () => {
    const problemas = validarPasso(passo);
    setErros(problemas);
    if (Object.keys(problemas).length) {
      focarPrimeiroErro(problemas);
      return;
    }
    setPasso((atual) => Math.min(atual + 1, PASSOS.length - 1));
  };

  const voltar = () => {
    setErroGeral("");
    setPasso((atual) => Math.max(atual - 1, 0));
  };

  const aoEnviar = async (evento) => {
    evento.preventDefault();
    setErroGeral("");

    // Enter em um passo intermediário só avança
    if (!ultimoPasso) {
      avancar();
      return;
    }

    // Envio final: confere tudo de novo, caso algo tenha mudado
    const problemas = PASSOS.reduce((acumulado, _, indice) => ({ ...acumulado, ...validarPasso(indice) }), {});
    setErros(problemas);
    if (Object.keys(problemas).length) {
      const primeiro = Object.keys(problemas)[0];
      const passoDoErro = PASSOS.findIndex((p, i) => i === 0 ? primeiro === "perfil" : p.campos.includes(primeiro));
      if (passoDoErro >= 0 && passoDoErro !== passo) setPasso(passoDoErro);
      else focarPrimeiroErro(problemas);
      return;
    }

    setCarregando(true);
    try {
      await api.post("/usuarios/", {
        nome: form.nome.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
        id_perfil: perfil,
        telefone: form.telefone.trim(),
        cpf: apenasDigitos(form.cpf),
        cnh: ehMotorista ? apenasDigitos(form.cnh) : "",
        rg: "",
        genero: form.genero || "nao_informar",
        data_nascimento: form.data_nascimento,
      });

      navigate("/entrar", {
        state: {
          mensagem: "Conta criada! Entre com seu e-mail e senha.",
          email: form.email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      setErroGeral(mensagemDeErro(err, "Não foi possível criar a conta. Verifique os dados."));
    } finally {
      setCarregando(false);
    }
  };

  /** Props comuns de um campo: liga label, erro e estado inválido para leitores de tela. */
  const propsCampo = (nome) => ({
    id: nome,
    name: nome,
    value: form[nome],
    onChange: aoMudar,
    onBlur: aoSair,
    "aria-invalid": erros[nome] ? "true" : undefined,
    "aria-describedby": erros[nome] ? `erro-${nome}` : undefined,
  });

  const renderErro = (nome) =>
    erros[nome] ? (
      <p className="conta-erro" id={`erro-${nome}`} role="alert">
        {erros[nome]}
      </p>
    ) : null;

  const progresso = `${((passo + 1) / PASSOS.length) * 100}%`;

  return (
    <div className="conta">
      {/* Lateral: foto com argumento (só em telas largas) */}
      <aside className="conta-lateral" aria-hidden="true">
        <img src={FotoLateral} alt="" width="1600" height="1067" />
        <div className="conta-lateral-texto">
          <p className="conta-lateral-chapeu">Sorocaba e região</p>
          <h2>Compartilhe o caminho, conecte pessoas</h2>
          <ul>
            <li>
              <IconeFolha tamanho={18} /> Só veículos elétricos e híbridos
            </li>
            <li>
              <IconeMoeda tamanho={18} /> Comparativo de custo antes de reservar
            </li>
            <li>
              <IconeCheck tamanho={18} /> Avaliações entre motoristas e passageiros
            </li>
          </ul>
        </div>
      </aside>

      {/* Formulário em passos */}
      <main className="conta-conteudo">
        <form ref={formRef} className="conta-form" onSubmit={aoEnviar} noValidate>
          <header className="conta-topo">
            <h1>Criar conta</h1>
            <p>
              Leva um minuto. Já tem conta? <Link to="/entrar">Entrar</Link>
            </p>
          </header>

          <div className="conta-progresso" aria-label={`Passo ${passo + 1} de ${PASSOS.length}`}>
            <span>
              Passo {passo + 1} de {PASSOS.length}
            </span>
            <span className="conta-progresso-barra" aria-hidden="true">
              <i style={{ width: progresso }} />
            </span>
          </div>

          {erroGeral && (
            <p className="conta-alerta" role="alert">
              {erroGeral}
            </p>
          )}

          {/* key={passo}: remonta o bloco para a animação de entrada rodar a cada passo */}
          <div className="conta-passo" key={passo}>
            <h2 className="conta-passo-titulo">{PASSOS[passo].titulo}</h2>

            {passo === 0 && (
              <fieldset className="conta-perfis" data-campo="perfil" tabIndex={-1}>
                <legend className="conta-oculto">Perfil</legend>
                <div className="conta-perfis-opcoes">
                  <label className={`conta-perfil ${perfil === PERFIL_PASSAGEIRO ? "escolhido" : ""}`}>
                    <input
                      type="radio"
                      name="perfil"
                      value={PERFIL_PASSAGEIRO}
                      checked={perfil === PERFIL_PASSAGEIRO}
                      onChange={() => escolherPerfil(PERFIL_PASSAGEIRO)}
                    />
                    <span className="conta-perfil-icone">
                      <IconePessoas tamanho={26} />
                    </span>
                    <span className="conta-perfil-texto">
                      <strong>Passageiro</strong>
                      <span>Reservo caronas no meu trajeto ou peço uma corrida agora.</span>
                    </span>
                  </label>
                  <label className={`conta-perfil ${perfil === PERFIL_MOTORISTA ? "escolhido" : ""}`}>
                    <input
                      type="radio"
                      name="perfil"
                      value={PERFIL_MOTORISTA}
                      checked={perfil === PERFIL_MOTORISTA}
                      onChange={() => escolherPerfil(PERFIL_MOTORISTA)}
                    />
                    <span className="conta-perfil-icone">
                      <IconeCarro tamanho={26} />
                    </span>
                    <span className="conta-perfil-texto">
                      <strong>Motorista</strong>
                      <span>Ofereço caronas no meu carro ou moto elétrica ou híbrida.</span>
                    </span>
                  </label>
                </div>
                {renderErro("perfil")}
              </fieldset>
            )}

            {passo === 1 && (
              <>
                <div className="conta-campo">
                  <label htmlFor="nome">Nome completo</label>
                  <input type="text" autoComplete="name" maxLength={100} placeholder="Como no seu documento" {...propsCampo("nome")} />
                  {renderErro("nome")}
                </div>

                <div className="conta-grade">
                  <div className="conta-campo">
                    <label htmlFor="email">E-mail</label>
                    <input type="email" autoComplete="email" inputMode="email" maxLength={100} placeholder="voce@exemplo.com" {...propsCampo("email")} />
                    {renderErro("email")}
                  </div>
                  <div className="conta-campo">
                    <label htmlFor="telefone">Celular</label>
                    <input type="tel" autoComplete="tel-national" inputMode="tel" maxLength={15} placeholder="(15) 99999-9999" {...propsCampo("telefone")} />
                    {renderErro("telefone")}
                  </div>
                </div>

                <div className="conta-grade">
                  <div className="conta-campo">
                    <label htmlFor="data_nascimento">Data de nascimento</label>
                    <input type="date" autoComplete="bday" max={hojeISO()} {...propsCampo("data_nascimento")} />
                    <p className="conta-dica">{ehMotorista ? "Motoristas: 18 anos ou mais." : "A partir de 16 anos."}</p>
                    {renderErro("data_nascimento")}
                  </div>
                  <div className="conta-campo">
                    <label htmlFor="genero">
                      Gênero <span className="conta-opcional">(opcional)</span>
                    </label>
                    <select {...propsCampo("genero")}>
                      <option value="">Prefiro não informar</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="outros">Outro</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {passo === 2 && (
              <>
                <p className="conta-grupo-texto">
                  Documentos confirmam que cada conta é de uma pessoa real. Não aparecem para outros usuários.
                </p>
                <div className="conta-grade">
                  <div className="conta-campo">
                    <label htmlFor="cpf">CPF</label>
                    <input type="text" inputMode="numeric" autoComplete="off" maxLength={14} placeholder="000.000.000-00" {...propsCampo("cpf")} />
                    {renderErro("cpf")}
                  </div>
                  {ehMotorista && (
                    <div className="conta-campo">
                      <label htmlFor="cnh">CNH (número de registro)</label>
                      <input type="text" inputMode="numeric" autoComplete="off" maxLength={11} placeholder="11 dígitos" {...propsCampo("cnh")} />
                      {renderErro("cnh")}
                    </div>
                  )}
                </div>

                <div className="conta-grade">
                  <div className="conta-campo">
                    <label htmlFor="senha">Senha</label>
                    <div className="conta-senha">
                      <input
                        type={mostrarSenha ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        placeholder="Mínimo 8 caracteres"
                        {...propsCampo("senha")}
                      />
                      <button
                        type="button"
                        className="conta-senha-olho"
                        onClick={() => setMostrarSenha((v) => !v)}
                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        aria-pressed={mostrarSenha}
                      >
                        {mostrarSenha ? <IconeOlhoFechado tamanho={20} /> : <IconeOlho tamanho={20} />}
                      </button>
                    </div>
                    {form.senha && (
                      <div className={`conta-forca conta-forca-${forca}`} aria-live="polite">
                        <span className="conta-forca-barra">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="conta-forca-texto">Senha {ROTULOS_FORCA[forca].toLowerCase()}</span>
                      </div>
                    )}
                    {renderErro("senha")}
                  </div>
                  <div className="conta-campo">
                    <label htmlFor="confirmesenha">Confirmar senha</label>
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      placeholder="Repita a senha"
                      {...propsCampo("confirmesenha")}
                    />
                    {renderErro("confirmesenha")}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="conta-acoes">
            {passo > 0 && (
              <button type="button" className="conta-btn-voltar" onClick={voltar} disabled={carregando}>
                Voltar
              </button>
            )}
            <button type="submit" className="conta-btn" disabled={carregando}>
              {ultimoPasso ? (carregando ? "Criando a conta..." : "Criar conta") : "Continuar"}
            </button>
          </div>

          {ultimoPasso && (
            <p className="conta-consentimento">
              Ao criar a conta, você concorda com os <Link to="/termos">Termos de Uso</Link> e com
              a <Link to="/privacidade">Política de Privacidade</Link>.
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

export default Cadastro;
