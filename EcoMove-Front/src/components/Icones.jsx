import React from "react";

// Ícones de linha, 24x24, herdam a cor do texto (currentColor).
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

const Svg = ({ tamanho = 24, children, ...resto }) => (
  <svg width={tamanho} height={tamanho} {...base} {...resto}>
    {children}
  </svg>
);

export const IconeRota = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5" />
  </Svg>
);

export const IconeFolha = (p) => (
  <Svg {...p}>
    <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
    <path d="M5 19c3-4 6-7 10-9" />
  </Svg>
);

export const IconeMoeda = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v10M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7c0 2.5-5 1.5-5 4 0 1 1 1.7 2.5 1.7s2.5-.7 2.5-1.7" />
  </Svg>
);

export const IconeAlvo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Svg>
);

export const IconeEstrela = (p) => (
  <Svg {...p}>
    <path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.2 6.1L12 16.9l-5.5 2.9 1.2-6.1L3.2 9.4l6.1-.8z" />
  </Svg>
);

export const IconeFaisca = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </Svg>
);

export const IconeCelular = (p) => (
  <Svg {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M10.5 18.5h3" />
  </Svg>
);

export const IconeCarro = (p) => (
  <Svg {...p}>
    <path d="M5 12l1.6-4.5A2 2 0 0 1 8.5 6h7a2 2 0 0 1 1.9 1.5L19 12" />
    <rect x="3" y="12" width="18" height="6" rx="1.5" />
    <path d="M6 18v2M18 18v2" />
    <circle cx="7.5" cy="15" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="15" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconeMoto = (p) => (
  <Svg {...p}>
    <circle cx="5.5" cy="16.5" r="3" />
    <circle cx="18.5" cy="16.5" r="3" />
    <path d="M5.5 16.5l3-6h4l2 3h4M12.5 10.5l-1.5-3h-3" />
  </Svg>
);

export const IconeRaio = (p) => (
  <Svg {...p}>
    <path d="M13 2L5 13h6l-1 9 8-11h-6z" />
  </Svg>
);

export const IconeRelogio = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const IconeCheck = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12.5 2.3 2.3 4.7-5" />
  </Svg>
);

export const IconeEscudo = (p) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" />
    <path d="m9.5 12 1.8 1.8 3.5-3.6" />
  </Svg>
);

export const IconePessoas = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <circle cx="16.5" cy="9.5" r="2.5" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 19a4 4 0 0 1 6 0" />
  </Svg>
);

export const IconeUsuario = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" />
  </Svg>
);

export const IconeSair = (p) => (
  <Svg {...p}>
    <path d="M10 4H5v16h5" />
    <path d="M14 8l4 4-4 4M18 12H9" />
  </Svg>
);
