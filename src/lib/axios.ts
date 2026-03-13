import axios, { AxiosError, AxiosResponse } from "axios";
import { getPublicEnv } from "@/lib/env/public";

const api = axios.create({
  baseURL:
    typeof window === "undefined" ? getPublicEnv().NEXT_PUBLIC_APP_URL : "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

api.interceptors.request.use(
  (config) => {
    // Attach auth token here if needed, e.g.:
    // config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const message =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export default api;
