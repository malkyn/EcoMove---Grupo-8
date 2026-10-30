// Sessão do usuário no navegador.
// Guardamos apenas dados públicos do perfil. Nunca senha, nunca token.
// Isto NÃO é autenticação: o backend nunca deve confiar no que está aqui.
const CHAVE = "ecomove_usuario";

export function salvarUsuario(usuario) {
  // Lista explícita de campos: o que o backend mandar a mais é descartado.
  const dados = {
    id_usuario: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    id_perfil: usuario.id_perfil,
  };
  localStorage.setItem(CHAVE, JSON.stringify(dados));
  return dados;
}

export function getUsuarioLogado() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto);
    // Valor alterado à mão pelo DevTools ou corrompido: trata como deslogado.
    if (!dados || typeof dados !== "object" || !dados.id_usuario) {
      localStorage.removeItem(CHAVE);
      return null;
    }
    return dados;
  } catch {
    localStorage.removeItem(CHAVE);
    return null;
  }
}

/** Atualiza na sessão só o que a pessoa editou (nome, e-mail); o resto fica como está. */
export function atualizarUsuarioLogado(parcial) {
  const atual = getUsuarioLogado();
  if (!atual) return null;
  return salvarUsuario({ ...atual, ...parcial });
}

export function logout() {
  localStorage.removeItem(CHAVE);
}
