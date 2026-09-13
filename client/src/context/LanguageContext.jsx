import React, { createContext, useContext, useState } from "react";
import { translations } from "../data/translations.js";

const LanguageContext = createContext(null);

const STORAGE_KEY = "bsfdm_lang";

function loadLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "id" || saved === "en" ? saved : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(loadLang);

  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — language choice just won't persist
    }
  };

  const toggleLang = () => setLang(lang === "en" ? "id" : "en");

  const t = (key, vars) => {
    const raw = translations[lang]?.[key] ?? translations.en[key] ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
