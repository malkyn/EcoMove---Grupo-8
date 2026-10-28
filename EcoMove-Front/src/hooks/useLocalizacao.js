import { useCallback, useEffect, useRef, useState } from "react";
import { distanciaHaversineKm } from "../services/geo";

const OPCOES = { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 };
const OPCOES_ACOMPANHAR = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 };
const MOVIMENTO_MINIMO_KM = 0.01; // 10 m: abaixo disso é ruído do GPS, não vale redesenhar

/**
 * Localização atual do aparelho.
 * `obter()` devolve { lat, lng } ou null (sem permissão, sem suporte ou tempo esgotado) e nunca lança erro.
 * `acompanhar()` segue a posição enquanto a tela precisar (motorista online) e devolve a função que para.
 */
export function useLocalizacao() {
  const [posicao, setPosicao] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");
  const observador = useRef(null);

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

  const acompanhar = useCallback(() => {
    if (!("geolocation" in navigator) || observador.current !== null) return () => {};
    observador.current = navigator.geolocation.watchPosition(
      (p) => {
        const ponto = { lat: p.coords.latitude, lng: p.coords.longitude };
        setErro("");
        setPosicao((atual) =>
          atual && distanciaHaversineKm(atual, ponto) < MOVIMENTO_MINIMO_KM ? atual : ponto
        );
      },
      () => setErro("Sem acesso à sua localização."),
      OPCOES_ACOMPANHAR
    );
    return () => {
      if (observador.current !== null) {
        navigator.geolocation.clearWatch(observador.current);
        observador.current = null;
      }
    };
  }, []);

  // Garante que o acompanhamento para quando a tela some
  useEffect(
    () => () => {
      if (observador.current !== null) navigator.geolocation.clearWatch(observador.current);
    },
    []
  );

  return { posicao, buscando, erro, obter, acompanhar };
}
