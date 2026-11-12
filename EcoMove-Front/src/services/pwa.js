// Estado do PWA fora do React: conexão, versão nova do service worker e o evento de
// instalação. Fica aqui, e não num hook, porque o `beforeinstallprompt` dispara logo no
// carregamento da página: se só ouvíssemos quando a tela do Perfil monta, ele já teria passado.
import { registerSW } from "virtual:pwa-register";

const VERIFICAR_VERSAO_MS = 60 * 60 * 1000; // quem deixa o app aberto por horas também fica sabendo

const emModoApp = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

let estado = {
  online: navigator.onLine !== false,
  atualizacaoPronta: false,
  eventoInstalacao: null,
  instalado: emModoApp(),
};
const ouvintes = new Set();
let aplicarVersaoNova = async () => {};

function mudar(parcial) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach((avisar) => avisar());
}

export const lerPwa = () => estado;

export function assinarPwa(avisar) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

/** Chamado uma vez, em main.jsx, antes de montar o app. */
export function iniciarPwa() {
  window.addEventListener("online", () => mudar({ online: true }));
  window.addEventListener("offline", () => mudar({ online: false }));

  // Android/Chrome/Edge: guardamos o evento para abrir o diálogo nativo quando a pessoa quiser
  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    mudar({ eventoInstalacao: evento });
  });
  window.addEventListener("appinstalled", () => mudar({ instalado: true, eventoInstalacao: null }));

  // Em desenvolvimento o plugin entrega um registerSW vazio; o service worker só existe no build
  aplicarVersaoNova = registerSW({
    onNeedRefresh() {
      mudar({ atualizacaoPronta: true });
    },
    onRegisteredSW(_url, registro) {
      if (!registro) return;
      setInterval(() => registro.update().catch(() => {}), VERIFICAR_VERSAO_MS);
    },
  });
}

/** Ativa a versão nova já baixada e recarrega a página. */
export function atualizarApp() {
  return aplicarVersaoNova(true);
}

/** Abre o diálogo nativo de instalação. Resolve true se a pessoa aceitou. */
export async function instalarApp() {
  const evento = estado.eventoInstalacao;
  if (!evento) return false;
  mudar({ eventoInstalacao: null }); // o navegador só deixa chamar prompt() uma vez por evento
  evento.prompt();
  const escolha = await evento.userChoice;
  return escolha?.outcome === "accepted";
}
