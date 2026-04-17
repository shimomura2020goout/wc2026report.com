"use client";

import { createContext, useCallback, useContext, useMemo, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface Preferences {
  favoriteCountries: string[];
  favoritePlayers: string[];
  onboardedAt: string | null;
}

const defaultPreferences: Preferences = {
  favoriteCountries: [],
  favoritePlayers: [],
  onboardedAt: null,
};

const STORAGE_KEY = "wcup2026:prefs:v1";

interface PreferencesContextValue {
  prefs: Preferences;
  hydrated: boolean;
  addFavoriteCountry: (code: string) => void;
  removeFavoriteCountry: (code: string) => void;
  toggleFavoriteCountry: (code: string) => void;
  addFavoritePlayer: (id: string) => void;
  removeFavoritePlayer: (id: string) => void;
  completeOnboarding: (countries: string[]) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { value: prefs, setValue, removeValue, hydrated } = useLocalStorage<Preferences>(
    STORAGE_KEY,
    defaultPreferences
  );

  const addFavoriteCountry = useCallback(
    (code: string) => {
      setValue((prev) => {
        if (prev.favoriteCountries.includes(code)) return prev;
        return { ...prev, favoriteCountries: [...prev.favoriteCountries, code] };
      });
    },
    [setValue]
  );

  const removeFavoriteCountry = useCallback(
    (code: string) => {
      setValue((prev) => ({
        ...prev,
        favoriteCountries: prev.favoriteCountries.filter((c) => c !== code),
      }));
    },
    [setValue]
  );

  const toggleFavoriteCountry = useCallback(
    (code: string) => {
      setValue((prev) => {
        const has = prev.favoriteCountries.includes(code);
        return {
          ...prev,
          favoriteCountries: has
            ? prev.favoriteCountries.filter((c) => c !== code)
            : [...prev.favoriteCountries, code],
        };
      });
    },
    [setValue]
  );

  const addFavoritePlayer = useCallback(
    (id: string) => {
      setValue((prev) => {
        if (prev.favoritePlayers.includes(id)) return prev;
        return { ...prev, favoritePlayers: [...prev.favoritePlayers, id] };
      });
    },
    [setValue]
  );

  const removeFavoritePlayer = useCallback(
    (id: string) => {
      setValue((prev) => ({
        ...prev,
        favoritePlayers: prev.favoritePlayers.filter((p) => p !== id),
      }));
    },
    [setValue]
  );

  const completeOnboarding = useCallback(
    (countries: string[]) => {
      setValue((prev) => ({
        ...prev,
        favoriteCountries: Array.from(new Set([...prev.favoriteCountries, ...countries])),
        onboardedAt: new Date().toISOString(),
      }));
    },
    [setValue]
  );

  const resetPreferences = useCallback(() => {
    removeValue();
  }, [removeValue]);

  const contextValue = useMemo<PreferencesContextValue>(
    () => ({
      prefs,
      hydrated,
      addFavoriteCountry,
      removeFavoriteCountry,
      toggleFavoriteCountry,
      addFavoritePlayer,
      removeFavoritePlayer,
      completeOnboarding,
      resetPreferences,
    }),
    [
      prefs,
      hydrated,
      addFavoriteCountry,
      removeFavoriteCountry,
      toggleFavoriteCountry,
      addFavoritePlayer,
      removeFavoritePlayer,
      completeOnboarding,
      resetPreferences,
    ]
  );

  return (
    <PreferencesContext.Provider value={contextValue}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}
