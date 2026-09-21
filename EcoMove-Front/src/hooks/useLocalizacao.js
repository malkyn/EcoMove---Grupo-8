import { useCallback, useState } from "react";

const OPCOES = { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 };

/**
 * Localização atual do aparelho. `obter()` devolve { lat, lng } ou null (sem permissão,
 * sem suporte ou tempo esgotado), e nunca lança erro.
 */
export function useLocalizacao() {
  const [posicao, setPosicao] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");

  const obter = useCallback(
    () =>
      new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
          setErro("Seu navegador não oferece localização.");
          resolve(null);
          return;
        }
        setBuscando(true);
        setErro("");
        navigator.geolocation.getCurrentPosition(
          (p) => {
            const ponto = { lat: p.coords.latitude, lng: p.coords.longitude };
            setPosicao(ponto);
            setBuscando(false);
            resolve(ponto);
          },
          () => {
            setErro("Sem acesso à sua localização.");
            setBuscando(false);
            resolve(null);
          },
          OPCOES
        );
      }),
    []
  );

  return { posicao, buscando, erro, obter };
}
