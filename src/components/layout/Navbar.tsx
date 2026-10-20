import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Sun, Moon, Search, User as UserIcon, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import GlobalSearchModal from "@/components/GlobalSearchModal";
import NotificationDropdown from "@/components/NotificationDropdown";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Sol Taraf: Mobil Hamburger Butonu & Hızlı Arama */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs sm:max-w-sm">
          {/* Sadece mobilde görünen menü açma butonu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer shrink-0"
            title="Menüyü Aç"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Arama Butonu */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full h-9 pl-3 sm:pl-9 pr-3 sm:pr-4 rounded-xl border border-border bg-background text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{t("searchHotkeyText")}</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-secondary border border-border rounded-md text-muted-foreground shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Sağ Taraf: Tema, Bildirimler ve Profil */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border hover:bg-secondary text-foreground transition cursor-pointer"
            title={t("changeThemeTitle")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <NotificationDropdown />

          <Link
            to="/profile"
            className="flex items-center space-x-2 sm:space-x-3 border-l border-border pl-2 sm:pl-3 py-1 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
              {currentUser?.displayName ? (
                currentUser.displayName.slice(0, 2).toUpperCase()
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
            <div className="text-xs hidden md:block">
              <p className="font-bold text-foreground truncate max-w-[120px]">
                {currentUser?.displayName ||
                  currentUser?.email?.split("@")[0] ||
                  "Kullanıcı"}
              </p>
              <span className="text-[10px] text-primary font-semibold">
                {t("proPlan")}
              </span>
            </div>
          </Link>
        </div>
      </header>
    </>
  );
}