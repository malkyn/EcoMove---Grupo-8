import { useEffect, useRef } from "react";

/**
 * Executa `callback` a cada `ms` milissegundos enquanto `ativo` for verdadeiro.
 * Usado para consultar a API periodicamente (status de corrida, pedidos próximos).
 */
export function useIntervalo(callback, ms, ativo = true) {
  const referencia = useRef(callback);

  useEffect(() => {
    referencia.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!ativo || !ms) return undefined;
    const id = setInterval(() => referencia.current(), ms);
    return () => clearInterval(id);
  }, [ms, ativo]);
}
