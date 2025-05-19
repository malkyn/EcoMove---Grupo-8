import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import NavBar from "./components/NavBar/NavBar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import CadastroUsuario from "./pages/CadastroUsuario.jsx";
import Login from "./pages/Login.jsx";
import BalãoFlutuante from "./components/Balão/Balão.jsx";
import Entrar from "./pages/Entrar.jsx";

function App() {
  const [count, setCount] = useState(0);
  const hiddenPages = ["/Entrar"]; // Páginas onde o balão não aparece

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
          </Routes>
        </main>
        <Footer />
        <BalãoFlutuante hiddenPages={hiddenPages} />
      </div>
    </Router>
  );
}

export default App;
