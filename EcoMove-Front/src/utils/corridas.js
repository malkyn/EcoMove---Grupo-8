// Estados de uma corrida sob demanda e seus rótulos na interface.
export const STATUS_CORRIDA = {
  pendente: { rotulo: "Procurando motorista", tom: "aguardando" },
  aceita: { rotulo: "Motorista a caminho", tom: "andamento" },
  em_andamento: { rotulo: "Em andamento", tom: "andamento" },
  concluida: { rotulo: "Concluída", tom: "ok" },
  cancelada: { rotulo: "Cancelada", tom: "erro" },
};

export const STATUS_ATIVOS = ["pendente", "aceita", "em_andamento"];

export const corridaAtiva = (corrida) => Boolean(corrida) && STATUS_ATIVOS.includes(corrida.status);

export const rotuloStatus = (status) => STATUS_CORRIDA[status]?.rotulo || status;

export const tomStatus = (status) => STATUS_CORRIDA[status]?.tom || "aguardando";
