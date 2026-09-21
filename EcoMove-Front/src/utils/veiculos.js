// Regras e rótulos de veículos compartilhados entre telas e simulador.
export const CATEGORIAS = [
  { valor: "carro", rotulo: "Carro" },
  { valor: "moto", rotulo: "Moto" },
];

// O EcoMove aceita apenas veículos 100% elétricos ou híbridos.
export const PROPULSOES = [
  { valor: "eletrico", rotulo: "100% elétrico" },
  { valor: "hibrido", rotulo: "Híbrido" },
];

export const rotuloCategoria = (valor) =>
  CATEGORIAS.find((c) => c.valor === valor)?.rotulo || valor;

export const rotuloPropulsao = (valor) =>
  PROPULSOES.find((p) => p.valor === valor)?.rotulo || valor;

/** Elétrico e híbrido ganham destaque na interface. */
export const propulsaoSustentavel = (valor) => valor === "eletrico" || valor === "hibrido";

/** Maiúsculas, sem hífen ou espaço. */
export const normalizarPlaca = (placa) =>
  String(placa || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

/** Aceita padrão Mercosul (ABC1D23) e antigo (ABC1234). */
export const placaValida = (placa) => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(normalizarPlaca(placa));
