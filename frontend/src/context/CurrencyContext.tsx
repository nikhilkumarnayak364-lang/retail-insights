"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { CurrencyCode, CurrencyInfo, CurrencyRatesResponse } from "@/types/api";
import { apiService } from "@/services/api";

const DEFAULT_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$", rate_to_usd: 1.0, flag: "🇺🇸" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rate_to_usd: 86.50, flag: "🇮🇳" },
  { code: "EUR", name: "Euro", symbol: "€", rate_to_usd: 0.92, flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", rate_to_usd: 0.79, flag: "🇬🇧" },
];

export interface FormatOptions {
  compact?: boolean;
  decimals?: number;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencies: CurrencyInfo[];
  activeInfo: CurrencyInfo;
  symbol: string;
  convert: (amountInUSD: number) => number;
  formatCurrency: (amountInUSD: number | undefined | null, options?: FormatOptions) => string;
  isCalculatorOpen: boolean;
  openCalculator: () => void;
  closeCalculator: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEY = "retail_insights_preferred_currency";

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(DEFAULT_CURRENCIES);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Load saved preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && ["USD", "INR", "EUR", "GBP"].includes(saved)) {
        setCurrencyState(saved);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Fetch live exchange rates from backend
  useEffect(() => {
    let isMounted = true;
    apiService
      .getCurrencyRates()
      .then((data: CurrencyRatesResponse) => {
        if (isMounted && data.currencies && data.currencies.length > 0) {
          setCurrencies(data.currencies);
        }
      })
      .catch(() => {
        // Fall back to default currencies silently
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // Ignore localStorage write errors
    }
  };

  const activeInfo = useMemo(() => {
    return (
      currencies.find((c) => c.code === currency) ||
      currencies[0] ||
      DEFAULT_CURRENCIES[0]
    );
  }, [currencies, currency]);

  const convert = (amountInUSD: number): number => {
    if (typeof amountInUSD !== "number" || isNaN(amountInUSD)) return 0;
    return amountInUSD * activeInfo.rate_to_usd;
  };

  const formatCurrency = (
    amountInUSD: number | undefined | null,
    options: FormatOptions = {}
  ): string => {
    if (amountInUSD === undefined || amountInUSD === null || isNaN(amountInUSD)) {
      return `${activeInfo.symbol}0.00`;
    }

    const converted = convert(amountInUSD);
    const sym = activeInfo.symbol;
    const decimals = options.decimals ?? 2;

    if (options.compact) {
      if (currency === "INR") {
        // Indian numbering system support (Cr / L / K)
        const absVal = Math.abs(converted);
        if (absVal >= 10_000_000) {
          return `${sym}${(converted / 10_000_000).toFixed(2)}Cr`;
        }
        if (absVal >= 100_000) {
          return `${sym}${(converted / 100_000).toFixed(2)}L`;
        }
        if (absVal >= 1_000) {
          return `${sym}${(converted / 1_000).toFixed(1)}K`;
        }
        return `${sym}${converted.toFixed(decimals)}`;
      } else {
        // Western format (M / K)
        const absVal = Math.abs(converted);
        if (absVal >= 1_000_000) {
          return `${sym}${(converted / 1_000_000).toFixed(1)}M`;
        }
        if (absVal >= 1_000) {
          return `${sym}${(converted / 1_000).toFixed(1)}K`;
        }
        return `${sym}${converted.toFixed(decimals)}`;
      }
    }

    // Standard localized number formatting
    const locale =
      currency === "INR"
        ? "en-IN"
        : currency === "EUR"
        ? "de-DE"
        : currency === "GBP"
        ? "en-GB"
        : "en-US";

    const formattedNum = converted.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return `${sym}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencies,
        activeInfo,
        symbol: activeInfo.symbol,
        convert,
        formatCurrency,
        isCalculatorOpen,
        openCalculator: () => setIsCalculatorOpen(true),
        closeCalculator: () => setIsCalculatorOpen(false),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

