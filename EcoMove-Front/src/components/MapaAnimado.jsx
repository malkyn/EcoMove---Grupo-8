import React, { useMemo } from "react";

/**
 * Mapa ilustrativo em SVG: a rota é traçada, um passageiro entra na carona
 * e um carro percorre o trajeto. As animações são SMIL (nativas do SVG),
 * sem JavaScript por quadro. Com "reduzir movimento" ativado no sistema,
 * mostra a cena final parada.
 */
const ROTA =
  "M60 260 H170 Q180 260 180 250 V190 Q180 180 190 180 H290 Q300 180 300 170 V90 Q300 80 310 80 H460";
const DURACAO = "8s";

function MapaAnimado() {
  const animar = useMemo(
    () =>
      !(
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ),
    []
  );

  return (
    <div className="lp-cta-mapa">
      <svg
        viewBox="0 0 520 340"
        role="img"
        aria-label="Mapa com uma rota compartilhada e um carro percorrendo o trajeto"
      >
        <defs>
          <clipPath id="lp-mapa-recorte">
            <rect x="0" y="0" width="520" height="340" rx="24" />
          </clipPath>
        </defs>

        <g clipPath="url(#lp-mapa-recorte)">
          {/* Fundo do mapa */}
          <rect width="520" height="340" fill="#eef3ef" />

          {/* Quarteirões e parques */}
          <g fill="#e2eae4">
            <rect x="72" y="92" width="96" height="76" rx="8" />
            <rect x="192" y="92" width="96" height="76" rx="8" />
            <rect x="312" y="92" width="96" height="76" rx="8" />
            <rect x="192" y="192" width="96" height="56" rx="8" />
            <rect x="432" y="192" width="96" height="56" rx="8" />
            <rect x="192" y="272" width="96" height="76" rx="8" />
            <rect x="312" y="272" width="96" height="76" rx="8" />
            <rect x="432" y="-8" width="96" height="76" rx="8" />
            <rect x="72" y="-8" width="96" height="76" rx="8" />
          </g>
          <g fill="#d5ecdd">
            <rect x="312" y="192" width="96" height="56" rx="8" />
            <rect x="72" y="272" width="96" height="76" rx="8" />
            <rect x="192" y="-8" width="96" height="76" rx="8" />
          </g>

          {/* Ruas */}
          <g stroke="#ffffff" strokeWidth="10" strokeLinecap="round">
            <path d="M60 0V340M180 0V340M300 0V340M420 0V340" />
            <path d="M0 80H520M0 180H520M0 260H520" />
          </g>

          {/* Rota: halo e traço, desenhados do início ao fim */}
          <path
            d={ROTA}
            pathLength="100"
            fill="none"
            stroke="#036141"
            strokeOpacity="0.18"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100"
            strokeDashoffset={animar ? 100 : 0}
          >
            {animar && (
              <animate
                attributeName="stroke-dashoffset"
                values="100;100;0;0"
                keyTimes="0;0.05;0.3;1"
                dur={DURACAO}
                repeatCount="indefinite"
              />
            )}
          </path>
          <path
            id="lp-rota"
            d={ROTA}
            pathLength="100"
            fill="none"
            stroke="#036141"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100"
            strokeDashoffset={animar ? 100 : 0}
          >
            {animar && (
              <animate
                attributeName="stroke-dashoffset"
                values="100;100;0;0"
                keyTimes="0;0.05;0.3;1"
                dur={DURACAO}
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Origem */}
          <g transform="translate(60 260)">
            <circle r="9" fill="#036141" stroke="#ffffff" strokeWidth="3" />
            <text x="0" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1f2d27">
              Você
            </text>
          </g>

          {/* Destino: aparece quando a rota termina de ser traçada */}
          <g transform="translate(460 80)" opacity={animar ? 0 : 1}>
            {animar && (
              <animate
                attributeName="opacity"
                values="0;0;1;1"
                keyTimes="0;0.28;0.32;1"
                dur={DURACAO}
                repeatCount="indefinite"
              />
            )}
            <circle r="9" fill="#d9480f" stroke="#ffffff" strokeWidth="3" />
            <text x="0" y="-18" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1f2d27">
              FACENS
            </text>
          </g>

          {/* Passageiro no caminho: pulsa quando entra na carona */}
          <g transform="translate(240 180)">
            <circle r="6" fill="#1d4ed8" fillOpacity="0.25">
              {animar && (
                <animate
                  attributeName="r"
                  values="6;6;24;6;6"
                  keyTimes="0;0.34;0.46;0.5;1"
                  dur={DURACAO}
                  repeatCount="indefinite"
                />
              )}
              {animar && (
                <animate
                  attributeName="fill-opacity"
                  values="0.25;0.25;0;0.25;0.25"
                  keyTimes="0;0.34;0.46;0.5;1"
                  dur={DURACAO}
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle r="7" fill="#1d4ed8" stroke="#ffffff" strokeWidth="3" />
          </g>

          {/* Balão de confirmação */}
          <g transform="translate(240 148)" opacity={animar ? 0 : 1}>
            {animar && (
              <animate
                attributeName="opacity"
                values="0;0;1;1;0;0"
                keyTimes="0;0.44;0.48;0.88;0.92;1"
                dur={DURACAO}
                repeatCount="indefinite"
              />
            )}
            <rect x="-66" y="-14" width="132" height="28" rx="14" fill="#ffffff" stroke="#e3e8e5" />
            <circle cx="-50" cy="0" r="5" fill="#036141" />
            <text x="-40" y="4" fontSize="12" fontWeight="600" fill="#1f2d27">
              Carona confirmada
            </text>
          </g>

          {/* Carro: percorre a rota virando com o traçado */}
          <g opacity={animar ? 0 : 1} transform={animar ? undefined : "translate(460 80)"}>
            {animar && (
              <animate
                attributeName="opacity"
                values="0;0;1;1;0;0"
                keyTimes="0;0.38;0.4;0.9;0.93;1"
                dur={DURACAO}
                repeatCount="indefinite"
              />
            )}
            {animar && (
              <animateMotion
                dur={DURACAO}
                repeatCount="indefinite"
                rotate="auto"
                calcMode="linear"
                keyPoints="0;0;1;1"
                keyTimes="0;0.4;0.9;1"
              >
                <mpath href="#lp-rota" />
              </animateMotion>
            )}
            <ellipse cx="0" cy="9" rx="13" ry="4" fill="#0f1f19" opacity="0.18" />
            <rect x="-14" y="-8" width="28" height="16" rx="5" fill="#036141" />
            <rect x="-7" y="-6" width="9" height="12" rx="2" fill="#8ee0b8" />
            <rect x="6" y="-5" width="4" height="10" rx="1.5" fill="#dff7ea" />
            <circle cx="13" cy="-4" r="1.6" fill="#fff8d6" />
            <circle cx="13" cy="4" r="1.6" fill="#fff8d6" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default MapaAnimado;
