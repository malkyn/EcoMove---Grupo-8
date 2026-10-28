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
