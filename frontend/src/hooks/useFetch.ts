import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { AxiosRequestConfig } from "axios";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string, config?: AxiosRequestConfig) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Stringify the config so it can be safely used as a useEffect dependency
  const configString = JSON.stringify(config);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.get<T>(url, config);
      setState({ data: res.data, loading: false, error: null });
    } catch (err: any) {
      setState({ 
        data: null, 
        loading: false, 
        error: err?.response?.data?.message ?? "Something went wrong" 
      });
    }
  }, [url, configString]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    
    // We wrap the call to prevent setting state on unmounted components
    api.get<T>(url, config)
      .then((res) => {
        if (!cancelled) setState({ data: res.data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err?.response?.data?.message ?? "Something went wrong" });
      });

    return () => { cancelled = true; };
  }, [url, configString]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch: fetchData };
}