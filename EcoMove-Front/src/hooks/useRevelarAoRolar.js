import { useEffect } from "react";

/**
 * Revela, com animação, os elementos marcados com [data-revelar] quando
 * entram na tela durante a rolagem. Cada elemento ganha a classe "visivel"
 * uma única vez; o CSS cuida da transição.
 *
 * Se a pessoa preferir menos movimento (prefers-reduced-motion) ou o
 * navegador não tiver IntersectionObserver, tudo aparece de uma vez.
 *
 * @param {React.RefObject<HTMLElement>} raiz elemento que contém os alvos
 */
export default function useRevelarAoRolar(raiz) {
  useEffect(() => {
    const container = raiz.current;
    if (!container) return undefined;

    const alvos = container.querySelectorAll("[data-revelar]");
    const menosMovimento =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (menosMovimento || typeof IntersectionObserver === "undefined") {
      alvos.forEach((alvo) => alvo.classList.add("visivel"));
      return undefined;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    alvos.forEach((alvo) => observador.observe(alvo));
    return () => observador.disconnect();
  }, [raiz]);
}
