import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
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

/**
 * Avisa o centro do mapa sempre que a pessoa termina de arrastá-lo. Com um pino fixo
 * desenhado sobre o centro, vira o "ajuste o ponto de encontro" dos apps de corrida.
 */
export function CentroDoMapa({ onMover }) {
  const mapa = useMapEvents({
    moveend: () => {
      const centro = mapa.getCenter();
      onMover({ lat: centro.lat, lng: centro.lng });
    },
  });
  return null;
}

/**
 * Enquadra o mapa para mostrar todos os pontos ([{ lat, lng }]) sempre que a lista muda.
 * Com um ponto só, centraliza nele. Lista vazia não mexe no mapa.
 */
export function Enquadrar({ pontos, margemInferior = 40, zoomMaximo = 15 }) {
  const mapa = useMap();
  // A lista costuma ser recriada a cada render; a chave evita reenquadrar sem mudança real
  const chave = JSON.stringify((pontos || []).map((p) => [Number(p.lat.toFixed(5)), Number(p.lng.toFixed(5))]));
  const coordenadas = useMemo(() => JSON.parse(chave), [chave]);
  useEffect(() => {
    if (coordenadas.length === 0) return;
    // Um ponto só também passa por fitBounds: assim a margem inferior (a folha que cobre o
    // mapa) desloca o ponto para a parte visível, em vez de centralizá-lo atrás dela.
    // Sem animação: a animada depende de requestAnimationFrame e fica presa em aba oculta.
    mapa.fitBounds(coordenadas, {
      paddingTopLeft: [30, 30],
      paddingBottomRight: [30, margemInferior],
      maxZoom: zoomMaximo,
      animate: false,
    });
  }, [mapa, coordenadas, margemInferior, zoomMaximo]);
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
