export const normalizeBackendUrl = (url) =>
  (url || "").replace(/\/+$/, "");
