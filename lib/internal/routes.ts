export const INTERNAL_ROUTES = {
  base: "/crn-control-x92",
  login: "/crn-control-x92/login",
  applications: "/crn-control-x92/solicitudes",
  clients: "/crn-control-x92/clientes",
  dates: "/crn-control-x92/fechas",
  newDate: "/crn-control-x92/fechas/nueva"
} as const;

export function getInternalApplicationDetailRoute(applicationId: string) {
  return `${INTERNAL_ROUTES.applications}/${applicationId}`;
}

export function getInternalDateDetailRoute(availableDateId: string) {
  return `${INTERNAL_ROUTES.dates}/${availableDateId}`;
}
