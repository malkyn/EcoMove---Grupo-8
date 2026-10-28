// Estados de uma corrida sob demanda e seus rótulos na interface.
export const STATUS_CORRIDA = {
  pendente: { rotulo: "Procurando motorista", tom: "aguardando" },
  aceita: { rotulo: "Motorista a caminho", tom: "andamento" },
  em_andamento: { rotulo: "Em viagem", tom: "andamento" },
  concluida: { rotulo: "Concluída", tom: "ok" },
  cancelada: { rotulo: "Cancelada", tom: "erro" },
};

export const STATUS_ATIVOS = ["pendente", "aceita", "em_andamento"];

/** Etapas na ordem em que acontecem, para a linha de progresso da tela da corrida. */
export const ETAPAS_CORRIDA = [
  { status: "pendente", rotulo: "Procurando" },
  { status: "aceita", rotulo: "A caminho" },
  { status: "em_andamento", rotulo: "Em viagem" },
  { status: "concluida", rotulo: "Concluída" },
];

/** Motivos oferecidos ao passageiro ao cancelar (vão no campo `motivo` da API). */
export const MOTIVOS_CANCELAMENTO = [
  { valor: "demora", rotulo: "Demorou demais" },
  { valor: "engano", rotulo: "Pedi por engano" },
  { valor: "outro_jeito", rotulo: "Vou de outro jeito" },
  { valor: "outro", rotulo: "Outro motivo" },
];

/** Sem motorista por este tempo, a tela oferece continuar procurando ou cancelar. */
export const LIMITE_ESPERA_MIN = 2;

export const corridaAtiva = (corrida) => Boolean(corrida) && STATUS_ATIVOS.includes(corrida.status);

export const rotuloStatus = (status) => STATUS_CORRIDA[status]?.rotulo || status;

export const tomStatus = (status) => STATUS_CORRIDA[status]?.tom || "aguardando";

export const rotuloMotivo = (valor) =>
  MOTIVOS_CANCELAMENTO.find((m) => m.valor === valor)?.rotulo || valor;
