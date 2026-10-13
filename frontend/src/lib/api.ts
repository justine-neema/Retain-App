import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL as string;

if (!API_URL) {
    throw new Error("VITE_API_URL is not defined in the environment variables.");
}

export const api = axios.create({
    baseURL: API_URL,
    headers: {"content-Type": "application/json"},
});

const TOKEN_KEY = "retain_token";

// attaching token to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
