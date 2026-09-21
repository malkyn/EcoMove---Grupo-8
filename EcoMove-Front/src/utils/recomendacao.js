// Recomendação de caronas: um modelo de pontuação explicável.
// Cada carona recebe pontos por proximidade de saída e chegada, horário,
// semelhança com o histórico do passageiro, reputação do motorista e tipo de
// veículo. A soma vira uma pontuação de 0 a 100 e os fatores que mais pesaram
// viram "motivos" mostrados ao usuário. Detalhes em docs/recomendacao.md.
import { distanciaHaversineKm } from "../services/geo";
import { formatarKm } from "./estimativas";

export const PESOS = {
  origem: 25,
  destino: 25,
  horario: 20,
  historico: 15,
  reputacao: 8,
  veiculo: 7,
};

export const LIMIAR_RECOMENDADA = 60; // pontuação mínima para o selo "Recomendada para você"
export const LIMIAR_SUGESTAO = 50; // pontuação mínima para sugerir no Início

const temCoordenadas = (v) =>
  v && v.origem_lat != null && v.origem_lng != null && v.destino_lat != null && v.destino_lng != null;

/** 1 quando os pontos praticamente coincidem, caindo até 0 a partir de 5 km. */
function fatorProximidade(km) {
  if (km == null) return 0;
  if (km <= 0.5) return 1;
  if (km <= 1.5) return 0.8;
  if (km <= 3) return 0.5;
  if (km <= 5) return 0.2;
  return 0;
}

/** Semelhança (0 a 1) entre dois trajetos com coordenadas: média das proximidades de saída e chegada. */
export function similaridadeTrajeto(a, b) {
  if (!temCoordenadas(a) || !temCoordenadas(b)) return 0;
  const dOrigem = distanciaHaversineKm(
    { lat: a.origem_lat, lng: a.origem_lng },
    { lat: b.origem_lat, lng: b.origem_lng }
  );
  const dDestino = distanciaHaversineKm(
    { lat: a.destino_lat, lng: a.destino_lng },
    { lat: b.destino_lat, lng: b.destino_lng }
  );
  return (fatorProximidade(dOrigem) + fatorProximidade(dDestino)) / 2;
}

const horaDe = (iso) => new Date(iso).getHours() + new Date(iso).getMinutes() / 60;

/** Mesma faixa do dia: diferença de até 1 h no horário (independente da data). */
export function mesmoPeriodo(isoA, isoB) {
  if (!isoA || !isoB) return false;
  return Math.abs(horaDe(isoA) - horaDe(isoB)) <= 1;
}

function pontosHorario(carona, contexto) {
  if (contexto.quando === "agendar" && contexto.dataHora) {
    const minutos = Math.abs(new Date(carona.horario) - new Date(contexto.dataHora)) / 60000;
    if (minutos <= 15) return PESOS.horario;
    if (minutos <= 45) return PESOS.horario * 0.7;
    if (minutos <= 90) return PESOS.horario * 0.4;
    return 0;
  }
  // "Agora": quanto antes sair, melhor (dentro das próximas 24 h)
  const horas = (new Date(carona.horario) - Date.now()) / 3600000;
  if (horas < 0) return 0;
  if (horas <= 2) return PESOS.horario;
  if (horas <= 6) return PESOS.horario * 0.7;
  if (horas <= 24) return PESOS.horario * 0.4;
  return 0;
}

const primeiroNome = (nome) => String(nome || "").split(" ")[0];

/**
 * Pontua uma carona para um contexto de busca.
 * contexto: { origem, destino, quando, dataHora, historico }
 *   origem/destino: { lat, lng } do passageiro (opcionais)
 *   historico: viagens anteriores do passageiro, com coordenadas, horário e id_motorista
 */
