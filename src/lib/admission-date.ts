// Pass a request-time server snapshot to clients to keep SSR deterministic.
export function getAdmissionDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bratislava",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
