import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import NavBar from "./components/NavBar/NavBar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import CadastroUsuario from "./pages/CadastroUsuario.jsx";
import Login from "./pages/Login.jsx";
import BalãoFlutuante from "./components/Balão/Balão.jsx";
import Entrar from "./pages/Entrar.jsx";
import NaoEncontrada from "./pages/NaoEncontrada.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import AppShell from "./components/AppShell/AppShell.jsx";
import Inicio from "./pages/app/Inicio.jsx";
import Viagens from "./pages/app/Viagens.jsx";
import Perfil from "./pages/app/Perfil.jsx";
import Veiculos from "./pages/app/Veiculos.jsx";
import Destino from "./pages/app/Destino.jsx";
import CaronasCompativeis from "./pages/app/CaronasCompativeis.jsx";
import OferecerCarona from "./pages/app/OferecerCarona.jsx";

const PERFIL_MOTORISTA = 1;

/** Site público: landing page, cadastro e login, com navbar e rodapé. */
function Site() {
  const hiddenPages = ["/entrar"]; // Páginas onde o balão não aparece
  return (
    <div className="app-container">
      <NavBar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <BalãoFlutuante hiddenPages={hiddenPages} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Site />}>
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/cadastrousuario" element={<CadastroUsuario />} />
          <Route path="/loginForm" element={<Login />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>

        {/* Área logada: casca de app mobile com abas inferiores */}
        <Route
          path="/app"
          element={
            <RotaProtegida>
              <AppShell />
            </RotaProtegida>
          }
        >
          <Route index element={<Inicio />} />
          <Route path="viagens" element={<Viagens />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="destino" element={<Destino />} />
          <Route path="caronas" element={<CaronasCompativeis />} />
          <Route
            path="caronas/nova"
            element={
              <RotaProtegida perfil={PERFIL_MOTORISTA}>
                <OferecerCarona />
              </RotaProtegida>
            }
          />
          <Route
            path="veiculos"
            element={
              <RotaProtegida perfil={PERFIL_MOTORISTA}>
                <Veiculos />
              </RotaProtegida>
            }
          />
        </Route>

        {/* Rota antiga do painel */}
        <Route path="/painel" element={<Navigate to="/app" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
