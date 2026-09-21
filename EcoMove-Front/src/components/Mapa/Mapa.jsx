import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
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

/** Ponto colorido com rótulo (origem, destino, motorista...). */
export function Marcador({ posicao, cor = "#036141", rotulo }) {
  return (
    <CircleMarker
      center={[posicao.lat, posicao.lng]}
      radius={8}
      pathOptions={{ color: "#ffffff", fillColor: cor, fillOpacity: 1, weight: 3 }}
    >
      {rotulo && <Popup>{rotulo}</Popup>}
    </CircleMarker>
  );
}

/**
 * Traçado de rota ([[lat, lng], ...]) que enquadra o mapa para caber inteiro.
 * `margemInferior` reserva espaço para a folha que cobre a base do mapa.
 */
export function TracadoRota({ pontos, cor = "#036141", margemInferior = 40 }) {
  const mapa = useMap();
  useEffect(() => {
    if (pontos && pontos.length > 1) {
      mapa.fitBounds(pontos, { paddingTopLeft: [30, 30], paddingBottomRight: [30, margemInferior] });
    }
  }, [mapa, pontos, margemInferior]);

  if (!pontos || pontos.length < 2) return null;
  return <Polyline positions={pontos} pathOptions={{ color: cor, weight: 5, opacity: 0.85 }} />;
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
        <Marcador posicao={posicaoUsuario} cor="#036141" rotulo="Você está aqui" />
      )}
      {children}
    </MapContainer>
  );
}

export default Mapa;
