export const INTERNAL_ROUTES = {
  base: "/crn-control-x92",
  login: "/crn-control-x92/login",
  applications: "/crn-control-x92/solicitudes",
  clients: "/crn-control-x92/clientes"
} as const;

export function getInternalApplicationDetailRoute(applicationId: string) {
  return `${INTERNAL_ROUTES.applications}/${applicationId}`;
}
