import React, { useEffect } from "react";
import { NavLink, Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";
import "./AppShell.css";
import "./AppTema.css";
import Logo from "../../pages/icons/logo.webp";
import { usandoMock } from "../../services/api";
import { getUsuarioLogado } from "../../services/auth";
import { FeedbackProvider } from "../Feedback/FeedbackProvider";

const PERFIL_MOTORISTA = 1;

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

const IconeVeiculo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path
      d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14a2 2 0 0 1 2 2v4h-2m-14-6a2 2 0 0 0-2 2v4h2m0 0v2h2v-2m-2 0h12m0 0v2h2v-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
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

const IconeVoltar = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Abas por perfil: quem dirige tem as caronas oferecidas e os veículos à mão
const ABAS_PASSAGEIRO = [
  { para: "/app", rotulo: "Início", Icone: IconeInicio, fim: true },
  { para: "/app/viagens", rotulo: "Viagens", Icone: IconeViagens },
  { para: "/app/perfil", rotulo: "Perfil", Icone: IconePerfil },
];

const ABAS_MOTORISTA = [
  { para: "/app", rotulo: "Início", Icone: IconeInicio, fim: true },
  { para: "/app/viagens", rotulo: "Caronas", Icone: IconeViagens },
  { para: "/app/veiculos", rotulo: "Veículos", Icone: IconeVeiculo },
  { para: "/app/perfil", rotulo: "Perfil", Icone: IconePerfil },
];

// Telas internas (fora das abas): o topo mostra o título e o botão de voltar.
// `voltarPara` é usado quando a tela foi aberta direto (link, atalho), sem histórico no app.
const TELAS_INTERNAS = [
  { padrao: "/app/destino", titulo: "Para onde?", voltarPara: "/app" },
  { padrao: "/app/caronas", titulo: "Caronas compatíveis", voltarPara: "/app/destino" },
  { padrao: "/app/caronas/nova", titulo: "Oferecer carona", voltarPara: "/app" },
  { padrao: "/app/corridas/:id", titulo: "Sua corrida", voltarPara: "/app" },
];

/**
 * Casca do app para quem está logado: barra superior compacta, conteúdo e
 * abas inferiores no padrão dos apps de mobilidade. Sem navbar nem rodapé do site.
 * O FeedbackProvider dá às telas a folha de confirmação e os toasts (useConfirmacao, useToast).
 */
function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;
  const abas = ehMotorista ? ABAS_MOTORISTA : ABAS_PASSAGEIRO;
  const tela = TELAS_INTERNAS.find((t) => matchPath(t.padrao, location.pathname)) || null;

  useEffect(() => {
    document.title = tela ? `${tela.titulo} · EcoMove` : "EcoMove";
  }, [tela]);

  const voltar = () => {
    // Chegou de outra tela do app: volta no histórico. Abriu direto: vai para a tela "pai".
    if (location.key !== "default") navigate(-1);
    else navigate(tela.voltarPara, { replace: true });
  };

  return (
    <div className="app-shell">
      <FeedbackProvider>
        <header className="app-topo">
          {tela ? (
            <>
              <button type="button" className="app-topo-voltar" onClick={voltar} aria-label="Voltar">
                <IconeVoltar />
              </button>
              <h1 className="app-topo-titulo app-topo-titulo-tela">{tela.titulo}</h1>
            </>
          ) : (
            <>
              <img src={Logo} alt="" width="28" height="28" />
              <span className="app-topo-titulo">EcoMove</span>
            </>
          )}
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
      </FeedbackProvider>
    </div>
  );
}

export default AppShell;
