import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Mapa.css";

/** Move o mapa quando o centro muda (o MapContainer só usa o centro inicial). */
function Recentrar({ centro, zoom }) {
  const mapa = useMap();
  useEffect(() => {
    mapa.setView([centro.lat, centro.lng], zoom, { animate: true });
  }, [mapa, centro.lat, centro.lng, zoom]);
  return null;
}

/**
 * Mapa base com OpenStreetMap (sem chave de API).
 * `posicaoUsuario` desenha o ponto "você está aqui"; `children` recebe marcadores e rotas.
 */
function Mapa({ centro, zoom = 14, posicaoUsuario = null, children }) {
  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={zoom}
      zoomControl={false}
      className="mapa"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recentrar centro={centro} zoom={zoom} />
      {posicaoUsuario && (
        <CircleMarker
          center={[posicaoUsuario.lat, posicaoUsuario.lng]}
          radius={9}
          pathOptions={{ color: "#ffffff", fillColor: "#036141", fillOpacity: 1, weight: 3 }}
        >
          <Popup>Você está aqui</Popup>
        </CircleMarker>
      )}
      {children}
    </MapContainer>
  );
}

export default Mapa;
