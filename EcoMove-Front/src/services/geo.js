// Geocodificação e rotas com serviços públicos do OpenStreetMap, sem chave de API.
// Nominatim: uso justo, no máximo 1 requisição por segundo (por isso o campo de
// endereço espera o usuário parar de digitar antes de buscar).
// OSRM (servidor de demonstração): uso justo; se falhar, estimamos em linha reta.
const NOMINATIM = "https://nominatim.openstreetmap.org";
const OSRM = "https://router.project-osrm.org/route/v1/driving";

// Caixa aproximada de Sorocaba e região, para priorizar resultados locais
const VIEWBOX_REGIAO = "-47.70,-23.30,-47.20,-23.70";
const FATOR_TORTUOSIDADE = 1.3; // linha reta -> trajeto urbano aproximado
const VELOCIDADE_MEDIA_KMH = 30;

function nomeCurto(resultado) {
  const a = resultado.address || {};
  const principal =
    resultado.name || a.road || a.suburb || a.city || String(resultado.display_name).split(",")[0];
  const bairro = a.suburb || a.neighbourhood || a.city_district;
  const cidade = a.city || a.town || a.village || a.municipality;
  return [principal, bairro, cidade]
    .filter(Boolean)
    .filter((valor, i, lista) => lista.indexOf(valor) === i)
    .join(", ");
}

function paraLugar(resultado) {
  return {
    id: resultado.place_id,
    nome: nomeCurto(resultado),
    descricao: resultado.display_name,
    lat: Number(resultado.lat),
    lng: Number(resultado.lon),
  };
}

/** Sugestões de endereço para um texto digitado. */
export async function buscarEnderecos(texto, sinal) {
  const q = String(texto || "").trim();
  if (q.length < 3) return [];

  const url = new URL(`${NOMINATIM}/search`);
  url.search = new URLSearchParams({
    q,
    format: "jsonv2",
    limit: "6",
    countrycodes: "br",
    "accept-language": "pt-BR",
    addressdetails: "1",
    viewbox: VIEWBOX_REGIAO,
    bounded: "0",
  }).toString();

  const resposta = await fetch(url, { signal: sinal, headers: { Accept: "application/json" } });
  if (!resposta.ok) throw new Error("Falha na busca de endereços");
  const dados = await resposta.json();
  return dados.map(paraLugar);
}

/** Nome curto do endereço em uma coordenada (geocodificação reversa). */
export async function enderecoDe(lat, lng, sinal) {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.search = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "jsonv2",
    "accept-language": "pt-BR",
    addressdetails: "1",
  }).toString();

  const resposta = await fetch(url, { signal: sinal, headers: { Accept: "application/json" } });
  if (!resposta.ok) throw new Error("Falha ao identificar o endereço");
  const dados = await resposta.json();
  return nomeCurto(dados);
}

/** Distância em linha reta (fórmula de Haversine), em km. */
export function distanciaHaversineKm(a, b) {
  const R = 6371;
  const rad = (graus) => (graus * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Rota de carro entre dois pontos: distância, duração e traçado.
 * `pontos` vem como [[lat, lng], ...] pronto para o Leaflet.
 * Se o OSRM não responder, devolve uma estimativa em linha reta (`estimada: true`).
 */
export async function calcularRota(origem, destino, sinal) {
  try {
    const url =
      `${OSRM}/${origem.lng},${origem.lat};${destino.lng},${destino.lat}` +
      "?overview=full&geometries=geojson";
    const resposta = await fetch(url, { signal: sinal });
    if (!resposta.ok) throw new Error("Serviço de rotas indisponível");
    const dados = await resposta.json();
    const rota = dados.routes?.[0];
    if (!rota) throw new Error("Rota não encontrada");
    return {
      distanciaKm: rota.distance / 1000,
      duracaoMin: rota.duration / 60,
      pontos: rota.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      estimada: false,
    };
  } catch (err) {
    if (err.name === "AbortError") throw err;
    const km = distanciaHaversineKm(origem, destino) * FATOR_TORTUOSIDADE;
    return {
      distanciaKm: km,
      duracaoMin: (km / VELOCIDADE_MEDIA_KMH) * 60,
      pontos: [
        [origem.lat, origem.lng],
        [destino.lat, destino.lng],
      ],
      estimada: true,
    };
  }
}
