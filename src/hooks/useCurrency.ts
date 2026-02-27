"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrencySymbol } from "@/lib/currency";

interface UseCurrencyReturn {
  currency: string;
  symbol: string;
  format: (amount: number) => string;
  loading: boolean;
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("user-currency");
    if (cached) {
      setCurrency(cached);
      setLoading(false);
      return;
    }

    fetch("/api/profile")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.currency) {
          setCurrency(data.currency);
          sessionStorage.setItem("user-currency", data.currency);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const symbol = getCurrencySymbol(currency);

  const format = useCallback(
    (amount: number) => {
      const s = getCurrencySymbol(currency);
      return `${s}${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    },
    [currency]
  );

  return { currency, symbol, format, loading };
}
