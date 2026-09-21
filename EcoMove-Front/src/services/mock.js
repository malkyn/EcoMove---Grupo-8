// Modo simulado da API (ativado com VITE_USE_MOCK=true no .env).
// Responde às mesmas rotas do backend (ver docs/api-contrato.md) guardando
// os dados no localStorage do navegador. Serve para desenvolver e demonstrar
// o frontend sem o backend no ar.
//
// NUNCA usar em produção: é um simulador. As senhas dos usuários de
// demonstração ficam em texto puro no navegador, o que é inaceitável fora daqui.
import { AxiosError } from "axios";
import { distanciaHaversineKm } from "./geo";
import { estimarCarona } from "../utils/estimativas";

const CHAVE_DB = "ecomove_mock_db";
// Aumente quando o formato dos dados mudar: o banco salvo no navegador é recriado.
const VERSAO_BANCO = 3;
const LATENCIA_MS = 300;
const PERFIL_MOTORISTA = 1;
const PERFIL_PASSAGEIRO = 2;
const CATEGORIAS = ["carro", "moto"];
const PROPULSOES = ["eletrico", "hibrido"]; // sem combustão: regra do produto
const PLACA_VALIDA = /^[A-Z]{3}\d[A-Z0-9]\d{2}$/;
const RAIO_PADRAO_KM = 3; // busca de caronas compatíveis: distância máxima entre pontos

// Pontos de referência em Sorocaba para os dados de demonstração
const CAMPOLIM = { lat: -23.5199, lng: -47.4642 };
const FACENS = { lat: -23.4706, lng: -47.4295 };
const CENTRO = { lat: -23.5015, lng: -47.4526 };
const VOTORANTIM = { lat: -23.5446, lng: -47.4388 };

