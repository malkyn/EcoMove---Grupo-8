import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AppShell.css";
import Logo from "../../pages/icons/logo.svg";
import { usandoMock } from "../../services/api";

const IconeInicio = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path
      d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const IconeViagens = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <circle cx="6" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="18" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M8.5 6H14a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconePerfil = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M4 20a8 8 0 0 1 16 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const abas = [
  { para: "/app", rotulo: "Início", Icone: IconeInicio, fim: true },
  { para: "/app/viagens", rotulo: "Viagens", Icone: IconeViagens },
  { para: "/app/perfil", rotulo: "Perfil", Icone: IconePerfil },
];

/**
 * Casca do app para quem está logado: barra superior compacta, conteúdo e
 * abas inferiores no padrão dos apps de mobilidade. Sem navbar nem rodapé do site.
 */
function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-topo">
        <img src={Logo} alt="" width="28" height="28" />
        <span className="app-topo-titulo">EcoMove</span>
        {usandoMock && (
          <span className="app-topo-demo" title="Dados simulados no navegador">
            demo
          </span>
        )}
      </header>

      <main className="app-conteudo">
        <Outlet />
      </main>

      <nav className="app-abas" aria-label="Navegação principal">
        {abas.map((aba) => (
          <NavLink
            key={aba.para}
            to={aba.para}
            end={aba.fim}
            className={({ isActive }) => `app-aba ${isActive ? "ativa" : ""}`}
          >
            <aba.Icone />
            <span>{aba.rotulo}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AppShell;
