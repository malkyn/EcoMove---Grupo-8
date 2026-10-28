/**
 * Som e vibração para avisar o motorista de um pedido novo.
 * Sem arquivo de áudio: dois tons curtos sintetizados com a Web Audio API.
 * O navegador só libera áudio depois de um toque, então `prepararAudio` deve ser chamado
 * no clique de "Ficar online"; `avisarPedido` toca depois, quando o pedido chega.
 */
export function prepararAudio(ref) {
  try {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return;
    if (!ref.current) ref.current = new Contexto();
    if (ref.current.state === "suspended") ref.current.resume();
  } catch {
    // sem áudio neste navegador
  }
}

export function avisarPedido(ref) {
  // O Chrome só vibra depois de um toque na página; antes disso, chamar só gera aviso no console
  if (navigator.vibrate && navigator.userActivation?.hasBeenActive !== false) {
    navigator.vibrate([200, 100, 200]);
  }
  const contexto = ref.current;
  if (!contexto) return;
  try {
    if (contexto.state === "suspended") contexto.resume();
    [880, 1175].forEach((frequencia, i) => {
      const inicio = contexto.currentTime + i * 0.18;
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.type = "sine";
      oscilador.frequency.value = frequencia;
      ganho.gain.setValueAtTime(0.0001, inicio);
      ganho.gain.exponentialRampToValueAtTime(0.25, inicio + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.35);
      oscilador.connect(ganho).connect(contexto.destination);
      oscilador.start(inicio);
      oscilador.stop(inicio + 0.4);
    });
  } catch {
    // sem áudio: a vibração e a tela já avisam
  }
}