// =============================================
//               BANCO SIMULADO
// =============================================
const pad = (n) => String(n).padStart(2, "0");
const dataLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const agoraISO = () => {
  const d = new Date();
  return `${dataLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function bancoInicial() {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const depois = new Date(hoje);
  depois.setDate(hoje.getDate() + 2);

  return {
    versao: VERSAO_BANCO,
    proximoId: { usuario: 3, veiculo: 2, carona: 4, avaliacao: 1 },
    usuarios: [
      {
        id_usuario: 1,
        nome: "Camila Ferreira",
        email: "camila@exemplo.com",
        senha: "123456",
        id_perfil: PERFIL_MOTORISTA,
        telefone: "(15) 99999-0001",
        cnh: "12345678900",
      },
      {
        id_usuario: 2,
        nome: "Lucas Almeida",
        email: "lucas@exemplo.com",
        senha: "123456",
        id_perfil: PERFIL_PASSAGEIRO,
        telefone: "(15) 99999-0002",
      },
    ],
    veiculos: [
      {
        id_veiculo: 1,
        id_usuario: 1,
        modelo: "Chevrolet Bolt EV",
        placa: "BRA2E19",
        categoria: "carro",
        propulsao: "eletrico",
        cor: "Branco",
      },
    ],
    caronas: [
      {
        id_carona: 1,
        id_usuario: 1,
        id_veiculo: 1,
        origem: "Parque Campolim, Sorocaba",
        destino: "Centro Universitário FACENS, Sorocaba",
        origem_lat: CAMPOLIM.lat,
        origem_lng: CAMPOLIM.lng,
        destino_lat: FACENS.lat,
        destino_lng: FACENS.lng,
        horario: `${dataLocal(amanha)}T07:30`,
        vagas_disponiveis: 3,
        distancia_km: 10.2,
      },
      {
        id_carona: 2,
        id_usuario: 1,
        id_veiculo: 1,
        origem: "Centro Universitário FACENS, Sorocaba",
        destino: "Centro, Sorocaba",
        origem_lat: FACENS.lat,
        origem_lng: FACENS.lng,
        destino_lat: CENTRO.lat,
        destino_lng: CENTRO.lng,
        horario: `${dataLocal(amanha)}T18:00`,
        vagas_disponiveis: 2,
        distancia_km: 6.4,
      },
      {
        id_carona: 3,
        id_usuario: 1,
        id_veiculo: 1,
        origem: "Centro, Votorantim",
        destino: "Centro Universitário FACENS, Sorocaba",
        origem_lat: VOTORANTIM.lat,
        origem_lng: VOTORANTIM.lng,
        destino_lat: FACENS.lat,
        destino_lng: FACENS.lng,
        horario: `${dataLocal(depois)}T07:00`,
        vagas_disponiveis: 3,
        distancia_km: 12.8,
      },
    ],
    reservas: [],
    avaliacoes: [],
  };
}

function salvarBanco(db) {
  localStorage.setItem(CHAVE_DB, JSON.stringify(db));
}

function carregarBanco() {
  try {
    const bruto = localStorage.getItem(CHAVE_DB);
    if (bruto) {
      const db = JSON.parse(bruto);
      if (db && Array.isArray(db.usuarios) && db.versao === VERSAO_BANCO) return db;
    }
  } catch {
    // banco corrompido: recria abaixo
  }
  const db = bancoInicial();
  salvarBanco(db);
  return db;
}

/** Apaga os dados simulados; na próxima requisição o banco volta ao estado inicial. */
export function reiniciarMock() {
  localStorage.removeItem(CHAVE_DB);
}

// =============================================
//               FORMATOS DE RESPOSTA
// =============================================
function usuarioPublico(u) {
  return {
    id_usuario: u.id_usuario,
    nome: u.nome,
    email: u.email,
    id_perfil: u.id_perfil,
    perfil: u.id_perfil === PERFIL_MOTORISTA ? "Motorista" : "Passageiro",
    telefone: u.telefone || null,
  };
}

function resumoUsuario(u) {
  return u ? { id_usuario: u.id_usuario, nome: u.nome } : null;
}

function caronaCompleta(db, c) {
  const motorista = db.usuarios.find((u) => u.id_usuario === c.id_usuario);
  const veiculo = db.veiculos.find((v) => v.id_veiculo === c.id_veiculo);
  const reservas = db.reservas.filter((r) => r.id_carona === c.id_carona);
  return {
    ...c,
    preco_estimado: c.distancia_km ? estimarCarona(c.distancia_km) : null,
    motorista: resumoUsuario(motorista),
    veiculo: veiculo
      ? {
          id_veiculo: veiculo.id_veiculo,
          modelo: veiculo.modelo,
          placa: veiculo.placa,
          categoria: veiculo.categoria,
          propulsao: veiculo.propulsao,
        }
      : null,
    vagas_restantes: Math.max(0, c.vagas_disponiveis - reservas.length),
    passageiros: reservas
      .map((r) => resumoUsuario(db.usuarios.find((u) => u.id_usuario === r.id_usuario)))
      .filter(Boolean),
  };
}

const ok = (data, status = 200) => ({ status, data });
const criado = (data) => ({ status: 201, data, gravar: true });
const erro = (status, mensagem) => ({ status, data: { erro: mensagem } });

function camposFaltando(body, campos) {
  const faltando = campos.filter((c) => body[c] === undefined || body[c] === null || body[c] === "");
  return faltando.length
    ? erro(400, `Campo(s) obrigatório(s) ausente(s): ${faltando.join(", ")}`)
    : null;
}

// =============================================
//               USUÁRIOS
// =============================================
function listarUsuarios({ db }) {
  return ok(db.usuarios.map(usuarioPublico));
}

function buscarUsuario({ db, match }) {
  const u = db.usuarios.find((x) => x.id_usuario === Number(match[1]));
  return u ? ok(usuarioPublico(u)) : erro(404, "Usuário não encontrado");
}

function criarUsuario({ db, body }) {
  const faltando = camposFaltando(body, ["nome", "email", "senha", "id_perfil"]);
  if (faltando) return faltando;

  const idPerfil = Number(body.id_perfil);
  if (![PERFIL_MOTORISTA, PERFIL_PASSAGEIRO].includes(idPerfil)) {
    return erro(400, "id_perfil deve ser 1 (Motorista) ou 2 (Passageiro)");
  }

  const email = String(body.email).trim().toLowerCase();
  if (db.usuarios.some((u) => u.email === email)) {
    return erro(409, "Já existe um usuário cadastrado com este e-mail");
  }
  if (String(body.senha).length < 6) {
    return erro(400, "A senha deve ter pelo menos 6 caracteres");
  }

  const novo = {
    id_usuario: db.proximoId.usuario++,
    nome: String(body.nome).trim(),
    email,
    senha: String(body.senha),
    id_perfil: idPerfil,
    telefone: body.telefone || null,
    cpf: body.cpf || null,
    rg: body.rg || null,
    cnh: body.cnh || null,
    genero: body.genero || null,
    data_nascimento: body.data_nascimento || null,
  };
  db.usuarios.push(novo);
  return criado({ mensagem: "Usuário criado com sucesso!", usuario: usuarioPublico(novo) });
}

function login({ db, body }) {
  const email = String(body.email || "").trim().toLowerCase();
  const senha = String(body.senha || "");
  if (!email || !senha) return erro(400, "Informe e-mail e senha");

  const u = db.usuarios.find((x) => x.email === email);
  // Mesma mensagem para e-mail inexistente e senha errada (não revela quem está cadastrado)
  if (!u || u.senha !== senha) return erro(401, "E-mail ou senha inválidos");

  return ok({ mensagem: "Login realizado com sucesso!", usuario: usuarioPublico(u) });
}

function deletarUsuario({ db, match }) {
  const id = Number(match[1]);
  const idx = db.usuarios.findIndex((u) => u.id_usuario === id);
  if (idx === -1) return erro(404, "Usuário não encontrado");
  db.usuarios.splice(idx, 1);
  db.veiculos = db.veiculos.filter((v) => v.id_usuario !== id);
  db.caronas = db.caronas.filter((c) => c.id_usuario !== id);
  db.reservas = db.reservas.filter((r) => r.id_usuario !== id);
  return { ...ok({ mensagem: "Usuário deletado com sucesso!" }), gravar: true };
}

// =============================================
//               VEÍCULOS
// =============================================
function listarVeiculos({ db, params }) {
  const idUsuario = params.id_usuario ? Number(params.id_usuario) : null;
  return ok(db.veiculos.filter((v) => idUsuario === null || v.id_usuario === idUsuario));
}

function criarVeiculo({ db, body }) {
  const faltando = camposFaltando(body, ["modelo", "placa", "id_usuario", "categoria", "propulsao"]);
  if (faltando) return faltando;

  const dono = db.usuarios.find((u) => u.id_usuario === Number(body.id_usuario));
  if (!dono) return erro(404, "Usuário não encontrado");
  if (dono.id_perfil !== PERFIL_MOTORISTA) {
    return erro(403, "Apenas motoristas podem cadastrar veículos");
  }

  const categoria = String(body.categoria).toLowerCase();
  if (!CATEGORIAS.includes(categoria)) return erro(400, "categoria deve ser carro ou moto");
  const propulsao = String(body.propulsao).toLowerCase();
  if (!PROPULSOES.includes(propulsao)) {
    return erro(400, "Só aceitamos veículos elétricos ou híbridos (propulsao: eletrico ou hibrido)");
  }

  const placa = String(body.placa).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!PLACA_VALIDA.test(placa)) {
    return erro(400, "Placa inválida: use o formato ABC1D23 ou ABC1234");
  }
  if (db.veiculos.some((v) => v.placa === placa)) {
    return erro(409, "Já existe um veículo com esta placa");
  }

  const novo = {
    id_veiculo: db.proximoId.veiculo++,
    id_usuario: dono.id_usuario,
    modelo: String(body.modelo).trim(),
    placa,
    categoria,
    propulsao,
    cor: body.cor ? String(body.cor).trim() : null,
  };
  db.veiculos.push(novo);
  return criado({ mensagem: "Veículo cadastrado com sucesso!", veiculo: novo });
}

function deletarVeiculo({ db, match }) {
  const id = Number(match[1]);
  const idx = db.veiculos.findIndex((v) => v.id_veiculo === id);
  if (idx === -1) return erro(404, "Veículo não encontrado");
  if (db.caronas.some((c) => c.id_veiculo === id)) {
    return erro(409, "Este veículo possui caronas cadastradas. Cancele-as antes.");
  }
  db.veiculos.splice(idx, 1);
  return { ...ok({ mensagem: "Veículo deletado com sucesso!" }), gravar: true };
}

// =============================================
//               CARONAS
// =============================================
const normalizar = (s) => String(s || "").trim().toLowerCase();
const HORARIO_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const numeroOuNull = (v) =>
  v === undefined || v === null || v === "" || Number.isNaN(Number(v)) ? null : Number(v);

function pontoDe(lat, lng) {
  const la = numeroOuNull(lat);
  const lo = numeroOuNull(lng);
  return la === null || lo === null ? null : { lat: la, lng: lo };
}

function coordenadasDe(body) {
  const o = pontoDe(body.origem_lat, body.origem_lng);
  const d = pontoDe(body.destino_lat, body.destino_lng);
  return {
    origem_lat: o ? o.lat : null,
    origem_lng: o ? o.lng : null,
    destino_lat: d ? d.lat : null,
    destino_lng: d ? d.lng : null,
  };
}

const temCoordenadas = (c) =>
  c.origem_lat !== null && c.origem_lat !== undefined && c.destino_lat !== null && c.destino_lat !== undefined;

/**
 * Lista caronas com filtros opcionais. Com origem/destino em coordenadas, faz o "match":
 * só caronas com saída e chegada a até `raio_km` dos pontos pedidos, ordenadas pela soma
 * das distâncias, e devolve `compatibilidade` com essas distâncias.
 */
function listarCaronas({ db, params }) {
  const origem = normalizar(params.origem);
  const destino = normalizar(params.destino);
  const data = String(params.data || "").trim();
  const idMotorista = params.id_usuario ? Number(params.id_usuario) : null;
  const excluirUsuario = params.excluir_usuario ? Number(params.excluir_usuario) : null;
  const horarioDe = params.horario_de ? String(params.horario_de).slice(0, 16) : null;
  const horarioAte = params.horario_ate ? String(params.horario_ate).slice(0, 16) : null;
  const somenteComVagas = String(params.com_vagas) === "true";
  const pontoOrigem = pontoDe(params.origem_lat, params.origem_lng);
  const pontoDestino = pontoDe(params.destino_lat, params.destino_lng);
  const raioKm = numeroOuNull(params.raio_km) ?? RAIO_PADRAO_KM;
  const porProximidade = Boolean(pontoOrigem && pontoDestino);

  const arred = (v) => Math.round(v * 10) / 10;

  const lista = db.caronas
    .map((c) => caronaCompleta(db, c))
    .filter((c) => !origem || normalizar(c.origem).includes(origem))
    .filter((c) => !destino || normalizar(c.destino).includes(destino))
    .filter((c) => !data || c.horario.startsWith(data))
    .filter((c) => idMotorista === null || c.id_usuario === idMotorista)
    .filter((c) => excluirUsuario === null || c.id_usuario !== excluirUsuario)
    .filter((c) => !horarioDe || c.horario >= horarioDe)
    .filter((c) => !horarioAte || c.horario <= horarioAte)
    .filter((c) => !somenteComVagas || c.vagas_restantes > 0)
    .map((c) => {
      if (!porProximidade || !temCoordenadas(c)) return c;
      return {
        ...c,
        compatibilidade: {
          distancia_origem_km: arred(
            distanciaHaversineKm(pontoOrigem, { lat: c.origem_lat, lng: c.origem_lng })
          ),
          distancia_destino_km: arred(
            distanciaHaversineKm(pontoDestino, { lat: c.destino_lat, lng: c.destino_lng })
          ),
        },
      };
    })
    .filter(
      (c) =>
        !porProximidade ||
        (c.compatibilidade &&
          c.compatibilidade.distancia_origem_km <= raioKm &&
          c.compatibilidade.distancia_destino_km <= raioKm)
    )
    .sort((a, b) => {
      if (porProximidade) {
        const pa = a.compatibilidade.distancia_origem_km + a.compatibilidade.distancia_destino_km;
        const pb = b.compatibilidade.distancia_origem_km + b.compatibilidade.distancia_destino_km;
        if (pa !== pb) return pa - pb;
      }
      return a.horario.localeCompare(b.horario);
    });

  return ok(lista);
}

function buscarCarona({ db, match }) {
  const c = db.caronas.find((x) => x.id_carona === Number(match[1]));
  return c ? ok(caronaCompleta(db, c)) : erro(404, "Carona não encontrada");
}

function criarCarona({ db, body }) {
  const faltando = camposFaltando(body, [
    "origem",
    "destino",
    "horario",
    "vagas_disponiveis",
    "id_usuario",
    "id_veiculo",
  ]);
  if (faltando) return faltando;

  const motorista = db.usuarios.find((u) => u.id_usuario === Number(body.id_usuario));
  if (!motorista) return erro(404, "Usuário não encontrado");
  if (motorista.id_perfil !== PERFIL_MOTORISTA) {
    return erro(403, "Apenas motoristas podem oferecer caronas");
  }

  const veiculo = db.veiculos.find((v) => v.id_veiculo === Number(body.id_veiculo));
  if (!veiculo) return erro(404, "Veículo não encontrado");
  if (veiculo.id_usuario !== motorista.id_usuario) {
    return erro(403, "O veículo não pertence a este motorista");
  }

  const vagas = Number(body.vagas_disponiveis);
  if (!Number.isInteger(vagas) || vagas < 1 || vagas > 8) {
    return erro(400, "vagas_disponiveis deve ser um inteiro entre 1 e 8");
  }
  if (veiculo.categoria === "moto" && vagas > 1) {
    return erro(400, "Moto leva no máximo 1 passageiro");
  }

  const horario = String(body.horario).trim();
  if (!HORARIO_ISO.test(horario) || Number.isNaN(Date.parse(horario))) {
    return erro(400, "horario deve estar no formato AAAA-MM-DDTHH:MM");
  }
  if (horario.slice(0, 16) < agoraISO()) {
    return erro(400, "O horário da carona precisa ser no futuro");
  }

  const nova = {
    id_carona: db.proximoId.carona++,
    id_usuario: motorista.id_usuario,
    id_veiculo: veiculo.id_veiculo,
    origem: String(body.origem).trim(),
    destino: String(body.destino).trim(),
    ...coordenadasDe(body),
    horario: horario.slice(0, 16),
    vagas_disponiveis: vagas,
    distancia_km: numeroOuNull(body.distancia_km),
  };
  db.caronas.push(nova);
  return criado({ mensagem: "Carona publicada com sucesso!", carona: caronaCompleta(db, nova) });
}

function deletarCarona({ db, match }) {
  const id = Number(match[1]);
  const idx = db.caronas.findIndex((c) => c.id_carona === id);
  if (idx === -1) return erro(404, "Carona não encontrada");
  db.caronas.splice(idx, 1);
  db.reservas = db.reservas.filter((r) => r.id_carona !== id);
  return { ...ok({ mensagem: "Carona cancelada com sucesso!" }), gravar: true };
}

// =============================================
//               RESERVAS
// =============================================
function criarReserva({ db, body, match }) {
  const idCarona = Number(match[1]);
  const carona = db.caronas.find((c) => c.id_carona === idCarona);
  if (!carona) return erro(404, "Carona não encontrada");

  const idUsuario = Number(body.id_usuario);
  if (!idUsuario) return erro(400, "id_usuario é obrigatório");
  const passageiro = db.usuarios.find((u) => u.id_usuario === idUsuario);
  if (!passageiro) return erro(404, "Usuário não encontrado");
  if (passageiro.id_usuario === carona.id_usuario) {
    return erro(403, "O motorista não pode reservar a própria carona");
  }
  if (db.reservas.some((r) => r.id_carona === idCarona && r.id_usuario === idUsuario)) {
    return erro(409, "Você já reservou esta carona");
  }
  const ocupadas = db.reservas.filter((r) => r.id_carona === idCarona).length;
  if (ocupadas >= carona.vagas_disponiveis) return erro(409, "Não há vagas disponíveis");

  db.reservas.push({ id_carona: idCarona, id_usuario: idUsuario, criada_em: agoraISO() });
  return criado({ mensagem: "Vaga reservada com sucesso!", carona: caronaCompleta(db, carona) });
}

function cancelarReserva({ db, match }) {
  const idCarona = Number(match[1]);
  const idUsuario = Number(match[2]);
  const idx = db.reservas.findIndex((r) => r.id_carona === idCarona && r.id_usuario === idUsuario);
  if (idx === -1) return erro(404, "Reserva não encontrada");
  db.reservas.splice(idx, 1);
  return { ...ok({ mensagem: "Reserva cancelada com sucesso!" }), gravar: true };
}

function listarReservasDoUsuario({ db, match }) {
  const idUsuario = Number(match[1]);
  if (!db.usuarios.some((u) => u.id_usuario === idUsuario)) {
    return erro(404, "Usuário não encontrado");
  }
  const caronas = db.reservas
    .filter((r) => r.id_usuario === idUsuario)
    .map((r) => db.caronas.find((c) => c.id_carona === r.id_carona))
    .filter(Boolean)
    .sort((a, b) => a.horario.localeCompare(b.horario));
  return ok(caronas.map((c) => caronaCompleta(db, c)));
}

// =============================================
//               AVALIAÇÕES
// =============================================
function criarAvaliacao({ db, body }) {
  const faltando = camposFaltando(body, ["id_carona", "id_avaliador", "id_avaliado", "nota"]);
  if (faltando) return faltando;

  const nota = Number(body.nota);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return erro(400, "nota deve ser um inteiro entre 1 e 5");
  }
  const idCarona = Number(body.id_carona);
  const idAvaliador = Number(body.id_avaliador);
  const idAvaliado = Number(body.id_avaliado);
  if (idAvaliador === idAvaliado) return erro(400, "Você não pode avaliar a si mesmo");
  if (!db.caronas.some((c) => c.id_carona === idCarona)) return erro(404, "Carona não encontrada");
  if (!db.usuarios.some((u) => u.id_usuario === idAvaliador)) return erro(404, "Avaliador não encontrado");
  if (!db.usuarios.some((u) => u.id_usuario === idAvaliado)) return erro(404, "Avaliado não encontrado");
  if (
    db.avaliacoes.some(
      (a) => a.id_carona === idCarona && a.id_avaliador === idAvaliador && a.id_avaliado === idAvaliado
    )
  ) {
    return erro(409, "Você já avaliou este usuário nesta carona");
  }

  const nova = {
    id_avaliacao: db.proximoId.avaliacao++,
    id_carona: idCarona,
    id_avaliador: idAvaliador,
    id_avaliado: idAvaliado,
    nota,
    comentario: String(body.comentario || "").trim().slice(0, 300),
    criada_em: agoraISO(),
  };
  db.avaliacoes.push(nova);
  return criado({ mensagem: "Avaliação registrada com sucesso!", avaliacao: nova });
}

function listarAvaliacoesDoUsuario({ db, match }) {
  const idUsuario = Number(match[1]);
  if (!db.usuarios.some((u) => u.id_usuario === idUsuario)) {
    return erro(404, "Usuário não encontrado");
  }
  const lista = db.avaliacoes.filter((a) => a.id_avaliado === idUsuario);
  const media = lista.length
    ? Math.round((lista.reduce((soma, a) => soma + a.nota, 0) / lista.length) * 10) / 10
    : null;
  return ok({
    media,
    total: lista.length,
    avaliacoes: lista.map((a) => ({
      ...a,
      avaliador: db.usuarios.find((u) => u.id_usuario === a.id_avaliador)?.nome || null,
    })),
  });
}

// =============================================
//               ROTEADOR
// =============================================
const rotas = [
  ["GET", /^\/usuarios\/?$/, listarUsuarios],
  ["POST", /^\/usuarios\/?$/, criarUsuario],
  ["POST", /^\/usuarios\/login\/?$/, login],
  ["GET", /^\/usuarios\/(\d+)\/?$/, buscarUsuario],
  ["DELETE", /^\/usuarios\/(\d+)\/?$/, deletarUsuario],
  ["GET", /^\/usuarios\/(\d+)\/reservas\/?$/, listarReservasDoUsuario],
  ["GET", /^\/usuarios\/(\d+)\/avaliacoes\/?$/, listarAvaliacoesDoUsuario],
  ["GET", /^\/veiculos\/?$/, listarVeiculos],
  ["POST", /^\/veiculos\/?$/, criarVeiculo],
  ["DELETE", /^\/veiculos\/(\d+)\/?$/, deletarVeiculo],
  ["GET", /^\/caronas\/?$/, listarCaronas],
  ["POST", /^\/caronas\/?$/, criarCarona],
  ["GET", /^\/caronas\/(\d+)\/?$/, buscarCarona],
  ["DELETE", /^\/caronas\/(\d+)\/?$/, deletarCarona],
  ["POST", /^\/caronas\/(\d+)\/reservas\/?$/, criarReserva],
  ["DELETE", /^\/caronas\/(\d+)\/reservas\/(\d+)\/?$/, cancelarReserva],
  ["POST", /^\/avaliacoes\/?$/, criarAvaliacao],
];

function responder(config, status, data) {
  const response = {
    data,
    status,
    statusText: status >= 400 ? "Error" : "OK",
    headers: { "content-type": "application/json" },
    config,
    request: {},
  };
  if (status >= 400) {
    const codigo = status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST;
    return Promise.reject(
      new AxiosError(`Request failed with status code ${status}`, codigo, config, {}, response)
    );
  }
  return Promise.resolve(response);
}

/** Adapter do axios: substitui a rede pelo banco simulado. */
export async function mockAdapter(config) {
  await new Promise((resolve) => setTimeout(resolve, LATENCIA_MS));

  const metodo = String(config.method || "get").toUpperCase();
  const url = new URL(config.url || "/", "http://mock.local");
  const caminho = url.pathname;
  const params = { ...Object.fromEntries(url.searchParams), ...(config.params || {}) };

  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch {
      body = {};
    }
  }

  const db = carregarBanco();
  for (const [m, padrao, handler] of rotas) {
    if (m !== metodo) continue;
    const match = caminho.match(padrao);
    if (!match) continue;
    const resultado = handler({ db, params, body, match });
    if (resultado.gravar) salvarBanco(db);
    return responder(config, resultado.status, resultado.data);
  }

  return responder(config, 404, { erro: `Rota simulada não encontrada: ${metodo} ${caminho}` });
}
