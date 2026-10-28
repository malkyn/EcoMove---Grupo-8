/**
 * O que outros usuários podem ver de uma pessoa (Política de Privacidade, item 1):
 * primeiro nome e avaliação. Telefone nunca aparece na tela; vira botão de ligar ou mensagem.
 */

/** "Camila Ferreira" -> "Camila". */
export function primeiroNome(nome) {
  return String(nome || "").trim().split(/\s+/)[0] || "";
}

/**
 * Links de ligação e WhatsApp a partir de um telefone brasileiro em qualquer formato
 * ("(15) 99999-0001", "15999990001", "+55 15 ..."). Devolve null se o número for curto demais.
 */
export function linksDeContato(telefone, { mensagem = "" } = {}) {
  const digitos = String(telefone || "").replace(/\D/g, "");
  if (digitos.length < 10) return null;
  const completo = digitos.startsWith("55") && digitos.length >= 12 ? digitos : `55${digitos}`;
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return { ligar: `tel:+${completo}`, whatsapp: `https://wa.me/${completo}${texto}` };
}
