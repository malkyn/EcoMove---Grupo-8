import { createContext, useContext } from "react";

/** Contexto preenchido pelo FeedbackProvider (montado no AppShell). */
export const FeedbackContext = createContext(null);

function useFeedback() {
  const contexto = useContext(FeedbackContext);
  if (!contexto) {
    throw new Error("useConfirmacao e useToast só funcionam dentro do FeedbackProvider (AppShell).");
  }
  return contexto;
}

/**
 * Folha de confirmação no lugar do window.confirm.
 *   const confirmar = useConfirmacao();
 *   if (!(await confirmar({ titulo: "Cancelar corrida?", mensagem: "...", confirmar: "Cancelar corrida", perigo: true }))) return;
 * Resolve true no botão principal e false ao cancelar, fechar com Esc ou tocar fora.
 */
export function useConfirmacao() {
  return useFeedback().confirmar;
}

/**
 * Aviso curto acima das abas, que some sozinho.
 *   const toast = useToast();
 *   toast("Vaga reservada!");                                   // tipo "ok"
 *   toast("Sem conexão.", { tipo: "erro" });                    // também "aviso"
 *   toast("Vaga reservada!", { acao: { rotulo: "Ver em Viagens", para: "/app/viagens" } });
 */
export function useToast() {
  return useFeedback().toast;
}
