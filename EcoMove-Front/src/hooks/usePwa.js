import { useSyncExternalStore } from "react";
import { assinarPwa, atualizarApp, instalarApp, lerPwa } from "../services/pwa";

const ehIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const usePwa = () => useSyncExternalStore(assinarPwa, lerPwa);

/** true com internet; false quando o aparelho avisa que a conexão caiu. */
export function useConexao() {
  return usePwa().online;
}

/** Versão nova do app já baixada pelo service worker, esperando a pessoa aplicar. */
export function useAtualizacaoApp() {
  return { atualizacaoPronta: usePwa().atualizacaoPronta, atualizar: atualizarApp };
}

/**
 * Instalação do PWA.
 * - Android/Chrome/Edge: o navegador dispara `beforeinstallprompt` (capturado em services/pwa.js
 *   no carregamento da página); `instalar()` abre o diálogo nativo.
 * - iOS/Safari: não existe diálogo; a tela mostra "Compartilhar › Adicionar à Tela de Início".
 */
export function useInstalarApp() {
  const { eventoInstalacao, instalado } = usePwa();
  return {
    jaInstalado: instalado,
    podeInstalar: !instalado && Boolean(eventoInstalacao),
    precisaDeInstrucaoIOS: !instalado && ehIOS(),
    instalar: instalarApp,
  };
}
