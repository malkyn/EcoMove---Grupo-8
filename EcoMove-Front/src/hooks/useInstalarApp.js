import { useEffect, useState } from "react";

const ehIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const emModoApp = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

/**
 * Controla a instalação do PWA.
 * - Android/Chrome/Edge: o navegador dispara `beforeinstallprompt`; guardamos o evento e
 *   chamamos `prompt()` quando o usuário tocar em "Instalar".
 * - iOS/Safari: não existe prompt; mostramos a instrução "Compartilhar > Adicionar à Tela de Início".
 */
export function useInstalarApp() {
  const [eventoInstalacao, setEventoInstalacao] = useState(null);
  const [instalado, setInstalado] = useState(emModoApp());

  useEffect(() => {
    const aoPoderInstalar = (evento) => {
      evento.preventDefault();
      setEventoInstalacao(evento);
    };
    const aoInstalar = () => {
      setInstalado(true);
      setEventoInstalacao(null);
    };
    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  const instalar = async () => {
    if (!eventoInstalacao) return;
    eventoInstalacao.prompt();
    await eventoInstalacao.userChoice;
    setEventoInstalacao(null);
  };

  return {
    jaInstalado: instalado,
    podeInstalar: Boolean(eventoInstalacao),
    precisaDeInstrucaoIOS: !instalado && ehIOS(),
    instalar,
  };
}
