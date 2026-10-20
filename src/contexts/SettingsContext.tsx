import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/utils/translations";

export type AccentColor = "blue" | "emerald" | "purple" | "amber";
export type Language = "tr" | "en";
export type DefaultView = "kanban" | "list";

export interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  defaultView: DefaultView;
  setDefaultView: (view: DefaultView) => void;
  t: (key: keyof typeof translations["tr"]) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem("app_language") as Language) || "tr"
  );
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => (localStorage.getItem("app_accent_color") as AccentColor) || "blue"
  );
  const [defaultView, setDefaultViewState] = useState<DefaultView>(
    () => (localStorage.getItem("app_default_view") as DefaultView) || "kanban"
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem("app_accent_color", color);
    document.documentElement.setAttribute("data-accent", color);
  };

  const setDefaultView = (view: DefaultView) => {
    setDefaultViewState(view);
    localStorage.setItem("app_default_view", view);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accentColor);
  }, [accentColor]);

  const t = (key: keyof typeof translations["tr"]): string => {
    return translations[language]?.[key] || translations["tr"][key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        accentColor,
        setAccentColor,
        defaultView,
        setDefaultView,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings, SettingsProvider içerisinde kullanılmalıdır.");
  }
  return context;
};

export default SettingsContext;