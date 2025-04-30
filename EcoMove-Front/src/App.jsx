import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Usuarios from "./pages/Usuarios";
import NavBar from "./components/NavBar/NavBar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import CadastroUsuario from "./pages/CadastroUsuario.jsx";
import Login from "./pages/Login.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usuarios" element={<Usuarios></Usuarios>}></Route>
        <Route
          path="/cadastrousuario"
          element={<CadastroUsuario></CadastroUsuario>}
        ></Route>
        <Route path="/loginForm" element={<Login></Login>}></Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
