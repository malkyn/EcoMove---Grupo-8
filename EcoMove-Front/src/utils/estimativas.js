// Estimativas de custo e impacto ambiental. Valores de referência para Sorocaba,
// ajustáveis em um só lugar. São estimativas para comparação, não preços cobrados:
// pagamento não faz parte desta versão do projeto.

// Corrida individual (padrão dos apps de transporte, tarifa urbana média)
export const TARIFA_CORRIDA = {
  bandeirada: 5.0,
  porKm: 2.2,
  porMinuto: 0.3,
  minimo: 8.0,
};

// Carona: contribuição para dividir o custo do trajeto
export const TARIFA_CARONA = {
  porKm: 0.6,
  minimo: 3.0,
};

// Emissão média de CO₂ por km (gramas), fonte de referência: carro a combustão ~120 g/km
export const CO2_G_POR_KM = {
  combustao: 120,
  hibrido: 60,
  eletrico: 0,
};

const arredondar = (valor) => Math.round(valor * 100) / 100;

export function estimarCorrida(distanciaKm, duracaoMin) {
  const valor =
    TARIFA_CORRIDA.bandeirada +
    distanciaKm * TARIFA_CORRIDA.porKm +
    duracaoMin * TARIFA_CORRIDA.porMinuto;
  return arredondar(Math.max(TARIFA_CORRIDA.minimo, valor));
}

export function estimarCarona(distanciaKm) {
  return arredondar(Math.max(TARIFA_CARONA.minimo, distanciaKm * TARIFA_CARONA.porKm));
}

/** CO₂ (kg) evitado ao trocar um carro a combustão individual por carona no veículo dado. */
export function co2EvitadoKg(distanciaKm, propulsao = "eletrico") {
  const emissaoVeiculo = CO2_G_POR_KM[propulsao] ?? CO2_G_POR_KM.combustao;
  const evitadoGramas = distanciaKm * (CO2_G_POR_KM.combustao - emissaoVeiculo);
  return Math.round((evitadoGramas / 1000) * 10) / 10;
}

export function compararCorridaECarona(distanciaKm, duracaoMin) {
  const corrida = estimarCorrida(distanciaKm, duracaoMin);
  const carona = estimarCarona(distanciaKm);
  const economia = arredondar(Math.max(0, corrida - carona));
  const percentual = corrida > 0 ? Math.round((economia / corrida) * 100) : 0;
  return { corrida, carona, economia, percentual };
}

const formatoReais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatarReais = (valor) => formatoReais.format(valor);

export function formatarKm(km) {
  return km < 10 ? `${km.toFixed(1).replace(".", ",")} km` : `${Math.round(km)} km`;
}

export function formatarMinutos(minutos) {
  const total = Math.max(1, Math.round(minutos));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
