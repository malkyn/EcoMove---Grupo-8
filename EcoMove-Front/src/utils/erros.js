/**
 * Converte um erro do axios em mensagem para o usuário.
 * - 4xx: a mensagem do servidor é feita para o usuário (validação, conflito, permissão)
 * - 5xx: texto genérico, nunca expor detalhes internos do servidor
 * - sem resposta: servidor fora do ar, sem rede ou timeout
 */
export function mensagemDeErro(err, padrao = "Não foi possível concluir. Tente novamente.") {
  if (err?.response && err.response.status < 500) {
    return err.response.data?.erro || padrao;
  }
  if (err?.response) {
    return "O servidor encontrou um problema. Tente novamente em instantes.";
  }
  return "Não foi possível conectar ao servidor.";
}
