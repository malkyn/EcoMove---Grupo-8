import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import NavBar from "./components/NavBar/NavBar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import CadastroUsuario from "./pages/CadastroUsuario.jsx";
import Login from "./pages/Login.jsx";
import BalãoFlutuante from "./components/Balão/Balão.jsx";
import Entrar from "./pages/Entrar.jsx";
import Painel from "./pages/Painel.jsx";
import NaoEncontrada from "./pages/NaoEncontrada.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";

function App() {
  const hiddenPages = ["/entrar", "/painel"]; // Páginas onde o balão não aparece

  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/cadastrousuario" element={<CadastroUsuario />} />
            <Route path="/loginForm" element={<Login />} />
            <Route path="/entrar" element={<Entrar />} />
            <Route
              path="/painel"
              element={
                <RotaProtegida>
                  <Painel />
                </RotaProtegida>
              }
            />
            <Route path="*" element={<NaoEncontrada />} />
          </Routes>
        </main>
        <Footer />
        <BalãoFlutuante hiddenPages={hiddenPages} />
      </div>
    </Router>
  );
}

export default App;
