import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useSettings } from "@/contexts/SettingsContext";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart3,
  Tag,
  Settings,
  LogOut,
  CheckCircle2,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useSettings();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onClose) onClose();
      navigate("/login");
    } catch (err) {
      console.error("Çıkış yapılırken hata:", err);
    }
  };

  const navItems = [
    { title: t("dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { title: t("projects"), path: "/projects", icon: FolderKanban },
    { title: t("tasks"), path: "/tasks", icon: CheckSquare },
    { title: t("calendar"), path: "/calendar", icon: Calendar },
    { title: t("reports"), path: "/reports", icon: BarChart3 },
    { title: t("tags"), path: "/tags", icon: Tag },
    { title: t("settings"), path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* MOBİL ARKA PLAN KARARTMASI (Backdrop) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* ASIL SIDEBAR (Masaüstünde sabit, mobilde soldan kayar) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full border-r border-border bg-card flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Mobilde Kapatma Butonu */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                TaskFlow
              </span>
            </div>

            {/* Sadece mobilde görünen kapatma çarpısı */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menü Linkleri */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (onClose) onClose(); // Mobilde tıklandığında menüyü kapat
                  }}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Çıkış Yap Butonu */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition w-full text-left cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>{t("logout")}</span>
        </button>
      </aside>
    </>
  );
}