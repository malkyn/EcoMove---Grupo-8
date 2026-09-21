import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Inicio.css";
import Mapa from "../../components/Mapa/Mapa";
import { getUsuarioLogado } from "../../services/auth";

const PERFIL_MOTORISTA = 1;
// Centro de Sorocaba: usado enquanto a localização do celular não chega
const SOROCABA = { lat: -23.5015, lng: -47.4526 };

const IconeBusca = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function Inicio() {
  const location = useLocation();
  const avisoDeRota = location.state?.erro; // ex.: passageiro tentou abrir área de motorista
  const usuario = getUsuarioLogado();
  const ehMotorista = usuario?.id_perfil === PERFIL_MOTORISTA;
  const primeiroNome = usuario?.nome ? String(usuario.nome).split(" ")[0] : "";

  const [posicao, setPosicao] = useState(null);
  const [avisoGps, setAvisoGps] = useState("");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setAvisoGps("Seu navegador não oferece localização. Mostrando Sorocaba.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPosicao({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setAvisoGps("Sem acesso à sua localização. Mostrando Sorocaba."),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return (
    <div className="inicio">
      <div className="inicio-mapa">
        <Mapa centro={posicao || SOROCABA} zoom={posicao ? 15 : 13} posicaoUsuario={posicao} />
      </div>

      {/* Folha inferior, no padrão dos apps de mobilidade */}
      <section className="inicio-folha" aria-label="Ações rápidas">
        <div className="inicio-alca" aria-hidden="true" />
        {avisoDeRota && (
          <p className="inicio-aviso" role="alert">
            {avisoDeRota}
          </p>
        )}
        {avisoGps && <p className="inicio-aviso">{avisoGps}</p>}
        <p className="inicio-saudacao">Olá, {primeiroNome}</p>

        {ehMotorista ? (
          <div className="inicio-acoes">
            <Link to="/app/caronas/nova" className="inicio-botao">
              Oferecer carona
            </Link>
            <button type="button" className="inicio-botao inicio-botao-secundario" disabled>
              Ficar online para corridas (em breve)
            </button>
          </div>
        ) : (
          <Link to="/app/destino" className="inicio-busca">
            <IconeBusca />
            <span>Para onde?</span>
          </Link>
        )}
      </section>
    </div>
  );
}

export default Inicio;
