/** Lugares que a pessoa salva como atalho (Início e campos de endereço). */
export const TIPOS_SALVOS = [
  { tipo: "casa", rotulo: "Casa" },
  { tipo: "trabalho", rotulo: "Trabalho" },
];

const chaveSalvos = (idUsuario) => `ecomove_lugares_${idUsuario}`;

/** Lugares salvos ficam no aparelho (localStorage), por usuário: { casa: lugar, trabalho: lugar }. */
export function lerLugaresSalvos(idUsuario) {
  if (!idUsuario) return {};
  try {
    return JSON.parse(localStorage.getItem(chaveSalvos(idUsuario))) || {};
  } catch {
    return {};
  }
}

function gravarSalvos(idUsuario, salvos) {
  try {
    localStorage.setItem(chaveSalvos(idUsuario), JSON.stringify(salvos));
  } catch {
    // sem espaço ou armazenamento bloqueado: a tela segue com o valor em memória
  }
  return salvos;
}

export function salvarLugar(idUsuario, tipo, lugar) {
  return gravarSalvos(idUsuario, {
    ...lerLugaresSalvos(idUsuario),
    [tipo]: { nome: lugar.nome, lat: lugar.lat, lng: lugar.lng },
  });
}

export function removerLugar(idUsuario, tipo) {
  const novos = { ...lerLugaresSalvos(idUsuario) };
  delete novos[tipo];
  return gravarSalvos(idUsuario, novos);
}

/** Casa e Trabalho definidos, no formato de sugestão do CampoEndereco. */
export function salvosComoSugestoes(salvos) {
  return TIPOS_SALVOS.filter((t) => salvos[t.tipo]).map((t) => ({
    id: `salvo-${t.tipo}`,
    nome: salvos[t.tipo].nome,
    descricao: t.rotulo,
    lat: salvos[t.tipo].lat,
    lng: salvos[t.tipo].lng,
  }));
}

/**
 * Lugares recentes do usuário, tirados das reservas de carona e das corridas:
 * origens e destinos, do mais novo para o mais antigo, sem repetir o mesmo nome.
 * Cada lugar tem a forma que o CampoEndereco espera: { id, nome, descricao, lat, lng }.
 */
export function lugaresRecentes(reservas = [], corridas = [], max = 4) {
  const brutos = [];
  const juntar = (viagem, quando) => {
    brutos.push({ nome: viagem.origem, lat: viagem.origem_lat, lng: viagem.origem_lng, quando });
    brutos.push({ nome: viagem.destino, lat: viagem.destino_lat, lng: viagem.destino_lng, quando });
  };
  reservas.forEach((c) => juntar(c, c.horario));
  corridas.forEach((c) => juntar(c, c.criada_em));

  // O mesmo lugar pode vir com nomes diferentes ("FACENS, Alto da Boa Vista" e "FACENS"):
  // além do nome, repete-se o que cai no mesmo quadrado de ~100 m
  const nomesVistos = new Set();
  const pontosVistos = new Set();
  const saida = [];
  brutos
    .filter((l) => l.nome && Number.isFinite(l.lat) && Number.isFinite(l.lng))
    .sort((a, b) => String(b.quando || "").localeCompare(String(a.quando || "")))
    .forEach((l) => {
      const nome = l.nome.trim().toLowerCase();
      const ponto = `${l.lat.toFixed(3)},${l.lng.toFixed(3)}`;
      if (nomesVistos.has(nome) || pontosVistos.has(ponto)) return;
      nomesVistos.add(nome);
      pontosVistos.add(ponto);
      saida.push({ id: `recente-${saida.length}`, nome: l.nome, descricao: "Recente", lat: l.lat, lng: l.lng });
    });
  return saida.slice(0, max);
}
