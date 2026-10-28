/**
 * Chips da avaliação: elogios para nota 4 ou 5, pontos a melhorar para nota 1 a 3.
 * Os valores vão no campo `tags` da API; os rótulos aparecem na tela.
 */
const COMUNS_BONS = [
  { valor: "pontual", rotulo: "Pontual" },
  { valor: "simpatia", rotulo: "Simpatia" },
  { valor: "boa_conversa", rotulo: "Boa conversa" },
];

const COMUNS_RUINS = [
  { valor: "atrasou", rotulo: "Atrasou" },
  { valor: "comunicacao", rotulo: "Comunicação" },
];

export const CHIPS = {
  motorista: {
    bons: [...COMUNS_BONS, { valor: "dirige_bem", rotulo: "Dirige bem" }, { valor: "veiculo_limpo", rotulo: "Veículo limpo" }],
    ruins: [
      ...COMUNS_RUINS,
      { valor: "direcao_brusca", rotulo: "Direção brusca" },
      { valor: "veiculo_sujo", rotulo: "Veículo sujo" },
      { valor: "rota_estranha", rotulo: "Rota estranha" },
    ],
  },
  passageiro: {
    bons: [...COMUNS_BONS, { valor: "educado", rotulo: "Educado" }, { valor: "ponto_certo", rotulo: "No ponto certo" }],
    ruins: [...COMUNS_RUINS, { valor: "nao_apareceu", rotulo: "Não apareceu" }, { valor: "combinado", rotulo: "Mudou o combinado" }],
  },
};

/** Chips que fazem sentido para a nota dada e para quem está sendo avaliado. */
export function chipsPara(nota, papelAvaliado = "motorista") {
  if (!nota) return [];
  const conjunto = CHIPS[papelAvaliado] || CHIPS.motorista;
  return nota >= 4 ? conjunto.bons : conjunto.ruins;
}

const TODOS = Object.values(CHIPS).flatMap((c) => [...c.bons, ...c.ruins]);

export const rotuloChip = (valor) => TODOS.find((c) => c.valor === valor)?.rotulo || valor;
