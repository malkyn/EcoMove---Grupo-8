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

const pad = (n) => String(n).padStart(2, "0");

/** Date -> "AAAA-MM-DDTHH:MM" no horário local (formato do input datetime-local e da API). */
export function paraInputDataLocal(data) {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`;
}

export function agoraLocal() {
  return paraInputDataLocal(new Date());
}

/** Próxima hora cheia a partir de daqui a uma hora (padrão para agendar). */
export function proximaHoraCheia() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return paraInputDataLocal(d);
}

/** Soma minutos a um "AAAA-MM-DDTHH:MM" local. */
export function somarMinutos(isoLocal, minutos) {
  const d = new Date(isoLocal);
  if (Number.isNaN(d.getTime())) return isoLocal;
  return paraInputDataLocal(new Date(d.getTime() + minutos * 60 * 1000));
}

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
