import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUsuarioLogado } from "../services/auth";

const PERFIL_MOTORISTA = 1;

/**
 * Só renderiza o conteúdo se houver usuário logado.
 * Com `perfil`, exige também o tipo de perfil (1 motorista, 2 passageiro).
 *
 * Isto protege apenas a navegação da interface. O backend precisa validar
 * permissões de novo em cada rota: qualquer um consegue burlar o front.
 */
function RotaProtegida({ children, perfil }) {
  const location = useLocation();
  const usuario = getUsuarioLogado();

  if (!usuario) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{ de: location.pathname, mensagem: "Entre para acessar esta página." }}
      />
    );
  }

  if (perfil && usuario.id_perfil !== perfil) {
    const exclusivo = perfil === PERFIL_MOTORISTA ? "motoristas" : "passageiros";
    return (
      <Navigate to="/app" replace state={{ erro: `Esta área é exclusiva para ${exclusivo}.` }} />
    );
  }

  return children;
}

export default RotaProtegida;
