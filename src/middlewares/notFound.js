export function notFound(_req, res, _next) {
  res.status(404).json({ error: "Route Not Found" });
}
