const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** "2026-10-20T07:30" -> "20/10/2026 às 07:30" */
export function formatarDataHora(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return formatoDataHora.format(data).replace(",", " às");
}

/** "2026-10-20" -> "20/10/2026" */
export function formatarData(iso) {
  if (!iso) return "";
  const data = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(data.getTime())) return iso;
  return formatoData.format(data);
}
