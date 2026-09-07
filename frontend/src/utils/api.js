import axios from "axios";

export const normalizeBackendUrl = (url) =>
  (url || "").replace(/\/+$/, "");

export const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL: normalizeBackendUrl(baseURL),
    timeout: 60000,
  });

  return client;
};

export const requestWithRetry = async (requestFn, retries = 2, delayMs = 2000) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      const isNetworkError =
        !error.response &&
        (error.code === "ECONNABORTED" ||
          error.message?.includes("Network Error") ||
          error.message?.includes("timeout"));

      if (!isNetworkError || attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }

  throw lastError;
};