export function pontuarCarona(carona, contexto = {}) {
  const motivos = [];
  let pontuacao = 0;

  // Proximidade de saída e chegada
  if (contexto.origem && temCoordenadas(carona)) {
    const dOrigem =
      carona.compatibilidade?.distancia_origem_km ??
      distanciaHaversineKm(contexto.origem, { lat: carona.origem_lat, lng: carona.origem_lng });
    const pontos = fatorProximidade(dOrigem) * PESOS.origem;
    pontuacao += pontos;
    if (pontos >= PESOS.origem * 0.8) motivos.push(`Saída a ${formatarKm(dOrigem)} de você`);
  }
  if (contexto.destino && temCoordenadas(carona)) {
    const dDestino =
      carona.compatibilidade?.distancia_destino_km ??
      distanciaHaversineKm(contexto.destino, { lat: carona.destino_lat, lng: carona.destino_lng });
    const pontos = fatorProximidade(dDestino) * PESOS.destino;
    pontuacao += pontos;
    if (pontos >= PESOS.destino * 0.8) motivos.push(`Chegada a ${formatarKm(dDestino)} do seu destino`);
  }

  // Horário
  const pontosDeHorario = pontosHorario(carona, contexto);
  pontuacao += pontosDeHorario;
  if (pontosDeHorario >= PESOS.horario * 0.7) {
    motivos.push(contexto.quando === "agendar" ? "Horário próximo do que você pediu" : "Sai em breve");
  }

  // Histórico do passageiro
  const historico = contexto.historico || [];
  const trajetoConhecido = historico.some((h) => similaridadeTrajeto(h, carona) >= 0.8);
  if (trajetoConhecido) {
    pontuacao += PESOS.historico;
    motivos.push("Mesmo trajeto de uma viagem sua");
  }
  const motoristaConhecido = historico.some((h) => h.id_motorista === carona.id_usuario);
  if (motoristaConhecido) {
    pontuacao += 5;
    motivos.push(`Você já viajou com ${primeiroNome(carona.motorista?.nome)}`);
  }

  // Reputação do motorista
  const media = carona.motorista?.media_avaliacao;
  const total = carona.motorista?.total_avaliacoes || 0;
  if (total > 0 && media >= 4.5) {
    pontuacao += PESOS.reputacao;
    motivos.push(`Motorista bem avaliado (${String(media).replace(".", ",")})`);
  } else if (total > 0 && media >= 4) {
    pontuacao += PESOS.reputacao * 0.6;
  }

  // Veículo
  if (carona.veiculo?.propulsao === "eletrico") {
    pontuacao += PESOS.veiculo;
    motivos.push("Veículo 100% elétrico");
  } else if (carona.veiculo?.propulsao === "hibrido") {
    pontuacao += PESOS.veiculo * 0.5;
  }

  return { pontuacao: Math.min(100, Math.round(pontuacao)), motivos };
}

/** Ordena caronas da mais para a menos recomendada, anexando `recomendacao` a cada uma. */
export function recomendar(caronas, contexto) {
  return caronas
    .map((c) => ({ ...c, recomendacao: pontuarCarona(c, contexto) }))
    .sort((a, b) => b.recomendacao.pontuacao - a.recomendacao.pontuacao);
}

/**
 * Sugestões proativas para o Início: caronas futuras parecidas com viagens
 * anteriores do passageiro (mesmo trajeto, mesma faixa de horário, motorista conhecido).
 */
export function sugerirPeloHistorico(candidatas, historico, limite = 2) {
  if (!historico.length) return [];
  return candidatas
    .map((c) => {
      const semelhanca = Math.max(...historico.map((h) => similaridadeTrajeto(h, c)));
      const mesmaFaixa = historico.some(
        (h) => similaridadeTrajeto(h, c) >= 0.5 && mesmoPeriodo(h.horario, c.horario)
      );
      const motoristaConhecido = historico.some((h) => h.id_motorista === c.id_usuario);
      const eletrico = c.veiculo?.propulsao === "eletrico";

      const motivos = [];
      if (semelhanca >= 0.8) motivos.push("Mesmo trajeto de uma viagem sua");
      else if (semelhanca >= 0.5) motivos.push("Trajeto parecido com uma viagem sua");
      if (mesmaFaixa) motivos.push("No horário em que você costuma viajar");
      if (motoristaConhecido) motivos.push(`Você já viajou com ${primeiroNome(c.motorista?.nome)}`);
      if (eletrico) motivos.push("Veículo 100% elétrico");

      const pontuacao = Math.round(
        semelhanca * 60 + (mesmaFaixa ? 20 : 0) + (motoristaConhecido ? 10 : 0) + (eletrico ? 10 : 0)
      );
      return { ...c, recomendacao: { pontuacao, motivos } };
    })
    .filter((c) => c.recomendacao.pontuacao >= LIMIAR_SUGESTAO)
    .sort((a, b) => b.recomendacao.pontuacao - a.recomendacao.pontuacao)
    .slice(0, limite);
}

/** Monta o histórico do passageiro a partir das reservas e corridas concluídas. */
export function montarHistorico(reservas = [], corridas = []) {
  const deCaronas = reservas.map((c) => ({
    origem_lat: c.origem_lat,
    origem_lng: c.origem_lng,
    destino_lat: c.destino_lat,
    destino_lng: c.destino_lng,
    horario: c.horario,
    id_motorista: c.id_usuario,
  }));
  const deCorridas = corridas
    .filter((c) => c.status === "concluida")
    .map((c) => ({
      origem_lat: c.origem_lat,
      origem_lng: c.origem_lng,
      destino_lat: c.destino_lat,
      destino_lng: c.destino_lng,
      horario: c.criada_em,
      id_motorista: c.id_motorista,
    }));
  return [...deCaronas, ...deCorridas];
}
