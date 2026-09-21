/**
 * Validações e máscaras de formulário usadas no cadastro.
 * Tudo aqui é conforto para quem preenche: o backend valida de novo.
 */

export const apenasDigitos = (valor) => String(valor || "").replace(/\D/g, "");

/** Valida CPF pelos dígitos verificadores (rejeita sequências repetidas). */
export function cpfValido(cpf) {
  const d = apenasDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (tamanho) => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

/** Idade em anos completos a partir de uma data ISO (AAAA-MM-DD); null se inválida. */
export function calcularIdade(dataISO) {
  if (!dataISO) return null;
  const nascimento = new Date(`${dataISO}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}

/** Hoje em "AAAA-MM-DD" no horário local (limite do campo de data). */
export function hojeISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());

/** "12345678901" -> "123.456.789-01" (aplica enquanto digita). */
export function mascaraCPF(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** "15998243110" -> "(15) 99824-3110"; aceita fixo com 10 dígitos. */
export function mascaraTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Só os 11 dígitos do registro da CNH. */
export const mascaraCNH = (valor) => apenasDigitos(valor).slice(0, 11);

/**
 * Força da senha em três níveis, para orientar (não substitui a regra mínima).
 * 0 = fraca, 1 = média, 2 = forte.
 */
export function forcaSenha(senha) {
  const s = String(senha || "");
  if (s.length < 8) return 0;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(s)).length;
  if (s.length >= 12 && classes >= 3) return 2;
  if (classes >= 2) return 1;
  return 0;
}

export const senhaValida = (senha) =>
  String(senha || "").length >= 8 && /[A-Za-z]/.test(senha) && /\d/.test(senha);
